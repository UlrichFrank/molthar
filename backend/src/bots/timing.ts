/**
 * timing.ts — Endgame-Timing-Awareness für NPC-Bots.
 *
 * Gibt einen Multiplikator zurück, der steuert wie stark Bots
 * Punkt-Aktivierungen priorisieren sollen:
 *   1.8 — Endspurt (eigene Punkte ≥ 9)
 *   1.4 — Gegner führt (max. Gegner-Punkte ≥ 9, eigene < 9)
 *   1.0 — Normal
 */

import type { GameState } from '@portale-von-molthar/shared';

/**
 * Berechnet den Timing-Multiplikator für die Aktivierungspriorisierung.
 * Höherer Wert = Punkte werden stärker gewichtet.
 */
export function getTimingMultiplier(G: GameState, playerID: string): number {
  const player = G.players[playerID];
  if (!player) return 1.0;

  const ownPoints = player.powerPoints;

  if (ownPoints >= 9) return 1.8;

  const maxOpponentPoints = Math.max(
    0,
    ...Object.values(G.players)
      .filter(p => p.id !== playerID)
      .map(p => p.powerPoints),
  );

  if (maxOpponentPoints >= 9) return 1.4;

  return 1.0;
}
