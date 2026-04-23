/**
 * EdelsteinBot — "Edelstein-Erda"
 * Strategy: diamond — prioritises characters with the most diamond rewards.
 * Pearl selection uses strategy-aware scoring targeting the diamond-richest card.
 */

import type { GameState } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';
import { getTimingMultiplier } from './timing';
import { pickPearlAction } from './pearlDecision';

const T = STRATEGY_TEMPERATURES.diamond;

export function EdelsteinBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'diamond');
  if (pending) return pending;

  const timingMult = getTimingMultiplier(G, playerID);

  // 1. Activate payable portal card — Softmax gewichtet nach Diamonds + Punkten × Timing
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: a.entry.card.diamonds * 3 + a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, player.diamondCards.length, 'diamond');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Take character card — Softmax gewichtet nach Diamonds, Tiebreak Punkte
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const scored = G.characterSlots.map((card, i) => ({
      item: i,
      score: card.diamonds * 3 + card.powerPoints,
    }));
    const bestIdx = softmaxPick(scored, T);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take pearl — needs-aware decision
  const pearlAction = pickPearlAction(G, playerID, 'diamond');
  if (pearlAction) return pearlAction;

  return { event: 'endTurn' };
}

