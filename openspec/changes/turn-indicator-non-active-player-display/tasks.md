## 1. Component Props and Data Flow

- [x] 1.1 Review TurnIndicatorDisplay component and identify required props
- [x] 1.2 Add `playerName` or `playerID` prop to TurnIndicatorDisplay
- [x] 1.3 Add `isActivePlayer` prop to distinguish active vs non-active state
- [x] 1.4 Update CanvasGameBoard to pass these new props to TurnIndicatorDisplay
- [x] 1.5 Identify and locate the separate "Player X Active" indicator component (likely ActionCounterDisplay or similar)
- [x] 1.6 Remove or hide the separate "Player X Active" indicator from CanvasGameBoard

## 2. Text Content Rendering

- [x] 2.1 Update TurnIndicatorDisplay to render "Player X Y/Z" format instead of just "Y/Z"
- [ ] 2.2 Verify text rendering with various player names/IDs
- [ ] 2.3 Test text content displays correctly for both active and non-active players

## 3. Positioning and Layout

- [x] 3.1 Measure current vertical position of "Player X Active" indicator
- [x] 3.2 Measure current vertical position of turn indicator
- [x] 3.3 Calculate new Y position for turn indicator (move down to previous "Player X Active" location)
- [x] 3.4 Update CSS or component styling to reposition turn indicator
- [ ] 3.5 Verify visual layout is clean with consolidated indicator

## 4. Styling and Color Implementation

- [x] 4.1 Update turnActionCounter.css to add blue color styling for non-active state
- [x] 4.2 Define blue color value (#3B82F6 or adjust based on design system)
- [x] 4.3 Apply conditional CSS class based on `isActivePlayer` prop
- [ ] 4.4 Ensure color contrast meets accessibility standards (WCAG)

## 5. Testing and Validation

- [ ] 5.1 Test indicator displays blue for non-active players
- [ ] 5.2 Test indicator uses standard color for active player
- [ ] 5.3 Test text content shows "Player X Y/Z" format correctly
- [ ] 5.4 Test in multiplayer game with 2+ players
- [ ] 5.5 Verify indicator updates correctly when turns advance
- [ ] 5.6 Test edge cases (single player, many players)
- [ ] 5.7 Verify "Player X Active" indicator is no longer visible
- [ ] 5.8 Test that repositioned indicator does not overlap other UI elements

## 6. Code Review and Cleanup

- [x] 6.1 Remove any commented code or debug statements
- [x] 6.2 Verify no console errors or warnings (Build successful with no errors)
- [x] 6.3 Code review for consistency and maintainability
- [x] 6.4 Update any relevant inline comments
- [x] 6.5 Verify removed component/display is completely cleaned up
