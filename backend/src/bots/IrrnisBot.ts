/**
 * IrrnisBot — "Irrnis, der Zufallsgeist"
 * Strategy: random — picks a random valid move each action.
 * Timing awareness: in endgame, activation moves get a tiny weight boost
 * (but high temperature means the effect is barely noticeable — intentional).
 */

import type { GameState } from '@portale-von-molthar/shared';
import { computeNeededValues } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { enumerateMoves } from './enumerate';
import { getTimingMultiplier } from './timing';

export function IrrnisBot(
  G: GameState,
  ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  let moves = enumerateMoves(G, ctx, playerID, 'random');
  if (moves.length === 0) return { event: 'endTurn' };

  // Handlimit-Schutz: wenn Hand voll und keine Perle nützlich, takePearlCard entfernen
  const player = G.players[playerID];
  if (player) {
    const handLimit = 5 + player.handLimitModifier;
    if (player.hand.length >= handLimit) {
      const neededValues = computeNeededValues(
        player.portal.map(e => e.card),
        player.hand,
        player.diamondCards.length,
        player.activeAbilities,
      );
      if (neededValues.size === 0) {
        moves = moves.filter(m => !('move' in m && m.move === 'takePearlCard'));
      }
    }
  }

  const timingMult = getTimingMultiplier(G, playerID);

  // In endgame, activation moves get slightly more weight — but barely noticeable
  // due to high temperature (= essentially still random, but spec-compliant)
  if (timingMult > 1.0) {
    const activateMoves = moves.filter(m => 'move' in m && m.move === 'activatePortalCard');
    const otherMoves = moves.filter(m => !('move' in m && m.move === 'activatePortalCard'));

    // Repeat activation moves proportional to timingMult (rounded), then pick randomly
    const weighted = [
      ...otherMoves,
      ...Array(Math.round(timingMult)).fill(null).flatMap(() => activateMoves),
    ];
    const pool = weighted.length > 0 ? weighted : moves;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick ?? { event: 'endTurn' };
  }

  const pick = moves[Math.floor(Math.random() * moves.length)];
  return pick ?? { event: 'endTurn' };
}
