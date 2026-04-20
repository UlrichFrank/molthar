/**
 * IrrnisBot — "Irrnis, der Zufallsgeist"
 * Strategy: random — picks a random valid move each action.
 */

import type { GameState } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { enumerateMoves } from './enumerate';

export function IrrnisBot(
  G: GameState,
  ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const moves = enumerateMoves(G, ctx, playerID, 'random');
  if (moves.length === 0) return { event: 'endTurn' };
  const pick = moves[Math.floor(Math.random() * moves.length)];
  return pick ?? { event: 'endTurn' };
}
