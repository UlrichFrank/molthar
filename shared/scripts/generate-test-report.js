#!/usr/bin/env node

/**
 * Generate a detailed test report for card cost validation
 * Shows positive and negative test results for each card
 */

const { getAllCards } = require('../dist/game/cardDatabase.js');
const { validateCostPayment } = require('../dist/game/costCalculation.js');
const fs = require('fs');
const path = require('path');

// Helper to create pearl cards
function createPearlCard(value, hasSwapSymbol = false) {
  return {
    id: `pearl-${value}-${Math.random()}`,
    value,
    hasSwapSymbol,
  };
}

// Check if a cost is impossible (unsatisfiable)
function isCostImpossible(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return false;
  }
  
  // For now, just check sumAnyTuple/sumTuple with n=1 and sum>8
  for (const comp of costComponents) {
    if ((comp.type === 'sumAnyTuple' || comp.type === 'sumTuple') && (comp.n || 1) === 1 && comp.sum > 8) {
      return true;
    }
  }
  return false;
}

// Hand generation functions (same as in tests)
function generateValidHandForCost(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }
  const component = costComponents[0];
  return generateHandForComponent(component, true);
}

function generateInvalidHandForCost(costComponents) {
  if (!costComponents || costComponents.length === 0) {
    return [];
  }
  const component = costComponents[0];
  return generateHandForComponent(component, false);
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
        const hand = [];
        let remaining = Math.max(0, value - 1);
        for (let i = 8; i >= 1 && remaining > 0; i--) {
          if (remaining >= i) {
            hand.push(createPearlCard(i));
            remaining -= i;
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
        for (let i = 0; i < Math.max(1, n - 1); i++) {
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
          hand.push(createPearlCard(1 + i));
        }
        return hand;
      } else {
        const hand = [];
        hand.push(createPearlCard(1));
        hand.push(createPearlCard(3));
        if (length > 2) {
          hand.push(createPearlCard(5));
        }
        return hand;
      }
    }

    case 'sumTuple':
    case 'sumAnyTuple': {
      const n = component.n || 1;
      const sum = component.sum || 10;
      if (shouldPass) {
        const hand = [];
        if (n === 1) {
          const cardValue = Math.min(8, Math.max(1, sum));
          hand.push(createPearlCard(cardValue));
        } else {
          let remaining = sum;
          for (let i = 0; i < n; i++) {
            const avgNeeded = Math.ceil(remaining / (n - i));
            const cardValue = Math.min(8, Math.max(1, avgNeeded));
            hand.push(createPearlCard(cardValue));
            remaining -= cardValue;
          }
        }
        return hand;
      } else {
        const hand = [];
        if (n === 1) {
          if (sum > 1) {
            hand.push(createPearlCard(Math.max(1, sum - 1)));
          }
        } else {
          for (let i = 0; i < Math.max(1, n - 1); i++) {
            hand.push(createPearlCard(5));
          }
        }
        return hand;
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
        const oddValues = [1, 3, 5, 7];
        for (let i = 0; i < n; i++) {
          hand.push(createPearlCard(oddValues[i % oddValues.length]));
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
        const evenValues = [2, 4, 6, 8];
        for (let i = 0; i < n; i++) {
          hand.push(createPearlCard(evenValues[i % evenValues.length]));
        }
        return hand;
      }
    }

    case 'drillingChoice': {
      if (shouldPass) {
        return [createPearlCard(5)];
      } else {
        return [];
      }
    }

    default:
      return [];
  }
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
  
  // Test positive case
  const validHand = generateValidHandForCost(card.cost);
  const positiveResult = validateCostPayment(card.cost, validHand, card.diamonds);
  
  // Test negative case
  const invalidHand = generateInvalidHandForCost(card.cost);
  const negativeResult = validateCostPayment(card.cost, invalidHand, 0);
  
  if (positiveResult) positivePassCount++;
  if (!negativeResult) negativePassCount++;
  if (isImpossible) impossibleCostCount++;
  
  const costStr = card.cost && card.cost.length > 0 
    ? card.cost.map(c => `${c.type}${c.n ? `(${c.n})` : ''}${c.value ? `[${c.value}]` : ''}`).join(' + ')
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
    status: status,
    isImpossible: isImpossible
  });
});

// Print text report
console.log('═'.repeat(150));
console.log('CARD COST PAYMENT TEST REPORT'.padEnd(150));
console.log('═'.repeat(150));
console.log('');

console.log('Legend:');
console.log('  ✅ Test passed (positive test validates, card can be paid)');
console.log('  ❌ Test failed (positive test failed, or negative test succeeded)');
console.log('  ✓ PASS = Both positive AND negative tests passed');
console.log('  ✗ FAIL = At least one test failed');
console.log('  ⚠️  IMPOSSIBLE = Cost is unsatisfiable (e.g., need value 10 from pearl cards max 1-8)\n');

console.log('');
console.log('─'.repeat(150));
console.log(
  '#   '.padEnd(6) +
  'Card Name'.padEnd(30) +
  'Cost Description'.padEnd(50) +
  'PP'.padEnd(4) +
  'Dia'.padEnd(4) +
  'Positive'.padEnd(10) +
  'Negative'.padEnd(10) +
  'Status'.padEnd(15)
);
console.log('─'.repeat(150));

report.forEach(r => {
  console.log(
    (r.num + '.').padEnd(6) +
    r.name.substring(0, 28).padEnd(30) +
    r.cost.substring(0, 48).padEnd(50) +
    r.powerPoints.toString().padEnd(4) +
    r.diamonds.toString().padEnd(4) +
    r.positiveTest.padEnd(10) +
    r.negativeTest.padEnd(10) +
    r.status.padEnd(15)
  );
});

console.log('─'.repeat(150));
console.log('');
console.log(`Total Cards: ${cards.length}`);
console.log(`Positive Tests Passed: ${positivePassCount}/${cards.length}`);
console.log(`Negative Tests Passed: ${negativePassCount}/${cards.length}`);
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
      max-width: 1400px;
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
    }
    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f9f9f9;
    }
    tr.impossible {
      background: #fff9e6;
    }
    tr.impossible:hover {
      background: #ffe6cc;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .num {
      width: 50px;
      color: #999;
      font-size: 12px;
    }
    .name {
      font-weight: 600;
      min-width: 150px;
    }
    .cost {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      color: #666;
      max-width: 300px;
    }
    .number {
      text-align: center;
      width: 40px;
    }
    .test {
      text-align: center;
      font-size: 16px;
      width: 60px;
    }
    .status {
      text-align: center;
      font-weight: 600;
      width: 120px;
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
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Card Cost Payment Test Report</h1>
    <p>Validation results for all character cards from cards.json</p>
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
        <div class="stat-label">Impossible Costs</div>
        <div class="stat-number">${impossibleCostCount}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label" style="font-size: 18px; font-weight: bold;">
          ${passCount === totalTests ? '✅ ALL PASS' : '⚠️  REVIEW'}
        </div>
      </div>
    </div>
  </div>

  <div class="legend">
    <strong>How to read this report:</strong>
    <div class="legend-item"><span class="emoji">✅</span> Positive Test: Card can be paid with valid hand</div>
    <div class="legend-item"><span class="emoji">❌</span> Negative Test: Card cannot be paid with invalid hand (expected)</div>
    <div class="legend-item"><span class="emoji">✓</span> Status PASS: Both tests work correctly</div>
    <div class="legend-item"><span class="emoji">✗</span> Status FAIL: At least one test failed - review needed</div>
    <div class="legend-item"><span class="emoji">⚠️</span> Status IMPOSSIBLE: Cost is unsatisfiable (e.g., need value 10 from cards with max 1-8)</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th class="name">Card Name</th>
        <th class="cost">Cost Description</th>
        <th class="number">PP</th>
        <th class="number">Dia</th>
        <th class="test">Positive</th>
        <th class="test">Negative</th>
        <th class="status">Status</th>
      </tr>
    </thead>
    <tbody>
      ${report.map(r => `
      <tr${r.isImpossible ? ' class="impossible"' : ''}>
        <td class="num">${r.num}</td>
        <td class="name">${r.name}</td>
        <td class="cost">${r.cost}</td>
        <td class="number">${r.powerPoints}</td>
        <td class="number">${r.diamonds}</td>
        <td class="test">${r.positiveTest}</td>
        <td class="test">${r.negativeTest}</td>
        <td class="status ${r.status.startsWith('✓') ? 'pass' : r.status.startsWith('⚠️') ? 'warning' : 'fail'}">${r.status}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <script>
    // Allow filtering by status
    document.addEventListener('DOMContentLoaded', function() {
      const rows = document.querySelectorAll('tbody tr');
      const failedRows = Array.from(rows).filter(r => r.querySelector('.fail'));
      
      if (failedRows.length > 0) {
        console.warn('⚠️  ' + failedRows.length + ' cards have failed tests');
        failedRows.forEach(r => {
          console.log(r.textContent);
        });
      }
    });
  </script>
</body>
</html>`;

// Write HTML report
const reportPath = path.join(process.cwd(), 'test-report.html');
fs.writeFileSync(reportPath, html);
console.log(`✅ HTML Report generated: test-report.html`);
console.log(`   Open in browser to review: file://${reportPath}`);

