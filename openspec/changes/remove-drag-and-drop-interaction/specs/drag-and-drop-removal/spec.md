## REMOVED Requirements

### Requirement: Drag-and-drop card selection
The drag-and-drop interaction system for selecting cards from the face-up display is removed.

**Reason:** Drag-and-drop interaction is unintuitive, difficult to discover, and conflicts with the new hover + click button-based system. Click-based selection via interactive card buttons is clearer and more accessible.

**Migration:** Replace all card selection with the interactive card button system:
1. Hover over a card to see it elevate (visual preview)
2. Click the card to select/take it
3. No dragging required

### Requirement: Drag visual feedback (preview)
The semi-transparent card preview that appeared during drag operations is removed.

**Reason:** Drag-and-drop is no longer supported. Visual feedback is now provided by the hover elevation effect and click-based selection outline.

**Migration:** The new interactive card button system provides:
- **Hover feedback:** Card elevation + shadow (CSS-based, automatic on pointer enter)
- **Selection feedback:** Selection outline or glow (CSS-based, applied on click)
- No intermediate "dragging" state needed

### Requirement: DragState type and state management
The `DragState` interface, `drag` state variable, and all drag-related state mutations are removed from `CanvasGameBoard`.

**Reason:** Drag state is not needed for the new interaction model. Removing it simplifies component state and prevents confusion.

**Migration:** All card selection state is now managed by the game logic layer (via game actions). The interactive card button system dispatches click events; the game engine processes selection.

### Requirement: Mouse drag event handlers
The `onMouseDown`, `onMouseMove`, and `onMouseUp` event handlers that implement drag detection and tracking are removed.

**Reason:** Drag events are no longer needed. Click selection is handled by the interactive card button system (separate HTML overlay component).

**Migration:** The interactive card button system provides its own event handlers (pointer events). Canvas can maintain click handlers for other interactions (non-card areas) if needed.
