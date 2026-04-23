/**
 * WendelinBot — "Weiser Wendelin"
 * Strategy: efficient — maximises power points per activation effort.
 * "Effort" = number of cost components not yet coverable by current hand.
 * Payment preserves highest-value cards in hand.
 */

import type { GameState } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, scoredPearlSlots, estimateEffort } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';
import { getTimingMultiplier } from './timing';

const T = STRATEGY_TEMPERATURES.efficient;

export function WendelinBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'efficient');
  if (pending) return pending;

  const timingMult = getTimingMultiplier(G, playerID);

  // 1. Activate payable portal card — Softmax gewichtet nach Punkten × Timing
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, player.diamondCards.length, 'efficient');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Choose best target card by points/effort ratio — Softmax
  const diamonds = player.diamondCards.length;

  type Candidate = { card: (typeof player.portal)[number]['card']; displayIdx: number | null };

  const allCandidates: Candidate[] = [
    ...player.portal.map(e => ({ card: e.card, displayIdx: null })),
    ...G.characterSlots.map((c, ci) => ({ card: c, displayIdx: ci })),
  ];

  if (allCandidates.length > 0) {
    const scored = allCandidates.map(c => {
      const effort = estimateEffort(c.card, player.hand, diamonds);
      const score = effort === 0 ? c.card.powerPoints : c.card.powerPoints / (effort + 1);
      return { item: c, score };
    });

    const target = softmaxPick(scored, T);

    // If target is in display (not in portal), take it
    if (target.displayIdx !== null && player.portal.length < 2) {
      return { move: 'takeCharacterCard', args: [target.displayIdx] };
    }
  }

  // 3. Take pearl — Softmax über Slot-Scores
  const slots = scoredPearlSlots(G, playerID, 'efficient');
  if (slots.length > 0) {
    const scored = slots.map(s => ({ item: s.slot, score: s.score }));
    const bestSlot = softmaxPick(scored, T);
    return { move: 'takePearlCard', args: [bestSlot] };
  }

  return { event: 'endTurn' };
}
