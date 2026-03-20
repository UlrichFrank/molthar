## 1. Rendering Infrastructure

- [ ] 1.1 Add activated characters grid positioning constants to cardLayoutConstants.ts (grid area x/y, card size 50%, max 12 cards)
- [ ] 1.2 Create `drawActivatedCharactersGrid(ctx, activatedCards, config)` function in gameRender.ts
- [ ] 1.3 Implement 180° rotation and 50% scaling for each grid card
- [ ] 1.4 Call drawActivatedCharactersGrid() from the main render function to display grid
- [ ] 1.5 Test grid rendering with varying numbers of activated cards (0, 1, 6, 12+)

## 2. Hit Testing & Interaction Detection

- [ ] 2.1 Add `hitTestActivatedGrid(x, y)` function to gameHitTest.ts to detect grid card clicks
- [ ] 2.2 Return hit objects with type `activated-character` and card ID
- [ ] 2.3 Integrate activated grid hit test into main `hitTest()` function
- [ ] 2.4 Test hit detection across all grid positions
- [ ] 2.5 Verify no false positives outside grid area

## 3. Interactive Card Buttons (Overlay)

- [ ] 3.1 Generate activated character card buttons in CardButtonOverlay.tsx (for hover effects)
- [ ] 3.2 Position buttons at grid coordinates (50% size, 180° rotation)
- [ ] 3.3 Set up hover state propagation to canvas renderer
- [ ] 3.4 Apply card-elevation-effect CSS classes to activated character buttons
- [ ] 3.5 Test hover feedback on grid cards (lift + shadow)

## 4. Detail View Modal - State Management

- [ ] 4.1 Add modal state to CanvasGameBoard: `const [activeCharacterId, setActiveCharacterId] = useState(null)`
- [ ] 4.2 Create modal open/close handlers
- [ ] 4.3 Wire up click handlers for grid cards to trigger modal open
- [ ] 4.4 Add keyboard event listener for Escape key to close modal
- [ ] 4.5 Test modal state transitions (open/close/reopen)

## 5. Detail View Modal - Rendering

- [ ] 5.1 Create `ActivatedCharacterDetailView` React component to display modal
- [ ] 5.2 Render full-sized character card image in centered modal
- [ ] 5.3 Add semi-transparent overlay background (rgba(0,0,0,0.5))
- [ ] 5.4 Display card stats/info (name, power points, cost, abilities) in modal
- [ ] 5.5 Ensure modal fits entire screen without scroll (apply max-width/max-height with CSS)
- [ ] 5.6 Test layout on mobile, tablet, and desktop (minimum 1000x700 resolution)

## 6. Detail View Modal - Interaction

- [ ] 6.1 Add click handler to modal to close on card click
- [ ] 6.2 Add click handler to overlay background to close modal
- [ ] 6.3 Add keyboard Escape handler to close modal
- [ ] 6.4 Ensure close handlers prevent event propagation
- [ ] 6.5 Test all three close mechanisms work independently

## 7. Layout & Responsive Design

- [ ] 7.1 Position activated grid to right of player portal (x = PORTAL_X + PORTAL_W + margin)
- [ ] 7.2 Adjust grid layout for responsive scaling (scale with viewport)
- [ ] 7.3 Test grid positioning on different device sizes
- [ ] 7.4 Verify no overlaps with game buttons or other UI elements
- [ ] 7.5 Test on desktop (1920x1080), tablet (1024x768), mobile (375x667)

## 8. Styling & Visual Effects

- [ ] 8.1 Apply card-elevation-effect hover styles to activated character grid buttons
- [ ] 8.2 Add CSS for 180° rotation on grid cards
- [ ] 8.3 Add CSS for modal background overlay
- [ ] 8.4 Add CSS for modal card centering and sizing
- [ ] 8.5 Test all hover effects (lift, shadow, smooth transitions)

## 9. Testing & Validation

- [ ] 9.1 Unit test: Grid rendering with 0, 1, 6, 12 activated cards
- [ ] 9.2 Unit test: Hit detection for each grid cell
- [ ] 9.3 Integration test: Click grid card → modal opens with correct card
- [ ] 9.4 Integration test: Escape key closes modal
- [ ] 9.5 Integration test: Click overlay closes modal
- [ ] 9.6 Integration test: Click card image closes modal
- [ ] 9.7 Manual QA: Test hover effects on touch devices
- [ ] 9.8 Manual QA: Verify no layout shifts when modal opens/closes
- [ ] 9.9 Manual QA: Test with many activated cards (edge cases)

## 10. Documentation & Cleanup

- [ ] 10.1 Add code comments to grid rendering and hit test functions
- [ ] 10.2 Document grid positioning constants and layout rationale
- [ ] 10.3 Document modal component API and state management
- [ ] 10.4 Update canvas layout documentation if needed
- [ ] 10.5 Remove any temporary debug code or console.log statements
- [ ] 10.6 Verify no console errors or TypeScript issues
- [ ] 10.7 Run full build and type checking
