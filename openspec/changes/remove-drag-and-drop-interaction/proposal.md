## Why

The game has two overlapping card interaction systems: the legacy drag-and-drop (on canvas) and the new interactive card button system (hover + click). Drag-and-drop is unintuitive, difficult to discover, and conflicts with the new button-based approach. Removing it simplifies the interaction model and aligns all card selection on a single, discoverable mechanism.

## What Changes

- **Removed:** `DragState` and related drag-and-drop logic from `CanvasGameBoard.tsx`
- **Removed:** Mouse drag event handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`)
- **Removed:** Drag threshold calculation and drag feedback rendering (semi-transparent card preview during drag)
- **Removed:** Drag state variables and state management
- **Removed:** Drag-related comments and documentation references
- **Modified:** Game action dispatch logic to work exclusively with click-based selection (from interactive card buttons)
- **Impact:** No game logic changes—only interaction simplification. Replaces drag with the new hover + click mechanism.

## Capabilities

### New Capabilities
- `drag-and-drop-removal`: Removal of drag-and-drop interaction system and consolidation to button-based card selection

### Modified Capabilities
<!-- None—this is a pure removal, not a requirement change to existing features -->

## Impact

**Code affected:**
- `game-web/src/components/CanvasGameBoard.tsx` (primary change: remove drag handlers, state, rendering)
- `game-web/src/lib/gameHitTest.ts` (if hit-test logic has drag-specific code, review)
- `game-web/src/types/` (remove any drag-specific types if they exist)

**User-facing changes:**
- Card selection now only via hover + click (no more dragging cards)
- Visual feedback clearer: elevation on hover, selection outline on click
- Interaction model unified with other button-based UI elements

**No breaking changes to:**
- Game engine or logic
- Game state structure
- API contracts
- Network communication

**Dependencies:**
- Depends on `interactive-card-buttons` change being implemented (provides the replacement hover + click system)
