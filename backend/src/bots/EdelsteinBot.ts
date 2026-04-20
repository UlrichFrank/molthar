/**
 * EdelsteinBot — "Edelstein-Erda"
 * Strategy: diamond — prioritises characters with the most diamond rewards.
 * Pearl selection uses strategy-aware scoring targeting the diamond-richest card.
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, bestPearlSlotByScore } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';

export function EdelsteinBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'diamond');
  if (pending) return pending;

  // 1. Activate payable portal card with most diamonds (tiebreak: most points)
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length))
    .sort((a, b) =>
      b.entry.card.diamonds !== a.entry.card.diamonds
        ? b.entry.card.diamonds - a.entry.card.diamonds
        : b.entry.card.powerPoints - a.entry.card.powerPoints,
    );

  if (activatable.length > 0) {
    const { entry, i } = activatable[0]!;
    const payment = findBotPayment(entry.card, player.hand, player.diamondCards.length, 'diamond');
    if (payment) return { move: 'activatePortalCard', args: [i, payment] };
  }

  // 2. Take character card with most diamonds if portal has room
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const bestIdx = bestDiamondCharIndex(G.characterSlots);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take pearl that best helps target card (diamond strategy scoring)
  const bestSlot = bestPearlSlotByScore(G, playerID, 'diamond');
  if (bestSlot !== null) return { move: 'takePearlCard', args: [bestSlot] };

  return { event: 'endTurn' };
}

function bestDiamondCharIndex(slots: CharacterCard[]): number {
  let best = 0;
  for (let i = 1; i < slots.length; i++) {
    const curr = slots[i]!;
    const bestCard = slots[best]!;
    if (
      curr.diamonds > bestCard.diamonds ||
      (curr.diamonds === bestCard.diamonds && curr.powerPoints > bestCard.powerPoints)
    ) {
      best = i;
    }
  }
  return best;
}
