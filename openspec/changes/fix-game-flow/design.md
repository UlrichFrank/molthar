## Context

The current CanvasGameBoard uses a selection-based model:
- Click card → set `selectedPearl`, `selectedCharacter`, or `selectedHandIndices` in component state
- Player clicks a button → dispatch move with selected indices
- Problems: disconnect between click and action, pending selections not reflected in game state, violates 3-action rule

The game engine (`shared/src/game/index.ts`) already implements correct moves:
- `takePearlCard(slotIndex: number)` - 1 action, takes pearl to hand
- `takeCharacterCard(slotIndex: number, replacedSlotIndex?: number)` - 1 action, takes character to portal
- `activatePortalCard(portalSlotIndex: number, usedCards?: number[])` - 1 action + portal activation

Current state:
- Game state tracks `actionCount` (0-3 per turn)
- Dialogs exist for replacement and activation (implemented in connect-legacy-dialog-components)
- Hit test system correctly identifies click targets

## Goals / Non-Goals

**Goals:**
- Implement direct-take-on-click: every card click immediately dispatches a move
- Remove selection state: no pending clicks, no UI selection highlighting
- Honor action limit: clicks blocked when `actionCount >= 3`
- Preserve dialog flows: replacement dialog on portal-full, activation dialog on portal-click
- Game state fidelity: UI reflects true game state always (no ghost selections)

**Non-Goals:**
- Change game engine moves or rules
- Modify game state schema
- Add new game mechanics beyond direct taking
- Refactor hit test system (reuse existing)
- Change card layout or rendering

## Decisions

### Decision 1: Remove Selection State Model
**Chosen: Delete selectedPearl, selectedCharacter, selectedHandIndices**
- Rationale: Selection model caused the problem - clicks should be immediate, not pending
- Alternatives: Keep selection but auto-execute on select (less clean), show selection with count-down (confusing)
- Impact: Simplifies component significantly, removes 50+ lines of selection logic

### Decision 2: Click → Move Dispatch Pipeline
**Chosen: onPointerDown → hitTest → validate action count → dispatch move directly**

Pipeline:
```
onPointerDown (canvas click)
  ↓ toModelCoords(clientX, clientY)
  ↓ hitTest(x, y) → HitTarget
  ↓ Validate: actionCount < 3?
  ↓ Dispatch move immediately:
    - auslage-card (0-1) → takePearlCard(id)
    - auslage-card (2-3) → takeCharacterCard(id) 
      [check portal full → show dialog]
    - portal-slot → openActivationDialog()
```

- Rationale: Matches game loop: user action → move dispatch → state update
- Alternatives: Queue actions (unnecessary complexity), batch updates (breaks responsiveness)

### Decision 3: Portal Full Detection at Click Time
**Chosen: Before takeCharacterCard move, check player.portal.length >= 2**

```javascript
if (me && me.portal.length >= 2) {
  // Show replacement dialog, user selects replacement slot
  // On select: takeCharacterCard(slotIndex, replacedSlotIndex)
} else {
  // Portal not full, take directly
  takeCharacterCard(slotIndex)
}
```

- Rationale: Dialog appears immediately, UX is clean (no failed moves)
- Alternatives: Let move fail, show error (bad UX), delay dialog (confusing)

### Decision 4: Action Count Display
**Chosen: Show prominent action counter on game board**

Display format: `Actions: 2/3` with visual bar/badge
- Click disables cards when count >= 3
- Visual feedback on click (counter increments)

- Rationale: Players need clear feedback on remaining actions
- Alternatives: Hide count, let move failure indicate limit (bad UX)

### Decision 5: Portal Activation Flow (Unchanged)
**Chosen: Portal slot click → CharacterActivationDialog (no direct action)**

Activation is separate from taking:
- Taking card: single click → immediate → action consumed
- Activating card: single click → dialog → select cards → activate → action consumed

- Rationale: Activation has multi-step UI (cost selection), dialog already handles this well
- Alternatives: Activate on slot click without dialog (loses cost validation UI)

## Risks / Trade-offs

**[Risk: Rapid Clicks] → [Mitigation: Action count prevents over-clicking]**
- Player clicks 4 times, only 3 actions consume cards
- Mitigation: Hit test disables targets when actionCount >= 3, UI visual feedback

**[Risk: Dialog + Click Race Condition] → [Mitigation: Dialog takes focus, no clicks accepted while open]**
- User clicks twice: once on card, once while replacement dialog open
- Mitigation: DialogContext modal overlay has pointer-events: all, prevents board clicks

**[Risk: Portal-full Click Confusion] → [Mitigation: Dialog appears immediately]**
- Player expects card to be taken, dialog appears instead
- Mitigation: Dialog title makes intent clear ("Replace Portal Card"), no ambiguity

**[Risk: Performance Jank on Rapid Clicks] → [Mitigation: Click handler is simple, <1ms]**
- Hit test + move dispatch must be fast
- Mitigation: Hit test is optimized (single function), move dispatch is synchronous, no animation delays

**[Trade-off: No Selection Feedback] → [Acceptance: Game state is immediate feedback]**
- Players can't preview what they'll take (old model highlighted card)
- Acceptance: Immediate card disappearance IS the feedback (card is taken)

## Migration Plan

**Phase 1: Refactor Click Handlers**
1. Remove selection state (selectedPearl, selectedCharacter, selectedHandIndices)
2. Remove selection rendering code
3. Implement new click handler: hitTest → validate → dispatch move

**Phase 2: Add Action Count Validation**
1. Add check: `if (actionCount >= 3) return` at start of click handler
2. Add visual action counter display

**Phase 3: Test and Verify**
1. Manual game flow test - verify cards taken immediately
2. Verify dialog flows (replacement, activation)
3. Verify action limit enforcement

**Rollback Strategy:**
If major issues found:
- Revert CanvasGameBoard changes
- Keep DialogContext integration (separate change, already working)
- Return to selection-based model temporarily

## Open Questions

1. **Should action counter show during dialog?** 
   - Proposed: Yes, semi-transparent to indicate it's pending completion

2. **Should there be a "Confirm Take" button for safety?**
   - Proposed: No - immediate taking matches game rules and feels responsive

3. **Should keyboard shortcuts work?** (e.g., number keys 1-4 for auslage)
   - Proposed: Future enhancement, not in this change

4. **What happens if move fails validation?** (e.g., hand is full)
   - Proposed: Game engine returns without error; silently fails (game rules prevent this)
