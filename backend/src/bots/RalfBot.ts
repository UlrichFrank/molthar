/**
 * RalfBot — "Raubritter Ralf"
 * Strategy: aggressive — prioritises characters with red (instant) abilities,
 * especially steal/discard. Targets the leading player. Falls back to GierBot logic.
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment, scoredPearlSlots } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';
import { getTimingMultiplier } from './timing';

const T = STRATEGY_TEMPERATURES.aggressive;
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

  const timingMult = getTimingMultiplier(G, playerID);

  // 1. Activate payable portal card — Softmax: rote Fähigkeiten + Punkte × Timing
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, player.diamondCards.length));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: (hasRedAbility(a.entry.card) ? 5 : 0) + a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, player.diamondCards.length, 'aggressive');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Take character card — Softmax: rote Fähigkeit stark bevorzugen
  if (player.portal.length < 2 && G.characterSlots.length > 0) {
    const scored = G.characterSlots.map((card, i) => ({
      item: i,
      score: (hasRedAbility(card) ? 8 : 0) + card.powerPoints,
    }));
    const bestIdx = softmaxPick(scored, T);
    return { move: 'takeCharacterCard', args: [bestIdx] };
  }

  // 3. Take pearl — Softmax über Slot-Scores (hoher Contest-Weight = defensiv)
  const slots = scoredPearlSlots(G, playerID, 'aggressive');
  if (slots.length > 0) {
    const scored = slots.map(s => ({ item: s.slot, score: s.score }));
    const bestSlot = softmaxPick(scored, T);
    return { move: 'takePearlCard', args: [bestSlot] };
  }

  return { event: 'endTurn' };
}

function hasRedAbility(card: CharacterCard): boolean {
  return card.abilities.some(
    a => !a.persistent && RED_PRIORITY_ABILITIES.includes(a.type),
  );
}
