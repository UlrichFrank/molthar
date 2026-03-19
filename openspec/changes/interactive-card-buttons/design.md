## Context

Cards are rendered on the canvas in CanvasGameBoard.tsx. Currently, card rendering and hit-testing exist but cards don't provide clear interactive feedback. The game has a working hit-test system (`gameHitTest.ts`) that detects card clicks, but the visual feedback is minimal. Players need clear, intuitive cues that cards are interactive.

## Goals / Non-Goals

**Goals:**
- Make card interactivity obvious through visual feedback
- Provide smooth, responsive hover effects
- Support both mouse (desktop) and touch (mobile/tablet) interactions
- Maintain performance (GPU-accelerated animations)
- Ensure accessibility (keyboard navigation, focus states, screen readers)
- Follow modern UI patterns (button-like behavior)

**Non-Goals:**
- Drag-and-drop card repositioning (phase 2)
- Custom card animations or elaborate effects
- Changing game logic based on selection state
- Card dragging or swapping functionality
- Undo/history tracking for selections

## Decisions

**1. CSS-Based Hover Effects (Not Canvas)**
- **Decision**: Use CSS hover states and animations for elevation effect, not canvas redrawing
- **Rationale**: 
  - CSS animations are GPU-accelerated (smooth 60 FPS)
  - Simpler to implement and maintain
  - Works across all browsers
  - Doesn't require canvas state management
- **Alternatives considered**:
  - Canvas-based rendering of hover state → CPU-intensive, harder to animate smoothly
  - Canvas hover with requestAnimationFrame → more complex, harder to maintain

**2. HTML Card Elements with Canvas Integration**
- **Decision**: Wrap/overlay interactive HTML elements on canvas for mouse/touch events
- **Rationale**:
  - HTML elements naturally support pointer events and touch events
  - CSS transitions work smoothly
  - Accessibility features (focus, aria-labels) are built-in
  - Can be layered on top of canvas without major refactoring
- **Alternatives considered**:
  - Pure canvas with custom event handling → more complex, less maintainable
  - Canvas hit-test only, no visual feedback → not user-friendly

**3. Visual Feedback: Transform + Shadow**
- **Decision**: Use CSS `transform: translateY()` for elevation + `box-shadow` for depth
- **Rationale**:
  - Transform is GPU-accelerated (efficient)
  - Shadow creates clear visual depth
  - Simple, proven UX pattern
  - No layout recalculation needed
- **Alternatives considered**:
  - Glow effect only → less clear
  - Color change → harder to distinguish from disabled state
  - Size increase → can look jarring, harder to center

**4. Selection State via Data Attributes**
- **Decision**: Store selection state via data attributes on HTML elements or React state
- **Rationale**:
  - Decouples state from canvas rendering
  - Easy to query and style with CSS selectors
  - Works with CSS classes for visual indication
- **Alternatives considered**:
  - Canvas state tracking → harder to style and animate
  - Global state object → overkill for local UI state

**5. Touch Support via Pointer Events (Not Separate Touch Handlers)**
- **Decision**: Use single pointer event handler (pointerdown, pointerup) that works for mouse and touch
- **Rationale**:
  - Single event system handles both mouse and touch
  - Modern standard, good browser support
  - Simpler code than separate mouse + touch handlers
- **Alternatives considered**:
  - Separate mouse + touch event listeners → more code, harder to maintain
  - Mouse events only → no mobile support

**6. Accessibility: Focus States + Keyboard Navigation**
- **Decision**: Add focus styles (outline/border on :focus-visible) and keyboard support
- **Rationale**:
  - Required for WCAG 2.1 AA compliance
  - No extra cost (CSS only)
  - Keyboard users can navigate and select cards
- **Alternatives considered**:
  - Ignore keyboard accessibility → poor UX for keyboard users
  - Custom focus indicator → harder to maintain consistency

## Risks / Trade-offs

**[Risk: Canvas + HTML Overlap Complexity]** → Mixing canvas and HTML elements can create rendering/event order issues
- **Mitigation**: 
  - Use precise z-index layering
  - Keep HTML elements simple (no complex layouts over canvas)
  - Test thoroughly on different browsers
  - Consider canvas z-index strategy (what renders on top)

**[Risk: Touch Event Conflicts]** → Touch events might conflict with canvas touch handling
- **Mitigation**:
  - Use pointer events (unified standard)
  - Test on actual mobile devices
  - Implement preventDefault() carefully to avoid blocking scrolling

**[Risk: Performance on Low-End Devices]** → Many simultaneous card hover animations might lag
- **Mitigation**:
  - Use will-change CSS property sparingly
  - Limit number of simultaneously animated cards (typically ≤4)
  - Profile on low-end devices
  - Reduce animation duration if needed

**[Risk: Visual Conflict with Canvas Rendering]** → Card hover effect might visually clash with canvas
- **Mitigation**:
  - Use subtle elevation (small translateY like 2-4px)
  - Ensure shadow complements canvas colors
  - Theme consistency testing

**[Trade-off: Complexity vs UX]** → Adding interactive feedback increases complexity
- **Decision**: Worth it because UX improvement is significant and complexity is low (mostly CSS)

## Migration Plan

1. **Phase 1: Foundation** (Week 1)
   - Add HTML overlay elements for cards (positioned absolutely over canvas)
   - Implement basic pointer event detection
   - Add hover styles (CSS)

2. **Phase 2: Interactions** (Week 2)
   - Wire up click handlers to game logic
   - Add selection state tracking
   - Add selected card visual feedback

3. **Phase 3: Polish** (Week 3)
   - Add touch event support
   - Implement keyboard navigation
   - Add focus states and accessibility labels

4. **Phase 4: Testing & Optimization** (Week 4)
   - Performance profiling (target 60 FPS on low-end devices)
   - Mobile/tablet testing
   - Accessibility testing (keyboard, screen readers)
   - Cross-browser testing

5. **Rollback Strategy**:
   - Changes are additive (CSS + HTML elements)
   - Can be disabled by removing event listeners
   - No game logic changes; game works without new features

## Open Questions

1. **Animation Duration**: How fast should hover elevation animate? (Default: 200ms)
   - Proposed: 200ms (feels responsive but not too snappy)

2. **Elevation Height**: How far should cards lift on hover? (Default: 4-6px)
   - Proposed: 4px (subtle but noticeable)

3. **Selection Visual**: Should selected cards show outline, glow, or different visual?
   - Proposed: Subtle outline + shadow (consistent with hover)

4. **Mobile Behavior**: Should hover work on touch, or only click?
   - Proposed: Touch should trigger hover state + click to select (two-tap workflow)

5. **Disabled Cards**: How should disabled/unselectable cards look?
   - Proposed: Reduced opacity + cursor: not-allowed
