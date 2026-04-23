/**
 * GierBot — "Gier von Goldbach"
 * Strategy: greedy — activates any payable card (highest points first),
 * otherwise takes the pearl that best helps the target card, otherwise takes a character card.
 */

import type { GameState } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, scoredPearlSlots } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';
import { getTimingMultiplier } from './timing';

const T = STRATEGY_TEMPERATURES.greedy;

export function GierBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  // Resolve any pending ability states first
  const pending = resolvePending(G, playerID, 'greedy');
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
    const payment = findBotPayment(chosen.entry.card, player.hand, player.diamondCards.length, 'greedy');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Take character card — Softmax gewichtet nach Punkten
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const scored = G.characterSlots.map((card, i) => ({ item: i, score: card.powerPoints }));
    const bestIdx = softmaxPick(scored, T);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take pearl — Softmax über Slot-Scores
  const slots = scoredPearlSlots(G, playerID, 'greedy');
  if (slots.length > 0) {
    const scored = slots.map(s => ({ item: s.slot, score: s.score }));
    const bestSlot = softmaxPick(scored, T);
    return { move: 'takePearlCard', args: [bestSlot] };
  }

  return { event: 'endTurn' };
}
