## Context

We have a cost validation system (`validateCostPayment()` in `costCalculation.ts`) that validates whether a player's pearl card hand can pay for a character card's activation cost. The system supports 7 different cost types (number, nTuple, run, sumTuple, sumAnyTuple, evenTuple, oddTuple) and applies diamond modifiers.

Currently, we have 31 unit tests in `costCalculation.test.ts` that test the cost validation logic with synthetic/manually-crafted test data. However, we have no end-to-end tests that verify the cost system works correctly with the **actual 45 character cards from cards.json** (loaded via `cardDatabase.ts`).

**Current State:**
- 45 character cards in cards.json with real cost specifications
- Cost validation system fully implemented and unit-tested
- No validation that real cards work with the cost system
- Risk: Card data could be malformed or incompatible with cost validation

**Goal:** Add comprehensive test coverage for all real character cards.

## Goals / Non-Goals

**Goals:**
- Verify that `validateCostPayment()` works correctly with all 45 real character cards
- Create automated positive and negative tests for each card (90 test cases)
- Ensure no cards have malformed cost data that would break validation
- Validate that all 7 cost types are represented and working in real cards
- Tests should be maintainable and auto-generate from card database (no manual test data)

**Non-Goals:**
- Do NOT modify the cost validation logic itself (already tested separately)
- Do NOT change cardDatabase.ts or card data
- Do NOT implement special ability tests (focus only on cost validation)
- Do NOT create performance tests
- Do NOT test networked/multiplayer cost validation

## Decisions

### Decision 1: Auto-generate test cases from card database
**Approach:** Write a test file that programmatically iterates through all cards from `cardDatabase.getAllCards()` and generates test cases dynamically, rather than manually writing 90 separate test cases.

**Rationale:**
- Ensures tests match real card data exactly (no manual sync needed)
- Scales automatically if cards.json is updated
- Reduces boilerplate code
- Easy to spot cards with unusual/problematic costs

**Alternatives Considered:**
- Manual test cases: Would need to be updated every time cards.json changes (high maintenance)
- Generated snapshot tests: Overkill for this use case, harder to understand failures

### Decision 2: One positive test per card, one negative test per card
**Approach:** For each card, create two test cases:
- **Positive:** Generate a valid hand that exactly satisfies the cost, verify `validateCostPayment()` returns `true`
- **Negative:** Generate a hand with insufficient value/structure, verify `validateCostPayment()` returns `false`

**Rationale:**
- Validates both happy path and error path
- Simple and clear intent
- Good coverage without overwhelming test output

**Alternatives Considered:**
- Multiple positive/negative cases per card: Would create 200+ tests, harder to debug failures
- Only positive tests: Wouldn't verify rejection logic works

### Decision 3: Separate test file for card tests
**Approach:** Create new test file `shared/src/game/costPayment-cardDatabase.test.ts` instead of adding to existing `costCalculation.test.ts`.

**Rationale:**
- Separates unit tests (logic) from integration tests (real data)
- Easier to run and profile independently
- Clearer structure: what to test vs. how it works
- Can be skipped during rapid dev if needed

**Alternatives Considered:**
- Add to existing test file: Would mix unit and integration tests, harder to understand
- Create in game-web: Cost validation is shared code, belongs in shared package

### Decision 4: Hand generation strategy
**Approach:** For each card cost:
- **Positive case:** Generate minimum valid hand by iterating cost components and satisfying each one
- **Negative case:** Generate hand with slightly less than needed (value-1 or missing one card)

**Rationale:**
- Deterministic and reproducible
- Verifies exact cost boundaries
- Clear what the test is checking

## Risks / Trade-offs

**[Risk]** Some cost types may be rare/uncommon in cards.json
→ **Mitigation:** Test will highlight any cost types that aren't used, good for data validation

**[Risk]** Hand generation logic may not handle complex multi-component costs perfectly
→ **Mitigation:** Start with simple generation, expand if needed; document any assumptions

**[Risk]** Test count could exceed vitest limits if cards.json grows
→ **Mitigation:** Unlikely with 45 cards (90 tests). If needed, can batch into describe blocks.

**[Risk]** Cards.json is in game-web, but tests are in shared
→ **Mitigation:** cardDatabase.ts copies card data to shared package; tests use cardDatabase.ts as source

## Trade-offs

**Simplicity vs. Coverage:** One pos/neg test per card is simpler than comprehensive coverage of all cost combinations, but validates the most important paths (happy path + basic failure).

**Maintainability vs. Detail:** Auto-generated tests are simpler to maintain but provide less control over specific test cases if edge cases emerge.
