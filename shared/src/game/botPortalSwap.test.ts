import { describe, it, expect } from 'vitest';
import { evaluatePortalSwap, scoreCardForStrategy } from './botPortalSwap';
import type {
  CharacterCard,
  CharacterAbility,
  GameState,
  PlayerState,
  PearlCard,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChar(
  overrides: Partial<CharacterCard> = {},
): CharacterCard {
  return {
    id: `char-${Math.random()}`,
    name: 'TestChar',
    imageName: 'test',
    cost: [{ type: 'number', value: 3 }],
    powerPoints: 3,
    diamonds: 0,
    abilities: [],
    ...overrides,
  };
}

function makePlayer(portal: CharacterCard[], hand: PearlCard[] = []): PlayerState {
  return {
    id: '0',
    name: 'Test',
    hand,
    portal: portal.map((card, i) => ({ id: `pe-${i}`, card, activated: false })),
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
  };
}

function makeGame(player: PlayerState): GameState {
  return {
    pearlDeck: [],
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [null, null, null, null],
    characterSlots: [],
    players: { '0': player },
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
  };
}

const redAbility: CharacterAbility = {
  id: 'ra1',
  type: 'stealOpponentHandCard',
  persistent: false,
  description: 'Steal opponent hand card',
};

const blueModifierAbility: CharacterAbility = {
  id: 'ba1',
  type: 'onesCanBeEights',
  persistent: true,
  description: 'Ones can be eights',
};

// ---------------------------------------------------------------------------
// evaluatePortalSwap
// ---------------------------------------------------------------------------

describe('evaluatePortalSwap', () => {
  it('returns swap=false when portal is empty', () => {
    const game = makeGame(makePlayer([]));
    const candidate = makeChar({ powerPoints: 8 });
    const decision = evaluatePortalSwap(game, '0', candidate, 'efficient');
    expect(decision.swap).toBe(false);
  });

  it('returns swap=false when portal has only one card', () => {
    const game = makeGame(makePlayer([makeChar({ powerPoints: 2 })]));
    const candidate = makeChar({ powerPoints: 8 });
    const decision = evaluatePortalSwap(game, '0', candidate, 'efficient');
    expect(decision.swap).toBe(false);
  });

  it('swaps when candidate is strictly stronger than weakest portal card', () => {
    const weakCard = makeChar({ powerPoints: 2 });
    const strongCard = makeChar({ powerPoints: 6 });
    const game = makeGame(makePlayer([weakCard, strongCard]));
    const candidate = makeChar({ powerPoints: 8 });
    const decision = evaluatePortalSwap(game, '0', candidate, 'greedy');
    expect(decision.swap).toBe(true);
    expect(decision.portalSlot).toBe(0);
    expect(decision.delta).toBeGreaterThan(0);
  });

  it('does not swap when candidate is weaker than both portal cards', () => {
    const game = makeGame(
      makePlayer([makeChar({ powerPoints: 6 }), makeChar({ powerPoints: 7 })]),
    );
    const candidate = makeChar({ powerPoints: 4 });
    const decision = evaluatePortalSwap(game, '0', candidate, 'greedy');
    expect(decision.swap).toBe(false);
    expect(decision.delta).toBeLessThan(0);
  });

  it('does not swap on strict-equal score (Tausch-Loop-Schutz)', () => {
    const game = makeGame(
      makePlayer([makeChar({ powerPoints: 5 }), makeChar({ powerPoints: 5 })]),
    );
    const candidate = makeChar({ powerPoints: 5 });
    const decision = evaluatePortalSwap(game, '0', candidate, 'greedy');
    expect(decision.swap).toBe(false);
    expect(decision.delta).toBe(0);
  });

  it('aggressive strategy favours red-ability card even at equal points', () => {
    const plain = makeChar({ powerPoints: 5 });
    const withRed = makeChar({ powerPoints: 4, abilities: [redAbility] });
    // portal has two plain 5pt cards, candidate has 4pt + red ability
    const game = makeGame(makePlayer([plain, plain]));
    const decision = evaluatePortalSwap(game, '0', withRed, 'aggressive');
    expect(decision.swap).toBe(true);
    // score: plain=5, withRed=4+8=12 → delta = 7
    expect(decision.delta).toBe(7);
  });

  it('diamond strategy favours diamond-rich card', () => {
    const plainStrong = makeChar({ powerPoints: 7, diamonds: 0 });
    const gem = makeChar({ powerPoints: 3, diamonds: 3 });
    const game = makeGame(makePlayer([plainStrong, plainStrong]));
    const decision = evaluatePortalSwap(game, '0', gem, 'diamond');
    // plainStrong: 7, gem: 3*3+3=12 → swap
    expect(decision.swap).toBe(true);
    expect(decision.delta).toBe(5);
  });

  it('diamond strategy applies +4 bonus for blue-modifier ability', () => {
    const plain = makeChar({ powerPoints: 5 });
    const withModifier = makeChar({ powerPoints: 5, abilities: [blueModifierAbility] });
    expect(scoreCardForStrategy(withModifier, 'diamond', 0)).toBe(
      scoreCardForStrategy(plain, 'diamond', 0) + 4,
    );
  });
});

// ---------------------------------------------------------------------------
// scoreCardForStrategy — early-game diamond bonus + payability bonus
// ---------------------------------------------------------------------------

describe('scoreCardForStrategy — early-game diamond bonus', () => {
  it('diamond strategy: diamond-rich card beats plain higher-pt card when deckSize > 15', () => {
    const diamondRich = makeChar({ powerPoints: 3, diamonds: 3 });
    const plain6 = makeChar({ powerPoints: 6, diamonds: 0 });
    // deckSize > 15 → +3*3 = +9 bonus for diamondRich
    // diamondRich (effort 0): 3*3 + 3 + 5 (payable) + 9 (early) = 26
    // plain6    (effort 0): 6 + 5 (payable) = 11
    const rich = scoreCardForStrategy(diamondRich, 'diamond', 0, 20);
    const plain = scoreCardForStrategy(plain6, 'diamond', 0, 20);
    expect(rich).toBeGreaterThan(plain);
    expect(rich - plain).toBe(15);
  });

  it('diamond bonus is NOT applied when deckSize is undefined', () => {
    const diamondRich = makeChar({ powerPoints: 3, diamonds: 3 });
    // Without deckSize: 3*3 + 3 + 5 (payable) = 17 (no +9 early bonus)
    expect(scoreCardForStrategy(diamondRich, 'diamond', 0)).toBe(17);
  });

  it('diamond bonus is NOT applied when deckSize <= 15', () => {
    const diamondRich = makeChar({ powerPoints: 3, diamonds: 3 });
    expect(scoreCardForStrategy(diamondRich, 'diamond', 0, 15)).toBe(17);
    expect(scoreCardForStrategy(diamondRich, 'diamond', 0, 10)).toBe(17);
  });

  it('diamond bonus requires diamonds >= 2 even in early game', () => {
    const oneDiamond = makeChar({ powerPoints: 4, diamonds: 1 });
    // 1*3 + 4 + 5 (payable) = 12 → no early bonus for only 1 diamond
    expect(scoreCardForStrategy(oneDiamond, 'diamond', 0, 20)).toBe(12);
  });
});

describe('scoreCardForStrategy — payability bonus', () => {
  it('payable low-pt card beats unpayable high-pt card (efficient)', () => {
    const payableLow = makeChar({ powerPoints: 3, diamonds: 0 });
    const unpayableHigh = makeChar({ powerPoints: 5, diamonds: 0 });
    // efficient effort=0: 3 + 5 = 8; effort=3: 5/(3+1) = 1.25
    expect(scoreCardForStrategy(payableLow, 'efficient', 0))
      .toBeGreaterThan(scoreCardForStrategy(unpayableHigh, 'efficient', 3));
  });

  it('payable low-pt card beats unpayable high-pt card (aggressive)', () => {
    const payableLow = makeChar({ powerPoints: 3, diamonds: 0 });
    const unpayableHigh = makeChar({ powerPoints: 5, diamonds: 0 });
    // aggressive effort=0: 3+5=8 vs effort=3: 5+0=5
    expect(scoreCardForStrategy(payableLow, 'aggressive', 0))
      .toBeGreaterThan(scoreCardForStrategy(unpayableHigh, 'aggressive', 3));
  });

  it('payable low-pt card beats unpayable high-pt card (diamond)', () => {
    const payableLow = makeChar({ powerPoints: 3, diamonds: 0 });
    const unpayableHigh = makeChar({ powerPoints: 5, diamonds: 0 });
    // diamond effort=0: 0+3+5=8 vs effort=3: 0+5+0=5
    expect(scoreCardForStrategy(payableLow, 'diamond', 0))
      .toBeGreaterThan(scoreCardForStrategy(unpayableHigh, 'diamond', 3));
  });

  it('payable low-pt card beats unpayable high-pt card (greedy)', () => {
    const payableLow = makeChar({ powerPoints: 3, diamonds: 0 });
    const unpayableHigh = makeChar({ powerPoints: 5, diamonds: 0 });
    // greedy effort=0: 3+5=8 vs effort=3: 5+0=5
    expect(scoreCardForStrategy(payableLow, 'greedy', 0))
      .toBeGreaterThan(scoreCardForStrategy(unpayableHigh, 'greedy', 3));
  });
});
