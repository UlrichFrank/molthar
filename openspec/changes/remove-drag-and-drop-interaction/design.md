## Context

Currently, `CanvasGameBoard.tsx` implements drag-and-drop for card selection—users click and drag a card to select it. The code includes:
- `DragState` interface tracking drag position and dragged object
- Mouse event handlers for `onMouseDown`, `onMouseMove`, `onMouseUp`
- Drag threshold (30px) to distinguish clicks from accidental drags
- Canvas rendering of a semi-transparent preview card during drag
- Drag state variables managed in component state

The new interactive card button system (`interactive-card-buttons` change) introduces hover + click as the primary interaction: hover to preview/elevate the card, click to select. This replaces the need for dragging entirely.

## Goals / Non-Goals

**Goals:**
- Remove all drag-and-drop event handlers and state management from `CanvasGameBoard`
- Eliminate drag-related rendering logic (drag feedback preview)
- Clean up drag-specific type definitions
- Ensure click-based selection (from interactive card buttons) is the only card selection mechanism
- Maintain 100% backward compatibility with game logic (no game state changes)
- Ensure no visual artifacts or rendering issues after removal

**Non-Goals:**
- Modify game engine or game logic
- Change card data structures
- Modify networking or multiplayer code
- Add new features beyond removal
- Refactor unrelated canvas rendering code

## Decisions

### Decision 1: Remove entire DragState interface and related state
- **Choice:** Delete `DragState`, `drag` state variable, and all drag-related state mutations
- **Rationale:** Drag-and-drop is no longer used; keeping the code adds maintenance burden and confusion. Clean removal is clearer than deprecation.
- **Alternatives:** Mark as deprecated, keep code but comment out (rejected: adds clutter, developers may accidentally use it)

### Decision 2: Remove mouse drag event handlers entirely
- **Choice:** Delete `onMouseDown`, `onMouseMove`, `onMouseUp` handlers that implement drag logic
- **Rationale:** Drag events are not needed after removal; click events will be handled by the interactive card button system (separate overlay)
- **Alternatives:** Keep handlers but do nothing (rejected: confusing dead code)

### Decision 3: Remove drag feedback rendering from canvas
- **Choice:** Delete the code that draws semi-transparent card preview during drag in the canvas draw loop
- **Rationale:** No drag interaction = no need for drag feedback. New system provides visual feedback via CSS (hover elevation, selection outline)
- **Alternatives:** Keep rendering code disabled (rejected: dead code, hard to test)

### Decision 4: Leave hit-test logic unchanged
- **Choice:** Do NOT modify `gameHitTest.ts` hit-test detection for cards
- **Rationale:** Hit-test is still used for determining which card is under the pointer (for hover effects). Only drag-specific logic is removed.
- **Alternatives:** Refactor hit-test (rejected: unnecessary, hit-test is still valuable for other interactions)

### Decision 5: Keep click event handling in canvas (or transition to overlay)
- **Choice:** If click handlers remain in `CanvasGameBoard`, adapt them to NOT use drag state. If interactive card button system uses HTML overlay, ensure canvas click handlers don't conflict.
- **Rationale:** Canvas may still need to handle clicks for other interactions (board areas, buttons). Drag removal doesn't affect this.
- **Alternatives:** Remove all canvas click handlers (rejected: may break other functionality)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Incomplete removal:** Drag code scattered across multiple files or referenced elsewhere** | Review entire codebase with grep for "drag" and "DragState" before removal. Check for any exports or imports. |
| **Game logic accidentally depends on drag state** | Run full game test suite after removal. Verify game engine does not reference drag-related code. |
| **Visual regression:** Missing drag feedback, but replacement system (hover + click) not yet implemented** | Implement `interactive-card-buttons` change BEFORE or simultaneously with this change. Ensure visual feedback exists in new system. |
| **Canvas rendering bug after drag code removal** | Test canvas rendering on multiple devices and browsers. Verify no artifacts, flickering, or performance issues. |
| **Developer confusion:** Other developers unaware drag-and-drop is removed** | Document removal in code comments. Update README or integration guide. Add note in design system docs. |

## Migration Plan

**Phase 1: Verification (Pre-removal)**
- Search codebase for all drag-related code and references
- Identify all files that import/use drag types or handlers
- Review game engine for any drag-specific logic

**Phase 2: Code Removal**
- Remove `DragState` interface definition
- Remove `drag` state variable and initialization
- Remove all drag event handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`)
- Remove drag rendering logic from canvas draw loop
- Remove drag-related imports and type definitions

**Phase 3: Testing & Validation**
- Run full game test suite (ensure no logic breakage)
- Test canvas rendering on desktop and mobile
- Test click-based card selection (via new interactive button system)
- Verify no console errors or warnings

**Phase 4: Documentation & Cleanup**
- Remove drag-related comments from code
- Update component documentation if it mentions drag-and-drop
- Add note in CHANGELOG or release notes
- Clean up any dead imports

## Open Questions

1. **Timing:** Should `interactive-card-buttons` be implemented first, or simultaneously? (Recommendation: Simultaneous to avoid period without card selection)
2. **Canvas click handlers:** Are there existing canvas click handlers that depend on drag state indirectly? (Action: Review `CanvasGameBoard` click handler logic)
3. **Mobile users:** Will touch support in the new button system be ready before or after drag removal? (Action: Ensure `touch-card-interaction` spec is completed)
