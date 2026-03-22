import type { CostComponent, PearlCard } from './types';

/**
 * Cost Calculation Module
 * Handles all cost validation and calculation for character card activation
 * 
 * ## Cost Types and Diamond Modifiers
 * 
 * **Fixed Sum Costs ('number')**: Require a total pearl value.
 * - Example: Cost value=10 means player needs cards totaling 10 (or 9 with 1 diamond, 8 with 2, etc.)
 * - Diamonds reduce the required sum by 1 per diamond (minimum 0)
 * 
 * **N-Tuple Costs ('nTuple')**: Require n cards of identical values.
 * - Example: n=2 means "pair" (any two cards with same value)
 * - Diamonds do NOT apply to tuple-based costs (only check if n cards exist)
 * 
 * **Run/Sequence Costs ('run')**: Require sequential cards (e.g., 3-4-5 for a 3-run).
 * - Example: length=3 means "three consecutive values"
 * - Diamonds do NOT apply to run-based costs
 * 
 * **Sum-Tuple Costs ('sumTuple', 'sumAnyTuple')**: Require n cards that sum to a target.
 * - Example: n=2, sum=9 means "two cards totaling 9" (3+6, 4+5, 1+8)
 * - Diamonds do NOT apply to sum-tuple costs
 * 
 * **Even/Odd Tuple Costs ('evenTuple', 'oddTuple')**: Require n cards with even/odd values.
 * - Example: n=2 of evenTuple means "two even cards" (2, 4, 6, 8)
 * - Diamonds do NOT apply to parity-based costs
 * 
 * **Diamond Costs ('diamond')**: Require a minimum number of diamonds (payment in diamonds).
 * - Example: value=2 means "costs 2 diamonds"
 * - No reduction possible (diamonds are the cost, not the discount)
 * 
 * **Key Rule**: Diamonds only reduce FIXED SUM costs. All other cost types are absolute checks.
 */

/**
 * Calculate fixed sum cost, accounting for diamond modifiers
 * @param costComponent - Cost component of type 'number'
 * @param diamondCount - Number of diamonds to reduce cost by
 * @returns Required pearl points (minimum 0)
 */
export function calculateFixedSumCost(
  costComponent: CostComponent,
  diamondCount: number
): number {
  const baseValue = costComponent.value || 0;
  const reduced = Math.max(0, baseValue - diamondCount);
  return reduced;
}

/**
 * Apply diamond modifier to a base cost value
 * Diamonds reduce cost by 1 per diamond, minimum 0
 * @param baseCost - Base cost before diamond reduction
 * @param diamondCount - Number of diamonds to apply
 * @returns Reduced cost (never negative)
 */
export function applyDiamondModifier(baseCost: number, diamondCount: number): number {
  return Math.max(0, baseCost - diamondCount);
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
  if (n <= 0 || hand.length < n) {
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
  if (runLength <= 0 || hand.length < runLength) {
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
  const n = costComponent.n || 1;
  const targetSum = costComponent.sum || 0;

  if (hand.length < n || targetSum <= 0) {
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
    targetValue: number
  ): boolean {
    // Check if we've reached the target
    if (currentSum === targetValue) {
      return true;
    }
    // Check if we've exceeded the target or run out of cards
    if (currentSum > targetValue || cards.length === 0) {
      return false;
    }

    const [first, ...rest] = cards;

    // Try including first card
    if (findCombination(rest, currentSum + first.value, targetValue)) {
      return true;
    }

    // Try excluding first card
    if (findCombination(rest, currentSum, targetValue)) {
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
  const oddCards = hand.filter(card => card.value % 2 === 1);
  return oddCards.length >= n;
}

/**
 * Validate drilling choice cost (will be renamed to tripleChoice)
 * Must have 3 cards of value1 OR 3 cards of value2
 * @param costComponent - Cost component with type 'drillingChoice' or 'tripleChoice'
 * @param hand - Player's hand of pearl cards
 * @returns True if valid combination exists
 */
export function validateDrillingChoiceCost(
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
 * Main cost validation function
 * Checks if player can afford a character card with given cost components
 * ALL cost components must be satisfied (AND logic)
 * @param costComponents - Array of cost components to satisfy (all must be met)
 * @param hand - Player's pearl cards
 * @param diamondCount - Player's available diamonds
 * @returns True if ALL cost components can be satisfied
 */
export function validateCostPayment(
  costComponents: CostComponent[] | undefined,
  hand: PearlCard[],
  diamondCount: number
): boolean {
  // Empty cost = free card
  if (!costComponents || costComponents.length === 0) {
    return true;
  }

  // ALL cost components must be satisfied (AND logic)
  for (const component of costComponents) {
    if (!validateCostComponent(component, hand, diamondCount)) {
      return false;
    }
  }

  return true;
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
      // Fixed sum cost with diamond modifier
      // Must find a subset of hand that sums to EXACTLY required value
      // IMPORTANT: Excess cards are NOT allowed - sum must be exact, not >= 
      // Example: cost[10] requires exactly 10 points (8+2 = OK, 8+3 = FAIL)
      const required = calculateFixedSumCost(component, diamondCount);
      
      if (required <= 0) {
        return true; // Free or negative cost
      }
      
      // Use subset-finding backtracking to find cards summing to exactly required
      function findSum(cards: PearlCard[], currentSum: number, target: number): boolean {
        if (currentSum === target) return true;  // ✓ EXACT match required
        if (currentSum > target || cards.length === 0) return false;  // ✗ Too much or not enough
        
        const [first, ...rest] = cards;
        
        // Try including first card
        if (findSum(rest, currentSum + first.value, target)) return true;
        // Try excluding first card
        if (findSum(rest, currentSum, target)) return true;
        
        return false;
      }
      
      return findSum(hand, 0, required);
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
      // Diamond cost
      const required = component.value || 0;
      return diamondCount >= required;
    }

    case 'drillingChoice': {
      // Drilling choice (future rule)
      return validateDrillingChoiceCost(component, hand);
    }

    default:
      // Unknown cost type - reject to be safe
      return false;
  }
}

/**
 * Calculate total required cost for a character card
 * Useful for UI display or cost prediction
 * @param costComponents - Array of cost components
 * @param diamondCount - Available diamonds (for fixed sum calculations)
 * @returns Total cost in pearl points
 */
export function calculateCostRequirement(
  costComponents: CostComponent[] | undefined,
  diamondCount: number
): number {
  if (!costComponents || costComponents.length === 0) {
    return 0;
  }

  // For display purposes, return the first fixed sum cost found
  for (const component of costComponents) {
    if (component.type === 'number') {
      return calculateFixedSumCost(component, diamondCount);
    }
  }

  // If no fixed sum, return 0 (other cost types are harder to quantify)
  return 0;
}

/**
 * JSDoc Summary for Cost Calculation System
 * 
 * This module provides all cost validation and calculation functionality for the 
 * Portale von Molthar game. The cost system supports multiple cost types, each with 
 * distinct validation rules:
 * 
 * **Main Exported Functions:**
 * - `validateCostPayment(costComponents, hand, diamondCount)` - Main validation function
 * - `calculateFixedSumCost(costComponent, diamondCount)` - Fixed sum cost with diamond reduction
 * - `applyDiamondModifier(baseCost, diamondCount)` - Diamond modifier utility
 * - `calculateCostRequirement(costComponents, diamondCount)` - Cost display calculation
 * 
 * **Cost Type Support:**
 * - `number` (fixed sum with diamond reduction)
 * - `nTuple` (pairs, triplets, etc.)
 * - `run` (sequential cards)
 * - `sumTuple`/`sumAnyTuple` (n cards summing to value)
 * - `evenTuple`/`oddTuple` (cards with even/odd values)
 * - `diamond` (diamond costs)
 * - `drillingChoice` (placeholder for future expansion)
 * 
 * **Diamond Mechanics:**
 * - Diamonds ONLY reduce fixed sum costs (type: 'number')
 * - 1 diamond = 1 point reduction (minimum 0, never negative)
 * - All other cost types are absolute and cannot be reduced by diamonds
 * 
 * **Integration:**
 * - Used by `activatePortalCard()` move in shared/src/game/index.ts
 * - Imported as `validateCostFromCards` to avoid name conflicts with old function
 * - Validates entire hand (not subset of cards)
 * 
 * **Testing:**
 * - 31 unit tests covering all cost types, edge cases, and diamond mechanics
 * - Tests located in shared/src/game/costCalculation.test.ts
 * - Run with `npm test` in shared package
 */
