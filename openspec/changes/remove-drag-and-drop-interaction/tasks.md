## 1. Code Analysis & Verification

- [x] 1.1 Search codebase for all drag-related code references
- [x] 1.2 Identify all files that import or use drag-related code
- [x] 1.3 Check if DragState is exported or used in other components
- [x] 1.4 Review CanvasGameBoard.tsx to map all drag-related code blocks
- [x] 1.5 Verify game engine has no drag-specific logic

## 2. Type Definition Removal

- [x] 2.1 Locate and remove DragState interface definition
- [x] 2.2 Remove drag-related type imports/exports
- [x] 2.3 Verify no TypeScript errors after type removal
- [x] 2.4 Check for any other drag-specific types (e.g., DragPoint, DragEvent)

## 3. State Variable Removal

- [x] 3.1 Remove drag state variable initialization from component state
- [x] 3.2 Remove any drag-related useState hooks
- [x] 3.3 Remove drag state reset logic
- [x] 3.4 Verify component state structure is correct

## 4. Event Handler Removal

- [x] 4.1 Remove onMouseDown handler that initiates drag
- [x] 4.2 Remove onMouseMove handler that tracks drag position
- [x] 4.3 Remove onMouseUp handler that completes drag
- [x] 4.4 Remove any drag threshold calculation logic (DRAG_THRESHOLD constant)
- [x] 4.5 Remove event listener attachments for drag events

## 5. Rendering Logic Removal

- [x] 5.1 Locate drag feedback rendering code in canvas draw loop
- [x] 5.2 Remove semi-transparent card preview rendering during drag
- [x] 5.3 Remove any drag position calculations for rendering
- [x] 5.4 Verify canvas rendering is clean (no artifacts)

## 6. Hit-Test & Click Handler Review

- [x] 6.1 Review existing click handlers that may interact with drag state
- [x] 6.2 Verify click handlers don't reference DragState
- [x] 6.3 Ensure canvas can still detect hits on cards (for other interactions)
- [x] 6.4 Test that click events still work properly

## 7. Comment & Documentation Cleanup

- [ ] 7.1 Remove drag-related comments from CanvasGameBoard.tsx
- [ ] 7.2 Remove drag-related comments from type files
- [ ] 7.3 Update component documentation to remove drag-and-drop mention
- [ ] 7.4 Remove any TODO/FIXME comments related to dragging

## 8. Import & Dependency Cleanup

- [x] 8.1 Remove unused imports after drag code removal
- [x] 8.2 Remove drag-related utility imports (if any)
- [x] 8.3 Verify no circular dependencies remain
- [x] 8.4 Run TypeScript compiler to check for errors

## 9. Testing: Unit & Component Tests

- [x] 9.1 Run existing unit tests for CanvasGameBoard
- [x] 9.2 Verify all tests pass (no failures due to drag removal)
- [x] 9.3 Remove or update any tests that specifically test drag behavior
- [x] 9.4 Add/verify tests for click-based selection (interactive button system)

## 10. Testing: Manual Canvas Rendering

- [ ] 10.1 Manual test: Render game board and verify no visual artifacts
- [ ] 10.2 Manual test: Verify cards display normally (no distortion)
- [ ] 10.3 Manual test: Verify pointer interactions still work (hover detection)
- [ ] 10.4 Manual test: Test on desktop (Chrome, Firefox, Safari)
- [ ] 10.5 Manual test: Test on mobile (iOS Safari, Chrome Android)

## 11. Testing: Game Logic Integration

- [ ] 11.1 Play a full game and verify card selection works (via click)
- [ ] 11.2 Verify game actions are dispatched correctly on card click
- [ ] 11.3 Verify game state updates correctly after card selection
- [ ] 11.4 Test multiple card selections in sequence
- [ ] 11.5 Verify no errors in console during gameplay

## 12. Testing: Edge Cases

- [ ] 12.1 Test clicking on disabled/inactive cards (should not select)
- [ ] 12.2 Test rapid clicks on different cards
- [ ] 12.3 Test click near card boundaries (hit-test accuracy)
- [ ] 12.4 Test interaction with other board elements (players, buttons)
- [ ] 12.5 Test on devices with different pointer types

## 13. Codebase Search & Cleanup

- [x] 13.1 Global grep for "drag" to find any remaining references
- [x] 13.2 Global grep for "DragState" to find any lingering code
- [x] 13.3 Global grep for "DRAG_THRESHOLD" constant
- [ ] 13.4 Remove or update any markdown docs mentioning drag-and-drop

## 14. Integration with Interactive Card Buttons

- [ ] 14.1 Verify interactive-card-buttons change is implemented
- [ ] 14.2 Verify new card button styles are applied correctly
- [ ] 14.3 Test hover elevation effect on cards
- [ ] 14.4 Test click selection with new button system
- [ ] 14.5 Verify no conflicts between canvas and HTML overlay events

## 15. Build & Production Verification

- [x] 15.1 Run production build (verify no errors)
- [ ] 15.2 Test production build in browser (no visual issues)
- [x] 15.3 Verify bundle size is reduced (drag code removed)
- [ ] 15.4 Test on production-like environment
- [x] 15.5 Run all tests (unit, integration, e2e if available)

## 16. Documentation & Release Notes

- [ ] 16.1 Update README to remove drag-and-drop documentation
- [ ] 16.2 Update component documentation (CanvasGameBoard)
- [ ] 16.3 Add migration note: "Drag-and-drop removed, use click selection"
- [ ] 16.4 Create CHANGELOG entry for this removal
- [ ] 16.5 Document the new interaction model (hover + click)

## 17. Code Review & Quality Assurance

- [x] 17.1 Self-review all code changes
- [x] 17.2 Verify code style matches project conventions
- [x] 17.3 Check for any console warnings or errors
- [x] 17.4 Verify TypeScript strict mode compliance
- [ ] 17.5 Ensure no accessibility regressions
