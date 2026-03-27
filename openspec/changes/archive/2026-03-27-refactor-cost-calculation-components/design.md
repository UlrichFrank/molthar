## Context

The current cost validation in `shared/src/game/costCalculation.ts` uses a private `tryAssignCardsToComponents()` function with recursive backtracking to determine if a player can satisfy all cost components given their hand and diamonds. However:

- The assignment logic is hidden (private); callers get only a boolean result
- Card removal is manual: the move (`activatePortalCard`) receives a hardcoded `usedCards[]` array from the UI
- No structured "consumption" phase: cards aren't automatically removed based on the assignment
- The UI must understand the internal validation logic to build correct `usedCards[]` arrays

This creates tight coupling: UI and engine must coordinate card indices without a clean contract.

## Goals / Non-Goals

**Goals:**
- Extract the internal assignment logic as a public, reusable function that returns which cards satisfy which components
- Create a consumption phase that automatically removes cards based on the assignment
- Implement prioritization: fixed-sum costs get priority (assigned first to preferred cards)
- Decouple UI from engine: the move validates and consumes automatically; UI just needs to provide selected card indices
- Maintain backward compatibility: `validateCostPayment()` continues to work for validation-only checks

**Non-Goals:**
- Change the cost types or component structure (still `'number'`, `'nTuple'`, `'run'`, etc.)
- Implement UI changes in this task (that's a separate work item)
- Auto-select cards for the player (selection remains manual; assignment is automatic)
- Optimize performance (correctness first)

## Decisions

### Decision 1: Two-Phase Cost Payment (Validation → Consumption)

**Chosen:** Validation and consumption are separate phases. `validateCostPayment()` checks feasibility; `consumeCosts()` executes the removal.

**Rationale:**
- Allows the UI to validate before committing (read-only check)
- Ensures atomicity: cards are only removed if full assignment is possible
- Matches player mental model: "check → select → pay"

**Alternatives Considered:**
- Single-phase payment (validate + consume in one call): Would require re-implementing assignment twice or passing mutable state. Rejected for clarity.

### Decision 2: Prioritization Strategy - Fixed Costs First

**Chosen:** When assigning cards to components, fixed-sum cost components (`type: 'number'`) are assigned first (highest priority). Other cost types follow.

**Rationale:**
- Fixed costs are the most common and predictable
- Assigning them first leaves "exotic" card combinations available for tuple/run costs
- Matches player intuition: "pay the sum, then use what's left for pairs/runs"

**Alternatives Considered:**
- Random assignment: Would be unpredictable for players. Rejected.
- Greedy (use lowest-value cards first): Reasonable but less intuitive; fixed costs first is clearer.

### Decision 3: Auto-Assign, Manual Select

**Chosen:** Player manually selects cards (UI layer); engine auto-assigns selected cards to components (with prioritization). No auto-selection of cards.

**Rationale:**
- Player agency: they choose which cards to use
- Engine responsibility: figures out "which cards pay for what"
- Avoids surprises: player always sees their selected cards being used, not a hidden subset

**Alternatives Considered:**
- Full auto-selection: Would remove player agency. Rejected.
- Manual assignment in UI: Would expose internal cost component structure to UI. Rejected.

### Decision 4: Return Type: State Only, Logging Internal

**Chosen:** `consumeCosts()` returns `{ hand: PearlCard[], diamonds: number } | null`. Logging is internal (console), not part of the API.

**Rationale:**
- Clean API contract: input cards + costs → output state
- Logging for debugging; state for gameplay
- UI can request detailed logs via a separate utility if needed

**Alternatives Considered:**
- Return full assignment details in API: Would couple UI to internal structure. Rejected.

### Decision 5: Extract Public `findCostAssignment()`

**Chosen:** Refactor `tryAssignCardsToComponents()` to be public (renamed `findCostAssignment()`), return assignment details, and use it in both `validateCostPayment()` and `consumeCosts()`.

**Rationale:**
- DRY: single source of truth for assignment logic
- Testable: can test assignment independently
- Reusable: future features (e.g., "what cards do I need?") can use it

**Alternatives Considered:**
- Keep assignment logic private, duplicate it for validation + consumption: Would be error-prone. Rejected.

## Risks / Trade-offs

**[Risk] Prioritization may not match player preferences in niche cases**
→ *Mitigation*: Fixed-cost-first is a reasonable default. If needed, future versions can add a prioritization parameter. For now, we document the strategy clearly.

**[Risk] `findCostAssignment()` has exponential worst-case time complexity (2^n subsets)**
→ *Mitigation*: Limited by practical hand size (max ~5-10 cards). Not a bottleneck in practice. Document the complexity in the function.

**[Risk] Breaking change to `activatePortalCard()` move signature**
→ *Mitigation*: This change is localized to the move definition. Clients (game-web) will need a corresponding UI update, but that's planned separately.

**[Trade-off] Auto-assignment adds ~20-30 lines of new code**
→ *Benefit*: Cleaner, more maintainable move logic. Worth the cost.

## Migration Plan

1. **Phase 1 (Engine):** Implement `findCostAssignment()` and `consumeCosts()` in costCalculation.ts. Keep `validateCostPayment()` unchanged.
2. **Phase 2 (Move):** Update `activatePortalCard()` to call `consumeCosts()`. Remove `usedCards[]` parameter.
3. **Phase 3 (Tests):** Add tests for new functions. Verify backward compatibility.
4. **Phase 4 (UI, separate task):** Update game-web card selection UI to pass selected cards directly to the move.

## Open Questions

- Should `findCostAssignment()` be exported in the public API (`shared/src/game/index.ts`), or keep it internal to costCalculation.ts? 
  - *Recommendation*: Export it; it's useful for UI validation ("which cards would I need?") and testing.
- If a player selects fewer cards than needed, should `consumeCosts()` throw an error or silently fail (return null)?
  - *Recommendation*: Silently fail (return null). The move can then reject the action gracefully.
