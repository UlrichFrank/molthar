## Why

Card selection (hover) positioning for hand cards and portal cards does not match the rendered card positions in the canvas. The auslage positioning is correct, but hand and portal card coordinates are misaligned, causing visual inconsistency and poor UX. Additionally, card position/size constants are defined in 3 separate files (gameHitTest.ts, gameRender.ts, CardButtonOverlay.tsx), creating maintenance burden and inconsistency risk.

## What Changes

- **Consolidate card layout constants** into a single shared module (`cardLayoutConstants.ts`) with all card dimensions and positioning definitions
- **Fix hand card positioning** calculations to match rendered fan-layout coordinates
- **Fix portal card positioning** calculations to match rendered portal layout
- **Update hit test calculations** to use consolidated constants
- **Update rendering code** to use consolidated constants
- **Update CardButtonOverlay** to use consolidated constants and fix position calculations

## Capabilities

### New Capabilities
- `shared-card-layout-constants`: Single source of truth for all card dimensions, positioning offsets, and layout calculations (dimensions, auslage layout, hand fan layout, portal layout, etc.)
- `hand-card-positioning-fix`: Correct hit test and button overlay calculations for hand cards to match fan-layout rotation and positioning
- `portal-card-positioning-fix`: Correct hit test and button overlay calculations for portal cards to match portal layout positioning
- `card-selection-visual-feedback`: Improved card selection highlighting via CardButtonOverlay using correct positioning

### Modified Capabilities
- `interactive-card-buttons`: Now uses consolidated card layout constants and correct positioning calculations from shared module

## Impact

**Affected Files:**
- game-web/src/lib/gameHitTest.ts (remove constants, import from shared)
- game-web/src/lib/gameRender.ts (remove constants, import from shared)
- game-web/src/components/CardButtonOverlay.tsx (remove constants, import from shared)
- game-web/src/lib/cardLayoutConstants.ts (NEW - shared constant module)

**User Impact:**
- Card hover selection will now align with rendered card positions
- Improved visual feedback and UX consistency

**Technical Impact:**
- Reduced code duplication (3 → 1 constant definitions)
- Single source of truth for layout calculations
- Easier to adjust card sizes/positions in future (change one place)
