import { describe, it, expect } from 'vitest';
import {
  getTimingMultiplier,
  URGENCY_OWN,
  URGENCY_OPP,
  URGENCY_DECK,
} from './timing';
import type { GameState, PlayerState, PearlCard } from '@portale-von-molthar/shared';

function makePlayer(id: string, powerPoints: number): PlayerState {
  return {
    id,
    name: `Player ${id}`,
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints,
    diamondCards: [],
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 0,
  };
}

function makeGame(
  players: Record<string, PlayerState>,
  deckSize = 30,
): GameState {
  const pearlDeck: PearlCard[] = Array.from({ length: deckSize }, (_, i) => ({
    id: `p${i}`,
    value: 1,
    hasSwapSymbol: false,
    hasRefreshSymbol: false,
  }));
  return {
    pearlDeck,
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [null, null, null, null],
    characterSlots: [],
    players,
    playerOrder: Object.keys(players),
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

describe('getTimingMultiplier (continuous)', () => {
  it('is ~1.0 in early game with full deck', () => {
    const G = makeGame({ '0': makePlayer('0', 0), '1': makePlayer('1', 0) }, 40);
    expect(getTimingMultiplier(G, '0')).toBeCloseTo(1.0, 5);
  });

  it('grows monotonically with own points', () => {
    const g6 = makeGame({ '0': makePlayer('0', 6), '1': makePlayer('1', 0) }, 30);
    const g9 = makeGame({ '0': makePlayer('0', 9), '1': makePlayer('1', 0) }, 30);
    const g11 = makeGame({ '0': makePlayer('0', 11), '1': makePlayer('1', 0) }, 30);
    const m6 = getTimingMultiplier(g6, '0');
    const m9 = getTimingMultiplier(g9, '0');
    const m11 = getTimingMultiplier(g11, '0');
    expect(m6).toBeLessThan(m9);
    expect(m9).toBeLessThan(m11);
  });

  it('11 own points yields multiplier ≥ 1.7', () => {
    const G = makeGame({ '0': makePlayer('0', 11), '1': makePlayer('1', 0) }, 30);
    expect(getTimingMultiplier(G, '0')).toBeGreaterThanOrEqual(1.7);
  });

  it('opponent at 10 raises pressure over baseline', () => {
    const g = makeGame({ '0': makePlayer('0', 4), '1': makePlayer('1', 10) }, 30);
    expect(getTimingMultiplier(g, '0')).toBeGreaterThan(1.0 + URGENCY_OPP * 0.5);
  });

  it('empty deck adds full URGENCY_DECK to base', () => {
    const g = makeGame({ '0': makePlayer('0', 0), '1': makePlayer('1', 0) }, 0);
    expect(getTimingMultiplier(g, '0')).toBeCloseTo(1.0 + URGENCY_DECK, 5);
  });

  it('combines all three signals additively', () => {
    const g = makeGame({ '0': makePlayer('0', 12), '1': makePlayer('1', 12) }, 0);
    // ownPressure=1, oppPressure=1, deckPressure=1
    const expected = 1 + URGENCY_OWN + URGENCY_OPP + URGENCY_DECK;
    expect(getTimingMultiplier(g, '0')).toBeCloseTo(expected, 5);
  });

  it('returns 1.0 when player not found', () => {
    const G = makeGame({ '0': makePlayer('0', 5) }, 30);
    expect(getTimingMultiplier(G, 'nonexistent')).toBe(1.0);
  });

  it('picks the max opponent as leader', () => {
    const G = makeGame(
      {
        '0': makePlayer('0', 3),
        '1': makePlayer('1', 7),
        '2': makePlayer('2', 11),
      },
      30,
    );
    const withMax = getTimingMultiplier(G, '0');
    const G2 = makeGame(
      {
        '0': makePlayer('0', 3),
        '1': makePlayer('1', 7),
        '2': makePlayer('2', 7),
      },
      30,
    );
    expect(withMax).toBeGreaterThan(getTimingMultiplier(G2, '0'));
  });
});
