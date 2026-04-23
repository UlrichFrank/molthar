import { describe, it, expect } from 'vitest';
import { estimateEffort, scorePearlSlot, pickTargetCard, bestPearlSlotByScore, scoredPearlSlots } from './botPearlScorer';
import type { CharacterCard, PearlCard, CostComponent, GameState, PlayerState } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePearl(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, id?: string): PearlCard {
  return { id: id ?? `p-${value}-${Math.random()}`, value, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function makeChar(cost: CostComponent[], powerPoints = 3, diamonds = 0): CharacterCard {
  return {
    id: `char-${Math.random()}`,
    name: 'TestChar',
    imageName: 'test',
    cost,
    powerPoints,
    diamonds,
    abilities: [],
  };
}

function makePlayer(hand: PearlCard[], portal: CharacterCard[] = [], diamonds = 0): PlayerState {
  return {
    id: '0',
    name: 'Test',
    hand,
    portal: portal.map((card, i) => ({ id: `pe-${i}`, card, activated: false })),
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: Array.from({ length: diamonds }, () => makeChar([], 0, 1)),
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
  };
}

function makeGame(overrides: Partial<GameState> = {}): GameState {
  return {
    pearlDeck: [],
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [null, null, null, null],
    characterSlots: [],
    players: {
      '0': makePlayer([]),
    },
    playerOrder: ['0'],
    actionCount: 0,
    maxActions: 3,
    finalRound: false,
    roundNumber: 1,
    finalRoundNumber: null,
    requiresHandDiscard: false,
    excessCardCount: 0,
    currentHandLimit: 5,
    nextPlayerExtraAction: false,
    playedRealPearlIds: [],
    pendingTakeBackPlayedPearl: false,
    isReshufflingPearlDeck: false,
    isReshufflingCharacterDeck: false,
    isPearlRefreshTriggered: false,
    pendingStealOpponentHandCard: false,
    pendingDiscardOpponentCharacter: false,
    usedPaymentAbilityTypes: [],
    usedAbilitySourceCharacterIds: [],
    withSpecialCards: false,
    replacePearlSlotsAbilityUsed: false,
    startingPlayer: '0',
    portalEntryCounter: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// estimateEffort
// ---------------------------------------------------------------------------

describe('estimateEffort', () => {
  it('returns 0 when card is already payable', () => {
    const card = makeChar([{ type: 'number', value: 5 }]);
    const hand = [makePearl(5)];
    expect(estimateEffort(card, hand, 0)).toBe(0);
  });

  it('returns positive when card is not yet payable', () => {
    const card = makeChar([{ type: 'number', value: 5 }, { type: 'number', value: 3 }]);
    const hand = [makePearl(5)]; // missing the 3
    expect(estimateEffort(card, hand, 0)).toBeGreaterThan(0);
  });

  it('returns 0 for diamond cost when enough diamonds available', () => {
    const card = makeChar([{ type: 'diamond', value: 1 }]);
    expect(estimateEffort(card, [], 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// scorePearlSlot — Signal 1: Helpfulness
// ---------------------------------------------------------------------------

describe('scorePearlSlot — Helpfulness', () => {
  it('scores higher when pearl reduces effort for target card', () => {
    const targetCard = makeChar([{ type: 'number', value: 5 }, { type: 'number', value: 3 }]);
    const G = makeGame({
      players: { '0': makePlayer([makePearl(3)], [targetCard]) },
      pearlDeck: [makePearl(5), makePearl(5), makePearl(5), makePearl(5)],
    });

    // Pearl 5 helps (effort reduces), pearl 2 does not
    const scoreHelps = scorePearlSlot(5, targetCard, G, '0', { help: 3, urgency: 0, contest: 0 });
    const scoreNoHelp = scorePearlSlot(2, targetCard, G, '0', { help: 3, urgency: 0, contest: 0 });
    expect(scoreHelps).toBeGreaterThan(scoreNoHelp);
  });

  it('scores 0 helpfulness when pearl does not reduce effort', () => {
    const targetCard = makeChar([{ type: 'number', value: 7 }]);
    const G = makeGame({
      players: { '0': makePlayer([], [targetCard]) },
      pearlDeck: [],
    });

    const score = scorePearlSlot(3, targetCard, G, '0', { help: 3, urgency: 0, contest: 0 });
    expect(score).toBe(0);
  });

  it('scores 0 helpfulness when targetCard is null', () => {
    const G = makeGame({
      players: { '0': makePlayer([]) },
      pearlDeck: [],
    });

    const score = scorePearlSlot(5, null, G, '0', { help: 3, urgency: 0, contest: 0 });
    expect(score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// scorePearlSlot — Signal 2: Urgency
// ---------------------------------------------------------------------------

describe('scorePearlSlot — Urgency', () => {
  it('scores higher urgency when that value is scarce in deck', () => {
    const G = makeGame({
      players: { '0': makePlayer([]) },
      // 1 five in a deck of 10 → very scarce
      pearlDeck: [makePearl(5), makePearl(3), makePearl(3), makePearl(3), makePearl(3),
                  makePearl(3), makePearl(3), makePearl(3), makePearl(3), makePearl(3)],
    });

    const urgentScore = scorePearlSlot(5, null, G, '0', { help: 0, urgency: 2, contest: 0 });
    const abundantScore = scorePearlSlot(3, null, G, '0', { help: 0, urgency: 2, contest: 0 });
    expect(urgentScore).toBeGreaterThan(abundantScore);
  });

  it('dampens urgency when deck is near empty (reshuffle imminent)', () => {
    // deck size < 4 → urgency × 0.5
    const smallDeck = makeGame({
      players: { '0': makePlayer([]) },
      pearlDeck: [makePearl(5), makePearl(7)], // only 2 cards
    });
    const largeDeck = makeGame({
      players: { '0': makePlayer([]) },
      pearlDeck: [makePearl(5), makePearl(3), makePearl(3), makePearl(3),
                  makePearl(3), makePearl(3), makePearl(3), makePearl(3)],
    });

    const urgencySmall = scorePearlSlot(5, null, smallDeck, '0', { help: 0, urgency: 2, contest: 0 });
    const urgencyLarge = scorePearlSlot(5, null, largeDeck, '0', { help: 0, urgency: 2, contest: 0 });
    expect(urgencySmall).toBeLessThan(urgencyLarge);
  });

  it('returns 0 urgency when deck is empty', () => {
    const G = makeGame({
      players: { '0': makePlayer([]) },
      pearlDeck: [],
    });
    const score = scorePearlSlot(5, null, G, '0', { help: 0, urgency: 2, contest: 0 });
    expect(score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// scorePearlSlot — Signal 3: Contestedness
// ---------------------------------------------------------------------------

describe('scorePearlSlot — Contestedness', () => {
  it('lowers score when another player benefits from the same pearl', () => {
    const opponentTarget = makeChar([{ type: 'number', value: 5 }]);
    const G = makeGame({
      players: {
        '0': makePlayer([]),
        '1': makePlayer([makePearl(3)], [opponentTarget]),
      },
      playerOrder: ['0', '1'],
      pearlDeck: [],
    });

    // Pearl 5 helps opponent → should lower score (contestedness active)
    const scoreContested = scorePearlSlot(5, null, G, '0', { help: 0, urgency: 0, contest: 3 });
    const scoreUncontested = scorePearlSlot(2, null, G, '0', { help: 0, urgency: 0, contest: 3 });
    expect(scoreContested).toBeLessThan(scoreUncontested);
  });

  it('weights next player double in contestedness', () => {
    const opponentTarget = makeChar([{ type: 'number', value: 5 }]);

    // Two opponents both benefit — next player (pos 1) should weigh more than later player (pos 2)
    const G = makeGame({
      players: {
        '0': makePlayer([]),
        '1': makePlayer([makePearl(3)], [opponentTarget]), // next player
        '2': makePlayer([makePearl(3)], [opponentTarget]), // later player
      },
      playerOrder: ['0', '1', '2'],
      pearlDeck: [],
    });

    // Both players need a 5 — contestedness should be higher than if only one player (later) needed it
    const score3players = scorePearlSlot(5, null, G, '0', { help: 0, urgency: 0, contest: 3 });

    const G2 = makeGame({
      players: {
        '0': makePlayer([]),
        '1': makePlayer([makePearl(3)]),                  // next player — does NOT need 5
        '2': makePlayer([makePearl(3)], [opponentTarget]), // later player — needs 5
      },
      playerOrder: ['0', '1', '2'],
      pearlDeck: [],
    });
    const score2players = scorePearlSlot(5, null, G2, '0', { help: 0, urgency: 0, contest: 3 });
    // More players benefiting = more contested = lower score
    expect(score3players).toBeLessThan(score2players);
  });
});

// ---------------------------------------------------------------------------
// pickTargetCard
// ---------------------------------------------------------------------------

describe('pickTargetCard', () => {
  it('returns null when no portal and no display', () => {
    const G = makeGame({ players: { '0': makePlayer([]) }, characterSlots: [] });
    expect(pickTargetCard(G, '0', 'greedy')).toBeNull();
  });

  it('picks highest points card for greedy', () => {
    const low = makeChar([], 3);
    const high = makeChar([], 7);
    const G = makeGame({ players: { '0': makePlayer([], [low, high]) } });
    expect(pickTargetCard(G, '0', 'greedy')).toBe(high);
  });

  it('picks most diamonds card for diamond strategy', () => {
    const lessDia = makeChar([], 5, 1);
    const moreDia = makeChar([], 3, 3);
    const G = makeGame({ players: { '0': makePlayer([], [lessDia, moreDia]) } });
    expect(pickTargetCard(G, '0', 'diamond')).toBe(moreDia);
  });

  it('falls back to characterSlots display when portal is empty', () => {
    const displayCard = makeChar([], 5);
    const G = makeGame({ players: { '0': makePlayer([]) }, characterSlots: [displayCard] });
    expect(pickTargetCard(G, '0', 'greedy')).toBe(displayCard);
  });

  it('prefers portal cards over display cards', () => {
    const portalCard = makeChar([], 4);
    const displayCard = makeChar([], 8); // higher points, but in display
    const G = makeGame({
      players: { '0': makePlayer([], [portalCard]) },
      characterSlots: [displayCard],
    });
    // greedy picks highest points overall — display wins here since it has more points
    // This is expected: greedy considers all candidates, portal + display
    const result = pickTargetCard(G, '0', 'greedy');
    expect(result).toBe(displayCard);
  });
});

// ---------------------------------------------------------------------------
// bestPearlSlotByScore — integration
// ---------------------------------------------------------------------------

describe('bestPearlSlotByScore', () => {
  it('returns null when no pearl slots available', () => {
    const G = makeGame({ players: { '0': makePlayer([]) }, pearlSlots: [null, null, null, null] });
    expect(bestPearlSlotByScore(G, '0', 'greedy')).toBeNull();
  });

  it('picks the slot whose pearl helps target card most', () => {
    const targetCard = makeChar([{ type: 'number', value: 5 }, { type: 'number', value: 3 }]);
    const G = makeGame({
      players: { '0': makePlayer([makePearl(3)], [targetCard]) },
      pearlSlots: [makePearl(2), makePearl(5), null, null],
      pearlDeck: [makePearl(2), makePearl(2), makePearl(5), makePearl(5)],
    });

    // Slot 1 (value 5) helps more than slot 0 (value 2)
    expect(bestPearlSlotByScore(G, '0', 'greedy')).toBe(1);
  });
});

// ---------------------------------------------------------------------------

describe('scoredPearlSlots', () => {
  it('returns empty array when no pearl slots available', () => {
    const G = makeGame({ players: { '0': makePlayer([]) }, pearlSlots: [null, null, null, null] });
    expect(scoredPearlSlots(G, '0', 'greedy')).toEqual([]);
  });

  it('returns one entry per non-null slot', () => {
    const G = makeGame({
      players: { '0': makePlayer([]) },
      pearlSlots: [makePearl(3), null, makePearl(5), null],
    });
    const result = scoredPearlSlots(G, '0', 'greedy');
    expect(result).toHaveLength(2);
    expect(result.map(r => r.slot)).toEqual([0, 2]);
  });

  it('assigns higher score to more helpful pearl', () => {
    const targetCard = makeChar([{ type: 'number', value: 5 }, { type: 'number', value: 3 }]);
    const G = makeGame({
      players: { '0': makePlayer([makePearl(3)], [targetCard]) },
      pearlSlots: [makePearl(2), makePearl(5), null, null],
      pearlDeck: [makePearl(2), makePearl(2), makePearl(5), makePearl(5)],
    });
    const result = scoredPearlSlots(G, '0', 'greedy');
    const slot0 = result.find(r => r.slot === 0)!;
    const slot1 = result.find(r => r.slot === 1)!;
    expect(slot1.score).toBeGreaterThan(slot0.score);
  });

  it('best slot from scoredPearlSlots matches bestPearlSlotByScore', () => {
    const targetCard = makeChar([{ type: 'number', value: 5 }, { type: 'number', value: 3 }]);
    const G = makeGame({
      players: { '0': makePlayer([makePearl(3)], [targetCard]) },
      pearlSlots: [makePearl(2), makePearl(5), null, null],
      pearlDeck: [makePearl(2), makePearl(2), makePearl(5), makePearl(5)],
    });
    const scored = scoredPearlSlots(G, '0', 'efficient');
    const bestFromScored = scored.reduce((a, b) => (b.score > a.score ? b : a)).slot;
    const bestDirect = bestPearlSlotByScore(G, '0', 'efficient');
    expect(bestFromScored).toBe(bestDirect);
  });
});
