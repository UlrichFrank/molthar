import { findCostAssignment, validateCostPayment } from './src/game/costCalculation';
import type { CostComponent, PearlCard } from './src/game/types';

const zwergCost: CostComponent[] = [
  { type: 'number', value: 6 } as any,
  { type: 'number', value: 6 } as any
];
const selectedCards: PearlCard[] = [
  { id: 'c1', value: 6, hasSwapSymbol: false },
  { id: 'c2', value: 6, hasSwapSymbol: false }
];

console.log('Testing Zwergenkämpfer 6 validation:');
console.log('Cost:', JSON.stringify(zwergCost));
console.log('Cards:', selectedCards.map(c => c.value).join(', '));

const assignment = findCostAssignment(zwergCost, selectedCards, 0);
console.log('findCostAssignment result:', assignment);

const valid = validateCostPayment(zwergCost, selectedCards, 0);
console.log('validateCostPayment result:', valid);
