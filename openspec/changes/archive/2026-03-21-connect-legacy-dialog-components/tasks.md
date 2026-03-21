# Task Checklist: Connect Legacy Dialog Components

## 1. Analysis & Understanding

- [x] 1.1 Map all game moves that need dialog triggers (takeCharacterCard, activatePortalCard)
- [x] 1.2 Document game state transitions that require dialogs
- [x] 1.3 Review boardgame.io event system documentation
- [x] 1.4 Understand current CanvasGameBoard component structure
- [x] 1.5 Create dialog integration flowchart

## 2. Setup Dialog State Management

- [x] 2.1 Decide: game state vs component context for activeDialog
- [x] 2.2 Define DialogType enum (none, replacement, activation)
- [x] 2.3 Add dialog context to component (create DialogProvider if needed)
- [x] 2.4 Create helper functions to open/close dialogs
- [x] 2.5 Verify state updates don't break game flow

## 3. Wire CharacterReplacementDialog

- [x] 3.1 Detect portal full condition in takeCharacterCard move
- [x] 3.2 Add logic to trigger replacement dialog
- [x] 3.3 Pass character/portal data to dialog via props
- [x] 3.4 Implement onSelect callback (calls takeCharacterCard with replacedSlotIndex)
- [x] 3.5 Implement onCancel callback (dismisses dialog without action)
- [ ] 3.6 Test: Player can take character with full portal and see replacement dialog
- [ ] 3.7 Test: Player can select replacement or cancel

## 4. Wire CharacterActivationDialog

- [x] 4.1 Modify CanvasGameBoard to render activation trigger (button? click?)
- [x] 4.2 Detect portal slot click in card selection logic
- [x] 4.3 Add logic to trigger activation dialog when slot clicked
- [x] 4.4 Pass character, hand, diamonds data to dialog
- [x] 4.5 Implement onActivate callback (validates cost and calls activatePortalCard)
- [x] 4.6 Implement onCancel callback (dismisses without activating)
- [ ] 4.7 Test: Player can activate character with cost validation
- [ ] 4.8 Test: Invalid cost combinations are prevented

## 5. Integrate OpponentPortals Component

- [x] 5.1 Extract OpponentPortals.tsx rendering logic
- [x] 5.2 Integrate into CanvasGameBoard layout (not modal, but persistent display)
- [x] 5.3 Pass all players and character data to OpponentPortals
- [x] 5.4 Display portal slots for all opponents
- [x] 5.5 Show power points for all opponents
- [x] 5.6 Update when game state changes
- [ ] 5.7 Test: OpponentPortals shows current game progress

## 6. Dialog Styling & Visual Integration

- [x] 6.1 Review dialog CSS modules for canvas compatibility
- [x] 6.2 Test z-index layering (dialogs above canvas, below everything else)
- [x] 6.3 Verify modal overlay doesn't interfere with canvas rendering
- [x] 6.4 Test dialog positioning on different screen sizes
- [x] 6.5 Ensure dialogs are responsive and mobile-friendly

## 7. State & Event Handling

- [x] 7.1 Ensure dialog state doesn't persist between games
- [x] 7.2 Handle player switching (hide dialog for non-active player)
- [x] 7.3 Prevent board interaction while dialog open
- [x] 7.4 Test rapid opens/closes of dialogs
- [x] 7.5 Verify no race conditions in move dispatch

## 8. TypeScript & Type Safety

- [x] 8.1 Ensure dialog props types match gameState types
- [x] 8.2 Create proper types for DialogContext
- [x] 8.3 Verify no `any` types in dialog code
- [x] 8.4 Run TypeScript strict mode check
- [x] 8.5 Fix any type errors

## 9. Testing: Unit Tests

- [ ] 9.1 Create tests for dialog trigger conditions
- [ ] 9.2 Test dialog state management (open/close)
- [ ] 9.3 Test callback functions are called correctly
- [ ] 9.4 Test cost validation logic in dialog
- [ ] 9.5 Run full test suite

## 10. Testing: Integration Tests

- [ ] 10.1 Test full turn flow with dialog interactions
- [ ] 10.2 Test multi-player game with dialogs
- [ ] 10.3 Test character taking with full portal
- [ ] 10.4 Test character activation with various costs
- [ ] 10.5 Test cancellation paths

## 11. Testing: Manual Game Flow

- [ ] 11.1 Play complete game focusing on dialog interactions
- [ ] 11.2 Test character replacement (full portal)
- [ ] 11.3 Test character activation (cost payment)
- [ ] 11.4 Test dialog cancellation
- [ ] 11.5 Test on desktop browsers (Chrome, Firefox, Safari)
- [ ] 11.6 Test on mobile/tablet devices
- [ ] 11.7 Verify OpponentPortals show correct info

## 12. Edge Cases & Error Handling

- [ ] 12.1 Test taking last available character slot
- [ ] 12.2 Test activating with exact cost match
- [ ] 12.3 Test activating with diamonds modifier
- [ ] 12.4 Test invalid cost combinations (should not allow activation)
- [ ] 12.5 Test dialog behavior with <2 players
- [ ] 12.6 Test dialog behavior with >4 players

## 13. Performance Verification

- [ ] 13.1 Profile dialog rendering (no jank)
- [ ] 13.2 Check memory usage (no leaks on repeated opens)
- [ ] 13.3 Test on low-end mobile devices
- [ ] 13.4 Verify canvas rendering not impacted by dialogs
- [ ] 13.5 Measure FPS during dialog interactions

## 14. Documentation & Comments

- [ ] 14.1 Add code comments explaining dialog state management
- [ ] 14.2 Document dialog trigger conditions in README
- [ ] 14.3 Create component documentation for dialogs
- [ ] 14.4 Document gameState modifications for dialogs
- [ ] 14.5 Add architecture diagram showing dialog flow

## 15. Code Review & Quality

- [ ] 15.1 Self-review all code changes
- [ ] 15.2 Verify code style matches project conventions
- [ ] 15.3 Check for console errors/warnings
- [ ] 15.4 Verify no circular dependencies
- [ ] 15.5 Ensure proper error handling

## 16. Final Verification

- [ ] 16.1 Full build succeeds (no TypeScript errors)
- [ ] 16.2 All tests pass
- [ ] 16.3 Manual smoke test (play one full game)
- [ ] 16.4 Production build created successfully
- [ ] 16.5 No bundle size regression
