import { findCostAssignment, validateCostPayment } from './src/game/costCalculation';
import type { CostComponent, PearlCard } from './src/game/types';

console.log('=== TEST 1: Run cost with 3 consecutive values ===');
const runCost: CostComponent[] = [{ type: 'run', length: 3 } as any];

// Test with exact 3 cards (1, 2, 3) - should pass
const cards3: PearlCard[] = [
  { id: 'c1', value: 1, hasSwapSymbol: false },
  { id: 'c2', value: 2, hasSwapSymbol: false },
  { id: 'c3', value: 3, hasSwapSymbol: false }
];
console.log('With 3 cards [1,2,3]:');
console.log('  validateCostPayment:', validateCostPayment(runCost, cards3, 0)); // should be true

// Test with 4 cards (1, 2, 3, 4) - should FAIL because we have excess cards
const cards4: PearlCard[] = [
  { id: 'c1', value: 1, hasSwapSymbol: false },
  { id: 'c2', value: 2, hasSwapSymbol: false },
  { id: 'c3', value: 3, hasSwapSymbol: false },
  { id: 'c4', value: 4, hasSwapSymbol: false }
];
console.log('With 4 cards [1,2,3,4]:');
console.log('  validateCostPayment:', validateCostPayment(runCost, cards4, 0)); // should be false (excess card)

console.log('\n=== TEST 2: Two fixed sum costs ===');
const twoFixed: CostComponent[] = [
  { type: 'number', value: 6 } as any,
  { type: 'number', value: 6 } as any
];

// With exact 2 cards (6, 6) - should pass
const cards2: PearlCard[] = [
  { id: 'c1', value: 6, hasSwapSymbol: false },
  { id: 'c2', value: 6, hasSwapSymbol: false }
];
console.log('With 2 cards [6,6]:');
console.log('  validateCostPayment:', validateCostPayment(twoFixed, cards2, 0)); // should be true

// With 3 cards (6, 6, 4) - should FAIL
const cards3alt: PearlCard[] = [
  { id: 'c1', value: 6, hasSwapSymbol: false },
  { id: 'c2', value: 6, hasSwapSymbol: false },
  { id: 'c3', value: 4, hasSwapSymbol: false }
];
console.log('With 3 cards [6,6,4]:');
console.log('  validateCostPayment:', validateCostPayment(twoFixed, cards3alt, 0)); // should be false
