/**
 * LegacyDiamondBot — Snapshot of the pre-personas EdelsteinBot (commit d87cce1).
 *
 * Used only in verify.ts control tournaments (see run.ts `--legacy-diamond`)
 * to measure whether the new persona bots outperform the previous Meta-Sieger
 * strategy. **Never imported into the production bot factory** (`bots/index.ts`).
 *
 * Kept 1:1 as the git-restored code — DO NOT extend with new features/fixes,
 * otherwise the comparison stops being a fair baseline.
 *
 * Original header:
 *   EdelsteinBot — "Edelsteinsammlerin Erda" (Engine-First)
 *   Strategy: diamond — build a diamond-based engine, then leverage it for late
 *   high-cost activations.
 */

import type { GameState } from '@portale-von-molthar/shared';
import {
  canPayCard,
  findBotPayment,
  estimateEffort,
  evaluatePortalSwap,
  scoreCardForStrategy,
} from '@portale-von-molthar/shared';
import type { BotAction } from '../enumerate';
import { resolvePending } from '../pending';
import { softmaxPick, STRATEGY_TEMPERATURES } from '../softmax';
import { getTimingMultiplier } from '../timing';
import { pickPearlAction } from '../pearlDecision';
import { pickBlueAbilityAction } from '../blueAbilities';

const T = STRATEGY_TEMPERATURES.diamond;

export function LegacyDiamondBot(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
): BotAction {
  const player = G.players[playerID];
  if (!player) return { event: 'endTurn' };

  const pending = resolvePending(G, playerID, 'diamond');
  if (pending) return pending;

  const blue = pickBlueAbilityAction(G, playerID, 'diamond');
  if (blue) return blue;

  const timingMult = getTimingMultiplier(G, playerID);
  const diamonds = player.diamondCards.length;

  // 1. Activate payable portal card — diamonds weighted x3.
  const activatable = player.portal
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => canPayCard(entry.card, player.hand, diamonds));

  if (activatable.length > 0) {
    const scored = activatable.map(a => ({
      item: a,
      score: a.entry.card.diamonds * 3 + a.entry.card.powerPoints * timingMult,
    }));
    const chosen = softmaxPick(scored, T);
    const payment = findBotPayment(chosen.entry.card, player.hand, diamonds, 'diamond');
    if (payment) return { move: 'activatePortalCard', args: [chosen.i, payment] };
  }

  // 2. Character card — take or swap. Diamond + blue-modifier bonuses via scoreCardForStrategy.
  if (G.characterSlots.length > 0) {
    const candidateScored = G.characterSlots.map((card, displayIdx) => ({
      item: { card, displayIdx },
      score: scoreCardForStrategy(card, 'diamond', estimateEffort(card, player.hand, diamonds)),
    }));

    if (candidateScored.length > 0) {
      const best = softmaxPick(candidateScored, T);
      if (player.portal.length < 2) {
        return { move: 'takeCharacterCard', args: [best.displayIdx] };
      }
      const swap = evaluatePortalSwap(G, playerID, best.card, 'diamond');
      if (swap.swap && swap.portalSlot !== undefined) {
        return { move: 'takeCharacterCard', args: [best.displayIdx, swap.portalSlot] };
      }
    }
  }

  // 3. Pearl — needs-aware.
  const pearlAction = pickPearlAction(G, playerID, 'diamond');
  if (pearlAction) return pearlAction;

  return { event: 'endTurn' };
}
