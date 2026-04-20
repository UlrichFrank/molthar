/**
 * EdelsteinBot — "Edelstein-Erda"
 * Strategy: diamond — prioritises characters with the most diamond rewards.
 * Collects pearls that match the target character's cost.
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment } from '@portale-von-molthar/shared';
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

  // 3. Take a pearl that matches the cost of our target portal card
  const targetCard = pickTargetCard(player.portal.map(e => e.card), G.characterSlots);
  if (targetCard) {
    const neededValues = neededPearlValues(targetCard, player.hand);
    const matchingSlot = findMatchingPearlSlot(G, neededValues);
    if (matchingSlot !== null) {
      return { move: 'takePearlCard', args: [matchingSlot] };
    }
  }

  // 4. Fallback: highest pearl
  const bestSlot = bestPearlSlotIndex(G);
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

function pickTargetCard(portal: CharacterCard[], display: CharacterCard[]): CharacterCard | null {
  const candidates = [...portal, ...display];
  if (candidates.length === 0) return null;
  return candidates.reduce((best, c) =>
    c.diamonds > best.diamonds || (c.diamonds === best.diamonds && c.powerPoints > best.powerPoints)
      ? c
      : best,
  );
}

function neededPearlValues(card: CharacterCard, hand: import('@portale-von-molthar/shared').PearlCard[]): number[] {
  const needed: number[] = [];
  for (const comp of card.cost ?? []) {
    if (comp.type === 'number' && comp.value !== undefined) {
      if (!hand.some(h => h.value === comp.value)) needed.push(comp.value);
    }
  }
  return needed;
}

function findMatchingPearlSlot(G: GameState, neededValues: number[]): number | null {
  for (let i = 0; i < G.pearlSlots.length; i++) {
    const card = G.pearlSlots[i];
    if (card && neededValues.includes(card.value)) return i;
  }
  return null;
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
