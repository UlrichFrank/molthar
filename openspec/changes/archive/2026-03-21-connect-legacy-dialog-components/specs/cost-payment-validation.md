# Spec: Cost Payment Validation System

## Overview
The Cost Payment Validation system validates whether a player can pay a character's cost using cards from their hand and optional diamond modifiers. This logic is used by CharacterActivationDialog and can be reused elsewhere.

## Cost Types

The game supports four cost types. All costs can be reduced by diamonds.

### 1. Fixed Sum
**Requirement**: Cards sum to exact total

```
Cost: Sum = 15
Example valid selections: [7, 8] | [3, 4, 8] | [5, 5, 5]
Example invalid: [7, 7] = 14 (too low) | [7, 8, 1] = 16 (too high)

With 1 diamond: Required sum becomes 14
With 2 diamonds: Required sum becomes 13
```

### 2. Identical Values
**Requirement**: N cards of same value

```
Cost: 3 identical values
Example valid: [4, 4, 4] | [7, 7, 7]
Example invalid: [3, 3, 4] (one 4 breaks pattern)

Diamond modifier:
- Reduces required count by 1
- Cost = 3 identical, with 1 diamond → need 2 identical + 1 any card
```

### 3. Run
**Requirement**: N consecutive card values

```
Cost: Run of 4
Example valid: [3, 4, 5, 6] | [2, 3, 4, 5]
Example invalid: [3, 4, 5, 7] (skips 6) | [2, 2, 3, 4] (duplicate 2)

Diamond modifier:
- Allows one gap in sequence
- Cost = Run of 4, with 1 diamond → [3, 4, 5, 7] (skips 6) is valid
```

### 4. Pairs
**Requirement**: N pairs (2 cards of same value each)

```
Cost: 2 pairs
Example valid: [3, 3, 7, 7] | [2, 2, 8, 8]
Example invalid: [3, 3, 3, 7] (three 3s, not a pair) | [3, 4, 7, 8]

Diamond modifier:
- Reduces required pair count by 1
- Cost = 2 pairs, with 1 diamond → need 1 pair + 2 any cards
```

## Validation Algorithm

### Input
```typescript
interface ValidationInput {
  costType: CostType;
  selectedCardIndices: number[];
  hand: number[]; // e.g., [3, 4, 7, 7, 8]
  diamondsUsed: number;
}

type CostType = 
  | { type: 'fixedSum', value: number }
  | { type: 'identicalValues', count: number }
  | { type: 'run', length: number }
  | { type: 'pairs', count: number };
```

### Output
```typescript
interface ValidationResult {
  isValid: boolean;
  reason?: string; // e.g., "Sum is 14, requires 15" or "Run has gap"
  selectedCards: number[]; // actual card values from indices
  totalValue?: number; // for fixed sum
}
```

### Pseudocode
```
function validateCost(input: ValidationInput): ValidationResult {
  const cards = input.selectedCardIndices.map(i => input.hand[i]);
  const adjustedCost = input.costType.value - input.diamondsUsed;

  if (input.costType.type === 'fixedSum') {
    const sum = cards.reduce((a, b) => a + b, 0);
    return { 
      isValid: sum === adjustedCost,
      totalValue: sum,
      reason: sum !== adjustedCost ? `Sum is ${sum}, requires ${adjustedCost}` : null
    };
  }
  
  if (input.costType.type === 'identicalValues') {
    const requiredCount = input.costType.count - input.diamondsUsed;
    const groups = groupBy(cards, v => v);
    const hasValidGroup = Object.values(groups).some(g => g.length >= requiredCount);
    return {
      isValid: hasValidGroup && cards.length >= requiredCount,
      reason: hasValidGroup ? null : `Need ${requiredCount} identical cards`
    };
  }
  
  if (input.costType.type === 'run') {
    const requiredLength = input.costType.length - input.diamondsUsed;
    const isRun = isConsecutiveSequence(cards, 1); // 1 gap allowed if diamond used
    return {
      isValid: isRun && cards.length >= requiredLength,
      reason: isRun ? null : `Need consecutive sequence of ${requiredLength}`
    };
  }
  
  if (input.costType.type === 'pairs') {
    const requiredPairs = input.costType.count - input.diamondsUsed;
    const pairs = countPairs(cards);
    return {
      isValid: pairs >= requiredPairs,
      reason: pairs < requiredPairs ? `Need ${requiredPairs} pairs, have ${pairs}` : null
    };
  }
}
```

## Constraints & Edge Cases

### Constraint: No Duplicate Indices
- Player cannot select same card twice
- System enforces: `selectedCardIndices` has no duplicates

### Constraint: Card Indices Must Be Valid
- `selectedCardIndices[i] < hand.length`
- System enforces: all indices point to actual cards

### Diamond Behavior
- Diamonds are separate from hand cards
- Using 1 diamond = reduce cost requirement by 1
- Can use multiple diamonds (if available)
- Diamond usage is separate from card selection

### Hand Size
- Can have 0-N cards (usually max 5 before discard)
- Empty hand = cannot pay any cost (except maybe with diamonds alone? Check rules)

### Edge Case: No Valid Selection
- If cost requires 5 pairs but player only has 2 cards: return isValid = false
- If cost requires run of 6 but player only has 3 cards: return isValid = false

### Edge Case: Cost = 0 (After Diamond Reduction)
- If cost is 2 sum, and player has 2 diamonds, required = 0
- Should return isValid = true with any selection (or no selection?)
- Check game rules for this edge case

## Implementation Location
- **Possible locations**:
  1. Shared utility: `shared/src/game/costValidation.ts`
  2. Game engine: Part of `GameEngine.validateCost()` method
  3. Dialog component: Embedded in CharacterActivationDialog (less reusable)
  
- **Recommendation**: Shared utility or game engine (more reusable)

## Testing Requirements
- [TC.1] Fixed Sum validation: accepts exact match, rejects over/under
- [TC.2] Fixed Sum with diamonds: correctly adjusts required sum
- [TC.3] Identical Values: accepts N cards of same value
- [TC.4] Identical Values: rejects mixed values
- [TC.5] Identical Values with diamonds: reduces required count
- [TC.6] Run: accepts consecutive sequences
- [TC.7] Run: rejects sequences with gaps (unless diamond used)
- [TC.8] Run with diamond: allows one gap
- [TC.9] Pairs: accepts N valid pairs
- [TC.10] Pairs: rejects odd/mismatched groups
- [TC.11] Pairs with diamonds: reduces required pair count
- [TC.12] Edge case: empty selection returns false
- [TC.13] Edge case: cost = 0 (after diamonds) returns true
- [TC.14] Multiple diamonds work correctly

## Performance
- Validation should run in <5ms per selection
- Called on every card click in dialog (real-time feedback)
- Algorithm complexity: O(N) where N = selected card count (usually < 10)

## Related Specs
- `character-activation-dialog.md` — Calls this validation on each card selection
- `character-replacement-dialog.md` — Does not use cost validation (replacement only)
- Game rules documentation — Check original game rules for edge cases
