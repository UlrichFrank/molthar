/**
 * GierBot — "Gier von Goldbach"
 * Strategy: greedy — activates any payable card (highest points first),
 * otherwise takes the highest-value pearl visible, otherwise takes a character card.
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';

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

  // 1. Activate payable portal card with most power points
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length))
    .sort((a, b) => b.entry.card.powerPoints - a.entry.card.powerPoints);

  if (activatable.length > 0) {
    const { entry, i } = activatable[0]!;
    const payment = findBotPayment(entry.card, player.hand, player.diamondCards.length, 'greedy');
    if (payment) return { move: 'activatePortalCard', args: [i, payment] };
  }

  // 2. Take character card if portal has room
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const bestIdx = bestCharacterIndex(G.characterSlots);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take highest-value visible pearl
  const bestPearlSlot = bestPearlSlotIndex(G);
  if (bestPearlSlot !== null) {
    return { move: 'takePearlCard', args: [bestPearlSlot] };
  }

  return { event: 'endTurn' };
}

function bestCharacterIndex(slots: CharacterCard[]): number {
  let best = 0;
  for (let i = 1; i < slots.length; i++) {
    if ((slots[i]?.powerPoints ?? 0) > (slots[best]?.powerPoints ?? 0)) best = i;
  }
  return best;
}

function bestPearlSlotIndex(G: GameState): number | null {
  let bestSlot: number | null = null;
  let bestValue = -1;
  for (let i = 0; i < G.pearlSlots.length; i++) {
    const card = G.pearlSlots[i];
    if (card && card.value > bestValue) {
      bestValue = card.value;
      bestSlot = i;
    }
  }
  return bestSlot;
}
