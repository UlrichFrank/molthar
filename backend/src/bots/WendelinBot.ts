/**
 * WendelinBot — "Weiser Wendelin"
 * Strategy: efficient — maximises power points per activation effort.
 * "Effort" = number of cost components not yet coverable by current hand.
 * Payment preserves highest-value cards in hand.
 */

import type { GameState, CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, findCostAssignment } from '@portale-von-molthar/shared';
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
  const allCandidates: { card: CharacterCard; effort: number }[] = [
    ...player.portal.map(e => ({ card: e.card, effort: estimateEffort(e.card, player.hand, player.diamondCards.length) })),
    ...G.characterSlots.map(c => ({ card: c, effort: estimateEffort(c, player.hand, player.diamondCards.length) })),
  ];

  if (allCandidates.length === 0) {
    const bestSlot = bestPearlSlotIndex(G);
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

  // 4. Take a pearl that helps pay for the target card
  const neededSlot = findPearlForTarget(G, target.card, player.hand);
  if (neededSlot !== null) return { move: 'takePearlCard', args: [neededSlot] };

  // 5. Fallback: highest pearl
  const bestSlot = bestPearlSlotIndex(G);
  if (bestSlot !== null) return { move: 'takePearlCard', args: [bestSlot] };

  return { event: 'endTurn' };
}

/**
 * Estimate how many more actions are needed to activate a card.
 * 0 = already payable now.
 */
function estimateEffort(
  card: CharacterCard,
  hand: PearlCard[],
  diamondCount: number,
): number {
  if (findCostAssignment(card.cost, hand, diamondCount) !== null) return 0;
  // Rough estimate: number of cost components we cannot cover
  let missing = 0;
  for (const comp of card.cost ?? []) {
    if (comp.type === 'diamond') {
      if (diamondCount < (comp.value ?? 1)) missing++;
    } else {
      missing++;
    }
  }
  return Math.max(1, missing);
}

function findPearlForTarget(
  G: GameState,
  card: CharacterCard,
  hand: PearlCard[],
): number | null {
  // Try each visible pearl slot: pick the one that, if added to hand, reduces effort the most
  let bestSlot: number | null = null;
  let bestEffortReduction = -1;

  const currentEffort = estimateEffort(card, hand, 0);

  for (let i = 0; i < G.pearlSlots.length; i++) {
    const pearl = G.pearlSlots[i];
    if (!pearl) continue;
    const newEffort = estimateEffort(card, [...hand, pearl], 0);
    const reduction = currentEffort - newEffort;
    if (reduction > bestEffortReduction) {
      bestEffortReduction = reduction;
      bestSlot = i;
    }
  }

  return bestSlot;
}

function bestPearlSlotIndex(G: GameState): number | null {
  let best: number | null = null;
  let bestVal = -1;
  for (let i = 0; i < G.pearlSlots.length; i++) {
    const card = G.pearlSlots[i];
    if (card && card.value > bestVal) {
      bestVal = card.value;
      best = i;
    }
  }
  return best;
}
