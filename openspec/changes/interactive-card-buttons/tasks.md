## 1. HTML Overlay for Card Elements

- [ ] 1.1 Create HTML overlay layer for card interactive elements
- [ ] 1.2 Position overlay elements absolutely over canvas cards
- [ ] 1.3 Map HTML elements to canvas card positions (sync with render)
- [ ] 1.4 Ensure overlay doesn't interfere with canvas rendering
- [ ] 1.5 Test z-index layering to ensure proper stacking

## 2. CSS Styling for Card States

- [ ] 2.1 Create CSS module for card button styles (`cardButtons.css`)
- [ ] 2.2 Define normal card state styles (opacity, cursor, sizing)
- [ ] 2.3 Define hover state styles (opacity increase, cursor: pointer)
- [ ] 2.4 Define selected state styles (outline, glow, or border)
- [ ] 2.5 Define disabled state styles (reduced opacity, cursor: not-allowed)
- [ ] 2.6 Define focus state styles for keyboard accessibility
- [ ] 2.7 Add CSS transitions for smooth state changes (200ms duration)

## 3. Card Elevation Effect

- [ ] 3.1 Implement CSS transform for card elevation (translateY: -4px)
- [ ] 3.2 Add box-shadow for depth effect on hover
- [ ] 3.3 Ensure shadow scales with elevation
- [ ] 3.4 Test elevation effect is smooth (60 FPS, no jank)
- [ ] 3.5 Verify elevation works with multiple cards simultaneously
- [ ] 3.6 Test z-index ordering doesn't cause visual issues

## 4. Pointer Event Handling

- [ ] 4.1 Implement pointerenter/pointerleave handlers for hover detection
- [ ] 4.2 Implement pointerdown/pointerup handlers for click detection
- [ ] 4.3 Track pointer type (mouse vs touch) for appropriate feedback
- [ ] 4.4 Add pointer event listeners to all card overlay elements
- [ ] 4.5 Ensure cross-browser pointer event support
- [ ] 4.6 Test pointer events on desktop and mobile

## 5. Hover State Management

- [ ] 5.1 Create hover state variable/hook for each card
- [ ] 5.2 Update hover state on pointerenter event
- [ ] 5.3 Clear hover state on pointerleave event
- [ ] 5.4 Apply/remove hover CSS class based on state
- [ ] 5.5 Ensure only one card is hovered at a time
- [ ] 5.6 Test hover state transitions are smooth

## 6. Click/Selection Handling

- [ ] 6.1 Create selection state management for cards
- [ ] 6.2 Implement click handler to toggle selection
- [ ] 6.3 Dispatch game action/event when card is selected
- [ ] 6.4 Update card selection state based on game logic
- [ ] 6.5 Prevent selection of disabled cards
- [ ] 6.6 Handle deselection (clear selection or toggle)

## 7. Visual Feedback Implementation

- [ ] 7.1 Implement outline/border for selected cards
- [ ] 7.2 Implement glow/shadow effect for selected cards
- [ ] 7.3 Ensure selection indication is visible over other elements
- [ ] 7.4 Test selection indication works with hover effect
- [ ] 7.5 Implement dimmed/faded style for disabled cards
- [ ] 7.6 Verify all states are visually distinct

## 8. Touch Event Support

- [ ] 8.1 Implement touch event detection (pointer type check)
- [ ] 8.2 Implement two-tap workflow (first tap: hover, second tap: select)
- [ ] 8.3 Add touch hover state that persists until tap away
- [ ] 8.4 Test touch events don't prevent page scrolling
- [ ] 8.5 Verify touch targets meet 44×44pt minimum (iOS)
- [ ] 8.6 Test on actual mobile/tablet devices

## 9. Cursor Feedback

- [ ] 9.1 Set cursor: pointer on enabled card hover
- [ ] 9.2 Set cursor: not-allowed on disabled card hover
- [ ] 9.3 Ensure cursor changes immediately on hover
- [ ] 9.4 Test cursor feedback on cross-platform
- [ ] 9.5 Verify cursor doesn't conflict with other UI elements

## 10. Accessibility Features

- [ ] 10.1 Add focus-visible styles for keyboard navigation
- [ ] 10.2 Add aria-label to each card element
- [ ] 10.3 Add aria-pressed or aria-selected for selection state
- [ ] 10.4 Implement keyboard support (Enter/Space to select)
- [ ] 10.5 Ensure focus outline is visible (WCAG 2.1 AA)
- [ ] 10.6 Test with screen reader (VoiceOver, NVDA)

## 11. Animation & Performance

- [ ] 11.1 Profile card hover animations (target 60 FPS)
- [ ] 11.2 Use will-change CSS property if needed (use sparingly)
- [ ] 11.3 Optimize shadow rendering for performance
- [ ] 11.4 Test performance on low-end mobile devices
- [ ] 11.5 Verify no layout thrashing during animations
- [ ] 11.6 Measure frame rate with DevTools Profiler

## 12. Testing: Hover Effects

- [ ] 12.1 Manual test: Hover over single card
- [ ] 12.2 Manual test: Hover between multiple cards (quick movement)
- [ ] 12.3 Manual test: Verify elevation animation is smooth
- [ ] 12.4 Manual test: Verify shadow effect accompanies elevation
- [ ] 12.5 Manual test: Hover over disabled card (no elevation)
- [ ] 12.6 Automated test: Hover state changes correctly

## 13. Testing: Click/Selection

- [ ] 13.1 Manual test: Click card to select it
- [ ] 13.2 Manual test: Click again to deselect (if toggle)
- [ ] 13.3 Manual test: Click disabled card (should do nothing)
- [ ] 13.4 Manual test: Verify selection indication is visible
- [ ] 13.5 Manual test: Game logic responds to selection
- [ ] 13.6 Automated test: Selection state updates correctly

## 14. Testing: Touch Interactions

- [ ] 14.1 Mobile test: Tap card (hover state appears)
- [ ] 14.2 Mobile test: Tap again to select (second tap)
- [ ] 14.3 Mobile test: Tap different card (hover moves)
- [ ] 14.4 Mobile test: Swipe to scroll (not blocked)
- [ ] 14.5 Tablet test: Same behavior as mobile
- [ ] 14.6 Test on actual iOS and Android devices

## 15. Testing: Cross-Browser & Devices

- [ ] 15.1 Desktop browser test (Chrome, Firefox, Safari, Edge)
- [ ] 15.2 Mobile browser test (iOS Safari, Chrome Android)
- [ ] 15.3 Touch device test (iPad, Android tablet)
- [ ] 15.4 Verify pointer events work on all browsers
- [ ] 15.5 Test fallbacks for older browsers if needed
- [ ] 15.6 Verify no visual artifacts across platforms

## 16. Game Integration Testing

- [ ] 16.1 Play full game flow with new card interactions
- [ ] 16.2 Test card selection during character activation
- [ ] 16.3 Test card selection during cost payment
- [ ] 16.4 Test disabled/enabled card state transitions
- [ ] 16.5 Test game logic responds correctly to selections
- [ ] 16.6 Verify no gameplay bugs introduced

## 17. Documentation & Polish

- [ ] 17.1 Document card button CSS classes and states
- [ ] 17.2 Add code comments to event handlers
- [ ] 17.3 Create accessibility documentation
- [ ] 17.4 Add touch interaction guide for users
- [ ] 17.5 Update design system docs with new card styles
- [ ] 17.6 Create component story/example (Storybook if used)

## 18. Final Verification

- [ ] 18.1 All hover effects work smoothly (60 FPS)
- [ ] 18.2 All selection states visually distinct
- [ ] 18.3 All touch interactions working on real devices
- [ ] 18.4 Accessibility features verified (keyboard, screen reader)
- [ ] 18.5 No performance regressions on any device
- [ ] 18.6 Production build passes all tests
