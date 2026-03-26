## 1. Setup & Preparation

- [ ] 1.1 Review cardDatabase.ts and understand all 45 cards and their cost structures
- [ ] 1.2 Review costCalculation.ts to understand validateCostPayment() function signature and behavior
- [ ] 1.3 Review existing costCalculation.test.ts to understand test structure and patterns
- [ ] 1.4 Document the 7 cost types and their validation rules (for hand generation logic)

## 2. Test File Creation

- [ ] 2.1 Create new test file `shared/src/game/costPayment-cardDatabase.test.ts`
- [ ] 2.2 Import required modules: cardDatabase (getAllCards), validateCostPayment, describe, it, expect from vitest
- [ ] 2.3 Load all cards from database at test initialization
- [ ] 2.4 Create test structure with describe block for each card

## 3. Hand Generation Utility

- [ ] 3.1 Implement `generateValidHandForCost()` function that creates a pearl card hand satisfying all cost components
- [ ] 3.2 Implement `generateInvalidHandForCost()` function that creates a hand insufficient for the cost
- [ ] 3.3 Add helper functions to handle each cost type (number, nTuple, run, sumTuple, sumAnyTuple, evenTuple, oddTuple)
- [ ] 3.4 Test hand generation functions with known card costs to verify correctness

## 4. Positive Test Cases

- [ ] 4.1 For each card, generate a valid hand that satisfies the cost requirements
- [ ] 4.2 Create test case: `should validate with valid payment` for each card
- [ ] 4.3 Verify test calls validateCostPayment(card.cost, hand, diamonds) and expects `true`
- [ ] 4.4 Run tests and verify all positive cases pass

## 5. Negative Test Cases

- [ ] 5.1 For each card, generate an invalid hand with insufficient value/structure
- [ ] 5.2 Create test case: `should reject with invalid payment` for each card
- [ ] 5.3 Verify test calls validateCostPayment() with invalid hand and expects `false`
- [ ] 5.4 Run tests and verify all negative cases pass

## 6. Verification & Cleanup

- [ ] 6.1 Run full test suite: `npm test -- --run` in shared directory
- [ ] 6.2 Verify 90+ new tests pass (approximately 45 cards × 2 tests)
- [ ] 6.3 Check coverage: all 7 cost types should be tested in at least one card
- [ ] 6.4 Verify no console errors or warnings in test output
- [ ] 6.5 Clean up temporary code or comments
- [ ] 6.6 Document any assumptions or edge cases found during testing

## 7. Integration Validation

- [ ] 7.1 Rebuild shared package: `npm run build` in shared directory
- [ ] 7.2 Rebuild game-web: `npm run build` in game-web directory
- [ ] 7.3 Verify no TypeScript errors introduced
- [ ] 7.4 Verify tests still pass after rebuild

## 8. Documentation

- [ ] 8.1 Add comment block in test file explaining the test strategy
- [ ] 8.2 Document any unusual card costs or edge cases found
- [ ] 8.3 Add README note about how to maintain tests if cards.json is updated
