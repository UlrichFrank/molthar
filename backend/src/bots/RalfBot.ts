/**
 * RalfBot — "Raubritter Ralf"
 * Strategy: aggressive — prioritises characters with red (instant) abilities,
 * especially steal/discard. Targets the leading player. Falls back to GierBot logic.
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';

const RED_PRIORITY_ABILITIES = ['discardOpponentCharacter', 'stealOpponentHandCard'];

export function RalfBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  // Resolve pending states (attack leading opponent)
  const pending = resolvePending(G, playerID, 'aggressive');
  if (pending) return pending;

  // 1. Prefer portal cards with red abilities, then fallback to most points
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length))
    .sort((a, b) => {
      const aRed = hasRedAbility(a.entry.card) ? 1 : 0;
      const bRed = hasRedAbility(b.entry.card) ? 1 : 0;
      if (bRed !== aRed) return bRed - aRed;
      return b.entry.card.powerPoints - a.entry.card.powerPoints;
    });

  if (activatable.length > 0) {
    const { entry, i } = activatable[0]!;
    const payment = findBotPayment(entry.card, player.hand, player.diamondCards.length, 'aggressive');
    if (payment) return { move: 'activatePortalCard', args: [i, payment] };
  }

  // 2. Take character card with red ability if portal has room
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const redIdx = G.characterSlots.findIndex(hasRedAbility);
    if (redIdx >= 0) return { move: 'takeCharacterCard', args: [redIdx] };
    // Fallback: most power points
    const bestIdx = bestCharacterIndex(G.characterSlots);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take highest-value pearl
  const bestSlot = bestPearlSlotIndex(G);
  if (bestSlot !== null) return { move: 'takePearlCard', args: [bestSlot] };

  return { event: 'endTurn' };
}

function hasRedAbility(card: CharacterCard): boolean {
  return card.abilities.some(
    a => !a.persistent && RED_PRIORITY_ABILITIES.includes(a.type),
  );
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
