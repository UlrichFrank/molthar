#!/usr/bin/env node

/**
 * Generate a detailed test report for card cost validation
 * Shows positive and negative test results for each card with hand combinations
 * 
 * IMPORTANT: Cost components use AND logic - ALL must be satisfied
 */

const { getAllCards } = require('../dist/game/cardDatabase.js');
const { validateCostPayment } = require('../dist/game/costCalculation.js');
const fs = require('fs');
const path = require('path');

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
  
  // Check for impossible sumTuple: n cards summing to value
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

function generateHandForComponent(component, shouldPass) {
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
        return [];
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
        return [];
      }
    }

    case 'run': {
      const length = component.length || 3;
      if (shouldPass) {
        const hand = [];
        for (let i = 0; i < length; i++) {
          hand.push(createPearlCard(1 + i));
        }
        return hand;
      } else {
        return [];
      }
    }

    case 'sumTuple': {
      const n = component.n || 1;
      const sum = component.sum || 10;
      if (shouldPass) {
        const hand = [];
        let remaining = sum;
        for (let i = 0; i < n; i++) {
          const avgNeeded = Math.ceil(remaining / (n - i));
          const cardValue = Math.min(8, Math.max(1, avgNeeded));
          hand.push(createPearlCard(cardValue));
          remaining -= cardValue;
        }
        return hand;
      } else {
        return [];
      }
    }

    case 'sumAnyTuple': {
      const sum = component.sum || 10;
      if (shouldPass) {
        const hand = [];
        let remaining = sum;
        // Use as few cards as possible (greedy: 8, 7, 6, ...)
        for (let i = 8; i >= 1 && remaining > 0; i--) {
          while (remaining >= i) {
            hand.push(createPearlCard(i));
            remaining -= i;
          }
        }
        return hand;
      } else {
        return [];
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
        return [];
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
        return [];
      }
    }

    case 'drillingChoice': {
      return shouldPass ? [createPearlCard(5)] : [];
    }

    default:
      return [];
  }
}

function mergeHands(hands) {
  const merged = [];
  hands.forEach(hand => {
    merged.push(...hand);
  });
  return merged;
}

function generateValidHandForCosts(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }

  const hands = costComponents.map(comp => generateHandForComponent(comp, true));
  return mergeHands(hands);
}

function generateInvalidHandForCosts(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }

  return [];
}

// Generate report
const cards = getAllCards();
const report = [];

console.log('📋 Generating Card Cost Payment Test Report...\n');

let positivePassCount = 0;
let negativePassCount = 0;
let impossibleCostCount = 0;

cards.forEach((card, index) => {
  const cardNum = index + 1;
  const isImpossible = isCostImpossible(card.cost);
  
  const validHand = generateValidHandForCosts(card.cost);
  const positiveResult = validateCostPayment(card.cost, validHand, card.diamonds);
  
  const invalidHand = generateInvalidHandForCosts(card.cost);
  const negativeResult = validateCostPayment(card.cost, invalidHand, 0);
  
  if (positiveResult) positivePassCount++;
  if (!negativeResult) negativePassCount++;
  if (isImpossible) impossibleCostCount++;
  
  const costStr = card.cost && card.cost.length > 0 
    ? card.cost.map(c => `${c.type}${c.n ? `(${c.n})` : ''}${c.value ? `[${c.value}]` : ''}${c.sum ? `(sum:${c.sum})` : ''}`).join(' + ')
    : 'FREE';
  
  const status = isImpossible 
    ? '⚠️  IMPOSSIBLE' 
    : (positiveResult && !negativeResult) ? '✓ PASS' : '✗ FAIL';
  
  report.push({
    num: cardNum,
    id: card.id,
    name: card.name,
    powerPoints: card.powerPoints,
    diamonds: card.diamonds,
    cost: costStr,
    positiveTest: positiveResult ? '✅' : '❌',
    negativeTest: negativeResult ? '❌' : '✅',
    validHand: formatHand(validHand),
    invalidHand: formatHand(invalidHand),
    status: status,
    isImpossible: isImpossible
  });
});

console.log('═'.repeat(220));
console.log('CARD COST PAYMENT TEST REPORT (AND Logic - All components must be satisfied)'.padEnd(220));
console.log('═'.repeat(220));
console.log('');

console.log('Legend:');
console.log('  ✅ Test passed');
console.log('  ❌ Test failed');
console.log('  ✓ PASS = Both tests correct');
console.log('  ✗ FAIL = At least one test incorrect');
console.log('  ⚠️  IMPOSSIBLE = Cost unsatisfiable\n');

console.log('');
console.log('─'.repeat(220));
console.log(
  '#   '.padEnd(6) +
  'Card Name'.padEnd(30) +
  'Cost Components (AND logic)'.padEnd(70) +
  'Valid Hand'.padEnd(25) +
  'Invalid Hand'.padEnd(20) +
  'Pos'.padEnd(5) +
  'Neg'.padEnd(5) +
  'Status'.padEnd(15)
);
console.log('─'.repeat(220));

report.forEach(r => {
  console.log(
    (r.num + '.').padEnd(6) +
    r.name.substring(0, 28).padEnd(30) +
    r.cost.substring(0, 68).padEnd(70) +
    r.validHand.substring(0, 23).padEnd(25) +
    r.invalidHand.substring(0, 18).padEnd(20) +
    r.positiveTest.padEnd(5) +
    r.negativeTest.padEnd(5) +
    r.status.padEnd(15)
  );
});

console.log('─'.repeat(220));
console.log('');
console.log(`Total Cards: ${cards.length}`);
console.log(`Positive Tests: ${positivePassCount}/${cards.length}`);
console.log(`Negative Tests: ${negativePassCount}/${cards.length}`);
console.log(`Impossible Costs: ${impossibleCostCount}`);
const passCount = positivePassCount + negativePassCount;
const totalTests = cards.length * 2;
console.log(`Overall: ${passCount === totalTests ? '✓ ALL TESTS PASSED' : `⚠️  ${totalTests - passCount} TESTS FAILED`}`);
console.log('');

// Generate HTML report
const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card Cost Payment Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
    }
    .subtitle {
      margin-top: 10px;
      font-size: 16px;
      opacity: 0.95;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-box {
      background: rgba(255,255,255,0.2);
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    tr:hover {
      background: #f9f9f9;
    }
    tr.impossible {
      background: #fff9e6;
    }
    .num {
      width: 35px;
      color: #999;
      font-size: 11px;
      text-align: center;
    }
    .name {
      font-weight: 600;
      min-width: 120px;
    }
    .cost {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      color: #666;
    }
    .hand {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      background: #f5f5f5;
      padding: 6px 10px;
      border-radius: 3px;
      color: #2c3e50;
      border-left: 3px solid #ddd;
    }
    .hand-valid {
      background: #e8f5e9;
      color: #2e7d32;
      border-left-color: #4caf50;
    }
    .hand-invalid {
      background: #ffebee;
      color: #c62828;
      border-left-color: #f44336;
    }
    .test {
      text-align: center;
      font-size: 16px;
      width: 45px;
    }
    .status {
      text-align: center;
      font-weight: 600;
      width: 110px;
    }
    .pass {
      color: #4caf50;
    }
    .fail {
      color: #f44336;
    }
    .warning {
      color: #ff9800;
    }
    .legend {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .legend-item {
      margin: 8px 0;
      font-size: 14px;
    }
    .emoji {
      font-size: 18px;
      margin-right: 8px;
      display: inline-block;
      width: 24px;
    }
    .legend-section {
      margin-top: 15px;
    }
    .legend-section strong {
      display: block;
      margin-bottom: 8px;
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Card Cost Payment Test Report</h1>
    <div class="subtitle">AND Logic: All cost components must be satisfied together</div>
    <p>Test results for all ${cards.length} character cards from cards.json</p>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-label">Total Cards</div>
        <div class="stat-number">${cards.length}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Positive Tests</div>
        <div class="stat-number">${positivePassCount}/${cards.length}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Negative Tests</div>
        <div class="stat-number">${negativePassCount}/${cards.length}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Impossible</div>
        <div class="stat-number">${impossibleCostCount}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label" style="font-size: 18px; font-weight: bold;">
          ${passCount === totalTests ? '✅ ALL' : '⚠️  SOME'}
        </div>
      </div>
    </div>
  </div>

  <div class="legend">
    <strong>Cost Components Reference:</strong>
    <div class="legend-item"><code>number[5]</code> = Pearls summing to 5</div>
    <div class="legend-item"><code>nTuple(2)</code> = 2 identical valued pearls</div>
    <div class="legend-item"><code>run</code> = Sequential cards (e.g., 1-2-3)</div>
    <div class="legend-item"><code>sumTuple(3, sum:20)</code> = 3 pearls summing to exactly 20</div>
    <div class="legend-item"><code>sumAnyTuple(sum:10)</code> = Any number of pearls summing to 10</div>
    <div class="legend-item"><code>evenTuple(2)</code> = 2 even-valued pearls</div>
    <div class="legend-item"><code>oddTuple(2)</code> = 2 odd-valued pearls</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th class="name">Card</th>
        <th class="cost">Cost Components</th>
        <th>💚 Valid</th>
        <th>❤️ Invalid</th>
        <th class="test">✅</th>
        <th class="test">❌</th>
        <th class="status">Status</th>
      </tr>
    </thead>
    <tbody>
      ${report.map(r => `
      <tr${r.isImpossible ? ' class="impossible"' : ''}>
        <td class="num">${r.num}</td>
        <td class="name">${r.name}</td>
        <td class="cost">${r.cost}</td>
        <td><div class="hand hand-valid">${r.validHand}</div></td>
        <td><div class="hand hand-invalid">${r.invalidHand}</div></td>
        <td class="test">${r.positiveTest}</td>
        <td class="test">${r.negativeTest}</td>
        <td class="status ${r.status.startsWith('✓') ? 'pass' : r.status.startsWith('⚠️') ? 'warning' : 'fail'}">${r.status}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const rows = document.querySelectorAll('tbody tr');
      const failedRows = Array.from(rows).filter(r => r.querySelector('.fail'));
      
      if (failedRows.length > 0) {
        console.warn('⚠️  ' + failedRows.length + ' cards have issues');
      } else {
        console.log('✅ All card tests passed!');
      }
    });
  </script>
</body>
</html>`;

const reportPath = path.join(process.cwd(), 'test-report.html');
fs.writeFileSync(reportPath, html);
console.log(`✅ HTML Report saved: test-report.html`);

