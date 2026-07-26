/**
 * WendelinBot — "Weiser Wendelin" (Stratege)
 * Strategy: efficient — maximises power points per activation effort.
 *
 * Smart Core hooks:
 *  - resolvePending  (red-ability follow-ups)
 *  - pickBlueAbilityAction (peek, swap, trade — before normal actions)
 *  - evaluatePortalSwap (Lücke 1+4 — takes over full portal)
 *  - kontinuierliches Timing (Lücke 2)
 *  - pearl decision uses contest-fix via denyThreshold=1.0
 *
 * Personality delta:
 *  - Card score:      powerPoints / (effort + 1)  (pts per work)
 *  - Portal target:   highest score across portal + display candidates
 *  - Softmax T:       0.7 (focused, few random picks)
 */

import type { GameState } from '@portale-von-molthar/shared';
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

const T = STRATEGY_TEMPERATURES.efficient;

export function WendelinBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'efficient');
  if (pending) return pending;

  // Smart Core: blue-ability moves (free — no action cost).
  const blue = pickBlueAbilityAction(G, playerID, 'efficient');
  if (blue) return blue;

  const timingMult = getTimingMultiplier(G, playerID);
  const diamonds = player.diamondCards.length;

  // 1. Activate payable portal card — score by powerPoints × timing
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, diamonds));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, diamonds, 'efficient');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Pick best card candidate — either take from display OR swap into full portal.
  if (G.characterSlots.length > 0) {
    const candidateScored = G.characterSlots
      .map((card, displayIdx) => {
        const effort = estimateEffort(card, player.hand, diamonds);
        return {
          item: { card, displayIdx },
          score: scoreCardForStrategy(card, 'efficient', effort, G.pearlDeck.length),
        };
      })
      .filter(c => Number.isFinite(c.score));

    // Compare against current portal — only take if candidate improves the portal.
    if (candidateScored.length > 0) {
      const bestCandidate = softmaxPick(candidateScored, T);
      const { card: candidateCard, displayIdx } = bestCandidate;

      if (player.portal.length < 2) {
        // Free slot: just take it.
        return { move: 'takeCharacterCard', args: [displayIdx] };
      }

      // Portal full: consider swap.
      const swap = evaluatePortalSwap(G, playerID, candidateCard, 'efficient', G.pearlDeck.length);
      if (swap.swap && swap.portalSlot !== undefined) {
        return { move: 'takeCharacterCard', args: [displayIdx, swap.portalSlot] };
      }
    }
  }

  // 3. Pearl action (uses contest-fix + neededValues internally).
  const pearlAction = pickPearlAction(G, playerID, 'efficient');
  if (pearlAction) return pearlAction;

  return { event: 'endTurn' };
}
