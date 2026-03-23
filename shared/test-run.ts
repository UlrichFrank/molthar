import { findCostAssignment, validateCostPayment } from './src/game/costCalculation';
import type { CostComponent, PearlCard } from './src/game/types';

const gandalfCost: CostComponent[] = [{ type: 'run', length: 3 } as any];
const selectedCards: PearlCard[] = [
  { id: 'c1', value: 1, hasSwapSymbol: false },
  { id: 'c2', value: 2, hasSwapSymbol: false },
  { id: 'c3', value: 3, hasSwapSymbol: false }
];

console.log('Testing Gandalf validation:');
console.log('Cost:', JSON.stringify(gandalfCost));
console.log('Cards:', selectedCards.map(c => c.value).join(', '));

const assignment = findCostAssignment(gandalfCost, selectedCards, 0);
console.log('findCostAssignment result:', assignment);

const valid = validateCostPayment(gandalfCost, selectedCards, 0);
console.log('validateCostPayment result:', valid);
