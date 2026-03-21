## Context

The game board currently renders the player portal with activated characters shown only as text labels in the `player-portal-info` section. Activated characters are stored in `PlayerState.portal[]` array with an `activated` flag. The canvas rendering pipeline (`gameRender.ts`, `gameHitTest.ts`) and React overlay (`CardButtonOverlay.tsx`) handle interactive cards for auslage and portal slots.

The player portal layout has designated areas:
- Left third: Hand cards (fanned)
- Center: Portal slots (2) + player info + diamonds
- Right side: Currently empty (ideal for activated characters grid)

## Goals / Non-Goals

**Goals:**
- Render activated characters as a compact grid (3 rows × 4 cards, 50% size) with 180° rotation on right side of portal
- Enable detail view modal showing enlarged character card without scrolling
- Provide consistent hover feedback (elevation effect) across all card types
- Support responsive layout for mobile/tablet/desktop
- Reuse existing rendering patterns for consistency

**Non-Goals:**
- Animated card transitions on activation/deactivation
- Drag-to-reorder activated characters
- Character comparison view
- Undo/ability to deactivate cards from this view

## Decisions

**1. Grid Layout: 3 Rows × 4 Columns**
- **Decision**: Fixed 3×4 grid for activated characters (max 12 visible at once)
- **Rationale**: Portal max is 2 slots; max power = 12 points per character; reasonable worst-case is 12 active cards
- **Alternative**: Dynamic grid (columns adjust to fit) → harder to predict layout; inconsistent appearance

**2. 50% Scaling**
- **Decision**: Render activated cards at 50% of standard card size
- **Rationale**: Preserves space for other UI; still recognizable; cards are 80×120px → 40×60px when scaled
- **Alternative**: Variable scaling based on screen size → complexity for minimal benefit

**3. 180° Rotation**
- **Decision**: Apply 180° rotation to all activated character cards
- **Rationale**: Visual distinction from portal cards; indicates "card is active/used"
- **Alternative**: No rotation, different color/border → less intuitive; harder to distinguish at a glance

**4. Detail View Modal**
- **Decision**: Full-screen modal (centered, no scroll) showing enlarged character card + stats
- **Rationale**: Immersive focus; can display full card details; easy to implement with existing card rendering
- **Alternative**: Side panel → takes up more space; Tooltip → limited space for details

**5. Hit Testing & Interaction**
- **Decision**: Add grid card buttons to `CardButtonOverlay.tsx` hit targets; modal state managed in `CanvasGameBoard`
- **Rationale**: Consistent with existing card interaction pattern; centralizes state in component
- **Alternative**: Separate modal management component → increases component coupling; harder to maintain

**6. Positioning**
- **Decision**: Grid positioned at x = PORTAL_X + PORTAL_W + 20 (right margin); y = PORTAL_Y
- **Rationale**: Aligns with portal area; uses right margin space efficiently
- **Alternative**: Overlay grid on existing portal area → clutters center; conflicts with portal cards

## Risks / Trade-offs

**[Risk] Detail view modal may not fit on small screens**
- **Mitigation**: Test layout on minimum supported resolution (e.g., 1000x700); apply `max-height/max-width` with `contain` to fit without scroll

**[Risk] Too many activated cards (>12) may cause display issues**
- **Mitigation**: Clamp visible cards to 12; if overflow needed, add scroll container for grid (separate from main viewport)

**[Risk] 50% scaling may be too small to see card details**
- **Mitigation**: Detail view provides full-sized view; grid is for quick scanning/identification

**[Risk] 180° rotation + grid layout may be confusing**
- **Mitigation**: Hover effect + detail view provides context; rotation is intentional (signals "active")

**[Trade-off] Fixed 3×4 grid vs. dynamic grid**
- Predictable layout at cost of inflexibility
- Better for performance and consistency

## Open Questions

1. **Exact grid positioning**: How much right margin? Should grid respect right-side button area?
2. **Detail view styling**: Use existing card image + overlay with stats, or create custom detail template?
3. **Performance**: Should grid be rendered on canvas or as React overlay (buttons)? Canvas more efficient; React easier to manage.
4. **Fallback for >12 cards**: If somehow >12 cards activated, should we scroll the grid, hide extras, or clamp to 12?
