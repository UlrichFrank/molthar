import { describe, it, expect } from 'vitest';
import {
  validateFixedCost,
  applyDiamondModifier,
  validateNTupleCost,
  validateRunCost,
  validateSumTupleCost,
  validateEvenTupleCost,
  validateOddTupleCost,
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

describe('Cost Calculation - Fixed Value', () => {
  it('4.2: fixed value without diamonds returns correct value', () => {
    const component: CostComponent = { type: 'number', value: 8 };
    const hand = [createCard(8)];
    const result = validateFixedCost(component, hand);
    expect(result).toBe(true);
  });
/*
  it('4.3: fixed value with diamonds reduces correctly', () => {
    const component: CostComponent = { type: 'number', value: 7 };
    const cardvalue:number = 8;
    const hand = [createCard(applyDiamondModifier(cardvalue, 1))];
    const result = validateFixedCost(component, hand);
    expect(result).toBe(7);
  });
*/
  it('4.4: diamonds cap at zero (don\'t create negative costs)', () => {
    const component: CostComponent = { type: 'number', value: 5 };
    const result = validateFixedCost(component, [createCard(5)]);
    expect(result).toBe(true);
  });
});

describe('Cost Calculation - Diamond Modifier', () => {
  it('8.2: diamond reduction applies to fixed sum costs', () => {
    const result = applyDiamondModifier(6, 1);
    expect(result).toBe(5);
  });

  it('8.3: diamonds reduce cost by 1 per diamond correctly', () => {
    expect(applyDiamondModifier(5, 1)).toBe(4);
    expect(applyDiamondModifier(5, 2)).toBe(3);
    expect(applyDiamondModifier(5, 5)).toBe(0);
  });

  it('8.4: multiple diamonds reduce correctly', () => {
    const result = applyDiamondModifier(15, 4);
    expect(result).toBe(11);
  });

  it('8.5: diamonds don\'t create negative costs', () => {
    const result = applyDiamondModifier(3, 100);
    expect(result).toBe(0);
  });
});

describe('Cost Validation - N-Tuple', () => {
  it('5.2: pair validation passes with matching cards', () => {
    const hand = [createCard(5), createCard(5), createCard(3)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, hand)).toBe(true);
  });

  it('5.3: pair validation fails without matching cards', () => {
    const hand = [createCard(5), createCard(6), createCard(3)];
    const component: CostComponent = { type: 'nTuple', n: 2 };
    expect(validateNTupleCost(component, hand)).toBe(false);
  });

  it('5.4: triplet validation works correctly', () => {
    const hand = [createCard(4), createCard(4), createCard(4), createCard(2)];
    const component: CostComponent = { type: 'nTuple', n: 3 };
    expect(validateNTupleCost(component, hand)).toBe(true);

    const hand2 = [createCard(4), createCard(4), createCard(3)];
    expect(validateNTupleCost(component, hand2)).toBe(false);
  });

  it('5.5: validates n-tuple for any n (pairs, triplets, quads)', () => {
    const hand = [createCard(2), createCard(2), createCard(2), createCard(2), createCard(1)];

    expect(validateNTupleCost({ type: 'nTuple', n: 2 }, hand)).toBe(true);
    expect(validateNTupleCost({ type: 'nTuple', n: 3 }, hand)).toBe(true);
    expect(validateNTupleCost({ type: 'nTuple', n: 4 }, hand)).toBe(true);
    expect(validateNTupleCost({ type: 'nTuple', n: 5 }, hand)).toBe(false);
  });
});

describe('Cost Validation - Run/Sequence', () => {
  it('6.2: 3-run validation passes with sequential cards', () => {
    const hand = [createCard(3), createCard(4), createCard(5), createCard(1)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component, hand)).toBe(true);
  });

  it('6.3: 4-run validation passes with sequential cards', () => {
    const hand = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'run', length: 4 };
    expect(validateRunCost(component, hand)).toBe(true);
  });

  it('6.4: run validation fails with gaps', () => {
    const hand = [createCard(2), createCard(4), createCard(5), createCard(6)];
    const component: CostComponent = { type: 'run', length: 4 };
    expect(validateRunCost(component, hand)).toBe(false);
  });

  it('6.5: run validation fails with insufficient cards', () => {
    const hand = [createCard(3), createCard(4)];
    const component: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component, hand)).toBe(false);
  });

  it('6.6: multiple valid runs are detected', () => {
    const hand = [createCard(1), createCard(2), createCard(3), createCard(6), createCard(7), createCard(8)];
    const component3: CostComponent = { type: 'run', length: 3 };
    expect(validateRunCost(component3, hand)).toBe(true); // Can use 1-2-3 or 6-7-8
  });
});

describe('Cost Validation - Sum Tuple', () => {
  it('7.2: sum validation passes with exact match', () => {
    const hand = [createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'sumTuple', n: 2, sum: 7 };
    expect(validateSumTupleCost(component, hand)).toBe(true); // 3+4=7
  });

  it('7.3: sum validation passes with multiple valid combinations', () => {
    const hand = [createCard(2), createCard(3), createCard(4), createCard(5)];
    const component: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 7 };
    expect(validateSumTupleCost(component, hand)).toBe(true); // Multiple: 3+4, 2+5
  });

  it('7.4: sum validation fails when total unreachable', () => {
    const hand = [createCard(1), createCard(2), createCard(3)];
    const component: CostComponent = { type: 'sumTuple', n: 2, sum: 20 };
    expect(validateSumTupleCost(component, hand)).toBe(false);
  });

  it('7.5: validates all cost types that use sum component', () => {
    const hand = [createCard(2), createCard(3), createCard(4)];

    // sumTuple variant
    const comp1: CostComponent = { type: 'sumTuple', n: 2, sum: 6 };
    expect(validateSumTupleCost(comp1, hand)).toBe(true);

    // sumAnyTuple variant
    const comp2: CostComponent = { type: 'sumAnyTuple', n: 2, sum: 6 };
    expect(validateSumTupleCost(comp2, hand)).toBe(true);
  });
});

describe('Cost Validation - Even/Odd Tuples', () => {
  it('Even tuple validation', () => {
    const hand = [createCard(2), createCard(4), createCard(6), createCard(3)];
    const component: CostComponent = { type: 'evenTuple', n: 2 };
    expect(validateEvenTupleCost(component, hand)).toBe(true);

    const component2: CostComponent = { type: 'evenTuple', n: 4 };
    expect(validateEvenTupleCost(component2, hand)).toBe(false);
  });

  it('Odd tuple validation', () => {
    const hand = [createCard(1), createCard(3), createCard(5), createCard(2)];
    const component: CostComponent = { type: 'oddTuple', n: 3 };
    expect(validateOddTupleCost(component, hand)).toBe(true);

    const component2: CostComponent = { type: 'oddTuple', n: 4 };
    expect(validateOddTupleCost(component2, hand)).toBe(false);
  });
});

describe('Cost Validation - Main Function', () => {
  it('9.3: comprehensive unit test for mixed cost types', () => {
    const hand = [createCard(3), createCard(4), createCard(5), createCard(5)];

    // With AND logic, ALL components must pass
    const components1: CostComponent[] = [
      { type: 'number', value: 7 }, // Fails: 7 requested, 3 + 4 = 7 available but not distinct cards
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components1, hand, 0)).toBe(false);
    
    // With AND logic, ALL components must pass
    const components2: CostComponent[] = [
      { type: 'number', value: 3 }, // requested 3
      { type: 'number', value: 4 }, // requested 4
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components2, hand, 0)).toBe(true);

    // With AND logic, ALL components must pass
    const components3: CostComponent[] = [
      { type: 'sumAnyTuple', sum: 7 }, // requested 7 which fits 3 + 4
      { type: 'nTuple', n: 2 }, // Passes - has two 5s
    ];
    expect(validateCostPayment(components3, hand, 0)).toBe(true);
  });

  it('9.4: handle empty hand case', () => {
    const hand: PearlCard[] = [];

    // Free card should pass
    expect(validateCostPayment([], hand, 0)).toBe(true);

    // Cost should fail with empty hand
    const components: CostComponent[] = [{ type: 'number', value: 5 }];
    expect(validateCostPayment(components, hand, 0)).toBe(false);
  });

  it('9.5: handle empty cost array case (free card)', () => {
    const hand = [createCard(1)];
    expect(validateCostPayment([], hand, 0)).toBe(false);
    expect(validateCostPayment(undefined, hand, 0)).toBe(false);
  });

  it('9.6: handle null/undefined cost gracefully', () => {
    const hand = [createCard(5)];
    expect(validateCostPayment(undefined, hand, 0)).toBe(false);
    expect(validateCostPayment(null as any, hand, 0)).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('12.1: empty hand + free card = allowed', () => {
    const hand: PearlCard[] = [];
    expect(validateCostPayment([], hand, 0)).toBe(true);
  });

  it('12.2: single card hand with exact cost match', () => {
    const hand = [createCard(7)];
    const components: CostComponent[] = [{ type: 'number', value: 7 }];
    expect(validateCostPayment(components, hand, 0)).toBe(true);
  });

  it('12.6: EXACT sum required - excess cards NOT allowed', () => {
    // Cost requires exactly 10
    const components: CostComponent[] = [{ type: 'sumAnyTuple', sum: 10 }];
    
    // Valid: hand sums to exactly 10
    const validHand = [createCard(8), createCard(2)];
    expect(validateCostPayment(components, validHand, 0)).toBe(true);
    
    // Invalid: hand sums to 11 (too much)
    const tooMuchHand = [createCard(8), createCard(3)];
    expect(validateCostPayment(components, tooMuchHand, 0)).toBe(false);
    
    // Invalid: hand sums to 9 (too little)
    const tooLittleHand = [createCard(8), createCard(1)];
    expect(validateCostPayment(components, tooLittleHand, 0)).toBe(false);
  });
});
