/**
 * botPortalSwap — evaluates whether a bot should replace a portal card
 * with a candidate card from the display.
 *
 * Fixes Lücke 1 + 4: all previous bots refused to touch a full portal, even
 * when a display card was strictly stronger than one of the two held cards.
 *
 * The evaluator scores every card under a strategy-specific formula and
 * returns which portal slot (if any) should be swapped out.
 */

import type { CharacterCard, GameState, NpcStrategy } from './types.js';
import { estimateEffort } from './botPearlScorer.js';

// ---------------------------------------------------------------------------
// Scoring — strategy-specific
// ---------------------------------------------------------------------------

const RED_ABILITY_TYPES = new Set(['discardOpponentCharacter', 'stealOpponentHandCard']);
const BLUE_MODIFIER_TYPES = new Set([
  'onesCanBeEights',
  'threesCanBeAny',
  'decreaseWithPearl',
]);

function hasRedAbility(card: CharacterCard): boolean {
  return card.abilities.some(a => !a.persistent && RED_ABILITY_TYPES.has(a.type));
}

function hasBlueModifier(card: CharacterCard): boolean {
  return card.abilities.some(a => a.persistent && BLUE_MODIFIER_TYPES.has(a.type));
}

/**
 * Strategy-specific score for a character card, used for portal-slot comparison.
 * Higher = better. Effort is optional (only needed for efficient strategy).
 */
export function scoreCardForStrategy(
  card: CharacterCard,
  strategy: NpcStrategy,
  effort: number,
): number {
  switch (strategy) {
    case 'efficient':
      return effort === 0 ? card.powerPoints : card.powerPoints / (effort + 1);
    case 'diamond':
      return card.diamonds * 3 + card.powerPoints + (hasBlueModifier(card) ? 4 : 0);
    case 'aggressive':
      return card.powerPoints + (hasRedAbility(card) ? 8 : 0);
    case 'greedy':
      return card.powerPoints;
    case 'random':
      return 0;
    default:
      return card.powerPoints;
  }
}

// ---------------------------------------------------------------------------
// evaluatePortalSwap
// ---------------------------------------------------------------------------

export interface PortalSwapDecision {
  /** true when the bot should replace a portal card with `candidateCard`. */
  swap: boolean;
  /** Which portal slot (0 or 1) to replace. Only defined when swap=true. */
  portalSlot?: 0 | 1;
  /** Score delta (candidate − weakest portal). Positive = swap-worthy. */
  delta: number;
}

/**
 * Decide whether to replace a portal card with the given display candidate.
 *
 * Guarantees:
 *  - Only returns swap=true when portal has exactly 2 cards AND candidate
 *    scores strictly higher than at least one of them.
 *  - Non-full portals are handled elsewhere (`takeCharacterCard(idx)` without
 *    replace slot) — this evaluator returns `{ swap: false }` for them.
 */
export function evaluatePortalSwap(
  G: GameState,
  playerID: string,
  candidateCard: CharacterCard,
  strategy: NpcStrategy,
): PortalSwapDecision {
  const player = G.players[playerID];
  if (!player) return { swap: false, delta: 0 };
  if (player.portal.length < 2) return { swap: false, delta: 0 };

  const diamonds = player.diamondCards.length;
  const candidateScore = scoreCardForStrategy(
    candidateCard,
    strategy,
    estimateEffort(candidateCard, player.hand, diamonds),
  );

  const portalScores = player.portal.map((entry, i) => ({
    slot: i as 0 | 1,
    score: scoreCardForStrategy(
      entry.card,
      strategy,
      estimateEffort(entry.card, player.hand, diamonds),
    ),
  }));

  // Find the weakest portal card.
  const weakest = portalScores.reduce((a, b) => (a.score <= b.score ? a : b));

  const delta = candidateScore - weakest.score;
  if (delta > 0) {
    return { swap: true, portalSlot: weakest.slot, delta };
  }
  return { swap: false, delta };
}
