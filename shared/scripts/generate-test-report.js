#!/usr/bin/env node

/**
 * Generate a detailed test report for card cost validation
 * Shows positive and negative test results for each card with hand combinations
 * 
 * IMPORTANT: Cost components use AND logic - ALL must be satisfied
 */

const fs = require('fs');
const path = require('path');

// Load cards directly from cards.json
function loadCards() {
  const cardsPath = path.join(__dirname, '../../assets/cards.json');
  const data = fs.readFileSync(cardsPath, 'utf-8');
  return JSON.parse(data);
}

// Map raw card data to CharacterCard format
function mapRawCard(raw) {
  return {
    id: raw.id,
    name: raw.name,
    cost: raw.cost,
    powerPoints: raw.powerPoints,
    diamonds: raw.diamondsReward,
    abilities: raw.ability.type === 'none' ? [] : [raw.ability],
  };
}

// Get all cards with cardCount expansion
function getAllCards() {
  const rawCards = loadCards();
  const result = [];
  for (const raw of rawCards) {
    const mapped = mapRawCard(raw);
    for (let i = 0; i < raw.cardCount; i++) {
      result.push({
        ...mapped,
        id: raw.cardCount > 1 ? `${mapped.id}-copy${i}` : mapped.id,
      });
    }
  }
  return result;
}

// Validate cost payment (reimplemented in JavaScript)
// IMPORTANT: Each component must use a DIFFERENT subset of the hand
function validateCostPayment(components, hand, diamondCount = 0) {
  if (!components || components.length === 0) return true;

  // Try all possible ways to distribute hand cards among components
  return canSatisfyAllComponents(components, hand, diamondCount, 0, []);
}

function canSatisfyAllComponents(components, hand, diamondCount, compIndex, usedIndices) {
  // Base case: all components satisfied
  if (compIndex >= components.length) {
    return true;
  }

  const component = components[compIndex];
  const availableCards = hand.filter((_, idx) => !usedIndices.includes(idx));

  // Try all possible subsets of available cards for this component
  const subsets = generateSubsets(availableCards);
  for (const subset of subsets) {
    if (validateCostComponent(component, subset, diamondCount)) {
      // This subset works - mark its indices as used and continue
      const newUsedIndices = [
        ...usedIndices,
        ...availableCards
          .reduce((indices, card, idx) => {
            if (subset.includes(card)) indices.push(idx);
            return indices;
          }, [])
          .map(relIdx => hand.findIndex((_, hIdx) => hand[hIdx] === availableCards[relIdx]))
      ];
      
      if (canSatisfyAllComponents(components, hand, diamondCount, compIndex + 1, newUsedIndices)) {
        return true;
      }
    }
  }

  return false;
}

function generateSubsets(array) {
  const subsets = [[]];
  for (const item of array) {
    const newSubsets = subsets.map(subset => [...subset, item]);
    subsets.push(...newSubsets);
  }
  return subsets;
}

function validateCostComponent(component, hand, diamondCount = 0) {
  const type = component.type;

  switch (type) {
    case 'number': {
      const required = Math.max(1, component.value - diamondCount);
      return findSum(hand, 0, required);
    }
    
    case 'nTuple': {
      const n = component.n || 1;
      const identicalCards = hand.filter(c => c.value === hand[0]?.value || 0);
      return identicalCards.length >= n;
    }
    
    case 'sumTuple': {
      const n = component.n || 1;
      const sum = Math.max(1, component.sum - diamondCount);
      return findSumWithCount(hand, sum, n);
    }
    
    case 'sumAnyTuple': {
      const sum = Math.max(1, component.sum - diamondCount);
      return findSum(hand, 0, sum);
    }
    
    case 'run': {
      const length = component.length || 3;
      return hasRun(hand, length);
    }
    
    case 'tripleChoice': {
      const value1 = component.value1 || 3;
      const value2 = component.value2 || 6;
      const count1 = hand.filter(c => c.value === value1).length;
      const count2 = hand.filter(c => c.value === value2).length;
      return count1 >= 3 || count2 >= 3;
    }
    
    default:
      return true;
  }
}

function findSum(cards, currentSum, target) {
  if (currentSum === target) return true;
  if (currentSum > target || cards.length === 0) return false;

  const [first, ...rest] = cards;
  if (findSum(rest, currentSum + first.value, target)) return true;
  if (findSum(rest, currentSum, target)) return true;
  return false;
}

function findSumWithCount(cards, target, n) {
  function backtrack(index, currentSum, count) {
    if (currentSum === target && count === n) return true;
    if (currentSum >= target || count >= n || index >= cards.length) {
      return currentSum === target && count === n;
    }

    if (backtrack(index + 1, currentSum + cards[index].value, count + 1)) return true;
    if (backtrack(index + 1, currentSum, count)) return true;
    return false;
  }

  return backtrack(0, 0, 0);
}

function hasRun(cards, length) {
  const values = [...new Set(cards.map(c => c.value))].sort((a, b) => a - b);
  for (let i = 0; i <= values.length - length; i++) {
    let isRun = true;
    for (let j = 0; j < length - 1; j++) {
      if (values[i + j + 1] !== values[i + j] + 1) {
        isRun = false;
        break;
      }
    }
    if (isRun) return true;
  }
  return false;
}

function createPearlCard(value, hasSwapSymbol = false) {
  return {
    id: `pearl-${value}-${Math.random()}`,
    value,
    hasSwapSymbol,
  };
}

function isCostImpossible(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return false;
  }
  
  for (const comp of costComponents) {
    if (comp.type === 'sumTuple' && comp.n && comp.sum) {
      const maxSum = Array.from({length: comp.n}).reduce((sum, _, i) => sum + Math.max(1, 8-i), 0);
      if (comp.sum > maxSum) {
        return true;
      }
    }
  }
  return false;
}

function formatHand(hand) {
  if (!hand || hand.length === 0) return 'empty';
  const values = hand.map(c => c.value).sort((a, b) => b - a);
  return values.join('+');
}

function generateHandForComponent(component, shouldPass, diamondCount = 0) {
  const type = component.type;

  switch (type) {
    case 'number': {
      const value = component.value || 10;
      
      if (shouldPass) {
        const hand = [];
        let remaining = value;
        for (let i = 8; i >= 1 && remaining > 0; i--) {
          if (remaining >= i) {
            hand.push(createPearlCard(i));
            remaining -= i;
          }
        }
        return hand;
      } else {
        const hand = [];
        let remaining = Math.max(0, value - 1);
        if (remaining > 0) {
          for (let i = 8; i >= 1 && remaining > 0; i--) {
            if (remaining >= i) {
              hand.push(createPearlCard(i));
              remaining -= i;
            }
          }
        }
        return hand;
      }
    }

    case 'nTuple': {
      const n = component.n || 2;
      if (shouldPass) {
        const hand = [];
        for (let i = 0; i < n; i++) {
          hand.push(createPearlCard(5));
        }
        return hand;
      } else {
        const hand = [];
        for (let i = 0; i < Math.max(0, n - 1); i++) {
          hand.push(createPearlCard(5));
        }
        return hand;
      }
    }

    case 'run': {
      const length = component.length || 3;
      if (shouldPass) {
        const hand = [];
        for (let i = 0; i < length; i++) {
          hand.push(createPearlCard(i + 1));
        }
        return hand;
      } else {
        const hand = [];
        for (let i = 0; i < length - 1; i++) {
          hand.push(createPearlCard(i + 1));
        }
        return hand;
      }
    }

    case 'sumTuple': {
      const n = component.n || 2;
      const sum = component.sum || 10;
      
      if (shouldPass) {
        // Generate exactly n cards that sum to target value
        const hand = [];
        let remaining = sum;
        
        // Distribute evenly first: each card gets sum/n, plus remainder
        const baseValue = Math.floor(remaining / n);
        const remainder = remaining % n;
        
        for (let i = 0; i < n; i++) {
          const cardValue = baseValue + (i < remainder ? 1 : 0);
          hand.push(createPearlCard(Math.min(8, Math.max(1, cardValue))));
        }
        return hand;
      } else {
        // Generate hand that does NOT sum to target (off by 1)
        const hand = [];
        let remaining = sum + 1;
        const baseValue = Math.floor(remaining / n);
        const remainder = remaining % n;
        
        for (let i = 0; i < n; i++) {
          const cardValue = baseValue + (i < remainder ? 1 : 0);
          hand.push(createPearlCard(Math.min(8, Math.max(1, cardValue))));
        }
        return hand;
      }
    }

    case 'sumAnyTuple': {
      const sum = component.sum || 10;
      if (shouldPass) {
        const hand = [];
        let remaining = sum;
        for (let i = 8; i >= 1 && remaining > 0; i--) {
          if (remaining >= i) {
            hand.push(createPearlCard(i));
            remaining -= i;
          }
        }
        return hand;
      } else {
        const hand = [];
        let remaining = Math.max(0, sum - 1);
        if (remaining > 0) {
          for (let i = 8; i >= 1 && remaining > 0; i--) {
            if (remaining >= i) {
              hand.push(createPearlCard(i));
              remaining -= i;
            }
          }
        }
        return hand;
      }
    }

    case 'tripleChoice': {
      const value1 = component.value1 || 3;
      const value2 = component.value2 || 6;
      
      if (shouldPass) {
        return Math.random() < 0.5
          ? [createPearlCard(value1), createPearlCard(value1), createPearlCard(value1)]
          : [createPearlCard(value2), createPearlCard(value2), createPearlCard(value2)];
      } else {
        return [createPearlCard(value1), createPearlCard(value1), createPearlCard(value2)];
      }
    }

    case 'evenTuple': {
      const n = component.n || 2;
      if (shouldPass) {
        const hand = [];
        const evenValues = [2, 4, 6, 8];
        for (let i = 0; i < n; i++) {
          hand.push(createPearlCard(evenValues[i % evenValues.length]));
        }
        return hand;
      } else {
        const hand = [];
        for (let i = 0; i < Math.max(0, n - 1); i++) {
          hand.push(createPearlCard(2));
        }
        return hand;
      }
    }

    case 'oddTuple': {
      const n = component.n || 2;
      if (shouldPass) {
        const hand = [];
        const oddValues = [1, 3, 5, 7];
        for (let i = 0; i < n; i++) {
          hand.push(createPearlCard(oddValues[i % oddValues.length]));
        }
        return hand;
      } else {
        const hand = [];
        for (let i = 0; i < Math.max(0, n - 1); i++) {
          hand.push(createPearlCard(1));
        }
        return hand;
      }
    }

    case 'diamond': {
      // Diamond costs are paid with actual diamonds, not pearl cards
      // Return empty hand if shouldPass (no cards needed), something invalid otherwise
      return shouldPass ? [] : [createPearlCard(1)];
    }

    default:
      return [];
  }
}

function generateValidHandForCost(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }

  const componentHands = costComponents.map(comp => generateHandForComponent(comp, true, 0));
  const combinedHand = componentHands.flat();
  
  return combinedHand;
}

function generateInvalidHandForCost(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }

  const componentHands = [];
  for (let i = 0; i < costComponents.length; i++) {
    const shouldPass = i !== 0;
    componentHands.push(generateHandForComponent(costComponents[i], shouldPass, 0));
  }

  return componentHands.flat();
}

/**
 * Convert cost components to human-readable description
 * Mirrors the describeCost function from game-web
 */
function describeCost(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return 'Free';
  }

  const descriptions = costComponents.map(component => {
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

// Generate report
const cards = getAllCards();
const results = [];
const seenCombinations = new Set();

for (const card of cards) {
  const costComponents = card.cost || [];
  const impossible = isCostImpossible(costComponents);

  const validHand = generateValidHandForCost(costComponents);
  const isValidValid = validateCostPayment(costComponents, validHand, 0);

  const invalidHand = generateInvalidHandForCost(costComponents);
  const isInvalidInvalid = !validateCostPayment(costComponents, invalidHand, 0);

  const status = isValidValid && isInvalidInvalid ? '✓ PASS' : '✗ FAIL';
  const costStr = describeCost(costComponents);
  
  // Deduplicate: skip if we already tested this card name with these costs
  const key = `${card.name}|${costStr}`;
  if (seenCombinations.has(key)) {
    continue;
  }
  seenCombinations.add(key);

  results.push({
    name: card.name,
    status,
    validHand: formatHand(validHand),
    invalidHand: formatHand(invalidHand),
    costStr,
    isValidValid,
    isInvalidInvalid,
  });
}

// Generate HTML report
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Card Cost Validation Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; margin-bottom: 10px; }
    .summary { font-size: 1.1em; margin-bottom: 20px; }
    .pass-rate { font-weight: bold; color: #4CAF50; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background: #4CAF50; color: white; font-weight: 600; }
    tr:hover { background: #f0f0f0; }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:nth-child(even):hover { background: #e8f5e9; }
    .pass { background-color: #c8e6c9; color: #2e7d32; font-weight: bold; text-align: center; }
    .fail { background-color: #ffcdd2; color: #c62828; font-weight: bold; text-align: center; }
    .cost { font-size: 0.9em; color: #1976d2; font-weight: 500; max-width: 400px; }
    .hand { font-family: monospace; color: #555; }
  </style>
</head>
<body>
  <h1>Card Cost Validation Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <table>
    <thead>
      <tr>
        <th>Card</th>
        <th>Cost</th>
        <th>Valid Hand (✓)</th>
        <th>Invalid Hand (✗)</th>
        <th>Test Result</th>
      </tr>
    </thead>
    <tbody>
${results.map(r => `
      <tr>
        <td>${r.name}</td>
        <td class="cost">${r.costStr}</td>
        <td class="hand">${r.validHand}</td>
        <td class="hand">${r.invalidHand}</td>
        <td class="${r.status.includes('PASS') ? 'pass' : 'fail'}">${r.status}</td>
      </tr>
`).join('')}
    </tbody>
  </table>
  <div class="summary">
    <strong>Test Summary:</strong> <span class="pass-rate">${results.filter(r => r.status.includes('PASS')).length}/${results.length}</span> cards passed validation tests
  </div>
</body>
</html>`;

const reportPath = path.join(__dirname, '../test-report.html');
fs.writeFileSync(reportPath, html);

console.log(`Report generated: ${reportPath}`);
console.log(`Total: ${results.length} | Passed: ${results.filter(r => r.status.includes('PASS')).length}`);
