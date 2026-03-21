## 1. Turn Indicator Component

- [x] 1.1 Create `turn-indicator-display` component structure
- [x] 1.2 Add component to CanvasGameBoard bottom-left area
- [x] 1.3 Wire component to receive active player from game state
- [x] 1.4 Display "Player N Active" text with proper styling

## 2. Action Counter Display Component

- [x] 2.1 Create `action-counter-display` component
- [x] 2.2 Add component to CanvasGameBoard next to turn indicator
- [x] 2.3 Implement color coding logic (green/yellow/red based on action state)
- [x] 2.4 Render "Actions: N/M" text with dynamic values
- [x] 2.5 Add CSS styling for visibility and readability

## 3. Game State Integration

- [x] 3.1 Review GameState structure for action tracking
- [x] 3.2 Verify actionCount field exists and updates correctly
- [x] 3.3 Add maxActions field to track bonus actions
- [x] 3.4 Implement bonus action calculation when abilities activate
- [x] 3.5 Reset action count on turn end

## 4. Action Tracking & Consumption

- [x] 4.1 Audit card play logic to ensure actionCount decrements
- [x] 4.2 Audit ability activation logic to ensure actionCount decrements
- [x] 4.3 Ensure actionCount doesn't go negative
- [x] 4.4 Test action limit enforcement (prevent actions when count = 0)

## 5. Bonus Action Handling

- [x] 5.1 Identify which character abilities grant bonus actions
- [x] 5.2 Implement bonus action logic in GameEngine
- [x] 5.3 Update maxActions when bonus abilities activate
- [x] 5.4 Ensure bonuses are turn-scoped (reset on turn end)
- [x] 5.5 Test multi-source bonus stacking

## 6. Real-time Updates

- [x] 6.1 Wire action counter to re-render when actionCount changes
- [x] 6.2 Wire action counter to re-render when maxActions changes
- [x] 6.3 Test update timing (should be <100ms from action to display)
- [x] 6.4 Verify updates work in multi-player game state

## 7. Visual Polish

- [x] 7.1 Ensure text is readable at all screen resolutions
- [x] 7.2 Test color contrast for accessibility (WCAG AA minimum)
- [x] 7.3 Add hover/focus states for buttons near indicator
- [x] 7.4 Test layout with different viewport sizes

## 8. Testing

- [x] 8.1 Unit test: actionCount increments/decrements correctly
- [x] 8.2 Unit test: maxActions updates when bonuses activate
- [x] 8.3 Integration test: counter displays correct value in game
- [x] 8.4 Integration test: color changes correctly for each state
- [x] 8.5 End-to-end test: full game turn with actions and bonuses
- [x] 8.6 Multi-player test: all players see correct active player and action count

## 9. Documentation & Cleanup

- [x] 9.1 Document bonus action rules in code comments
- [x] 9.2 Update game board component documentation
- [x] 9.3 Remove any temporary debug logging
- [x] 9.4 Verify no console errors or warnings
- [x] 9.5 Create commit with clear description of changes
