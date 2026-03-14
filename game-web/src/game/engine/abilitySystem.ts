/**
 * Ability System: Handles red (instant) and blue (persistent) abilities
 * Red abilities trigger once when character is activated
 * Blue abilities provide persistent game rule modifications
 */

import type { IGameState, AbilityType } from '../../lib/types';

export interface AbilityEffect {
  executed: boolean;
  message?: string;
}

/**
 * Process red ability (instant effect triggered on character activation)
 * Returns modified state and effect execution result
 */
export function executeRedAbility(
  state: IGameState,
  abilityType: AbilityType,
  activatingPlayerId: string
): [IGameState, AbilityEffect] {
  const activatingPlayerIdx = state.players.findIndex((p) => p.id === activatingPlayerId);
  if (activatingPlayerIdx === -1) {
    return [state, { executed: false, message: 'Activating player not found' }];
  }

  switch (abilityType) {
    case 'threeExtraActions':
      return executeThreeExtraActions(state, activatingPlayerIdx);

    case 'nextPlayerOneExtraAction':
      return executeNextPlayerOneExtraAction(state, activatingPlayerIdx);

    case 'discardOpponentCharacter':
      return executeDiscardOpponentCharacter(state, activatingPlayerIdx);

    case 'stealOpponentHandCard':
      return executeStealOpponentHandCard(state, activatingPlayerIdx);

    case 'takeBackPlayedPearl':
      return executeTakeBackPlayedPearl(state, activatingPlayerIdx);

    default:
      return [state, { executed: false, message: `Unknown red ability: ${abilityType}` }];
  }
}

/**
 * Check if a blue ability is active for the current player
 * Returns boolean indicating if ability should affect gameplay
 */
export function isBlueAbilityActive(state: IGameState, abilityType: AbilityType): boolean {
  const player = state.players[state.currentPlayer];
  if (!player) return false;

  // Check if any of the player's portal characters have this blue ability
  for (const character of player.portal.characters) {
    if (character.ability === abilityType) {
      return true;
    }
  }

  return false;
}

/**
 * Get all active blue abilities for current player
 */
export function getActiveBlueAbilities(state: IGameState): Set<AbilityType> {
  const player = state.players[state.currentPlayer];
  const abilities = new Set<AbilityType>();

  if (!player) return abilities;

  for (const character of player.portal.characters) {
    if (character.ability && character.ability !== 'none' && isBlueAbilityType(character.ability)) {
      abilities.add(character.ability as AbilityType);
    }
  }

  return abilities;
}

/**
 * Modify action count based on blue abilities
 */
export function getModifiedActionCount(state: IGameState, baseActions: number): number {
  const player = state.players[state.currentPlayer];
  if (!player) return baseActions;

  let modified = baseActions;

  // Check for oneExtraActionPerTurn ability
  if (isBlueAbilityActive(state, 'oneExtraActionPerTurn')) {
    modified += 1;
  }

  // TODO: changeHandActions would allow using hand cards as actions
  // This requires more complex logic for action types

  return modified;
}

/**
 * Get modified hand limit based on blue abilities
 */
export function getModifiedHandLimit(state: IGameState, baseLimit: number = 5): number {
  const player = state.players[state.currentPlayer];
  if (!player) return baseLimit;

  let modified = baseLimit;

  // Check for handLimitPlusOne ability
  if (isBlueAbilityActive(state, 'handLimitPlusOne')) {
    modified += 1;
  }

  return modified;
}

/**
 * Check if a pearl can be used as different value (blue ability modifiers)
 * Used by cost validator to allow flexible cost matching
 */
export function getPearlValueModifiers(state: IGameState): {
  onesCanBeEights: boolean;
  threesCanBeAny: boolean;
} {
  const player = state.players[state.currentPlayer];

  return {
    onesCanBeEights: player ? isBlueAbilityActive(state, 'onesCanBeEights') : false,
    threesCanBeAny: player ? isBlueAbilityActive(state, 'threesCanBeAny') : false,
  };
}

/**
 * RED ABILITY IMPLEMENTATIONS
 */

/**
 * Three Extra Actions: Current player gets +3 actions this turn
 */
function executeThreeExtraActions(
  state: IGameState,
  playerIdx: number
): [IGameState, AbilityEffect] {
  const newState = { ...state };
  newState.players = newState.players.map((p, idx) =>
    idx === playerIdx ? { ...p, actionCount: p.actionCount + 3 } : p
  );

  return [newState, { executed: true, message: 'Granted 3 extra actions' }];
}

/**
 * Next Player One Extra Action: Following player gets +1 action on their turn
 */
function executeNextPlayerOneExtraAction(
  state: IGameState,
  playerIdx: number
): [IGameState, AbilityEffect] {
  const newState = { ...state };
  const nextPlayerIdx = (playerIdx + 1) % state.players.length;

  // Set a flag or bonus to apply on next player's turn start
  // For now, we'll directly modify - in full implementation might use state flags
  newState.players = newState.players.map((p, idx) =>
    idx === nextPlayerIdx ? { ...p, actionCount: p.actionCount + 1 } : p
  );

  return [newState, { executed: true, message: 'Next player gets 1 extra action' }];
}

/**
 * Discard Opponent Character: Remove one opponent's character
 * For now, stub - needs opponent selection UI
 */
function executeDiscardOpponentCharacter(
  state: IGameState,
  _playerIdx: number
): [IGameState, AbilityEffect] {
  // TODO: In full implementation, this would require selecting an opponent
  // and their character. For now, return stub.
  return [state, { executed: false, message: 'Discard Opponent Character requires opponent selection' }];
}

/**
 * Steal Opponent Hand Card: Take one card from opponent's hand
 * For now, stub - needs opponent selection UI
 */
function executeStealOpponentHandCard(
  state: IGameState,
  _playerIdx: number
): [IGameState, AbilityEffect] {
  // TODO: In full implementation, this would require selecting an opponent
  // and their card. For now, return stub.
  return [state, { executed: false, message: 'Steal Opponent Hand Card requires opponent selection' }];
}

/**
 * Take Back Played Pearl: Retrieve a pearl from discard pile
 * For now, stub - needs card selection UI
 */
function executeTakeBackPlayedPearl(
  state: IGameState,
  _playerIdx: number
): [IGameState, AbilityEffect] {
  // TODO: In full implementation, this would allow selecting a pearl
  // from the discard pile to add back to hand. For now, return stub.
  return [state, { executed: false, message: 'Take Back Played Pearl requires card selection' }];
}

/**
 * Helper: Check if ability type is a blue (persistent) ability
 */
function isBlueAbilityType(ability: AbilityType): boolean {
  const blueAbilities = [
    'onesCanBeEights',
    'threesCanBeAny',
    'tradeTwoForDiamond',
    'handLimitPlusOne',
    'oneExtraActionPerTurn',
    'changeHandActions',
    'providesVirtualPearl',
    'irrlicht',
  ];
  return blueAbilities.includes(ability);
}

/**
 * Helper: Check if ability type is a red (instant) ability
 */
export function isRedAbilityType(ability: AbilityType): boolean {
  const redAbilities = [
    'threeExtraActions',
    'nextPlayerOneExtraAction',
    'discardOpponentCharacter',
    'stealOpponentHandCard',
    'takeBackPlayedPearl',
  ];
  return redAbilities.includes(ability);
}
