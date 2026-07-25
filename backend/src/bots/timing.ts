/**
 * timing.ts — kontinuierliches Endgame-Timing für NPC-Bots.
 *
 * Der Multiplikator wird aus drei additiven Druck-Signalen gebildet:
 *   own_pressure   — eigene Punkte über der Schwelle
 *   leader_pressure — führender Gegner über der Schwelle
 *   deck_pressure  — wie leer der Nachziehstapel ist
 *
 * Zusammen ergibt das einen Wert im Bereich [1.0, ~2.7]. Höher = Bots
 * gewichten Aktivierungspunkte stärker als andere Signale.
 */

import type { GameState } from '@portale-von-molthar/shared';

/** Gewicht der eigenen Punkte oberhalb `PRESSURE_THRESHOLD`. */
export const URGENCY_OWN = 0.9;
/** Gewicht des führenden Gegners oberhalb `PRESSURE_THRESHOLD`. */
export const URGENCY_OPP = 0.5;
/** Gewicht des Deck-Endes (steigt linear von deck=30 gegen 0). */
export const URGENCY_DECK = 0.3;

const PRESSURE_THRESHOLD = 6;
const PRESSURE_SPAN = 6; // 6..12 → 0..1
const DECK_SPAN = 30;

/**
 * Kontinuierlicher Timing-Multiplikator für Bot-Aktivierungspriorisierung.
 * Monoton steigend in own_pts, leader_pts, sowie fallendem Deck.
 */
export function getTimingMultiplier(G: GameState, playerID: string): number {
  const player = G.players[playerID];
  if (!player) return 1.0;

  const ownPts = player.powerPoints;
  const leaderPts = Math.max(
    0,
    ...Object.values(G.players)
      .filter(p => p.id !== playerID)
      .map(p => p.powerPoints),
  );
  const deckSize = G.pearlDeck.length;

  const ownPressure = Math.min(1, Math.max(0, (ownPts - PRESSURE_THRESHOLD) / PRESSURE_SPAN));
  const oppPressure = Math.min(1, Math.max(0, (leaderPts - PRESSURE_THRESHOLD) / PRESSURE_SPAN));
  const deckPressure = Math.min(1, Math.max(0, (DECK_SPAN - deckSize) / DECK_SPAN));

  return (
    1.0 +
    URGENCY_OWN * ownPressure +
    URGENCY_OPP * oppPressure +
    URGENCY_DECK * deckPressure
  );
}
