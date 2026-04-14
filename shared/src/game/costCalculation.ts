import type { CostComponent, PearlCard } from './types';

/**
 * Cost Calculation Module
 * Handles all cost validation and calculation for character card activation.
 *
 * ## Public API
 *
 * - `validateCostPayment` — for **human players**: validates that the exact set of selected
 *   cards satisfies the card's cost. Too many or too few cards both return false.
 * - `findCostAssignment` — for **AI/computer players only**: finds a valid card-to-component
 *   assignment from a larger set of available cards. Must NOT be used for human player moves.
 *
 * ## Cost Types
 *
 * **Fixed Cost ('number')**: Require a single card with exact pearl value.
 * - Example: Cost value=8 means player needs a single card with value 8
 * - Diamonds do NOT apply to number-based costs
 *
 * **N-Tuple Costs ('nTuple')**: Require n cards of identical values.
 * - Example: n=2 means "pair" (any two cards with same value)
 * - Diamonds do NOT apply to tuple-based costs (only check if n cards exist)
 *
 * **Run/Sequence Costs ('run')**: Require sequential cards (e.g., 3-4-5 for a 3-run).
 * - Example: length=3 means "three consecutive values"
 * - Diamonds do NOT apply to run-based costs
 *
 * **Sum-Tuple Costs ('sumTuple')**: Require n cards that sum to a target.
 * - Example: n=2, sum=9 means "two cards totaling 9" (3+6, 4+5, 1+8)
 * - Diamonds do NOT apply to sum-tuple costs
 *
 * **Sum-Any-Tuple Costs ('sumAnyTuple')**: Require any number of cards that sum to a target.
 * - Example: sum=9 means "cards totaling 9" (1+1+7, 1+1+2+2+3, 1+8, ...)
 * - Diamonds do NOT apply to sum-tuple costs
 *
 * **Even/Odd Tuple Costs ('evenTuple', 'oddTuple')**: Require n cards with even/odd values.
 * - Example: n=2 of evenTuple means "two even cards" (2, 4, 6, 8)
 * - Diamonds do NOT apply to parity-based costs
 *
 * **Diamond Costs ('diamond')**: Require a number of diamonds (payment in diamonds).
 * - Example: value=2 means "costs 2 diamonds"
 * - No reduction possible (diamonds are the cost, not the discount)
 */

/**
 * Calculate the maximum hand limit for a player
 * @param handLimitModifier - Cumulative hand limit increase from activated characters
 * @returns Maximum number of pearl cards player can hold (5 base + modifier)
 */
export function calculateHandLimit(handLimitModifier: number): number {
  return 5 + handLimitModifier;
}

/**
 * Calculate how many excess cards must be discarded
 * @param hand - Player's pearl cards
 * @param handLimit - Maximum allowed hand size
 * @returns Number of cards that must be discarded (0 if within limit)
 */
export function getExcessCardCount(hand: PearlCard[], handLimit: number): number {
  const excess = hand.length - handLimit;
  return Math.max(0, excess);
}

/**
 * Validate fixed cost (exact card value)
 * Requires a single card with the exact value
 * @param costComponent - Cost component of type 'number'
 * @param hand - Player's hand of pearl cards
 * @returns True if hand contains a card with the exact required value
 */
export function validateFixedCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const requiredValue = costComponent.value || 0;
  return hand.some(card => card.value === requiredValue);
}

/**
 * Validate n-tuple cost (pairs, triplets, etc.)
 * Checks if hand contains n cards of the same value
 * @param costComponent - Cost component with type 'nTuple', should have n property
 * @param hand - Player's hand of pearl cards
 * @returns True if n cards of same value exist in hand
 */
export function validateNTupleCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const n = costComponent.n || 0;
  if (n <= 0 || hand.length !== n) {
    return false;
  }

  // Count cards by value
  const valueCounts: Record<number, number> = {};
  for (const card of hand) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }

  // Check if any value has n or more cards
  for (const count of Object.values(valueCounts)) {
    if (count >= n) {
      return true;
    }
  }

  return false;
}

/**
 * Validate run/sequence cost
 * Checks if hand contains n sequential cards (e.g., 3-4-5 for a 3-run)
 * @param costComponent - Cost component with type 'run', should have length property
 * @param hand - Player's hand of pearl cards
 * @returns True if sequential cards of required length exist
 */
export function validateRunCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const runLength = costComponent.length || 0;
  if (runLength <= 0 || hand.length !== runLength) {
    return false;
  }

  // Get unique values and sort them
  const uniqueValues = Array.from(new Set(hand.map(c => c.value))).sort((a, b) => a - b);

  // Check for sequential run of required length
  for (let i = 0; i <= uniqueValues.length - runLength; i++) {
    let isSequential = true;
    for (let j = 0; j < runLength - 1; j++) {
      if (uniqueValues[i + j + 1] !== uniqueValues[i + j] + 1) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) {
      return true;
    }
  }

  return false;
}

/**
 * Validate sumTuple cost
 * Checks if hand contains exactly n cards that sum to a target value
 * @param costComponent - Cost component with type 'sumTuple' (must have n and sum)
 * @param hand - Player's hand of pearl cards
 * @returns True if valid combination exists
 */
export function validateSumTupleCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const n = costComponent.n || hand.length;
  const targetSum = costComponent.sum || 0;

  if (hand.length !== n || targetSum <= 0) {
    return false;
  }

  // Use recursive backtracking to find exactly n cards that sum to target
  function findCombination(
    cards: PearlCard[],
    remaining: number,
    currentSum: number,
    targetValue: number
  ): boolean {
    if (remaining === 0) {
      return currentSum === targetValue;
    }
    if (cards.length === 0) {
      return false;
    }

    const [first, ...rest] = cards;

    // Try including first card
    if (findCombination(rest, remaining - 1, currentSum + first.value, targetValue)) {
      return true;
    }

    // Try excluding first card
    if (findCombination(rest, remaining, currentSum, targetValue)) {
      return true;
    }

    return false;
  }

  return findCombination(hand, n, 0, targetSum);
}

/**
 * Validate sumAnyTuple cost
 * Checks if hand contains any number of cards that sum to a target value
 * @param costComponent - Cost component with type 'sumAnyTuple' (must have sum)
 * @param hand - Player's hand of pearl cards
 * @returns True if valid combination exists
 */
export function validateSumAnyTupleCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const targetSum = costComponent.sum || 0;

  if (targetSum <= 0) {
    return false;
  }

  // Use recursive backtracking to find any number of cards that sum to target
  function findCombination(
    cards: PearlCard[],
    currentSum: number,
    target: number
  ): boolean {
    // Check if we've reached the target
    if (currentSum === target) {
      return true;
    }
    // Check if we've exceeded the target or run out of cards
    if (currentSum > target || cards.length === 0) {
      return false;
    }

    const [first, ...rest] = cards;

    // Try including first card
    if (findCombination(rest, currentSum + first.value, target)) {
      return true;
    }

    // Try excluding first card
    if (findCombination(rest, currentSum, target)) {
      return true;
    }

    return false;
  }

  return findCombination(hand, 0, targetSum);
}

/**
 * Validate even-value tuple cost
 * Checks if hand contains n cards with even values
 * @param costComponent - Cost component with type 'evenTuple'
 * @param hand - Player's hand of pearl cards
 * @returns True if n even-value cards exist
 */
export function validateEvenTupleCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const n = costComponent.n || 0;
  if (hand.length !== n) return false;
  const evenCards = hand.filter(card => card.value % 2 === 0);
  return evenCards.length >= n;
}

/**
 * Validate odd-value tuple cost
 * Checks if hand contains n cards with odd values
 * @param costComponent - Cost component with type 'oddTuple'
 * @param hand - Player's hand of pearl cards
 * @returns True if n odd-value cards exist
 */
export function validateOddTupleCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const n = costComponent.n || 0;
  if (hand.length !== n) return false;
  const oddCards = hand.filter(card => card.value % 2 === 1);
  return oddCards.length >= n;
}

/**
 * Validate triple choice cost
 * Must have 3 cards of value1 OR 3 cards of value2
 * @param costComponent - Cost component with type 'tripleChoice'
 * @param hand - Player's hand of pearl cards
 * @returns True if valid combination exists
 */
export function validateTripleChoiceCost(
  costComponent: CostComponent,
  hand: PearlCard[]
): boolean {
  const value1 = costComponent.value1 || 3;
  const value2 = costComponent.value2 || 6;

  // Count cards with each value
  const count1 = hand.filter(c => c.value === value1).length;
  const count2 = hand.filter(c => c.value === value2).length;

  // Need 3 of value1 OR 3 of value2
  return count1 >= 3 || count2 >= 3;
}

/**
 * Validates whether a human player's selected cards exactly pay for a character card.
 *
 * Use this function when a human player confirms their card selection for payment.
 * ALL cost components must be satisfied, and every selected card must be used —
 * too many cards return false just as too few or wrong cards would.
 *
 * Do NOT use for AI/computer players — use `findCostAssignment` instead.
 *
 * @param costComponents - Array of cost components to satisfy (all must be met)
 * @param selectedCards - The exact set of pearl cards the player selected for payment
 * @param diamondCount - Player's available diamonds
 * @returns True only if the selected cards satisfy all cost components with no cards left over
 */
export function validateCostPayment(
  costComponents: CostComponent[] | undefined,
  selectedCards: PearlCard[],
  diamondCount: number
): boolean {
  // Empty cost = free card
  if (!costComponents || costComponents.length === 0) {
    return selectedCards.length === 0; // No cost, so selectedCards must be empty
  }

  // Use backtracking to find valid assignment that uses all cards
  const assignment = findCostAssignmentExhaustive(costComponents, selectedCards, diamondCount);

  if (assignment === null) {
    return false;
  }

  // Verify all cards are used
  const usedIndices = new Set<number>();
  for (const cardIndices of assignment.values()) {
    for (const idx of cardIndices) {
      usedIndices.add(idx);
    }
  }

  // All cards must be used, no cards left over
  return usedIndices.size === selectedCards.length;
}

/**
 * Find optimal card-to-component assignment that exhausts all available cards
 * Optimized by processing components in order: fixed values first, then fixed card counts, then variable card counts
 * @param costComponents - Array of cost components to satisfy
 * @param availableCards - Player's selected pearl cards
 * @param diamondCount - Available diamonds
 * @returns Assignment map or null if no valid assignment exists that uses all cards
 */
function findCostAssignmentExhaustive(
  costComponents: CostComponent[] | undefined,
  availableCards: PearlCard[],
  diamondCount: number
): Map<number, number[]> | null {
  if (!costComponents || costComponents.length === 0) {
    // No components, so valid only if no cards provided
    return availableCards.length === 0 ? new Map() : null;
  }

  // Sort components with index tracking for optimization
  const indexedComponents = costComponents.map((component, idx) => ({ component, originalIdx: idx }));
  indexedComponents.sort((a, b) => {
    const priorityA = getComponentOptimizationPriority(a.component);
    const priorityB = getComponentOptimizationPriority(b.component);
    return priorityA - priorityB;
  });

  // Extract sorted components and create index mapping
  const sortedComponents = indexedComponents.map(ic => ic.component);
  const indexMapping = indexedComponents.map(ic => ic.originalIdx);

  // Use backtracking to find valid assignment
  const assignment = new Map<number, number[]>();
  const usedIndices = new Set<number>();

  // Try to assign cards to sorted components in order
  if (tryAssignCardsExhaustive(sortedComponents, availableCards, diamondCount, 0, usedIndices, assignment, availableCards.length)) {
    // Convert assignment map from sorted indices back to original indices
    const originalAssignment = new Map<number, number[]>();
    for (const [sortedIdx, cardIndices] of assignment.entries()) {
      const originalIdx = indexMapping[sortedIdx];
      originalAssignment.set(originalIdx, cardIndices);
    }
    return originalAssignment;
  }

  return null;
}

/**
 * Categorize component type for optimization purposes
 * Returns 0 for fixed values, 1 for fixed card counts, 2 for variable card counts
 */
function getComponentOptimizationPriority(component: CostComponent): number {
  switch (component.type) {
    // Fixed values: exactly 1 card needed
    case 'number':
      return 0;

    // Fixed card counts: exact number of cards needed
    case 'nTuple':
    case 'run':
    case 'sumTuple':
    case 'tripleChoice':
    case 'evenTuple':
    case 'oddTuple':
      return 1;

    // Variable card counts: flexible number of cards
    case 'sumAnyTuple':
    case 'diamond':
      return 2;

    default:
      return 1; // Default to fixed count
  }
}


/**
 * Validate a single cost component
 * @param component - Single cost component
 * @param hand - Player's hand
 * @param diamondCount - Available diamonds
 * @returns True if this cost requirement is met
 */
function validateCostComponent(
  component: CostComponent,
  hand: PearlCard[],
  diamondCount: number
): boolean {
  switch (component.type) {
    case 'number': {
      // Fixed cost - requires a single card with exact value
      // Diamonds do NOT apply to number-based costs
      // Example: cost value=8 means player needs a single card with value 8
      return validateFixedCost(component, hand);
    }

    case 'nTuple': {
      // N cards of same value
      return validateNTupleCost(component, hand);
    }

    case 'run': {
      // Sequential cards
      return validateRunCost(component, hand);
    }

    case 'sumTuple': {
      // N cards summing to value
      return validateSumTupleCost(component, hand);
    }

    case 'sumAnyTuple': {
      // Any number of cards summing to value
      return validateSumAnyTupleCost(component, hand);
    }

    case 'evenTuple': {
      // N cards with even values
      return validateEvenTupleCost(component, hand);
    }

    case 'oddTuple': {
      // N cards with odd values
      return validateOddTupleCost(component, hand);
    }

    case 'diamond': {
      // Diamond cost - diamonds are paid separately by the player
      // We don't validate here, just return true
      return validateDiamondCost(component, diamondCount);
    }

    case 'tripleChoice': {
      // Triple choice: 3 cards of value1 OR 3 cards of value2
      return validateTripleChoiceCost(component, hand);
    }

    default:
      // Unknown cost type - reject to be safe
      return false;
  }
}

/**
 * Finds a valid card-to-component assignment for AI/computer players.
 *
 * Use this function when an AI player needs to determine which cards from its hand
 * to spend for a given card cost. Unlike `validateCostPayment`, this does NOT require
 * all provided cards to be used — the AI passes its full hand and gets back which cards
 * to spend.
 *
 * Must NOT be used for human player moves — human selections must be validated
 * with `validateCostPayment` instead.
 *
 * @param costComponents - Array of cost components to satisfy
 * @param availableCards - The AI player's available pearl cards (full hand or subset)
 * @param diamondCount - Available diamonds
 * @returns Map of component-index → card-indices, or null if no valid assignment exists
 */
export function findCostAssignment(
  costComponents: CostComponent[] | undefined,
  availableCards: PearlCard[],
  diamondCount: number
): Map<number, number[]> | null {
  if (!costComponents || costComponents.length === 0) {
    return new Map();
  }

  // Use backtracking to find valid assignment
  const assignment = new Map<number, number[]>();
  const usedIndices = new Set<number>();

  // Try to assign cards to components in order
  if (tryAssignCards(costComponents, availableCards, diamondCount, 0, usedIndices, assignment)) {
    return assignment;
  }

  return null;
}

/**
 * Recursive backtracking to find valid card assignment
 */
function tryAssignCards(
  components: CostComponent[],
  availableCards: PearlCard[],
  diamondCount: number,
  componentIndex: number,
  usedIndices: Set<number>,
  assignment: Map<number, number[]>
): boolean {
  // Base case: all components assigned
  if (componentIndex >= components.length) {
    return true;
  }

  const component = components[componentIndex];

  // Get available card indices (not yet used)
  const availableIndices = availableCards
    .map((_, idx) => idx)
    .filter(idx => !usedIndices.has(idx));

  // Try all subsets of available cards
  const subsets = generateSubsets(availableIndices);
  // Sort by size: prefer smaller subsets first (more cards left for other components)
  subsets.sort((a, b) => a.length - b.length);

  for (const subset of subsets) {
    const cardsInSubset = subset.map(idx => availableCards[idx]);

    // Check if this subset satisfies the component
    if (validateCostComponent(component, cardsInSubset, diamondCount)) {
      // Mark these cards as used
      subset.forEach(idx => usedIndices.add(idx));
      assignment.set(componentIndex, subset);

      // Recursively try to satisfy remaining components
      if (tryAssignCards(components, availableCards, diamondCount, componentIndex + 1, usedIndices, assignment)) {
        return true;
      }

      // Backtrack
      subset.forEach(idx => usedIndices.delete(idx));
      assignment.delete(componentIndex);
    }
  }

  return false;
}

/**
 * Recursive backtracking to find valid card assignment that uses ALL cards
 * Ensures no cards are left over after satisfying all components
 * For variable-count components (sumAnyTuple), only accepts minimal subsets
 */
function tryAssignCardsExhaustive(
  components: CostComponent[],
  availableCards: PearlCard[],
  diamondCount: number,
  componentIndex: number,
  usedIndices: Set<number>,
  assignment: Map<number, number[]>,
  totalCards: number
): boolean {
  // Base case: all components assigned
  if (componentIndex >= components.length) {
    // All cards must be used (no cards left over)
    return usedIndices.size === totalCards;
  }

  const component = components[componentIndex];

  // Get available card indices (not yet used)
  const availableIndices = availableCards
    .map((_, idx) => idx)
    .filter(idx => !usedIndices.has(idx));

  // Try all subsets of available cards
  const subsets = generateSubsets(availableIndices);
  // Sort by size: prefer smaller subsets first (more cards left for other components)
  subsets.sort((a, b) => a.length - b.length);

  for (const subset of subsets) {
    const cardsInSubset = subset.map(idx => availableCards[idx]);

    // Check if this subset satisfies the component
    if (validateCostComponent(component, cardsInSubset, diamondCount)) {
      // For variable-count components, only accept minimal subsets
      // A subset is minimal if removing any card makes it invalid
      if (isVariableCountComponent(component)) {
        if (!isMinimalSubset(component, subset, availableCards, diamondCount)) {
          continue; // Skip non-minimal subsets
        }
      }

      // Mark these cards as used
      subset.forEach(idx => usedIndices.add(idx));
      assignment.set(componentIndex, subset);

      // Recursively try to satisfy remaining components
      if (tryAssignCardsExhaustive(components, availableCards, diamondCount, componentIndex + 1, usedIndices, assignment, totalCards)) {
        return true;
      }

      // Backtrack
      subset.forEach(idx => usedIndices.delete(idx));
      assignment.delete(componentIndex);
    }
  }

  return false;
}

/**
 * Check if a component has variable card count
 */
function isVariableCountComponent(component: CostComponent): boolean {
  return component.type === 'sumAnyTuple';
}

/**
 * Check if a subset is minimal for a component
 * A subset is minimal if removing any card makes it invalid
 */
function isMinimalSubset(
  component: CostComponent,
  subset: number[],
  availableCards: PearlCard[],
  diamondCount: number
): boolean {
  // Empty subset cannot be minimal
  if (subset.length === 0) {
    return false;
  }

  // Check if removing any single card makes it invalid
  for (let i = 0; i < subset.length; i++) {
    const smallerSubset = subset.slice(0, i).concat(subset.slice(i + 1));
    const cardsInSmallerSubset = smallerSubset.map(idx => availableCards[idx]);

    if (validateCostComponent(component, cardsInSmallerSubset, diamondCount)) {
      // A smaller subset also works, so this is not minimal
      return false;
    }
  }

  // No smaller subset works, so this is minimal
  return true;
}

/**
 * Generate all possible subsets of indices
 */
function generateSubsets(indices: number[]): number[][] {
  const subsets: number[][] = [];

  for (let mask = 0; mask < (1 << indices.length); mask++) {
    const subset: number[] = [];
    for (let i = 0; i < indices.length; i++) {
      if (mask & (1 << i)) {
        subset.push(indices[i]);
      }
    }
    subsets.push(subset);
  }

  return subsets;
}

/**
 * Consume (remove) cards from hand based on cost validation
 * @param costComponents - Array of cost components to satisfy
 * @param selectedCardIndices - Indices of cards in the hand to try to consume
 * @param fullHand - The complete hand of the player
 * @param diamondCount - Available diamonds
 * @returns Updated state {hand, diamonds} or null if validation fails
 */
export function consumeCosts(
  costComponents: CostComponent[] | undefined,
  selectedCardIndices: number[],
  fullHand: PearlCard[],
  diamondCount: number
): { hand: PearlCard[]; diamonds: number } | null {
  // Get the selected card objects from the hand
  const selectedCards = selectedCardIndices
    .filter(idx => idx >= 0 && idx < fullHand.length)
    .map(idx => fullHand[idx]);

  // First validate that assignment is possible
  const assignment = findCostAssignment(costComponents, selectedCards, diamondCount);
  if (assignment === null) {
    return null;
  }

  // If valid, remove the selected cards from the hand
  const newHand = fullHand.filter((_, idx) => !selectedCardIndices.includes(idx));

  return {
    hand: newHand,
    diamonds: diamondCount
  };
}

export function validateDiamondCost(component: CostComponent, diamondCount: number): boolean {
  const requiredDiamonds = component.value ?? 1;
  return diamondCount >= requiredDiamonds;
}

/**
 * Returns true if the selected hand contains at least one card that is unnecessary —
 * i.e., removing it still satisfies the full cost. Used to prevent overpayment.
 *
 * Uses a "leave-one-out" approach: O(n * validate) — fast enough for max ~6 hand cards.
 */
export function hasUnnecessarySelection(
  cost: CostComponent[] | undefined,
  hand: PearlCard[],
  diamonds: number
): boolean {
  for (let i = 0; i < hand.length; i++) {
    const reduced = hand.filter((_, idx) => idx !== i);
    if (validateCostPayment(cost, reduced, diamonds)) return true;
  }
  return false;
}
