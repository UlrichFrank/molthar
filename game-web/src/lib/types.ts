// Cost Components (9 types from card-manager)
export type CostComponent =
  | { type: 'number'; value: number }
  | { type: 'nTuple'; n: number }
  | { type: 'sumAnyTuple'; sum: number }
  | { type: 'sumTuple'; min: number; max: number }
  | { type: 'run'; length: number }
  | { type: 'evenTuple'; count: number }
  | { type: 'oddTuple'; count: number }
  | { type: 'drillingChoice'; val1: number; val2: number }
  | { type: 'none' };

// Ability Types (14 types)
export const AbilityType = {
  // Red Abilities (instant, once per card)
  ThreeExtraActions: 'threeExtraActions',
  NextPlayerOneExtraAction: 'nextPlayerOneExtraAction',
  DiscardOpponentCharacter: 'discardOpponentCharacter',
  StealOpponentHandCard: 'stealOpponentHandCard',
  TakeBackPlayedPearl: 'takeBackPlayedPearl',

  // Blue Abilities (persistent)
  OnesCanBeEights: 'onesCanBeEights',
  ThreesCanBeAny: 'threesCanBeAny',
  TradeTwoForDiamond: 'tradeTwoForDiamond',
  HandLimitPlusOne: 'handLimitPlusOne',
  OneExtraActionPerTurn: 'oneExtraActionPerTurn',
  ChangeHandActions: 'changeHandActions',
  ProvidesVirtualPearl: 'providesVirtualPearl',
  Irrlicht: 'irrlicht',

  // None
  None: 'none',
} as const;

export type AbilityType = (typeof AbilityType)[keyof typeof AbilityType];

// Pearl Card
export interface PearlCard {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  hasSwapSymbol: boolean;
}

// Character Card
export interface CharacterCard {
  id: string;
  name: string;
  cost: CostComponent[];
  powerPoints: number;
  diamonds: number;
  ability: AbilityType;
  imageUrl?: string;
}

// Player State
export interface PlayerState {
  id: string;
  name: string;
  hand: PearlCard[];
  portal: {
    characters: CharacterCard[];
    diamonds: number;
    powerPoints: number;
  };
  actionCount: number;
}

// Game State
export interface IGameState {
  players: PlayerState[];
  currentPlayer: number;
  pearlDeck: PearlCard[];
  pearlDiscardPile: PearlCard[];
  characterDeck: CharacterCard[];
  characterDiscardPile: CharacterCard[];
  faceUpPearls: PearlCard[];
  faceUpCharacters: CharacterCard[];
  gamePhase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  finalRoundActive: boolean;
  finalRoundPlayers: number[];
  winner?: string;
  gameLog: GameAction[];
}

// Game Actions
export const GameActionType = {
  TakePearlCard: 'takePearlCard',
  PlaceCharacter: 'placeCharacter',
  ActivateCharacter: 'activateCharacter',
  EndTurn: 'endTurn',
  DiscardCards: 'discardCards',
  UseRedAbility: 'useRedAbility',
} as const;

export type GameActionType =
  (typeof GameActionType)[keyof typeof GameActionType];

export interface GameAction {
  type: GameActionType;
  playerId: string;
  payload?: any;
  timestamp: number;
}
