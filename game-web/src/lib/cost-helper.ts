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
        return `Total sum of ${component.value}`;
      case 'nTuple':
        return `${component.n} cards with same value`;
      case 'sumAnyTuple':
        return `${component.n} different pairs`;
      case 'sumTuple':
        return `${component.n} cards summing to ${component.sum}`;
      case 'run':
        return `${component.length} consecutive values`;
      case 'evenTuple':
        return `${component.n} even-valued cards`;
      case 'oddTuple':
        return `${component.n} odd-valued cards`;
      case 'diamond':
        return `${component.value} diamonds`;
      case 'drillingChoice':
        return `Choose from multiple costs`;
      default:
        return 'Unknown cost';
    }
  });

  return descriptions.join(' OR ');
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

  // For simple 'number' costs, check if sum is possible
  const numberCost = cost.find(c => c.type === 'number');
  if (numberCost && numberCost.value) {
    const handSum = hand.reduce((sum, card) => sum + card.value, 0);
    return handSum >= numberCost.value;
  }

  // For other costs, we can't easily check without full validation
  // So we optimistically return true (server will validate)
  return true;
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

  const numberCost = cost.find(c => c.type === 'number');
  if (numberCost && numberCost.value) {
    return `Cost: ${numberCost.value}`;
  }

  const firstCost = cost[0];
  switch (firstCost.type) {
    case 'nTuple':
      return `Cost: ${firstCost.n} of same`;
    case 'run':
      return `Cost: ${firstCost.length} consecutive`;
    case 'diamond':
      return `Cost: ${firstCost.value}💎`;
    default:
      return 'Cost: Variable';
  }
}
