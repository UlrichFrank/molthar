## Why

The current cost validation system only checks whether a player **can afford** a character card (true/false binary check). It provides no way to actually **consume the cards** used to pay costs. The UI must manually track which cards the player selected, while the engine performs no automatic assignment of cards to cost components. This creates friction: validation and payment are disconnected, and the system has no awareness of "which cards paid for which component."

We need to refactor the cost calculation to be a **three-phase process**: (1) player selects cards, (2) system validates and auto-assigns cards to components with smart prioritization, (3) system consumes/removes the selected cards. This enables cleaner UI/engine separation and correct card accounting.

## What Changes

- **New `findCostAssignment()` function**: Extracts the internal backtracking logic from validation and makes it public. Returns which cards satisfy which cost component (`Map<componentIndex, cardIndices[]>`).
- **New `consumeCosts()` function**: Takes player-selected cards, validates them, auto-assigns to components (prioritizing fixed costs), then removes cards from hand. Returns new player state or null if assignment fails.
- **Prioritization strategy**: Fixed-sum cost components get priority when assigning cards (filled first), ensuring simpler, more predictable card consumption.
- **Updated `activatePortalCard()` move**: Replaces manual `usedCards[]` parameter with automatic consumption via `consumeCosts()`. Player selects cards; the move handles assignment and removal.
- **Validation remains separate**: `validateCostPayment()` continues to work for read-only checks (UI validation before card selection). No behavior change needed.

## Capabilities

### New Capabilities
- `cost-component-assignment`: Auto-assign player-selected cards to cost components with prioritization (fixed costs first). Returns which cards satisfy which component.
- `cost-consumption`: Consume (remove) cards from player hand based on validated assignment. Handles diamond updates. Phase 3 of cost payment: execute after validation.

### Modified Capabilities
- `activation`: The character card activation move now uses automatic cost consumption instead of manual card tracking. Player selection + engine assignment + automatic removal.

## Impact

**Affected Code:**
- `shared/src/game/costCalculation.ts`: Add `findCostAssignment()`, `consumeCosts()`, refactor internal logic
- `shared/src/game/index.ts`: Update `activatePortalCard()` move to use `consumeCosts()`
- `game-web/src/`: Card selection UI must adapt (no longer manually build `usedCards[]`; instead pass selected cards to `consumeCosts()`)

**Breaking Changes:**
- **BREAKING**: `activatePortalCard()` move signature changes: `usedCards?: number[]` is removed. Caller passes selected card indices; engine handles assignment.
- `validateCostPayment()` remains unchanged (backwards compatible for validation-only use).

**Testing:**
- Existing cost validation tests remain valid
- New tests for `findCostAssignment()` and `consumeCosts()`
- Integration tests for updated `activatePortalCard()`
