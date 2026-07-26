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
