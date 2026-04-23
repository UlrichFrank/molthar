/**
 * softmax.ts — Boltzmann/Softmax-Auswahl für NPC-Bots.
 *
 * Ermöglicht "menschliches" Verhalten: beste Züge sind wahrscheinlicher,
 * aber nicht garantiert. Temperatur steuert die Zufälligkeit:
 *   T → 0  : deterministisch (immer der beste)
 *   T → ∞  : Gleichverteilung (vollständig zufällig)
 */

import type { NpcStrategy } from '@portale-von-molthar/shared';

// ---------------------------------------------------------------------------
// Temperaturen pro Strategie
// ---------------------------------------------------------------------------

export const STRATEGY_TEMPERATURES: Record<NpcStrategy, number> = {
  random:     Infinity, // Gleichverteilung — kein Softmax nötig
  greedy:     1.5,      // impulsiv, macht öfter Fehler
  aggressive: 1.2,      // unberechenbar, manchmal irrational
  efficient:  0.8,      // solide, gelegentlich suboptimal
  diamond:    0.6,      // methodisch, selten Fehler
};

// ---------------------------------------------------------------------------
// softmaxPick — wählt ein Element per Boltzmann-Verteilung
// ---------------------------------------------------------------------------

/**
 * Wählt ein Element aus `items` per Softmax-Verteilung.
 * Score-Normalisierung (Shift auf Minimum=0) verhindert Probleme mit negativen Scores.
 *
 * @param items       Array von Elementen mit Score
 * @param temperature Temperaturparameter (höher = mehr Zufall)
 * @returns           Das gewählte Element
 */
export function softmaxPick<T>(
  items: Array<{ item: T; score: number }>,
  temperature: number,
): T {
  if (items.length === 0) {
    throw new Error('softmaxPick: items array must not be empty');
  }

  if (items.length === 1) return items[0]!.item;

  // Gleichverteilung bei Infinity-Temperatur
  if (!isFinite(temperature)) {
    return items[Math.floor(Math.random() * items.length)]!.item;
  }

  // Score-Normalisierung: Minimum auf 0 verschieben
  const minScore = Math.min(...items.map(i => i.score));
  const shifted = items.map(i => ({ item: i.item, score: i.score - minScore }));

  // Boltzmann-Gewichte berechnen
  // Numerisch stabil: zusätzlicher Shift um max-Score (log-sum-exp Trick)
  const maxScore = Math.max(...shifted.map(i => i.score));
  const weights = shifted.map(i => Math.exp((i.score - maxScore) / temperature));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Zufälliges Element nach Gewicht auswählen
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]!;
    if (rand <= 0) return items[i]!.item;
  }

  // Fallback (Floating-Point-Ungenauigkeit)
  return items[items.length - 1]!.item;
}
