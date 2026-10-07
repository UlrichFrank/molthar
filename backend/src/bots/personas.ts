/**
 * personas — planner parameters per NPC personality.
 *
 *  - Wendelin (efficient): pure tempo — minimises expected actions to 12 points.
 *  - Edelstein (diamond):  engine builder — values diamonds and blue abilities.
 *  - Ralf (aggressive):    disruptor — denies pearls/cards the leader needs and
 *                          prefers red attack abilities.
 */

import type { NpcStrategy } from '@portale-von-molthar/shared';
import type { GameState } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { DEFAULT_PARAMS, planAction, pickDiscardTarget, pickStealTarget } from './planner';
import type { PlannerParams } from './planner';
import { pickBlueAbilityAction } from './blueAbilities';

export const PERSONA_PARAMS: Record<'efficient' | 'diamond' | 'aggressive', PlannerParams> = {
  efficient:  { ...DEFAULT_PARAMS, temperature: 0.1 },
  diamond:    { ...DEFAULT_PARAMS, temperature: 0.25, diamondValue: 1.0, abilityWeight: 1.5 },
  aggressive: { ...DEFAULT_PARAMS, temperature: 0.25, denyWeight: 0.4, redBonus: 2 },
};

function resolvePendingSmart(G: GameState, playerID: string): BotAction | null {
  if (G.pendingStealOpponentHandCard) {
    const t = pickStealTarget(G, playerID);
    if (t) return { move: 'resolveStealOpponentHandCard', args: [t.playerId, t.index] };
  }
  if (G.pendingDiscardOpponentCharacter) {
    const t = pickDiscardTarget(G, playerID);
    if (t) return { move: 'resolveDiscardOpponentCharacter', args: [t.playerId, t.entryId] };
  }
  if (G.pendingTakeBackPlayedPearl) {
    for (const pearlId of G.playedRealPearlIds) {
      if (G.pearlDiscardPile.some(p => p.id === pearlId)) {
        return { move: 'resolveReturnPearl', args: [pearlId] };
      }
    }
    return { move: 'dismissReturnPearlDialog', args: [] };
  }
  return null;
}

export function makePlannerBot(strategy: NpcStrategy, params: PlannerParams) {
  return (G: GameState, _ctx: { currentPlayer: string }, playerID: string): BotAction => {
    if (!G.players[playerID]) return { event: 'endTurn' };
    const pending = resolvePendingSmart(G, playerID);
    if (pending) return pending;
    const blue = pickBlueAbilityAction(G, playerID, strategy);
    if (blue) return blue;
    return planAction(G, playerID, params);
  };
}
