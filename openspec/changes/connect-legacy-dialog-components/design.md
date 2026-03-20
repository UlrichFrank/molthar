## Context

The game board currently uses CanvasGameBoard for primary rendering, but certain game interactions require detailed multi-step dialogs that are better handled by React components than canvas overlays. Four legacy dialog components exist for these purposes:

- **OpponentPortals.tsx**: Display opponent portal areas (which characters they have placed)
- **CharacterReplacementDialog.tsx**: Choose which portal character to replace when taking new character with full portal
- **CharacterActivationDialog.tsx**: Choose which character to activate and select cards to pay cost
- **CostPaymentDialog.tsx**: Detailed cost payment UI (reused by CharacterActivationDialog)

These components are **not obsolete**—they're **disconnected**. They need to be integrated into the game state management and wired to the appropriate game moves.

## Dialog Integration Flow

### When Each Dialog Should Appear

**1. CharacterReplacementDialog**
- **Trigger**: Player clicks to take a character, but their portal is full (2 slots occupied)
- **Flow**:
  - Player sees: "Your portal is full. Which character do you want to replace?"
  - Player selects which portal slot character to replace
  - Move `takeCharacterCard(slotIndex, replacedSlotIndex)` is called
  - Dialog closes
- **Game State Requirement**: Modal overlay with conditional rendering

**2. CharacterActivationDialog** 
- **Trigger**: Player clicks to activate a character in their portal
- **Flow**:
  - Player sees: Dialog showing character details and their hand
  - Player selects cards from hand to pay the character's cost (or uses diamonds)
  - If cost is valid, "Activate" button is enabled
  - Player clicks "Activate"
  - Move `activatePortalCard(portalSlotIndex, usedCardIndices)` is called
  - Dialog closes, cards are consumed from hand
- **Game State Requirement**: Complex cost validation UI

**3. CostPaymentDialog**
- **Trigger**: Can be used standalone OR as part of CharacterActivationDialog
- **Flow**:
  - Shows character, required cost, player's hand
  - Player toggles cards to match cost requirements
  - Validates: cost matches exactly (with diamonds modifier)
  - Returns selected card indices
- **Game State Requirement**: Interactive cost selection component

**4. OpponentPortals**
- **Trigger**: Always visible on game board
- **Flow**:
  - Display all opponent player names, portal slots, power points
  - Show which characters they have activated
  - Show activation status (activated = can't be used again this turn)
- **Game State Requirement**: Read-only display component integrated into board layout

## Design Decisions

**1. Keep Components, Don't Remove Them**
- **Decision**: These components are technologically compatible and provide necessary functionality
- **Rationale**: React dialogs work perfectly with canvas rendering; removing them removes valuable UI functionality
- **Alternative rejected**: Removing them → loses important game flow UX

**2. Wire Through Game State**
- **Decision**: Pass game state to CanvasGameBoard, which conditionally renders dialogs
- **Rationale**: Clean separation; game state controls what dialogs appear
- **Implementation**: Add `activeDialog` field to game state or component context

**3. Event Callbacks to Game Moves**
- **Decision**: Dialog onActivate/onSelect callbacks call moves.takeCharacterCard, moves.activatePortalCard
- **Rationale**: Clean one-way data flow; dialogs trigger game logic, not vice versa
- **Implementation**: Pass move functions as props to dialogs

## Implementation Strategy

### Phase 1: Understand Current State
- Map out all game moves that might trigger dialogs
- Identify current game state transitions
- Understand boardgame.io's event system for dialogs

### Phase 2: Add Dialog State to Game
- Add `activeDialog` / `dialogContext` to game state or component context
- Define dialog types (replacement, activation, cost payment, none)
- Add dialog trigger logic to game moves

### Phase 3: Wire First Dialog - CharacterReplacementDialog
- Detect in takeCharacterCard when portal is full
- Set activeDialog = 'replacement' with context data
- Render CharacterReplacementDialog conditionally in CanvasGameBoard
- Wire onSelect callback to complete takeCharacterCard with replacedSlotIndex
- Test: Take character with full portal

### Phase 4: Wire Second Dialog - CharacterActivationDialog
- Detect in activatePortalCard move
- Set activeDialog = 'activation' with character/cost data
- Render CharacterActivationDialog in CanvasGameBoard
- Wire onActivate callback to validateCostPayment and update hand
- Test: Activate character with cost validation

### Phase 5: Integrate OpponentPortals
- Render OpponentPortals as board element (not modal)
- Display all opponent portal slots and power points
- Update when game state changes
- Test: Show correct opponent progress

### Phase 6: Testing & Polish
- Full game flow testing
- Edge case testing (full portal, invalid costs, etc.)
- Cross-browser/device testing
- Performance verification

## Risks & Mitigations

**[Risk: Dialog State Management Complexity]**
- **Mitigation**: Start with component-level state; evolve to game state if needed

**[Risk: Event Ordering Issues]**
- **Mitigation**: Test boardgame.io's event system; verify order of operations

**[Risk: Dialog Dismissal Without Action]**
- **Mitigation**: Implement cancel handlers; prevent board interaction while dialog open

**[Risk: Styling Conflicts]**
- **Mitigation**: Keep CSS modules isolated; test z-index layering with canvas

## Success Criteria

✅ All dialogs render conditionally based on game state  
✅ Dialog callbacks properly trigger game moves  
✅ Cost validation works correctly  
✅ Character replacement works when portal full  
✅ Opponent portals display current game state  
✅ No TypeScript errors or console warnings  
✅ Full game can be played with all dialog interactions  
✅ No performance degradation from previous implementation

## Open Questions

1. Should `activeDialog` live in game state (shareable to server) or component context (local only)?
   - **Proposed**: Component context for now (dialogs are UI-only, not game-affecting)

2. How do we handle dialog cancellation? Should players be able to cancel?
   - **Proposed**: For replacement: yes, cancel button to not take character. For activation: yes, cancel to keep portal empty.

3. Should OpponentPortals be a separate component or integrated into CanvasGameBoard?
   - **Proposed**: Separate component imported by CanvasGameBoard for cleanliness
