## Context

The current `CanvasGameBoard.tsx` and board layout components use fixed or semi-responsive sizing that doesn't scale well across different viewport sizes. Players see inconsistent layouts on mobile vs. desktop, and many areas waste screen space. CSS is used but lacks flexible sizing patterns (CSS Grid, Flexbox with percentages, aspect-ratio constraints). The web app must work on small phones (375px width), tablets (768-1024px), and desktops (1920px+).

## Goals / Non-Goals

**Goals:**
- Enable flexible sizing for all game board areas using CSS Grid, Flexbox, and aspect-ratio properties
- Maintain aspect ratios for images—no distortion or stretching (use CSS `object-fit: contain`)
- Support percentage-based sizing, CSS Grid fractional units (fr), and absolute constraints
- Auto-adapt layouts for mobile, tablet, and desktop viewports
- Allow players to save custom layout preferences in localStorage
- Preserve existing visual hierarchy and game logic

**Non-Goals:**
- Custom player-drawn layouts or free-form drag-drop positioning
- Game engine changes or new card data
- Real-time collaborative layout editing (multiplayer)
- Animation or drag-drop repositioning (phase 2)
- Backend API changes for layout persistence (phase 2)

## Decisions

**1. Layout System: CSS Grid + Flexbox**
- **Decision**: Use CSS Grid for major layout areas (deck, hand, face-up cards, opponents) and Flexbox for content within areas
- **Rationale**: Native CSS, no dependencies, scales smoothly, widely supported, integrates with Tailwind
- **Alternatives considered**:
  - Hard-code per-device layouts → inflexible, harder to maintain
  - JavaScript-based layout library → adds dependency, potential performance impact

**2. Sizing Model: Percentage + CSS Constraints**
- **Decision**: Define areas with CSS Grid `fr` units, percentages, min/max constraints, and aspect-ratio properties
- **Rationale**: Matches CSS box model, works natively in browsers, covers 90% of responsive layout use cases
- **Alternatives considered**:
  - JavaScript layout calculations → error-prone, performance overhead
  - Absolute pixel sizing only → not responsive

**3. Viewport Adaptation: CSS Media Queries + Container Queries**
- **Decision**: Use Tailwind breakpoints (md, lg, xl) with media queries; consider CSS Container Queries for component-level adaptation
- **Rationale**: Native browser features, clean separation of concerns, works with Tailwind utilities
- **Alternatives considered**:
  - JavaScript viewport listeners → manual, error-prone
  - Single layout → doesn't optimize for different viewport sizes

**4. Image Scaling: CSS object-fit + aspect-ratio**
- **Decision**: Use `object-fit: contain` with `aspect-ratio` property on card images; fallback for older browsers
- **Rationale**: Native CSS, preserves aspect ratio, scales to fill space without distortion, standard approach
- **Alternatives considered**:
  - Manual image sizing in React → maintenance burden
  - Canvas rendering → overcomplicates image scaling

**5. Persistence: localStorage with JSON**
- **Decision**: Store custom layout preferences in localStorage as JSON; no server-side sync initially
- **Rationale**: Simple, fast, no backend required, works offline, isolated per device
- **Alternatives considered**:
  - Backend API → adds complexity, requires authentication
  - IndexedDB → overkill for this use case

## Risks / Trade-offs

**[Risk: Complex CSS Maintenance]** → CSS Grid and media query rules could become hard to maintain as layout evolves
- **Mitigation**: Use CSS modules or Tailwind for consistency; document grid structure with comments; create utility classes for common patterns

**[Risk: Layout Fragmentation]** → Users could customize layouts to be illegible (all areas too small, overlapping content)
- **Mitigation**: Enforce minimum dimensions via CSS or JavaScript; provide sensible defaults; add "Reset to Default" button; preview before saving

**[Risk: Browser Compatibility]** → aspect-ratio and Container Queries not supported in older browsers
- **Mitigation**: Test on target browsers (modern mobile + desktop); use `@supports` for fallbacks; provide polyfill if needed

**[Risk: Performance on Mobile]** → Large number of layout calculations or DOM updates could lag on low-end phones
- **Mitigation**: Use CSS for layout (GPU-accelerated); avoid JavaScript layout recalculations; test on real devices

**[Trade-off: Customization vs Simplicity]** → Full layout control is powerful but adds UI complexity
- **Decision**: Start with sensible defaults and preset layouts; expose advanced customization only in settings panel (phase 2)

## Migration Plan

1. Create new responsive layout CSS modules and Tailwind configuration (no breaking changes)
2. Add layout preference hooks and localStorage utilities
3. Refactor `CanvasGameBoard.tsx` and board component hierarchy to use new CSS layout
4. Ship with new responsive layout as default; optionally keep old layout as fallback
5. Gather user feedback on different devices for 1-2 releases
6. Deprecate fixed layouts; provide migration guide if needed

## Open Questions

1. Should players be able to customize area positions (drag-drop) or only sizes?
   - *Proposed*: Start with size-only customization; add drag-drop in phase 2 if requested
2. How many preset layouts to support? (mobile portrait, mobile landscape, tablet, desktop)
   - *Proposed*: Auto-detect via media queries; 3-4 presets optimized for common device types
3. Should layout preferences sync across devices? (iCloud/cloud storage)
   - *Proposed*: localStorage per device for phase 1; investigate cloud sync in phase 2
4. What's the minimum viewport size we need to support?
   - *Proposed*: Down to 320px width (small phones); ensure touch targets stay ≥ 44px
