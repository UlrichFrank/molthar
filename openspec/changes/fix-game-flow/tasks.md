# Task Checklist: Fix Game Flow (Direct Card Taking)

## 1. Remove Selection State Model

- [ ] 1.1 Remove selectedPearl, selectedCharacter, selectedHandIndices from component state
- [ ] 1.2 Remove all selection-related useState hooks and state initialization
- [ ] 1.3 Remove selection highlighting CSS classes from rendering
- [ ] 1.4 Verify no remaining references to selection state variables
- [ ] 1.5 Test: Component still renders without selection state

## 2. Refactor Click Handler Pipeline

- [ ] 2.1 Modify onPointerDown to validate actionCount before processing click
- [ ] 2.2 Extract pearl card click logic: hitTest → validate actionCount < 3 → moves.takePearlCard(slotIndex)
- [ ] 2.3 Extract character card click logic: hitTest → validate actionCount < 3 → check portal full
- [ ] 2.4 If portal not full: moves.takeCharacterCard(slotIndex)
- [ ] 2.5 If portal full: call dialog.openReplacementDialog() instead of move
- [ ] 2.6 Remove "activate-character" button handler (replaced by immediate take)
- [ ] 2.7 Remove "take-pearl" button handler (replaced by immediate take)
- [ ] 2.8 Test: Console logs confirm moves are dispatched on click

## 3. Portal Replacement Dialog Integration

- [ ] 3.1 In takeCharacterCard callback, check if player.portal.length >= 2
- [ ] 3.2 If full: call dialog.openReplacementDialog(newCharacter, portalCharacters)
- [ ] 3.3 Dialog onSelect callback: dispatch moves.takeCharacterCard(slotIndex, replacedSlotIndex)
- [ ] 3.4 Dialog onCancel callback: close dialog without taking character
- [ ] 3.5 Test: Taking character with empty portal goes directly
- [ ] 3.6 Test: Taking character with full portal shows dialog
- [ ] 3.7 Test: Dialog selection dispatches correct move with replacedSlotIndex

## 4. Portal Activation Dialog - Keep Separate Flow

- [ ] 4.1 Verify portal-slot click handler still triggers activation dialog (not card take)
- [ ] 4.2 Verify CharacterActivationDialog still works (no changes needed)
- [ ] 4.3 Verify dialog callbacks dispatch moves.activatePortalCard() correctly
- [ ] 4.4 Test: Clicking portal character slot opens activation dialog
- [ ] 4.5 Test: Selecting cards in dialog validates cost correctly

## 5. Action Count Validation and Display

- [ ] 5.1 Add actionCount validation: at start of handleCardClick, return if actionCount >= 3
- [ ] 5.2 Add visual action counter display to game board (e.g., "Actions: 2/3")
- [ ] 5.3 Update counter in real-time on every move dispatch
- [ ] 5.4 Add CSS styling: disabled appearance for cards when actionCount >= 3
- [ ] 5.5 Add CSS styling: highlight/warning color for counter when actionCount == 3
- [ ] 5.6 Test: Clicking cards when actionCount >= 3 has no effect
- [ ] 5.7 Test: Counter increments correctly on each move

## 6. Remove UI Components/Code

- [ ] 6.1 Remove "Take Pearl" button from game board
- [ ] 6.2 Remove "Activate Character" button from game board
- [ ] 6.3 Remove selection highlighting CSS (selectedPearl, selectedCharacter, selectedHandIndices styling)
- [ ] 6.4 Remove any "selection" badge/tooltip displays
- [ ] 6.5 Verify game board still renders without these UI elements

## 7. OpponentPortals - Verify Integration

- [ ] 7.1 Verify OpponentPortals component renders correctly
- [ ] 7.2 Verify OpponentPortals updates when game state changes
- [ ] 7.3 Verify clicking opponent portals does nothing (no interaction)
- [ ] 7.4 Test: OpponentPortals shows correct player names, power, diamond count

## 8. Game State Consistency

- [ ] 8.1 Verify actionCount increments correctly for pearl takes
- [ ] 8.2 Verify actionCount increments correctly for character takes (including replacement)
- [ ] 8.3 Verify actionCount increments correctly for character activations
- [ ] 8.4 Verify actionCount resets at end of turn (new turn phase)
- [ ] 8.5 Verify no "ghost" selections persist between turns
- [ ] 8.6 Test: Play one complete turn, verify all actions counted correctly

## 9. TypeScript & Type Safety

- [ ] 9.1 Remove Selection interface definition (no longer needed)
- [ ] 9.2 Run TypeScript strict mode check: `npx tsc --noEmit`
- [ ] 9.3 Fix any type errors introduced by selection state removal
- [ ] 9.4 Verify no `any` types in modified code
- [ ] 9.5 Test: Build succeeds with no TypeScript errors

## 10. Build & Compilation

- [ ] 10.1 Run `npm run build` from game-web directory
- [ ] 10.2 Verify build succeeds with no errors
- [ ] 10.3 Verify bundle size hasn't regressed significantly
- [ ] 10.4 Check for any console warnings during build

## 11. Manual Game Flow Testing

- [ ] 11.1 Start a new 2-player game
- [ ] 11.2 Click pearl card in auslage → verify card appears in hand immediately
- [ ] 11.3 Click another pearl card → verify action counter increments (1/3, 2/3)
- [ ] 11.4 Take 3 pearl cards → verify action counter shows 3/3, no more clicks work
- [ ] 11.5 Click "End Turn" → verify turn passes to next player, action counter resets to 0/3

## 12. Character Taking & Replacement Testing

- [ ] 12.1 Start game with 2+ players
- [ ] 12.2 Take character card to empty portal → verify character appears in portal, action counter increments
- [ ] 12.3 Take second character card → verify appears in portal slot 2
- [ ] 12.4 Take third character card → verify replacement dialog appears
- [ ] 12.5 In dialog, select slot to replace → verify old character disappears, new one appears, action counter increments
- [ ] 12.6 Cancel replacement dialog → verify dialog closes, character NOT taken, action counter unchanged

## 13. Character Activation Testing

- [ ] 13.1 Click character slot in own portal → verify activation dialog opens
- [ ] 13.2 Select cards matching cost → verify "Activate" button enabled
- [ ] 13.3 Click "Activate" → verify character marked activated, power awarded, cards removed from hand
- [ ] 13.4 Try activating already-activated character → verify dialog doesn't open
- [ ] 13.5 Cancel activation dialog → verify dialog closes, hand unchanged, action count unchanged

## 14. Edge Cases & Error Conditions

- [ ] 14.1 Hand is full (5 cards) → try taking pearl → verify move fails silently, pearl remains
- [ ] 14.2 Taking last character in deck → verify game continues, new characters don't appear
- [ ] 14.3 No diamonds available → try activating character that requires diamonds → verify cost validation fails
- [ ] 14.4 Activate character with exact cost match → verify "Activate" button enabled
- [ ] 14.5 Rapid clicks (4 cards at 1 action each) → verify only 3 actions process, 4th is blocked

## 15. Performance & Responsiveness

- [ ] 15.1 Click card → verify immediate visual feedback (< 100ms)
- [ ] 15.2 Click card → verify game state updates within 200ms
- [ ] 15.3 Dialog appears → verify no jank or stutter
- [ ] 15.4 Rapid clicking → verify no lag or queue buildup
- [ ] 15.5 Check browser console → verify no console errors or warnings

## 16. Multi-Player Scenarios

- [ ] 16.1 Play 2-player game → both players take turns, verify action counts independent
- [ ] 16.2 Play 3-player game → verify turn order correct, dialogs work for each player
- [ ] 16.3 Play 4-player game → verify opponent portals show all players' info
- [ ] 16.4 Opponent takes character with replacement → verify YOUR dialog doesn't interfere

## 17. Browser & Device Testing

- [ ] 17.1 Test on Chrome (desktop) → all features work
- [ ] 17.2 Test on Firefox (desktop) → all features work
- [ ] 17.3 Test on Safari (desktop) → all features work
- [ ] 17.4 Test on mobile device (iOS/Android) → touch clicks work correctly
- [ ] 17.5 Test on tablet → verify responsive layout, clicks accurate

## 18. Documentation & Comments

- [ ] 18.1 Add code comment explaining click handler pipeline
- [ ] 18.2 Document actionCount validation logic
- [ ] 18.3 Document dialog trigger conditions (replacement, activation)
- [ ] 18.4 Update component JSDoc or comments to reflect new behavior
- [ ] 18.5 Create summary of changes in commit message

## 19. Code Review & Quality

- [ ] 19.1 Review diff: verify only selection-related code removed
- [ ] 19.2 Check for any leftover selection state variables
- [ ] 19.3 Verify click handler is clean and logical
- [ ] 19.4 Verify no circular dependencies introduced
- [ ] 19.5 Check that DialogContext still works after changes

## 20. Final Verification

- [ ] 20.1 Full build succeeds: `npm run build` from game-web
- [ ] 20.2 Production build created successfully
- [ ] 20.3 No TypeScript errors: `npx tsc --noEmit`
- [ ] 20.4 Play one complete 2-player game from start to finish
- [ ] 20.5 All 3 actions consume cards correctly, dialogs work, game playable
