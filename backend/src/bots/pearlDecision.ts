/**
 * pearlDecision — Einheitliche Pearl-Entscheidungslogik für NPC-Bots.
 *
 * pickPearlAction() kapselt das neue Entscheidungsmodell:
 *  1. Berechne welche Perlenwerte den Bot noch weiterbringen (computeNeededValues).
 *  2. Filtere die sichtbaren Slots auf "nützliche" Perlen (Wert in neededValues).
 *  3. Sind nützliche Kandidaten vorhanden → Softmax darunter (Strategy-gewichtet).
 *  4. Kein Kandidat, Hand voll → replacePearlSlots.
 *  5. Kein Kandidat, Hand nicht voll → Fallback auf scoredPearlSlots (Urgency/Seltenheit).
 */

import type { GameState, NpcStrategy } from '@portale-von-molthar/shared';
import { computeNeededValues, scoredPearlSlots } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';

/**
 * Entscheidet welche Pearl-Aktion ein Bot ausführen soll.
 * Gibt null zurück wenn keine sinnvolle Pearl-Aktion möglich ist (dann endTurn).
 */
export function pickPearlAction(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): BotAction | null {
  const player = G.players[playerID];
  if (!player) return null;

  const T = STRATEGY_TEMPERATURES[strategy];
  const diamonds = player.diamondCards.length;

  // Berechne welche Perlenwerte den Fortschritt erhöhen würden
  const portalCards = player.portal.map(e => e.card);
  const neededValues = computeNeededValues(
    portalCards,
    player.hand,
    diamonds,
    player.activeAbilities,
  );

  // Hole alle sichtbaren Slot-Scores (bestehende Urgency-/Contestedness-Logik)
  const allSlots = scoredPearlSlots(G, playerID, strategy);

  // Filtere auf nützliche Kandidaten (Wert in neededValues)
  const usefulSlots = allSlots.filter(({ slot }) => {
    const pearl = G.pearlSlots[slot];
    return pearl !== null && pearl !== undefined && neededValues.has(pearl.value);
  });

  // 3. Nützliche Kandidaten vorhanden → Softmax darunter
  if (usefulSlots.length > 0) {
    const scored = usefulSlots.map(s => ({ item: s.slot, score: s.score }));
    const bestSlot = softmaxPick(scored, T);
    return { move: 'takePearlCard', args: [bestSlot] };
  }

  // Kein nützlicher Kandidat — prüfe Hand-Status
  const handLimit = 5 + player.handLimitModifier;
  const handFull = player.hand.length >= handLimit;

  if (handFull) {
    // 4. Hand voll und keine nützliche Perle → Slots erneuern statt Müll nehmen
    return { move: 'replacePearlSlots', args: [] };
  }

  // 5. Hand nicht voll → nehme die Perle mit dem höchsten Urgency-Score (falls vorhanden).
  //    Auch wenn kein Direktbedarf, könnte Seltenheit/Contestedness einen Wert geben.
  if (allSlots.length > 0) {
    const scored = allSlots.map(s => ({ item: s.slot, score: s.score }));
    const bestSlot = softmaxPick(scored, T);
    return { move: 'takePearlCard', args: [bestSlot] };
  }

  // Blinder Zug vom Deck (nur als letzter Ausweg wenn keine Slots sichtbar)
  return null;
}
