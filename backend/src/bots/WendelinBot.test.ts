/**
 * WendelinBot personality tests — Task 5.1 (npc-personas-verfeinern).
 *
 * Verifies Wendelin's efficient-strategist deltas:
 *  1. Wählt die pts/effort-optimale Portal-Karte (Softmax T=0.7 focused).
 *  2. Tauscht eine schwache Portal-Karte gegen eine bessere Display-Karte.
 *  3. Nutzt Peek (previewCharacter) vor der ersten Aktion.
 *
 * Softmax non-determinism handled via frequency assertions (50 iterations,
 * ≥ 35/50 threshold — comfortable margin given the >98% probability mass on
 * the correct pick in each scenario).
 */

import { describe, it, expect } from 'vitest';
import { WendelinBot } from './WendelinBot';
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
    name: 'Wendelin',
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: true,
    handLimitModifier: 0,
    activeAbilities: abilities,
    colorIndex: 1,
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

const previewAbility: CharacterAbility = {
  id: 'ab-preview',
  type: 'previewCharacter',
  persistent: true,
  description: 'Preview character deck',
};

// ---------------------------------------------------------------------------
// Scenario 1 — pts/effort-optimale Portal-Karte
// ---------------------------------------------------------------------------

describe('WendelinBot — pts/effort-Wahl', () => {
  it('aktiviert die 8-Punkte-Karte deutlich häufiger als die 5-Punkte-Karte', () => {
    const card5 = makeChar({
      id: 'card-5pts',
      powerPoints: 5,
      cost: [{ type: 'number', value: 3 }],
    });
    const card8 = makeChar({
      id: 'card-8pts',
      powerPoints: 8,
      cost: [{ type: 'number', value: 5 }],
    });

    const buildGame = (): GameState => {
      const player = makePlayer({
        hand: [makePearl(3, 'p3'), makePearl(5, 'p5')],
        portal: [
          { id: 'e1', card: card5, activated: false },
          { id: 'e2', card: card8, activated: false },
        ],
      });
      // Deck size > 30 keeps timing multiplier ≈ 1.0 (no deck pressure).
      return makeGame({ '0': player }, { pearlDeck: Array(30).fill(null).map((_, i) => makePearl(1, `d${i}`)) });
    };

    let picked8 = 0;
    for (let i = 0; i < 50; i++) {
      const action = WendelinBot(buildGame(), { currentPlayer: '0' }, '0');
      expect(action.move).toBe('activatePortalCard');
      const slotIndex = (action.args as unknown[])[0] as number;
      if (slotIndex === 1) picked8++;
    }

    expect(picked8).toBeGreaterThanOrEqual(35);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — Portal-Tausch bei besserer Display-Karte
// ---------------------------------------------------------------------------

describe('WendelinBot — Portal-Tausch', () => {
  it('tauscht schwache Portal-Karte gegen starke, zahlbare Display-Karte', () => {
    // Portal cards need an 8; hand only has a 3 → both unpayable.
    const weakA = makeChar({
      id: 'weak-a',
      powerPoints: 2,
      cost: [{ type: 'number', value: 8 }],
    });
    const weakB = makeChar({
      id: 'weak-b',
      powerPoints: 3,
      cost: [{ type: 'number', value: 8 }],
    });
    // Display card is 8 pts and payable with the 3 in hand.
    const strongDisplay = makeChar({
      id: 'strong-display',
      powerPoints: 8,
      cost: [{ type: 'number', value: 3 }],
    });

    const player = makePlayer({
      hand: [makePearl(3, 'p3')],
      portal: [
        { id: 'p-a', card: weakA, activated: false },
        { id: 'p-b', card: weakB, activated: false },
      ],
    });
    const G = makeGame({ '0': player }, { characterSlots: [strongDisplay] });

    const action = WendelinBot(G, { currentPlayer: '0' }, '0');

    expect(action.move).toBe('takeCharacterCard');
    const args = action.args as unknown[];
    // 2-arg form: [displayIdx, portalSlot] — signals a swap.
    expect(args.length).toBe(2);
    expect(args[0]).toBe(0); // display card index
    // Weakest portal card is slot 0 (2 pts).
    expect(args[1]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — Peek (previewCharacter) vor erster Aktion
// ---------------------------------------------------------------------------

describe('WendelinBot — Blaue Fähigkeit (peek)', () => {
  it('spielt peekCharacterDeck vor der ersten Aktion wenn Ability aktiv', () => {
    const player = makePlayer({}, [previewAbility]);
    const G = makeGame({ '0': player }, { actionCount: 0 });

    const action = WendelinBot(G, { currentPlayer: '0' }, '0');

    expect(action).toEqual({ move: 'peekCharacterDeck', args: [] });
  });
});
