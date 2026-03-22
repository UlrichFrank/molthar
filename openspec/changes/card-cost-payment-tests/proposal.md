## Why

The cost system (`validateCostPayment()`) is critical for accurate game mechanics - players must pay correct card costs to activate characters. Currently, we have 31 unit tests covering the cost validation logic, but no end-to-end tests verifying that **actual game cards from cards.json work correctly with the cost system**. We need to validate that each of the 45 character cards can be afforded with valid hands and rejected with insufficient hands.

## What Changes

- Create comprehensive test suite covering all 45 character cards from `cards.json`
- For each card: one positive test (valid payment) and one negative test (insufficient payment)
- Tests automatically generate valid/invalid hands based on card cost specifications
- Integrate test data from the actual card database, not mocked data
- Ensure cost validation works correctly for all 7 cost types across all cards

## Capabilities

### New Capabilities
- `card-cost-payment-tests`: Automated test generation for all character cards. For each card, create positive and negative test cases that verify the cost validation system works correctly with real game data.

### Modified Capabilities
- `cost-system`: Adding comprehensive real-card test coverage to validate that `validateCostPayment()` function correctly handles all cost types used in the actual card database.

## Impact

- **Code**: Adds new test file `shared/src/game/costPayment-cardDatabase.test.ts` (~50-100 test cases)
- **Dependencies**: Requires `cardDatabase.ts` (already exists) and `costCalculation.ts` (already exists)
- **Testing**: Increases test count from 31 → ~90+ tests
- **No breaking changes**: Pure test addition, no implementation changes
