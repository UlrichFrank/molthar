## 1. Setup and Project Structure

- [x] 1.1 Review existing `validateCostPayment()` function in shared/src/game/index.ts
- [x] 1.2 Review GameState type definition and CharacterCard interface in shared/src/game/types.ts
- [x] 1.3 Verify cards.json structure and cost component definitions
- [x] 1.4 Create new cost calculation utility file: shared/src/game/costCalculation.ts

## 2. Implement Card Abilities Loading

- [ ] 2.1 Update GameEngine setup to preserve card ability data from loaded character cards
- [ ] 2.2 Add test to verify abilities are loaded with id, type, and description fields
- [ ] 2.3 Add test to verify red abilities are marked type "red"
- [ ] 2.4 Add test to verify blue abilities are marked type "blue"
- [ ] 2.5 Add test to verify cards with no abilities have empty ability array

## 3. Implement Card Cost Loading

- [ ] 3.1 Update GameEngine setup to preserve cost component data from loaded character cards
- [ ] 3.2 Add test to verify single cost component is loaded
- [ ] 3.3 Add test to verify multiple cost components are all loaded
- [ ] 3.4 Add test to verify cost type is preserved for all cost types
- [ ] 3.5 Add test to verify free cards (no cost) are handled correctly
- [ ] 3.6 Add test to verify cost properties (value, n, sum, length) are accessible

NOTE: Tasks 2 and 3 require loading card data from cards.json. The CharacterCard interface already has cost[] and abilities[] fields properly defined. Actual loading from cards.json will be addressed in a future change when card data loading is unified across the system.

## 4. Implement Fixed Sum Cost Calculation

- [x] 4.1 Implement `calculateFixedSumCost(costComponent, diamondCount)` function
- [x] 4.2 Add unit test: fixed sum without diamonds returns correct value
- [x] 4.3 Add unit test: fixed sum with diamonds reduces correctly
- [x] 4.4 Add unit test: diamonds cap at zero (don't create negative costs)
- [x] 4.5 Integrate fixed sum calculation into main cost calculator

## 5. Implement N-Tuple Cost Validation

- [x] 5.1 Implement `validateNTupleCost(costComponent, hand)` function to find n matching cards
- [x] 5.2 Add unit test: pair validation passes with matching cards
- [x] 5.3 Add unit test: pair validation fails without matching cards
- [x] 5.4 Add unit test: triplet validation works correctly
- [x] 5.5 Add unit test: validates n-tuple for any n (pairs, triplets, quads)
- [x] 5.6 Integrate n-tuple validation into main cost validator

## 6. Implement Run/Sequence Cost Validation

- [x] 6.1 Implement `validateRunCost(costComponent, hand)` function to find sequential cards
- [x] 6.2 Add unit test: 3-run validation passes with sequential cards
- [x] 6.3 Add unit test: 4-run validation passes with sequential cards
- [x] 6.4 Add unit test: run validation fails with gaps
- [x] 6.5 Add unit test: run validation fails with insufficient cards
- [x] 6.6 Add unit test: multiple valid runs are detected
- [x] 6.7 Integrate run validation into main cost validator

## 7. Implement Sum-Based Cost Validation

- [x] 7.1 Implement `validateSumTupleCost(costComponent, hand)` function to find n cards summing to target
- [x] 7.2 Add unit test: sum validation passes with exact match
- [x] 7.3 Add unit test: sum validation passes with multiple valid combinations
- [x] 7.4 Add unit test: sum validation fails when total unreachable
- [x] 7.5 Add unit test: validates all cost types that use sum component
- [x] 7.6 Integrate sum-tuple validation into main cost validator

## 8. Implement Diamond Modifier Logic

- [x] 8.1 Implement `applyDiamondModifier(baseCost, diamondCount)` utility
- [x] 8.2 Add unit test: diamond reduction applies to fixed sum costs
- [x] 8.3 Add unit test: diamonds reduce cost by 1 per diamond correctly
- [x] 8.4 Add unit test: multiple diamonds reduce correctly
- [x] 8.5 Add unit test: diamonds don't create negative costs
- [x] 8.6 Document that diamonds apply to cost calculation, not validation (runs/tuples)

## 9. Implement Main Cost Calculation/Validation Functions

- [x] 9.1 Implement `calculateCostRequirement(costComponent, diamondCount)` - returns required pearl points
- [x] 9.2 Implement `validateCostPayment(costComponents, hand, diamonds)` - returns true if affordable
- [x] 9.3 Add comprehensive unit test for mixed cost types
- [x] 9.4 Handle empty hand case
- [x] 9.5 Handle empty cost array case (free card)
- [x] 9.6 Handle null/undefined cost gracefully

## 10. Integration with activatePortalCard Move

- [x] 10.1 Update `activatePortalCard()` move to call new `validateCostPayment()` before processing
- [x] 10.2 Reject activation if validation fails (return early)
- [x] 10.3 Ensure used cards are deducted from hand only after successful validation
- [ ] 10.4 Add test: invalid cost payment is rejected
- [ ] 10.5 Add test: valid cost payment is accepted
- [ ] 10.6 Verify no regressions in existing game tests

## 11. Integration Tests with Real Card Data

- [ ] 11.1 Load actual cards.json and verify all costs parse correctly
- [ ] 11.2 Run cost calculation against every card in cards.json
- [ ] 11.3 Add test: every cost type used in real cards is covered by unit tests
- [ ] 11.4 Test edge cases from real cards (free cards, extreme costs, etc.)
- [ ] 11.5 Verify no TypeScript errors in full type checking

NOTE: Tasks 11.1-11.4 require cards.json to have complete cost definitions. Current cards.json has empty cost arrays (all free cards). This will be addressed when actual card data is loaded into the system.

## 12. Edge Cases and Error Handling

- [x] 12.1 Add test: empty hand + free card = allowed
- [x] 12.2 Add test: single card hand with exact cost match
- [x] 12.3 Add test: cost validation with full hand depletion
- [x] 12.4 Add test: cost with zero value
- [x] 12.5 Add test: cost with value higher than possible hand total
- [ ] 12.6 Verify error handling for malformed cost components

## 13. Documentation and Cleanup

- [x] 13.1 Add JSDoc comments to all cost calculation functions
- [x] 13.2 Document cost type rules in code comments (fixed sum, pairs, runs, tuples)
- [x] 13.3 Document diamond modifier behavior clearly
- [ ] 13.4 Create README explaining cost system (if needed)
- [x] 13.5 Ensure no console.log or debug code remains
- [x] 13.6 Run TypeScript compiler with strict mode
- [x] 13.7 Run full test suite
- [ ] 13.8 Create git commit with clear description of changes

## 14. Verification and Testing

- [x] 14.1 Run `npm test` in shared package - all tests pass
- [x] 14.2 Run `npm run build` in shared package - compiles successfully
- [x] 14.3 Run game-web build to verify frontend can use new types
- [ ] 14.4 Manual test: activate character with valid cost in running game
- [ ] 14.5 Manual test: verify invalid cost payment is rejected
- [ ] 14.6 Manual test: verify game state is consistent after cost payment

