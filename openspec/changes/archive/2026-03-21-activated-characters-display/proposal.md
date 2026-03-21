## Why

Currently, activated character cards are displayed as small text labels in the player info area, wasting valuable game board real estate and providing minimal visual feedback. Adding a dedicated, interactive display of activated characters improves gameplay immersion, makes character abilities and stats accessible at a glance, and allows detailed inspection without disrupting the main board view.

## What Changes

- **Activated characters display area**: New compact grid (3 rows × 4 cards, 50% size) positioned to the right of the player portal showing all activated characters
- **Card rotation**: Activated character cards rotated 180° to differentiate them from portal cards
- **Interactive hover feedback**: Cards highlight on hover with the same elevation effect as other interactive cards
- **Detail view modal**: Click any activated character to show an enlarged, centered detail view (full card, no scroll needed) with stats and abilities
- **Modal dismissal**: Click the detail view again to return to the main board
- **Responsive layout**: Grid adapts to device size; detail view always fits without scrolling

## Capabilities

### New Capabilities
- `activated-characters-grid`: Render activated characters in a compact 3×4 grid (50% size) to the right of player portal
- `activated-character-detail-view`: Click to show enlarged character card in centered modal; click to close
- `activated-character-hover-feedback`: Visual highlight on hover matching the elevation effect of other cards
- `activated-character-interaction`: Hit testing and click handling for grid cards and detail view modal

### Modified Capabilities
- `card-elevation-effect`: Extend hover feedback to activated character grid cards (same effect as auslage/portal cards)

## Impact

- **Game canvas rendering**: Add activated characters grid rendering in `gameRender.ts` with 180° rotation and 50% scaling
- **Hit testing**: Extend hit test logic in `gameHitTest.ts` to detect clicks on grid cards and modal dismiss area
- **Interactive overlay**: Add activated character buttons and detail view modal to `CardButtonOverlay.tsx`
- **Game state**: Display uses existing `PlayerState.portal[]` array; no new state needed
- **UI layout**: New content area (right side of player portal); ensure responsive layout
- **Styling**: Apply hover effects, modal styling, and responsive grid layout via CSS
