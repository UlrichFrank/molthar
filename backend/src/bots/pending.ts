/**
 * Shared helper: resolve pending ability states (steal, discard, takeBack).
 * Returns a BotAction if there's a pending state to resolve, null otherwise.
 */

import type { GameState, NpcStrategy } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';

export function resolvePending(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): BotAction | null {
  if (G.pendingStealOpponentHandCard) {
    // Pick opponent with most power points (aggressive) or first opponent (others)
    const opponents = Object.values(G.players)
      .filter(p => p.id !== playerID && p.hand.length > 0)
      .sort((a, b) =>
        strategy === 'aggressive'
          ? b.powerPoints - a.powerPoints
          : 0,
      );
    if (opponents.length > 0) {
      const target = opponents[0]!;
      return { move: 'resolveStealOpponentHandCard', args: [target.id, 0] };
    }
  }

  if (G.pendingDiscardOpponentCharacter) {
    // Pick opponent with most power points
    const opponents = Object.values(G.players)
      .filter(p => p.id !== playerID && p.portal.length > 0)
      .sort((a, b) =>
        strategy === 'aggressive'
          ? b.powerPoints - a.powerPoints
          : 0,
      );
    if (opponents.length > 0) {
      const target = opponents[0]!;
      const entry = target.portal[0];
      if (entry) {
        return { move: 'resolveDiscardOpponentCharacter', args: [target.id, entry.id] };
      }
    }
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
