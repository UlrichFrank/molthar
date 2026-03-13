// Cost Types - matched to Swift GameEngine.swift
export type CostType = 
  | 'identicalValues'
  | 'multipleIdenticalValues'
  | 'exactValues'
  | 'sum'
  | 'run'
  | 'allEven'
  | 'allOdd';

export interface Cost {
  type: CostType;
  // identicalValues
  count?: number;
  specificValue?: number | null;
  // multipleIdenticalValues
  counts?: number[];
  specificValues?: (number | null)[];
  // exactValues
  expected?: number[];
  // sum
  target?: number;
  cardCount?: number | null;
  // run
  length?: number;
  // allEven, allOdd
  // (reuses count from above)
}

// Ability Types - matched to Swift GameEngine.swift
export type AbilityType =
  | 'none'
  | 'threeExtraActions'
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
  | 'irrlicht';

export interface Ability {
  type: AbilityType;
  value?: number | null; // Only used for providesVirtualPearl
}

export interface CharacterCard {
  id: string;
  name: string;
  imageName: string;
  powerPoints: number; // 0-5
  diamondsReward: number; // 0-3
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
  category: 'red' | 'blue' | 'special' | 'none';
  hasParameters: boolean;
}

// Cost info for UI
export interface CostInfo {
  type: CostType;
  label: string;
  description: string;
  fields: string[];
}
