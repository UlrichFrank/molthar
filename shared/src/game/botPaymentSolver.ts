import type { CharacterCard, PearlCard, PaymentSelection, NpcStrategy } from './types.js';
import { findCostAssignment } from './costCalculation.js';

/**
 * Check whether a bot can afford to activate a character card.
 */
export function canPayCard(
  card: CharacterCard,
  hand: PearlCard[],
  diamondCount: number,
): boolean {
  return findCostAssignment(card.cost, hand, diamondCount) !== null;
}

/**
 * Find a PaymentSelection[] for activating a character card.
 * Uses the AI-only `findCostAssignment` from costCalculation.ts.
 *
 * - random / greedy / aggressive: first valid assignment (default ordering)
 * - diamond: same as greedy (payment isn't strategy-critical for this bot type)
 * - efficient: sort hand ascending by value first → preserves high-value cards
 *
 * Returns null if the card cannot be paid for with the given hand.
 */
export function findBotPayment(
  card: CharacterCard,
  hand: PearlCard[],
  diamondCount: number,
  strategy: NpcStrategy,
): PaymentSelection[] | null {
  if (strategy === 'efficient') {
    // Sort indices ascending by pearl value so findCostAssignment uses cheapest cards first
    const sortedIndices = [...hand.keys()].sort(
      (a, b) => hand[a]!.value - hand[b]!.value,
    );
    const sortedHand = sortedIndices.map(i => hand[i]!);
    const assignment = findCostAssignment(card.cost, sortedHand, diamondCount);
    if (!assignment) return null;
    return assignmentToSelections(assignment, sortedHand, sortedIndices);
  }

  const assignment = findCostAssignment(card.cost, hand, diamondCount);
  if (!assignment) return null;
  return assignmentToSelections(assignment, hand, [...hand.keys()]);
}

/**
 * Choose the best payment from a set of pre-computed combinations.
 * Provided for spec completeness; in practice `findBotPayment` is used directly.
 */
export function chooseBestPayment(
  combinations: PaymentSelection[][],
  strategy: NpcStrategy,
  hand?: PearlCard[],
): PaymentSelection[] | null {
  if (combinations.length === 0) return null;

  if (strategy === 'random') {
    return combinations[Math.floor(Math.random() * combinations.length)]!;
  }

  if (strategy === 'efficient' && hand) {
    // Pick the combination that leaves the highest total hand value
    let bestCombo = combinations[0]!;
    let bestRemainingValue = -Infinity;

    for (const combo of combinations) {
      const spentIndices = new Set(combo.map(s => s.handCardIndex).filter((i): i is number => i !== undefined));
      const remainingValue = hand.reduce(
        (sum, card, idx) => (spentIndices.has(idx) ? sum : sum + card.value),
        0,
      );
      if (remainingValue > bestRemainingValue) {
        bestRemainingValue = remainingValue;
        bestCombo = combo;
      }
    }

    return bestCombo;
  }

  // greedy / diamond / aggressive: return first combo (smallest number of cards via findCostAssignment ordering)
  return combinations[0]!;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function assignmentToSelections(
  assignment: Map<number, number[]>,
  hand: PearlCard[],
  originalIndices: number[],
): PaymentSelection[] {
  const usedSortedIndices = new Set<number>();
  const selections: PaymentSelection[] = [];

  for (const cardIndices of assignment.values()) {
    for (const idx of cardIndices) {
      if (!usedSortedIndices.has(idx)) {
        usedSortedIndices.add(idx);
        const originalIdx = originalIndices[idx]!;
        selections.push({
          source: 'hand',
          handCardIndex: originalIdx,
          value: hand[idx]!.value,
        });
      }
    }
  }

  return selections;
}
