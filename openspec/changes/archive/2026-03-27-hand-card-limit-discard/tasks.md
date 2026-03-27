## 1. Game Logic Foundation

- [x] 1.1 Create hand limit calculation utility function that computes maximum hand size (5 base + character bonuses)
- [x] 1.2 Implement hand limit check function that evaluates if current hand exceeds the calculated limit
- [x] 1.3 Add `requires-discard` flag to game state/turn state
- [x] 1.4 Integrate hand limit check into action completion lifecycle (hook after all actions are done)
- [x] 1.5 Implement logic to set requires-discard flag when limit is exceeded
- [x] 1.6 Implement logic to clear requires-discard flag when discard is confirmed or cancelled
- [x] 1.7 Add validation to prevent turn end while requires-discard is true and hand exceeds limit

## 2. Discard Button Component

- [x] 2.1 Create DiscardButton component that is positioned above "End Turn" button
- [x] 2.2 Implement visibility logic (only show when requires-discard flag is true)
- [x] 2.3 Implement click handler to open discard dialog
- [x] 2.4 Add styling to match existing UI (position, spacing, appearance)
- [x] 2.5 Wire up button state synchronization with game state

## 3. Card Discard Dialog

- [x] 3.1 Create CardDiscardDialog component with modal presentation
- [x] 3.2 Implement card display within dialog showing all hand cards
- [x] 3.3 Implement card selection mechanism (click to toggle, visual feedback)
- [x] 3.4 Add hand size indicator displaying "Hand: X/Y" format
- [x] 3.5 Add selected card count display
- [x] 3.6 Implement validation logic (cannot confirm unless remaining cards meet limit)
- [x] 3.7 Create Cancel button that closes dialog without changes
- [x] 3.8 Create Confirm Discard button (disabled until validation passes)
- [x] 3.9 Implement dialog auto-close on successful discard

## 4. Discard Action Execution

- [x] 4.1 Implement card removal from hand when Confirm Discard is clicked
- [x] 4.2 Implement card addition to discard pile
- [x] 4.3 Update game state after cards are discarded
- [x] 4.4 Clear requires-discard flag after successful discard
- [x] 4.5 Handle edge case: if Cancel clicked, preserve discard button for retry

## 5. Integration & Polish

- [x] 5.1 Test hand limit calculation with various character card combinations
- [x] 5.2 Test discard flow with different hand sizes (at limit, over limit, way over limit)
- [x] 5.3 Test that End Turn is disabled while requiring discard
- [x] 5.4 Test dialog open/close and card selection workflows
- [x] 5.5 Test discard button appears only when needed
- [x] 5.6 Verify card counts update correctly in all displays
- [x] 5.7 Test with edge case: player gains cards during action sequence
- [x] 5.8 Add tooltips/help text to discard button for player clarity

## 6. Review & Polish

- [x] 6.1 Code review: hand limit logic
- [x] 6.2 Code review: UI components and integration
- [x] 6.3 Review styling for consistency with existing design
- [x] 6.4 Verify accessibility (keyboard navigation, screen reader support)
- [x] 6.5 Test on mobile/tablet with touch interactions
