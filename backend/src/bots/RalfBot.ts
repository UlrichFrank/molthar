/**
 * RalfBot — "Raubritter Ralf" (Disruption-First)
 * Strategy: aggressive — attack the leader, deny contested pearls, prioritise
 * character cards with red (instant) abilities.
 *
 * Smart Core hooks:
 *  - resolvePending targets the leading opponent (via pending.ts strategy branch)
 *  - pickBlueAbilityAction (peek/swap/trade)
 *  - evaluatePortalSwap (with red-ability bonus baked into scoreCardForStrategy)
 *  - kontinuierliches Timing
 *  - pearl decision uses denyThreshold=0 → aggressively blocks opponents
 *
 * Personality delta:
 *  - Card score:      powerPoints + (hasRed ? 8 : 0)
 *  - Portal target:   red-ability cards preferred even at equal points
 *  - Softmax T:       1.0 (reactive, moderate spread)
 */

import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import {
  canPayCard,
  findBotPayment,
  estimateEffort,
  evaluatePortalSwap,
  scoreCardForStrategy,
} from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';
import { resolvePending } from './pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';
import { getTimingMultiplier } from './timing';
import { pickPearlAction } from './pearlDecision';
import { pickBlueAbilityAction } from './blueAbilities';

const T = STRATEGY_TEMPERATURES.aggressive;
const RED_ABILITY_TYPES = new Set(['discardOpponentCharacter', 'stealOpponentHandCard']);

function hasRedAbility(card: CharacterCard): boolean {
  return card.abilities.some(a => !a.persistent && RED_ABILITY_TYPES.has(a.type));
}

export function RalfBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'aggressive');
  if (pending) return pending;

  const blue = pickBlueAbilityAction(G, playerID, 'aggressive');
  if (blue) return blue;

  const timingMult = getTimingMultiplier(G, playerID);
  const diamonds = player.diamondCards.length;

  // 1. Activate payable portal card — red abilities weighted heavily.
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, diamonds));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: (hasRedAbility(a.entry.card) ? 5 : 0) + a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, diamonds, 'aggressive');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Character card — take or swap. Red-ability bonus is inside scoreCardForStrategy.
  if (G.characterSlots.length > 0) {
    const candidateScored = G.characterSlots.map((card, displayIdx) => ({
      item: { card, displayIdx },
      score: scoreCardForStrategy(
        card,
        'aggressive',
        estimateEffort(card, player.hand, diamonds),
        G.pearlDeck.length,
      ),
    }));

    if (candidateScored.length > 0) {
      const best = softmaxPick(candidateScored, T);
      if (player.portal.length < 2) {
        return { move: 'takeCharacterCard', args: [best.displayIdx] };
      }
      const swap = evaluatePortalSwap(G, playerID, best.card, 'aggressive', G.pearlDeck.length);
      if (swap.swap && swap.portalSlot !== undefined) {
        return { move: 'takeCharacterCard', args: [best.displayIdx, swap.portalSlot] };
      }
    }
  }

  // 3. Pearl — denyThreshold=0 handled inside pickPearlAction → contested pearls preferred.
  const pearlAction = pickPearlAction(G, playerID, 'aggressive');
  if (pearlAction) return pearlAction;

  return { event: 'endTurn' };
}
