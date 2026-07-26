/**
 * EdelsteinBot (Erda) personality tests — Task 5.3 (npc-personas-verfeinern).
 *
 * Verifies Erda's diamond-engine deltas:
 *  1. Bevorzugt in Frühphase (deck > 15) Diamant-Karten trotz weniger Punkte.
 *  2. Nutzt tradeForDiamond wenn eine 2-Perle nicht für das Portal gebraucht wird.
 *  3. Bevorzugt Karten mit blauen Modifikatoren (onesCanBeEights etc.) bei
 *     gleicher Punktzahl.
 *
 * Softmax non-determinism handled via frequency assertions.
 */

import { describe, it, expect } from 'vitest';
import { EdelsteinBot } from './EdelsteinBot';
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
  overrides: Partial<PlayerState> = {},
  abilities: CharacterAbility[] = [],
): PlayerState {
  return {
    id: '0',
    name: 'Erda',
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: abilities,
    colorIndex: 2,
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

const tradeAbility: CharacterAbility = {
  id: 'ab-trade',
  type: 'tradeTwoForDiamond',
  persistent: true,
  description: 'Trade 2-pearl for diamond',
};

const onesEightsBlueAbility: CharacterAbility = {
  id: 'ab-1as8',
  type: 'onesCanBeEights',
  persistent: true,
  description: '1-pearls count as 8',
};

// ---------------------------------------------------------------------------
// Scenario 1 — Diamant-Frühphase
// ---------------------------------------------------------------------------

describe('EdelsteinBot — Diamant-Frühphase', () => {
  it('bevorzugt in Frühphase (deck > 15) die diamantreiche Karte deutlich häufiger', () => {
    const highPoints = makeChar({
      id: 'high-pts',
      powerPoints: 6,
      diamonds: 0,
      cost: [{ type: 'number', value: 3 }],
    });
    const diamondRich = makeChar({
      id: 'diamond-3',
      powerPoints: 3,
      diamonds: 3,
      cost: [{ type: 'number', value: 3 }],
    });

    const buildGame = (): GameState => {
      const player = makePlayer({ hand: [], portal: [] });
      return makeGame(
        { '0': player },
        {
          characterSlots: [highPoints, diamondRich],
          // 30 > 15 → Frühphasen-Bonus aktiv.
          pearlDeck: Array(30).fill(null).map((_, i) => makePearl(1, `d${i}`)),
        },
      );
    };

    let pickedDiamond = 0;
    for (let i = 0; i < 50; i++) {
      const action = EdelsteinBot(buildGame(), { currentPlayer: '0' }, '0');
      expect(action.move).toBe('takeCharacterCard');
      const displayIdx = (action.args as unknown[])[0] as number;
      if (displayIdx === 1) pickedDiamond++;
    }

    // Score: highPoints = 0*3 + 6 + 0 + 0 = 6.
    // diamondRich = 3*3 + 3 + 0 + 0 + 3*3 (early bonus) = 21.
    // Softmax T=0.9 → p(diamond) ≈ 100%.
    expect(pickedDiamond).toBeGreaterThanOrEqual(35);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — tradeForDiamond bei ungenutzter 2-Perle
// ---------------------------------------------------------------------------

describe('EdelsteinBot — tradeForDiamond aktiv', () => {
  it('tauscht 2-Perle gegen Diamant wenn Ability aktiv und Portal-Karte keine 2 verlangt', () => {
    const portalCard = makeChar({
      id: 'needs-7',
      powerPoints: 4,
      cost: [{ type: 'number', value: 7 }],
    });
    const player = makePlayer(
      {
        // Hand: 2-Perle (die getauscht werden soll) + 4-Perle (keine Zahlung möglich).
        hand: [makePearl(2, 'h2'), makePearl(4, 'h4')],
        portal: [{ id: 'p-a', card: portalCard, activated: false }],
      },
      [tradeAbility],
    );
    const G = makeGame({ '0': player });

    const action = EdelsteinBot(G, { currentPlayer: '0' }, '0');

    expect(action.move).toBe('tradeForDiamond');
    // Hand-Index der 2-Perle.
    expect((action.args as unknown[])[0]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — Blauer Modifikator bevorzugt
// ---------------------------------------------------------------------------

describe('EdelsteinBot — Blauer Modifikator bevorzugt', () => {
  it('bevorzugt onesCanBeEights-Karte über gleichwertige Plain-Karte', () => {
    const plain = makeChar({
      id: 'plain-5',
      powerPoints: 5,
      diamonds: 0,
      cost: [{ type: 'number', value: 3 }],
      abilities: [],
    });
    const withBlueModifier = makeChar({
      id: 'blue-mod-5',
      powerPoints: 5,
      diamonds: 0,
      cost: [{ type: 'number', value: 3 }],
      abilities: [onesEightsBlueAbility],
    });

    const buildGame = (): GameState => {
      const player = makePlayer({ hand: [], portal: [] });
      return makeGame(
        { '0': player },
        {
          characterSlots: [plain, withBlueModifier],
          pearlDeck: Array(20).fill(null).map((_, i) => makePearl(1, `d${i}`)),
        },
      );
    };

    let pickedModifier = 0;
    for (let i = 0; i < 50; i++) {
      const action = EdelsteinBot(buildGame(), { currentPlayer: '0' }, '0');
      expect(action.move).toBe('takeCharacterCard');
      const displayIdx = (action.args as unknown[])[0] as number;
      if (displayIdx === 1) pickedModifier++;
    }

    // Score: plain = 0 + 5 = 5. modifier = 0 + 5 + 4 (blue bonus) = 9.
    // Softmax T=0.9 → p(modifier) ≈ 98.8%.
    expect(pickedModifier).toBeGreaterThanOrEqual(35);
  });
});
