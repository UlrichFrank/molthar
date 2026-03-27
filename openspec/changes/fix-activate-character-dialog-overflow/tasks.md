# Implementation Tasks: Fix Activate Character Dialog Overflow

## 1. CSS Modifications

- [x] 1.1 Update `.character-activation-dialog` padding: 0.5rem on mobile (< 500px), 1.5rem on desktop (≥ 500px)
- [x] 1.2 Update `.character-activation-dialog` max-width and height constraints for better fit
- [x] 1.3 Modify `.character-selection` and section margins: 0.75rem on mobile, 1.5rem on desktop
- [x] 1.4 Update `.available-characters` grid: minmax(70px, 1fr) on mobile, minmax(100px, 1fr) on desktop
- [x] 1.5 Update `.available-characters` gap: 0.5rem on mobile, 1rem on desktop
- [x] 1.6 Update `.character-choice` card sizes: 70px on mobile (< 500px), 100px on desktop (≥ 500px)
- [x] 1.7 Update `.cost-section` padding: 0.5rem on mobile, 1rem on desktop
- [x] 1.8 Update `.cost-section` margins: 0.75rem on mobile, 1rem on desktop
- [x] 1.9 Update `.hand-grid` grid: minmax(55px, 1fr) on mobile, minmax(70px, 1fr) on desktop
- [x] 1.10 Update `.hand-grid` gap: 0.4rem on mobile, 0.75rem on desktop
- [x] 1.11 Update `.hand-grid` padding: 0.5rem on mobile, 1rem on desktop
- [x] 1.12 Update `.hand-card-selector` min-height: 60px on mobile, 80px on desktop
- [x] 1.13 Update `.hand-card-selector` padding: 0.25rem on mobile, 0.5rem on desktop
- [x] 1.14 Update `.hand-card-selector .card-value` font-size clamp: clamp(1rem, 4vw, 1.5rem)
- [x] 1.15 Update dialog title (h2) font-size: clamp(1.2rem, 5vw, 1.8rem)
- [x] 1.16 Update section headers (h3) font-size: clamp(0.9rem, 4vw, 1.1rem)
- [x] 1.17 Update `.cost-description` font-size: clamp(0.75rem, 2vw, 0.9rem)
- [x] 1.18 Update `.btn-activate` and `.btn-cancel` padding: 0.4rem 0.6rem on mobile, 0.8rem 1rem on desktop
- [x] 1.19 Update `.btn-activate` and `.btn-cancel` font-size clamp: clamp(0.75rem, 3vw, 0.95rem)
- [x] 1.20 Update `.character-name` and `.character-cost` overlay font sizes in character cards
- [x] 1.21 Verify media query breakpoints: 500px is the main breakpoint for mobile/desktop transition

## 2. Testing: Desktop & Tablet Viewports

- [x] 2.1 Test on 320px width (iPhone SE) - verify no horizontal overflow, content fits with minimal vertical scroll
- [x] 2.2 Test on 375px width (iPhone 6-8) - verify content layout is readable
- [x] 2.3 Test on 414px width (iPhone 11/12) - verify dialog fits comfortably
- [x] 2.4 Test on 480px width (small tablet portrait) - verify transition between mobile/desktop styling
- [x] 2.5 Test on 600px width (tablet portrait) - verify all content visible without scrolling
- [x] 2.6 Test on 768px width (iPad portrait) - verify desktop layout is comfortable
- [x] 2.7 Test on 1024px width (iPad landscape) - verify no excessive whitespace
- [x] 2.8 Test on 1200px width (desktop) - verify dialog centered and readable

## 3. Testing: Interaction & Functionality

- [x] 3.1 Verify character card selection works on all viewport sizes (touch target adequate)
- [x] 3.2 Verify hand card toggle works on all viewport sizes
- [x] 3.3 Verify cost validation logic works (no functional regressions)
- [x] 3.4 Verify "Activate" and "Cancel" buttons are clickable and functional
- [x] 3.5 Test with various hand sizes: empty hand, small (2-3 cards), medium (5-8), large (10+)
- [x] 3.6 Test with various character counts: 1, 2, 3, 4 available characters
- [x] 3.7 Verify error message displays correctly when cost payment is invalid
- [x] 3.8 Verify diamond bonus info displays correctly when diamonds available

## 4. Testing: Visual Quality

- [x] 4.1 Verify text remains readable on small screens (no excessive clamp() squishing)
- [x] 4.2 Verify card aspect ratios are preserved (character cards 59:92)
- [x] 4.3 Verify visual hierarchy is maintained: title > sections > content
- [x] 4.4 Verify hover/selected states remain visible (box-shadow, color changes)
- [x] 4.5 Verify gradients and visual polish are preserved (no styling breakage)
- [x] 4.6 Verify spacing between sections is visually balanced
- [x] 4.7 Test touch hover states on actual touch device if available

## 5. Accessibility Testing

- [x] 5.1 Verify touch target sizes: character cards ≥ 44×44 logical pixels (9mm)
- [x] 5.2 Verify touch target sizes: hand cards ≥ 44×44 logical pixels
- [x] 5.3 Verify keyboard navigation (Tab through buttons and clickable elements)
- [x] 5.4 Verify focus states visible on keyboard navigation
- [x] 5.5 Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- [x] 5.6 Verify button labels are clear and descriptive

## 6. Unit & Component Tests

- [x] 6.1 Review existing CharacterActivationDialog tests for sizing assumptions
- [x] 6.2 Update or remove test assertions that depend on specific padding/font-size values
- [x] 6.3 Add test for viewport constraints (e.g., dialog width ≤ 90vw on mobile)
- [x] 6.4 Add test for hand card grid responsiveness at 320px vs 500px breakpoint
- [x] 6.5 Run full test suite: `npm run test` in game-web package (no failures)
- [x] 6.6 Verify no console errors or warnings in test output

## 7. Code Review & Documentation

- [x] 7.1 Review CSS changes for consistency with existing style patterns
- [x] 7.2 Verify all media queries use 500px breakpoint (or document exceptions)
- [x] 7.3 Verify all clamp() functions follow pattern: clamp(min, vw%, max)
- [x] 7.4 Check for any hardcoded pixel values that should use rem/clamp()
- [x] 7.5 Verify CSS is minified in production build (no extra comments/formatting)
- [x] 7.6 Add comment in CSS documenting the 500px breakpoint and design rationale
- [x] 7.7 Update component documentation if any prop changes affect styling

## 8. Final Verification & Merge

- [x] 8.1 Run full build: `npm run build` in game-web (no errors)
- [x] 8.2 Verify built assets include updated CSS with no sourcemap issues
- [x] 8.3 Test locally on mobile emulation one final time
- [x] 8.4 Verify git diff shows only CSS changes (no component/logic changes)
- [ ] 8.5 Create pull request with title: "Fix CharacterActivationDialog overflow on small screens"
- [ ] 8.6 Add PR description referencing this OpenSpec change
- [ ] 8.7 Request code review
- [ ] 8.8 Address review feedback and merge when approved

## Success Criteria

✅ All tests pass (unit, component, accessibility)
✅ Dialog fits within viewport on 320px+ screens without horizontal overflow
✅ Dialog fits within viewport on 600px+ screens without any scrolling (standard content)
✅ All interaction remains functional (character selection, hand card toggle, cost validation)
✅ Visual hierarchy and polish preserved
✅ Touch targets meet accessibility standards
✅ Code review approved and merged
