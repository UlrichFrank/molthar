import { describe, it, expect } from 'vitest';
import {
  validateFixedCost,
  validateNTupleCost,
  validateRunCost,
  validateSumTupleCost,
  validateEvenTupleCost,
  validateOddTupleCost,
  validateDiamondCost,
  validateCostPayment,
} from './costCalculation';
import type { CostComponent, PearlCard } from './types';

// Helper function to create pearl cards
function createCard(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): PearlCard {
  return {
    id: `card-${Math.random()}`,
    value,
    hasSwapSymbol: false,
  };
}

describe('Cost Validation - Fixed Value)', () => {
  it('1.1: fixed value (match)', () => {
    const component: CostComponent = { type: 'number', value: 5 };
    const selected = [createCard(5)];
    const result = validateFixedCost(component, selected);
    expect(result).toBe(true);
  });

  it('1.2: fixed value (mismatch)', () => {
    const component: CostComponent = { type: 'number', value: 5 };
    const selected = [createCard(6)];
    const result = validateFixedCost(component, selected);
    expect(result).toBe(false);
  });
});

describe('Cost Validation - Diamond Cost', () => {
  it('2.1: required diamonds (match)', () => {
    const component: CostComponent = { type: 'diamond', value: 1 };
    expect(validateDiamondCost(component, 1)).toBe(true);
  });

  it('2.2: required diamonds (mismatch - less)', () => {
    const component: CostComponent = { type: 'diamond', value: 1 };
    expect(validateDiamondCost(component, 0)).toBe(false);
  });

  it('2.3: required diamonds (mismatch - more)', () => {
    const component: CostComponent = { type: 'diamond', value: 1 };
    expect(validateDiamondCost(component, 2)).toBe(false);
  });

  it('2.4: Integrated: required diamonds (match)', () => {
    const component: CostComponent = { type: 'diamond', value: 1 };
    expect(validateCostPayment([component], [], 1)).toBe(true);
  });

  it('2.5: Integrated: required diamonds (mismatch - more)', () => {
    const component: CostComponent = { type: 'diamond', value: 1 };
    expect(validateCostPayment([component], [], 2)).toBe(false); // too many diamonds provided
  });
});

describe('Cost Validation - N-Tuple', () => {
  it('3.1: pair validation passes with matching cards', () => {
    const selected = [createCard(5), createCard(5)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, selected)).toBe(true);
  });

  it('3.2: pair validation passes too many cards (mismatch)', () => {
    const selected = [createCard(5), createCard(5), createCard(3)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, selected)).toBe(false);
  });

  it('3.4: pair validation fails without matching cards', () => {
    const selected = [createCard(5), createCard(6)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, selected)).toBe(false);
  });

  it('3.5: validates n-tuple for any n (pairs, triplets, quads)', () => {
    const selected = [createCard(2), createCard(2), createCard(2)];

    expect(validateNTupleCost({ type: 'nTuple', n: 2 }, selected)).toBe(false);
    expect(validateNTupleCost({ type: 'nTuple', n: 3 }, selected)).toBe(true);
    expect(validateNTupleCost({ type: 'nTuple', n: 4 }, selected)).toBe(false);
  });

  it('3.6: pair validation with two pairs (matching)', () => {
    const selected = [createCard(5), createCard(5), createCard(6), createCard(6)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, selected)).toBe(false); // too many cards
  });

  it('3.7: Integrated: pair validation  (match)', () => {
    const selected = [createCard(5), createCard(5)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateCostPayment([component], selected, 0)).toBe(true);
  });

  it('3.8: Integrated: pair validation passes too many cards (mismatch)', () => {
    const selected = [createCard(5), createCard(5), createCard(3)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateCostPayment([component], selected, 0)).toBe(false); // too many cards
  });

  it('3.9: Integrated: pair validation with two pairs (matching)', () => {
    const selected = [createCard(5), createCard(5), createCard(6), createCard(6)];
    const component1: CostComponent = { type: 'nTuple', n: 2 };
    const component2: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateCostPayment([component1, component2], selected, 0)).toBe(true);
  });

  it('3.10: Integrated: pair validation passes too many cards (matching)', () => {
    const selected = [createCard(5), createCard(5), createCard(5)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateCostPayment([component], selected, 0)).toBe(false); // too many cards
  });

});

describe('Cost Validation - Run/Sequence', () => {
  it('4.1: 3-run validation passes with sequential cards', () => {
    const selected = [createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component, selected)).toBe(true);
  });

  it('4.2: 4-run validation passes with sequential cards', () => {
    const selected = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'run', length: 4 };
    expect(validateRunCost(component, selected)).toBe(true);
  });

  it('4.3: run validation fails with gaps', () => {
    const selected = [createCard(2), createCard(4), createCard(5), createCard(6)];
    const component: CostComponent = { type: 'run', length: 4 };
    expect(validateRunCost(component, selected)).toBe(false);
  });

  it('4.4: run validation fails with insufficient cards', () => {
    const selected = [createCard(3), createCard(4)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component, selected)).toBe(false);
  });

  it('4.5: multiple valid runs are detected', () => {
    const selected = [createCard(1), createCard(2), createCard(3), createCard(6), createCard(7), createCard(8)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component, selected)).toBe(false); // Can use 1-2-3 or 6-7-8
  });

  it('4.6: Integrated: multiple valid runs are detected', () => {
    const selected = [createCard(1), createCard(2), createCard(3), createCard(6), createCard(7), createCard(8)];
    const component1: CostComponent = { type: 'run', length: 3 };
    const component2: CostComponent = { type: 'run', length: 3 };
    expect(validateCostPayment([component1, component2], selected, 0)).toBe(true); // Can use 1-2-3 or 6-7-8
  });

  it('4.7: Integrated: multiple valid runs are detected', () => {
    const selected = [createCard(1), createCard(2), createCard(3), createCard(6), createCard(7), createCard(8)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateCostPayment([component], selected, 0)).toBe(false); // Can use 1-2-3 or 6-7-8
  });
});

describe('Cost Validation - Sum Tuple', () => {
  it('5.1: sum validation passes with exact match', () => {
    const selected = [createCard(3), createCard(4)];
    const component: CostComponent = { type: 'sumTuple', n: 2, sum: 7 };
    expect(validateSumTupleCost(component, selected)).toBe(true); // 3+4=7
  });

  it('5.2: sum validation passes with multiple valid combinations', () => {
    const selected = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 7 };
    expect(validateSumTupleCost(component, selected)).toBe(false); // Multiple: 3+4, 2+5
  });

  it('5.3: Integrated: sum validation fails with too many cards (even if valid)', () => {
    const selected = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 7 };
    expect(validateCostPayment([component], selected, 0)).toBe(false); // Multiple: 3+4, 2+5
  });

  it('5.4: Integrated: sum validation fails with too many cards', () => {
    const selected = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component1: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 7 };
    const component2: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 7 };
    expect(validateCostPayment([component1, component2], selected, 0)).toBe(true); // Multiple: 3+4, 2+5
  });

  it('5.5: sum validation fails when total unreachable', () => {
    const selected = [createCard(1), createCard(2), createCard(3)];
    const component: CostComponent = { type: 'sumTuple', n: 3, sum: 20 };
    expect(validateSumTupleCost(component, selected)).toBe(false);
  });

  it('5.6: validates all cost types that use sum component', () => {
    const selected = [createCard(2), createCard(3), createCard(4)];

    // sumTuple variant
    const comp1: CostComponent = { type: 'sumTuple', n: 3, sum: 9 };
    expect(validateSumTupleCost(comp1, selected)).toBe(true);

    // sumAnyTuple variant
    const comp2: CostComponent = { type: 'sumAnyTuple', sum: 9 };
    expect(validateSumTupleCost(comp2, selected)).toBe(true);
  });
});

describe('Cost Validation - Even/Odd Tuples', () => {
  it('6.1: Even tuple validation', () => {
    const selected = [createCard(2), createCard(4), createCard(6)];
    const component2: CostComponent = { type: 'evenTuple', n: 2 };
    expect(validateEvenTupleCost(component2, selected)).toBe(false); // ==> Too many cards provided, only 2 should be used
  });

  it('6.2: Even tuple validation', () => {
    const selected = [createCard(2), createCard(4), createCard(6)];
    const component3: CostComponent = { type: 'evenTuple', n: 3 };
    expect(validateEvenTupleCost(component3, selected)).toBe(true);
  });

  it('6.3: Even tuple validation (too few cards)', () => {
    const selected = [createCard(2), createCard(4)];
    const component: CostComponent = { type: 'evenTuple', n: 3 };
    expect(validateEvenTupleCost(component, selected)).toBe(false);
  });

  it('6.4: Odd tuple validation', () => {
    const selected = [createCard(1), createCard(3), createCard(5)];
    const component2: CostComponent = { type: 'oddTuple', n: 2 };
    expect(validateOddTupleCost(component2, selected)).toBe(false); // ==> Too many cards provided, only 2 should be used
  });

  it('6.5: Odd tuple validation', () => {
    const selected = [createCard(1), createCard(3), createCard(5)];
    const component3: CostComponent = { type: 'oddTuple', n: 3 };
    expect(validateOddTupleCost(component3, selected)).toBe(true);
  });

  it('6.6: Odd tuple validation (too few cards)', () => {
    const selected = [createCard(1), createCard(3)];
    const component: CostComponent = { type: 'oddTuple', n: 3 };
    expect(validateOddTupleCost(component, selected)).toBe(false);
  });

  it('6.7: Integration: Tuple Validation (exact match)', () => {
    const selected = [createCard(1), createCard(3), createCard(2), createCard(4)];
    const component1: CostComponent = { type: 'oddTuple', n: 2 };
    const component2: CostComponent = { type: 'evenTuple', n: 2 };
    expect(validateCostPayment([component1, component2], selected, 0)).toBe(true);
  });

  it('6.8: Tuple Validation (too many cards)', () => {
    const selected = [createCard(1), createCard(3), createCard(5), createCard(2), createCard(4), createCard(6)];
    const component2: CostComponent = { type: 'oddTuple', n: 2 };
    expect(validateCostPayment([component2], selected, 0)).toBe(false);
  });
});


describe('Cost Validation - Main Function', () => {
  it('7.1: Integrated: comprehensive unit test for mixed cost types', () => {
    const selected = [createCard(3), createCard(4), createCard(5), createCard(5)];

    // With AND logic, ALL components must pass
    const components1: CostComponent[] = [
      { type: 'number', value: 7 }, // Fails: 7 requested, 3 + 4 = 7 available but not distinct cards
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components1, selected, 0)).toBe(false);
  });

  it('7.2: Integrated: comprehensive unit test for mixed cost types', () => {
    const selected = [createCard(3), createCard(4), createCard(5), createCard(5)];

    // With AND logic, ALL components must pass
    const components2: CostComponent[] = [
      { type: 'number', value: 3 }, // requested 3
      { type: 'number', value: 4 }, // requested 4
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components2, selected, 0)).toBe(true);
  });

  it('7.3: Integrated: comprehensive unit test for mixed cost types', () => {
    const selected = [createCard(3), createCard(4), createCard(5), createCard(5)];

    // With AND logic, ALL components must pass
    const components3: CostComponent[] = [
      { type: 'sumAnyTuple', sum: 7 }, // requested 7 which fits 3 + 4
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components3, selected, 0)).toBe(true);
  });

  it('7.4: Integrated: handle empty hand case', () => {
    const selected: PearlCard[] = [];

    // Free card should pass
    expect(validateCostPayment([], selected, 0)).toBe(true);

    // Cost should fail with empty hand
    const components: CostComponent[] = [{ type: 'number', value: 5 }];
    expect(validateCostPayment(components, selected, 0)).toBe(false);
  });

  it('7.5: Integrated: handle empty cost array case (free card)', () => {
    const selected = [createCard(1)];
    expect(validateCostPayment([], selected, 0)).toBe(false);
    expect(validateCostPayment(undefined, selected, 0)).toBe(false);
  });

  it('7.6: handle null/undefined cost gracefully', () => {
    const selected = [createCard(5)];
    expect(validateCostPayment(undefined, selected, 0)).toBe(false);
    expect(validateCostPayment(null as any, selected, 0)).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('8.1: single card hand with exact cost match', () => {
    const selected = [createCard(7)];
    const components: CostComponent[] = [{ type: 'number', value: 7 }];
    expect(validateCostPayment(components, selected, 0)).toBe(true);
  });

  it('8.2: EXACT sum required - excess cards NOT allowed', () => {
    // Cost requires exactly 10
    const components: CostComponent[] = [{ type: 'sumAnyTuple', sum: 10 }];

    // Valid: hand sums to exactly 10
    const validHand = [createCard(8), createCard(2)];
    expect(validateCostPayment(components, validHand, 0)).toBe(true);

    // Invalid: hand subset sums to exactly 10, but more is provided
    const tooManyCards = [createCard(8), createCard(2), createCard(1)];
    expect(validateCostPayment(components, tooManyCards, 0)).toBe(false);

    // Invalid: hand sums to 11 (too much)
    const tooMuchHand = [createCard(8), createCard(3)];
    expect(validateCostPayment(components, tooMuchHand, 0)).toBe(false);

    // Invalid: hand sums to 9 (too little)
    const tooLittleHand = [createCard(8), createCard(1)];
    expect(validateCostPayment(components, tooLittleHand, 0)).toBe(false);
  });
});
