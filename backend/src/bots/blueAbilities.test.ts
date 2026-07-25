import { describe, it, expect } from 'vitest';
import { pickBlueAbilityAction } from './blueAbilities';
import type {
  GameState,
  PlayerState,
  CharacterCard,
  CharacterAbility,
  PearlCard,
} from '@portale-von-molthar/shared';

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
    cost: [{ type: 'number', value: 3 }],
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
    name: 'Test',
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

function makeGame(player: PlayerState, overrides: Partial<GameState> = {}): GameState {
  return {
    pearlDeck: [],
    characterDeck: [makeChar({ powerPoints: 5 })],
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
const swapAbility: CharacterAbility = {
  id: 'ab-swap',
  type: 'changeCharacterActions',
  persistent: true,
  description: 'Swap portal character',
};
const tradeAbility: CharacterAbility = {
  id: 'ab-trade',
  type: 'tradeTwoForDiamond',
  persistent: true,
  description: 'Trade 2-pearl for diamond',
};

describe('pickBlueAbilityAction — peekCharacterDeck', () => {
  it('returns peek when ability is active and turn just started', () => {
    const player = makePlayer({}, [previewAbility]);
    const G = makeGame(player);
    const action = pickBlueAbilityAction(G, '0', 'diamond');
    expect(action).toEqual({ move: 'peekCharacterDeck', args: [] });
  });

  it('does not peek when player already peeked this turn', () => {
    const player = makePlayer({ peekedCard: makeChar() }, [previewAbility]);
    const G = makeGame(player);
    const action = pickBlueAbilityAction(G, '0', 'diamond');
    expect(action).toBeNull();
  });

  it('does not peek after first action', () => {
    const player = makePlayer({}, [previewAbility]);
    const G = makeGame(player, { actionCount: 1 });
    const action = pickBlueAbilityAction(G, '0', 'diamond');
    expect(action).toBeNull();
  });

  it('does not peek when ability inactive', () => {
    const player = makePlayer({}, []);
    const G = makeGame(player);
    expect(pickBlueAbilityAction(G, '0', 'diamond')).toBeNull();
  });
});

describe('pickBlueAbilityAction — swapPortalCharacter', () => {
  it('swaps when full portal has a weaker card than a display card', () => {
    const weakCard = makeChar({ powerPoints: 2 });
    const strongCard = makeChar({ powerPoints: 6 });
    const displayStrong = makeChar({ powerPoints: 8 });
    const player = makePlayer(
      { portal: [{ id: 'a', card: weakCard, activated: false }, { id: 'b', card: strongCard, activated: false }] },
      [swapAbility],
    );
    const G = makeGame(player, { characterSlots: [displayStrong] });
    const action = pickBlueAbilityAction(G, '0', 'greedy');
    expect(action).not.toBeNull();
    expect(action!.move).toBe('swapPortalCharacter');
    expect((action!.args as unknown[])[0]).toBe(0); // weak card slot
    expect((action!.args as unknown[])[1]).toBe(0); // display index
  });

  it('does not swap when display cards are weaker than both portal cards', () => {
    const strong1 = makeChar({ powerPoints: 6 });
    const strong2 = makeChar({ powerPoints: 7 });
    const weakDisplay = makeChar({ powerPoints: 3 });
    const player = makePlayer(
      { portal: [{ id: 'a', card: strong1, activated: false }, { id: 'b', card: strong2, activated: false }] },
      [swapAbility],
    );
    const G = makeGame(player, { characterSlots: [weakDisplay] });
    expect(pickBlueAbilityAction(G, '0', 'greedy')).toBeNull();
  });
});

describe('pickBlueAbilityAction — tradeForDiamond', () => {
  it('trades a 2-pearl when diamond strategy and 2 not useful for portal', () => {
    const targetCard = makeChar({ cost: [{ type: 'number', value: 7 }] });
    const player = makePlayer(
      {
        hand: [makePearl(2)],
        portal: [{ id: 'a', card: targetCard, activated: false }],
      },
      [tradeAbility],
    );
    const G = makeGame(player);
    const action = pickBlueAbilityAction(G, '0', 'diamond');
    expect(action).not.toBeNull();
    expect(action!.move).toBe('tradeForDiamond');
    expect((action!.args as unknown[])[0]).toBe(0);
  });

  it('keeps 2-pearl when portal card explicitly needs a 2', () => {
    const targetCard = makeChar({ cost: [{ type: 'number', value: 2 }] });
    const player = makePlayer(
      {
        hand: [makePearl(2)],
        portal: [{ id: 'a', card: targetCard, activated: false }],
      },
      [tradeAbility],
    );
    const G = makeGame(player);
    expect(pickBlueAbilityAction(G, '0', 'diamond')).toBeNull();
  });

  it('does not trade when player has no 2-pearl', () => {
    const player = makePlayer({ hand: [makePearl(5)] }, [tradeAbility]);
    const G = makeGame(player);
    expect(pickBlueAbilityAction(G, '0', 'diamond')).toBeNull();
  });
});

describe('pickBlueAbilityAction — precedence', () => {
  it('returns peek first when both preview and trade are available', () => {
    const player = makePlayer(
      {
        hand: [makePearl(2)],
        portal: [{ id: 'a', card: makeChar({ cost: [{ type: 'number', value: 7 }] }), activated: false }],
      },
      [previewAbility, tradeAbility],
    );
    const G = makeGame(player);
    const action = pickBlueAbilityAction(G, '0', 'diamond');
    expect(action?.move).toBe('peekCharacterDeck');
  });
});
