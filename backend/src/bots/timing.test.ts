import { describe, it, expect } from 'vitest';
import { getTimingMultiplier } from './timing';
import type { GameState, PlayerState } from '@portale-von-molthar/shared';

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

function makeGame(players: Record<string, PlayerState>): GameState {
  return {
    pearlDeck: [],
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

describe('getTimingMultiplier', () => {
  it('returns 1.0 in normal phase (all players < 9 points)', () => {
    const G = makeGame({ '0': makePlayer('0', 5), '1': makePlayer('1', 6) });
    expect(getTimingMultiplier(G, '0')).toBe(1.0);
  });

  it('returns 1.8 when own points >= 9 (Endspurt)', () => {
    const G = makeGame({ '0': makePlayer('0', 9), '1': makePlayer('1', 4) });
    expect(getTimingMultiplier(G, '0')).toBe(1.8);
  });

  it('returns 1.8 when own points > 9', () => {
    const G = makeGame({ '0': makePlayer('0', 11), '1': makePlayer('1', 7) });
    expect(getTimingMultiplier(G, '0')).toBe(1.8);
  });

  it('returns 1.4 when opponent has >= 9 and own < 9', () => {
    const G = makeGame({ '0': makePlayer('0', 6), '1': makePlayer('1', 10) });
    expect(getTimingMultiplier(G, '0')).toBe(1.4);
  });

  it('returns 1.8 when both own >= 9 and opponent >= 9 (own takes priority)', () => {
    const G = makeGame({ '0': makePlayer('0', 9), '1': makePlayer('1', 10) });
    expect(getTimingMultiplier(G, '0')).toBe(1.8);
  });

  it('returns 1.0 when player not found', () => {
    const G = makeGame({ '0': makePlayer('0', 5) });
    expect(getTimingMultiplier(G, 'nonexistent')).toBe(1.0);
  });

  it('returns 1.4 when any of multiple opponents has >= 9', () => {
    const G = makeGame({
      '0': makePlayer('0', 3),
      '1': makePlayer('1', 7),
      '2': makePlayer('2', 9),
    });
    expect(getTimingMultiplier(G, '0')).toBe(1.4);
  });
});
