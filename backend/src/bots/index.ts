/**
 * Bot factory — creates the appropriate strategy function for a given NpcStrategy.
 */

import type { GameState, NpcStrategy } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { IrrnisBot } from './IrrnisBot';
import { GierBot } from './GierBot';
import { EdelsteinBot } from './EdelsteinBot';
import { WendelinBot } from './WendelinBot';
import { RalfBot } from './RalfBot';

export type BotStrategyFn = (
  G: GameState,
  ctx: { currentPlayer: string },
  playerID: string,
) => BotAction;

export function createBot(strategy: NpcStrategy): BotStrategyFn {
  switch (strategy) {
    case 'random':     return IrrnisBot;
    case 'greedy':     return GierBot;
    case 'diamond':    return EdelsteinBot;
    case 'efficient':  return WendelinBot;
    case 'aggressive': return RalfBot;
    default:           return IrrnisBot;
  }
}

export type { BotAction } from './enumerate';
export { enumerateMoves } from './enumerate';
