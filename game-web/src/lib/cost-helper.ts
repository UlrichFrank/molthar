import type { CostComponent } from '@portale-von-molthar/shared';

/**
 * Convert cost components to human-readable description
 * @param cost Array of cost components
 * @returns String description of the cost
 */
export function describeCost(cost: CostComponent[]): string {
  if (!cost || cost.length === 0) {
    return 'Free';
  }

  const descriptions = cost.map(component => {
    switch (component.type) {
      case 'number':
        return `a card with value ${component.value}`;
      case 'nTuple':
        return `${component.n} cards with same value`;
      case 'sumAnyTuple':
        return `Any cards summing to ${component.sum}`;
      case 'sumTuple':
        return `${component.n} cards summing to ${component.sum}`;
      case 'run':
        return `${component.length} consecutive values`;
      case 'tripleChoice':
        return `3 cards of value ${component.value1} OR ${component.value2}`;
      case 'evenTuple':
        return `${component.n} even-valued cards`;
      case 'oddTuple':
        return `${component.n} odd-valued cards`;
      case 'diamond':
        return `${component.value} diamonds`;
      default:
        return 'Unknown cost';
    }
  });

  return descriptions.join(' AND ');
}

/**
 * Check if a set of pearl cards can satisfy a cost
 * This is a simplified check - full validation happens on server
 * @param cost Array of cost components
 * @param hand Array of pearl cards in hand
 * @returns true if hand might satisfy cost, false if definitely cannot
 */
export function canPotentiallySatisfyCost(
  cost: CostComponent[],
  hand: Array<{ value: number; hasSwapSymbol: boolean }>
): boolean {
  if (!cost || cost.length === 0) {
    return true; // Free cost
  }

  // Check each cost requirement
  for (const component of cost) {
    switch (component.type) {
      case 'number':
        // Check if hand sum is sufficient
        const handSum = hand.reduce((sum, card) => sum + card.value, 0);
        if (handSum < component.value!) {
          return false;
        }
        break;

      case 'nTuple':
        // Check if we have n cards of same value
        const valueCounts = countCardsByValue(hand);
        if (!Object.values(valueCounts).some(count => count >= component.n!)) {
          return false;
        }
        break;

      case 'run':
        // Check if we have consecutive sequence of length n
        if (!hasConsecutiveRun(hand, component.length || 0)) {
          return false;
        }
        break;

      case 'diamond':
        // Diamonds reduce cost, not add to it
        // This is handled by cost calculation, skip for now
        break;

      // For other complex types, optimistically return true
      case 'sumAnyTuple':
      case 'sumTuple':
      case 'evenTuple':
      case 'oddTuple':
      case 'tripleChoice':
      default:
        return true; // Let server validate
    }
  }

  return true;
}

/**
 * Count how many cards of each value are in hand
 */
function countCardsByValue(
  hand: Array<{ value: number; hasSwapSymbol: boolean }>
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const card of hand) {
    counts[card.value] = (counts[card.value] || 0) + 1;
  }
  return counts;
}

/**
 * Check if hand has a consecutive run of n cards
 */
function hasConsecutiveRun(
  hand: Array<{ value: number; hasSwapSymbol: boolean }>,
  length: number
): boolean {
  if (length <= 0 || hand.length < length) {
    return false;
  }

  // Get unique values in sorted order
  const values = [...new Set(hand.map(c => c.value))].sort((a, b) => a - b);

  // Check for consecutive sequence
  for (let i = 0; i <= values.length - length; i++) {
    let isConsecutive = true;
    for (let j = 0; j < length - 1; j++) {
      if (values[i + j + 1] !== values[i + j] + 1) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) {
      return true;
    }
  }

  return false;
}

/**
 * Get cost as simple text for UI
 * @param cost Array of cost components
 * @returns Short text like "Cost: 7" or "Free"
 */
export function getCostSummary(cost: CostComponent[]): string {
  if (!cost || cost.length === 0) {
    return 'Free';
  }

  // For single number cost, show just that value
  if (cost.length === 1 && cost[0].type === 'number') {
    return `${cost[0].value}`;
  }

  // For multiple components, show "Complex" and let describeCost handle details
  if (cost.length > 1) {
    return 'Complex';
  }

  // For other single costs
  const firstCost = cost[0];
  switch (firstCost.type) {
    case 'nTuple':
      return `${firstCost.n} of same`;
    case 'run':
      return `${firstCost.length} consecutive`;
    case 'diamond':
      return `${firstCost.value}💎`;
    case 'sumTuple':
      return `${firstCost.n} cards sum ${firstCost.sum}`;
    case 'sumAnyTuple':
      return `Sum ${firstCost.sum}`;
    default:
      return 'Variable';
  }
}
