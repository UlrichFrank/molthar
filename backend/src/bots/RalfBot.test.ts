/**
 * RalfBot personality tests — Task 5.2 (npc-personas-verfeinern).
 *
 * Verifies Ralf's disruption-first deltas:
 *  1. Blockiert kontestierte Perle (denyThreshold=0 → contest fully bites).
 *  2. Zielt Steal-Ability auf den führenden Gegner.
 *  3. Bevorzugt rote Fähigkeiten trotz niedrigerer Punktzahl.
 *
 * Softmax non-determinism handled via frequency assertions.
 */

import { describe, it, expect } from 'vitest';
import { RalfBot } from './RalfBot';
import type {
  GameState,
  PlayerState,
  CharacterCard,
  CharacterAbility,
  PearlCard,
  CostComponent,
} from '@portale-von-molthar/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePearl(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, id?: string): PearlCard {
  return {
    id: id ?? `p-${value}-${Math.random()}`,
    value,
    hasSwapSymbol: false,
    hasRefreshSymbol: false,
  };
}

function makeChar(overrides: Partial<CharacterCard> = {}): CharacterCard {
  return {
    id: `char-${Math.random()}`,
    name: 'TestChar',
    imageName: 'test',
    cost: [{ type: 'number', value: 3 } as CostComponent],
    powerPoints: 3,
    diamonds: 0,
    abilities: [],
    ...overrides,
  };
}

function makePlayer(
  id: string,
  overrides: Partial<PlayerState> = {},
  abilities: CharacterAbility[] = [],
): PlayerState {
  return {
    id,
    name: `P${id}`,
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: abilities,
    colorIndex: Number(id),
    ...overrides,
  };
}

function makeGame(
  players: Record<string, PlayerState>,
  overrides: Partial<GameState> = {},
): GameState {
  return {
    pearlDeck: [],
    characterDeck: [makeChar({ powerPoints: 5 })],
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
    ...overrides,
  };
}

const stealRedAbility: CharacterAbility = {
  id: 'ab-steal',
  type: 'stealOpponentHandCard',
  persistent: false,
  description: 'Steal an opponent hand card',
};

// ---------------------------------------------------------------------------
// Scenario 1 — Contest-Block: blockiert die für den Gegner besonders wertvolle Perle
// ---------------------------------------------------------------------------

describe('RalfBot — Contest-Block (denyThreshold=0)', () => {
  it('bevorzugt die kontestierte Perle, die der Gegner dringend benötigt', () => {
    // Ralf braucht sowohl 3 als auch 5 für seine Portal-Karte.
    const ralfCard = makeChar({
      id: 'ralf-portal',
      powerPoints: 3,
      cost: [
        { type: 'number', value: 3 },
        { type: 'number', value: 5 },
      ],
    });
    // Opponent braucht speziell die 5 (heavy contest signal).
    const oppCard = makeChar({
      id: 'opp-portal',
      powerPoints: 6,
      cost: [{ type: 'number', value: 5 }],
    });

    const buildGame = (): GameState => {
      const ralf = makePlayer('0', {
        hand: [],
        portal: [{ id: 'r-p', card: ralfCard, activated: false }],
      });
      const opp = makePlayer('1', {
        hand: [],
        portal: [{ id: 'o-p', card: oppCard, activated: false }],
      });
      return makeGame(
        { '0': ralf, '1': opp },
        {
          pearlSlots: [makePearl(3, 'p3'), makePearl(5, 'p5'), null, null],
          // Non-empty deck so urgency doesn't dominate.
          pearlDeck: Array(20).fill(null).map((_, i) => makePearl(1, `d${i}`)),
        },
      );
    };

    let pickedContested = 0;
    for (let i = 0; i < 50; i++) {
      const action = RalfBot(buildGame(), { currentPlayer: '0' }, '0');
      expect(action.move).toBe('takePearlCard');
      const slot = (action.args as unknown[])[0] as number;
      if (slot === 1) pickedContested++;
    }

    // The 5-slot benefits the opponent (turn +1 → proximity 2× ) and Ralf's
    // aggressive weights (contest=3, help=2, denyThreshold=0) tilt sharply
    // toward it. Comfortable margin against softmax noise.
    expect(pickedContested).toBeGreaterThanOrEqual(35);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — Steal-Ziel = führender Gegner
// ---------------------------------------------------------------------------

describe('RalfBot — Steal-Priorität auf Führenden', () => {
  it('zielt resolveStealOpponentHandCard auf den Gegner mit den meisten Punkten', () => {
    const ralf = makePlayer('0', {});
    const smallOpp = makePlayer('1', {
      powerPoints: 3,
      hand: [makePearl(2)],
    });
    const leaderOpp = makePlayer('2', {
      powerPoints: 8,
      hand: [makePearl(4)],
    });

    const G = makeGame(
      { '0': ralf, '1': smallOpp, '2': leaderOpp },
      { pendingStealOpponentHandCard: true },
    );

    const action = RalfBot(G, { currentPlayer: '0' }, '0');

    expect(action.move).toBe('resolveStealOpponentHandCard');
    const args = action.args as unknown[];
    expect(args[0]).toBe('2'); // leader with 8 pts
    expect(args[1]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — Rote Fähigkeit trotz niedrigerer Punktzahl
// ---------------------------------------------------------------------------

describe('RalfBot — Rote Fähigkeit bevorzugt', () => {
  it('nimmt die Karte mit stealOpponentHandCard deutlich häufiger als die punktreichere Plain-Karte', () => {
    const plain = makeChar({
      id: 'plain-5',
      powerPoints: 5,
      cost: [{ type: 'number', value: 3 }],
      abilities: [],
    });
    const redCard = makeChar({
      id: 'red-4',
      powerPoints: 4,
      cost: [{ type: 'number', value: 3 }],
      abilities: [stealRedAbility],
    });

    const buildGame = (): GameState => {
      const ralf = makePlayer('0', {
        hand: [],
        portal: [],
      });
      return makeGame(
        { '0': ralf },
        {
          characterSlots: [plain, redCard],
          pearlDeck: Array(20).fill(null).map((_, i) => makePearl(1, `d${i}`)),
        },
      );
    };

    let pickedRed = 0;
    for (let i = 0; i < 50; i++) {
      const action = RalfBot(buildGame(), { currentPlayer: '0' }, '0');
      expect(action.move).toBe('takeCharacterCard');
      const displayIdx = (action.args as unknown[])[0] as number;
      if (displayIdx === 1) pickedRed++;
    }

    // Score delta: plain=5 vs red=4+8=12. Softmax T=1.0 → p(red) ≈ 99.9%.
    expect(pickedRed).toBeGreaterThanOrEqual(35);
  });
});
