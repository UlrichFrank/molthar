/**
 * WendelinBot — "Weiser Wendelin"
 * Strategy: efficient — maximises power points per activation effort.
 * "Effort" = number of cost components not yet coverable by current hand.
 * Payment preserves highest-value cards in hand.
 */

import type { GameState } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, bestPearlSlotByScore, estimateEffort } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';

export function WendelinBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'efficient');
  if (pending) return pending;

  // 1. Activate payable portal card with best points/effort ratio
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length))
    .sort((a, b) => b.entry.card.powerPoints - a.entry.card.powerPoints);

  if (activatable.length > 0) {
    const { entry, i } = activatable[0]!;
    const payment = findBotPayment(entry.card, player.hand, player.diamondCards.length, 'efficient');
    if (payment) return { move: 'activatePortalCard', args: [i, payment] };
  }

  // 2. Choose best target card by points/effort ratio
  const diamonds = player.diamondCards.length;
  const allCandidates = [
    ...player.portal.map(e => ({ card: e.card, effort: estimateEffort(e.card, player.hand, diamonds) })),
    ...G.characterSlots.map(c => ({ card: c, effort: estimateEffort(c, player.hand, diamonds) })),
  ];

  if (allCandidates.length === 0) {
    const bestSlot = bestPearlSlotByScore(G, playerID, 'efficient');
    return bestSlot !== null ? { move: 'takePearlCard', args: [bestSlot] } : { event: 'endTurn' };
  }

  const target = allCandidates.reduce((best, c) => {
    const score = c.effort === 0 ? c.card.powerPoints : c.card.powerPoints / (c.effort + 1);
    const bestScore = best.effort === 0 ? best.card.powerPoints : best.card.powerPoints / (best.effort + 1);
    return score > bestScore ? c : best;
  });

  // 3. If target is in display (not in portal), take it
  const targetInPortal = player.portal.some(e => e.card === target.card);
  if (!targetInPortal && player.portal.length < 2) {
    const idx = G.characterSlots.indexOf(target.card);
    if (idx >= 0) return { move: 'takeCharacterCard', args: [idx] };
  }

  // 4. Take pearl with strategy-aware scoring (efficient: high urgency weight)
  const bestSlot = bestPearlSlotByScore(G, playerID, 'efficient');
  if (bestSlot !== null) return { move: 'takePearlCard', args: [bestSlot] };

  return { event: 'endTurn' };
}

