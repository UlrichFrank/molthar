/**
 * Bot factory — creates the appropriate strategy function for a given NpcStrategy.
 */

import type { GameState, NpcStrategy } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { IrrnisBot } from './IrrnisBot';
import { EdelsteinBot } from './EdelsteinBot';
import { WendelinBot } from './WendelinBot';
import { RalfBot } from './RalfBot';

export type BotStrategyFn = (
  G: GameState,
  ctx: { currentPlayer: string },
  playerID: string,
) => BotAction;

/**
 * Three production bot personalities. `random` and `greedy` remain in the
 * NpcStrategy union for backward compat and testing — `greedy` is mapped to
 * the Stratege, `random` to IrrnisBot (test-only, not exposed in lobby).
 */
export function createBot(strategy: NpcStrategy): BotStrategyFn {
  switch (strategy) {
    case 'diamond':    return EdelsteinBot;
    case 'efficient':  return WendelinBot;
    case 'aggressive': return RalfBot;
    case 'greedy':     return WendelinBot; // legacy alias → Stratege
    case 'random':     return IrrnisBot;   // test-only
    default:           return WendelinBot;
  }
}

export type { BotAction } from './enumerate';
export { enumerateMoves } from './enumerate';
