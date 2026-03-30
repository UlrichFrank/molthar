// Cost Types - new component-based system
export type CostComponent = 
  | { type: 'number'; value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }
  | { type: 'nTuple'; n: number }
  | { type: 'evenTuple'; n: number }
  | { type: 'oddTuple'; n: number }
  | { type: 'sumTuple'; n: number; sum: number }
  | { type: 'sumAnyTuple'; sum: number }
  | { type: 'run'; length: number }
  | { type: 'diamond' }
  | { type: 'tripleChoice'; value1: number; value2: number };

// Cost is now an array of components (all required = AND)
export type Cost = CostComponent[];

// Old Cost interface (kept for migration purposes)
export interface OldCost {
  type: 'identicalValues' | 'multipleIdenticalValues' | 'exactValues' | 'sum' | 'run' | 'allEven' | 'allOdd';
  count?: number;
  specificValue?: number | null;
  counts?: number[];
  specificValues?: (number | null)[];
  expected?: number[];
  target?: number;
  cardCount?: number | null;
  length?: number;
}

// Ability Types - matched to Swift GameEngine.swift
export type AbilityType =
  | 'none'
  | 'threeExtraActions'
  | 'anyAdditionalCardActions'
  | 'numberAdditionalCardActions'
  | 'changeHandActions'
  | 'changeCharacterActions'
  | 'nextPlayerOneExtraAction'
  | 'discardOpponentCharacter'
  | 'stealOpponentHandCard'
  | 'takeBackPlayedPearl'
  | 'onesCanBeEights'
  | 'threesCanBeAny'
  | 'tradeTwoForDiamond'
  | 'handLimitPlusOne'
  | 'oneExtraActionPerTurn'
  | 'providesVirtualPearl'
  | 'decreaseWithPearl'
  | 'previewCharacter'
  | 'irrlicht';

export type AbilityTiming = 'beforeAction' | 'duringTurn' | 'afterAction';

export interface Ability {
  type: AbilityType;
  timing?: AbilityTiming; // When the ability can be used
  value?: number | null; // Used for providesVirtualPearl and numberAdditionalCardActions
}

export interface CharacterCard {
  id: string;
  name: string;
  imageName: string;
  powerPoints: number; // 0-5
  diamondsReward: number; // 0-3
  cardCount: number; // 1+
  cost: Cost;
  ability: Ability;
}

export interface CardListItem {
  id: string;
  name: string;
  powerPoints: number;
  hasAbility: boolean;
}

// Ability info for UI
export interface AbilityInfo {
  type: AbilityType;
  label: string;
  description: string;
  category: 'red' | 'blue' | 'none';
  hasParameters: boolean;
}
