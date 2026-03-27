## 1. Refactor Cost Assignment Logic

- [x] 1.1 Extract `tryAssignCardsToComponents()` logic into a public, named `findCostAssignment()` function that returns assignment details
- [x] 1.2 Update `findCostAssignment()` to return `Map<componentIndex, cardIndices[]> | null` instead of just boolean
- [x] 1.3 Ensure `findCostAssignment()` maintains existing backtracking behavior (all possible subsets, card reuse prevention)
- [x] 1.4 Update internal `validateCostComponent()` to work with `findCostAssignment()` for consistency
- [x] 1.5 Verify `validateCostPayment()` still works correctly (should now use `findCostAssignment()` internally)

## 2. Implement Cost Consumption Function

- [x] 2.1 Create `consumeCosts()` function with signature: `(costComponents, selectedCards, diamondCount) → { hand, diamonds } | null`
- [x] 2.2 Implement validation phase: call `findCostAssignment()` to ensure all costs can be satisfied
- [x] 2.3 Implement consumption phase: remove cards from hand according to assignment (only if validation passed)
- [x] 2.4 Handle diamond updates: deduct diamonds from cost if fixed-sum costs use them
- [x] 2.5 Ensure atomicity: return original state unchanged on failure (null), or fully consumed state on success
- [x] 2.6 Add internal logging (console.log with descriptive messages) for debugging

## 3. Implement Prioritization Strategy

- [x] 3.1 Update `findCostAssignment()` to process cost components in priority order: fixed-sum (`number`) type first, then others in declaration order
- [x] 3.2 When generating subsets for assignment, ensure fixed-sum components attempt assignment before non-fixed types
- [x] 3.3 Add comments explaining prioritization logic and why fixed-sum costs get priority
- [x] 3.4 Verify prioritization doesn't break backtracking correctness (all valid assignments still possible)

## 4. Update activatePortalCard() Move

- [x] 4.1 Refactor `activatePortalCard()` signature: remove `usedCards?: number[]` parameter
- [x] 4.2 Accept selected cards differently: either as a new parameter or via game context (TBD based on boardgame.io conventions)
- [x] 4.3 Replace `validateCostPayment()` + manual card removal with single `consumeCosts()` call
- [x] 4.4 Handle null return from `consumeCosts()`: reject the move if consumption fails
- [x] 4.5 After successful consumption, update player state: `player.hand`, `player.diamonds`
- [x] 4.6 Continue with existing activation logic: grant power points, diamonds from card, check final round

## 5. Write Tests for New Functions

- [ ] 5.1 Add tests for `findCostAssignment()`:
  - [ ] 5.1a Single component assignment (fixed-sum, nTuple, run, etc.)
  - [ ] 5.1b Multiple components with prioritization (fixed-sum first)
  - [ ] 5.1c No valid assignment (return null)
  - [ ] 5.1d Diamond reduction for fixed-sum costs
  - [ ] 5.1e Card reuse prevention (no card in two components)

- [ ] 5.2 Add tests for `consumeCosts()`:
  - [ ] 5.2a Successful consumption: cards removed, hand updated
  - [ ] 5.2b Failed consumption: hand unchanged, return null
  - [ ] 5.2c Diamond updates: correct deduction during cost payment
  - [ ] 5.2d Atomicity: partial failure doesn't modify state
  - [ ] 5.2e Card order preservation: remaining cards maintain relative order

- [ ] 5.3 Add integration tests for updated `activatePortalCard()`:
  - [ ] 5.3a Activate with valid payment: character activated, cards consumed
  - [ ] 5.3b Activate with invalid payment: activation rejected, state unchanged
  - [ ] 5.3c Multi-component costs: assignment prioritizes fixed-sum first

## 6. Verify Backward Compatibility

- [ ] 6.1 Run existing cost validation tests: ensure `validateCostPayment()` still passes
- [ ] 6.2 Run existing game engine tests: ensure no regressions in unrelated moves
- [ ] 6.3 Verify UI code doesn't break (game-web should handle move signature change gracefully)
- [ ] 6.4 Test all cost types: number, nTuple, run, sumTuple, sumAnyTuple, evenTuple, oddTuple, diamond, tripleChoice

## 7. Documentation & Export

- [x] 7.1 Export `findCostAssignment()` from `shared/src/game/index.ts` (make it public API)
- [x] 7.2 Export `consumeCosts()` from `shared/src/game/index.ts` (make it public API)
- [ ] 7.3 Add JSDoc comments to both new functions explaining signature, behavior, and examples
- [ ] 7.4 Update existing JSDoc for `validateCostPayment()` if its internal behavior changed
- [ ] 7.5 Document prioritization strategy in a code comment or README section

## 8. Final Verification

- [x] 8.1 Build the project: `cd shared && npm run build`
- [ ] 8.2 Run all tests: `cd shared && npm test` (ensure all pass, no regressions)
- [ ] 8.3 Manual smoke test: can a player still activate a character in game-web?
- [ ] 8.4 Code review: check for any missed edge cases (complex cost combinations, large hand sizes, etc.)
