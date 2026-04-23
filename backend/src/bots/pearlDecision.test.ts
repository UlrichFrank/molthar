import { describe, it, expect } from 'vitest';
import type { GameState, PlayerState, PearlCard, CharacterCard, CostComponent } from '@portale-von-molthar/shared';
import { pickPearlAction } from './pearlDecision';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pearl(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, id?: string): PearlCard {
  return { id: id ?? `p${value}-${Math.random()}`, value, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function card(cost: CostComponent[], id = 'c'): CharacterCard {
  return { id, name: 'Test', imageName: 'test', cost, powerPoints: 3, diamonds: 0, abilities: [] };
}

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: '0',
    name: 'Bot',
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 0,
    ...overrides,
  };
}

function makeGame(player: PlayerState, pearlSlots: (PearlCard | null)[]): GameState {
  return {
    pearlDeck: [],
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots,
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
    lastPlayedPearlId: null,
    usedPaymentAbilityTypes: [],
    usedAbilitySourceCharacterIds: [],
    withSpecialCards: false,
    replacePearlSlotsAbilityUsed: false,
    startingPlayer: '0',
    portalEntryCounter: 0,
  };
}

// ---------------------------------------------------------------------------
// Test 5.1 — nützliche Perle vorhanden → wird gewählt
// ---------------------------------------------------------------------------

describe('pickPearlAction: nützliche Perle vorhanden', () => {
  it('wählt den Slot mit der benötigten Perle', () => {
    // Bot braucht eine 5 für seine Karte
    const portalCard = card([{ type: 'number', value: 5 }], 'card1');
    const player = makePlayer({
      portal: [{ card: portalCard, entryOrder: 0 }],
      hand: [],
    });
    // Slot 0: Pearl 3 (nicht benötigt), Slot 1: Pearl 5 (benötigt), Slot 2: leer, Slot 3: leer
    const pearlSlots: (PearlCard | null)[] = [pearl(3, 'p3'), pearl(5, 'p5'), null, null];
    const G = makeGame(player, pearlSlots);

    const action = pickPearlAction(G, '0', 'greedy');

    expect(action).not.toBeNull();
    expect(action).toMatchObject({ move: 'takePearlCard', args: [1] });
  });

  it('ignoriert Perlen mit Werten die nicht gebraucht werden', () => {
    const portalCard = card([{ type: 'number', value: 7 }], 'card1');
    const player = makePlayer({
      portal: [{ card: portalCard, entryOrder: 0 }],
      hand: [],
    });
    // Nur Perle 7 ist nützlich (Slot 2)
    const pearlSlots: (PearlCard | null)[] = [pearl(1, 'p1'), pearl(3, 'p3'), pearl(7, 'p7'), null];
    const G = makeGame(player, pearlSlots);

    const action = pickPearlAction(G, '0', 'greedy');

    expect(action).not.toBeNull();
    expect(action).toMatchObject({ move: 'takePearlCard', args: [2] });
  });
});

// ---------------------------------------------------------------------------
// Test 5.2 — keine nützliche Perle → replacePearlSlots
// ---------------------------------------------------------------------------

describe('pickPearlAction: keine nützliche Perle und Hand voll', () => {
  it('gibt replacePearlSlots zurück wenn Hand voll und kein Bedarf gedeckt wird', () => {
    const portalCard = card([{ type: 'number', value: 8 }], 'card1');
    // Hand schon voll (5 Karten), braucht 8, hat nur 2er und 3er im Markt
    const player = makePlayer({
      portal: [{ card: portalCard, entryOrder: 0 }],
      hand: [pearl(1), pearl(2), pearl(3), pearl(4), pearl(5)], // Hand voll (limit = 5)
    });
    const pearlSlots: (PearlCard | null)[] = [pearl(2), pearl(3), null, null];
    const G = makeGame(player, pearlSlots);

    const action = pickPearlAction(G, '0', 'greedy');

    expect(action).not.toBeNull();
    expect(action).toMatchObject({ move: 'replacePearlSlots', args: [] });
  });
});

// ---------------------------------------------------------------------------
// Test 5.3 — Hand voll, alle Karten nützlich → keine Perle nehmen
// ---------------------------------------------------------------------------

describe('pickPearlAction: Hand voll und alle Handkarten nützlich', () => {
  it('gibt replacePearlSlots zurück statt nutzlose Perle zu nehmen', () => {
    // Bot hat Karte die {5, 6} benötigt, Hand voll mit nützlichen Perlen
    const portalCard = card([
      { type: 'number', value: 5 },
      { type: 'number', value: 6 },
    ], 'card1');
    const player = makePlayer({
      portal: [{ card: portalCard, entryOrder: 0 }],
      hand: [pearl(1), pearl(2), pearl(3), pearl(4), pearl(7)], // Hand voll, keine 5 oder 6
    });
    // Markt hat nur Werte die nicht in neededValues sind: {5, 6} fehlen, Markt hat {1, 2}
    const pearlSlots: (PearlCard | null)[] = [pearl(1), pearl(2), null, null];
    const G = makeGame(player, pearlSlots);

    // Hand voll (5 Karten), kein Kandidat im Markt → replacePearlSlots
    const action = pickPearlAction(G, '0', 'greedy');

    expect(action).not.toBeNull();
    expect(action).toMatchObject({ move: 'replacePearlSlots', args: [] });
  });

  it('wählt nützliche Perle auch wenn Hand fast voll', () => {
    const portalCard = card([{ type: 'number', value: 5 }], 'card1');
    const player = makePlayer({
      portal: [{ card: portalCard, entryOrder: 0 }],
      hand: [pearl(1), pearl(2), pearl(3), pearl(4)], // 4 Karten, Limit = 5 → nicht voll
    });
    // Markt hat 5 → nützlich, nimm sie
    const pearlSlots: (PearlCard | null)[] = [pearl(5, 'p5'), null, null, null];
    const G = makeGame(player, pearlSlots);

    const action = pickPearlAction(G, '0', 'greedy');

    expect(action).not.toBeNull();
    expect(action).toMatchObject({ move: 'takePearlCard', args: [0] });
  });
});
