## Context

Currently, card special abilities and cost calculations exist only in `cards.json` (the data layer). The boardgame.io game state (`GameState`) and the `validateCostPayment()` function in `shared/src/game/index.ts` operate independently without structured knowledge of these capabilities.

This creates a gap:
- Card abilities cannot be triggered automatically or validated during gameplay
- Cost validation is done ad-hoc without comprehensive rules
- No centralized tests exist for cost calculation, leading to potential bugs in balance changes
- Diamond modifiers and complex cost types are not properly handled

The game needs a unified cost calculation engine that:
1. Reads cost rules from the loaded card data
2. Validates player has sufficient pearl cards to pay
3. Accounts for all cost types (fixed sum, runs, pairs, tuples, diamonds)
4. Is thoroughly tested to prevent regressions

## Goals / Non-Goals

**Goals:**
- Create a `calculateCost()` function that determines the total cost of a card given its cost definition
- Create a `validateCostPayment()` function that checks if a player can afford a card with their current hand + diamonds
- Implement all cost types: fixed sum, n-tuples, runs, pairs, diamonds, and any others defined in cards.json
- Add comprehensive unit tests covering all cost types, edge cases, and diamond interactions
- Integrate cost validation into the `activatePortalCard` move so invalid payments are rejected
- Ensure card abilities are accessible via the game state (for future ability triggering)

**Non-Goals:**
- Automatic ability triggering (that's a future feature)
- Balancing or changing existing card costs
- Migrating old card data formats
- UI improvements for cost selection (already handled by dialogs)

## Decisions

**Decision 1: Cost calculation as pure function**
- Place cost calculation logic in a standalone utility function `calculateCost(costComponent, hand, diamonds)` 
- Returns `{ required: number, feasible: boolean }`
- Rationale: Easier to test, no side effects, reusable in multiple contexts
- Alternative considered: Embed in GameEngine.processAction() - would make testing harder

**Decision 2: Separate validation from calculation**
- `calculateCost()` returns what's required
- `validateCostPayment()` checks feasibility (new function to replace existing partial logic)
- `activatePortalCard` move calls validation before accepting the action
- Rationale: Cleaner separation of concerns, easier to test each step
- Alternative considered: Combine into one function - less modular

**Decision 3: Test-driven cost types coverage**
- Create tests for each cost type before full implementation
- Test edge cases: 0-cost cards, cards exceeding max possible cost, diamond-only costs
- Test with multiple card combinations to ensure runs and pairs are detected correctly
- Rationale: Cost calculation has many edge cases; TDD catches bugs early
- Alternative considered: Test after implementation - higher regression risk

**Decision 4: Type-safe cost components**
- Use TypeScript interfaces for cost components (already in types.ts as `CostComponent`)
- Extend if needed to support new cost types without breaking existing cards
- Rationale: Prevents silent failures from malformed card data
- Alternative considered: Loosely typed JSON - prone to data validation errors

## Risks / Trade-offs

**Risk**: Complex cost types (runs, pairs) may have multiple valid payment combinations
- **Mitigation**: Implement greedy or backtracking algorithm to find ANY valid combination (not optimal). Tests will verify at least one solution exists.

**Risk**: Diamond modifier logic could interact badly with fixed-sum costs
- **Mitigation**: Test all diamond combinations with each cost type. Clarify rule: diamonds reduce total cost by 1 per diamond (up to cost).

**Risk**: Adding validation to `activatePortalCard` may reject previously-accepted invalid moves
- **Mitigation**: Verify existing game logs don't depend on invalid cost payments. Add tests with real card data from cards.json.

**Risk**: Performance if cost validation is called frequently
- **Mitigation**: Cost calculation is O(n) where n = hand size (~5-8 cards). Acceptable. No caching needed.

## Migration Plan

1. Implement `calculateCost()` utility function with comprehensive tests (sync tests, not in-game)
2. Add new `validateCostPayment()` function alongside existing logic
3. Update `activatePortalCard` move to use new validation before accepting the action
4. Run full game test suite to ensure no regressions
5. No player data migration needed; this is engine logic only

## Open Questions

- Should we support dynamic cost modifiers from character abilities in the future? (e.g., "This turn, cards cost 1 less")
- Do we need to track which cards were used to pay for an activated card? (Current implementation just deducts from hand)
- Should cost validation provide a helpful error message showing what would be needed? (e.g., "Need 2 more diamonds")

