## Why

The game board currently has fixed-size areas that don't adapt to different screen sizes and aspect ratios. Players on different devices (mobile, tablet, desktop) and window sizes experience inconsistent layouts and waste screen space. Content doesn't scale proportionally, making the interface look cramped on small screens and stretched on large ones. We need flexible, CSS-like layout control to maximize usable space and maintain visual consistency across all platforms and viewport sizes.

## What Changes

- Game board layout areas (player hand, character deck, face-up cards, opponent indicators, etc.) become resizable and repositionable using CSS-based layout patterns
- Content within areas scales proportionally without distortion—images maintain aspect ratio while filling available space
- Areas can be sized as percentages of parent container width/height or use absolute constraints (min/max bounds)
- Layout adapts automatically to viewport size changes and orientation (portrait/landscape)
- Users can customize area dimensions and save preferences per device
- Visual hierarchy remains consistent—no stretching or aspect ratio changes

## Capabilities

### New Capabilities
- `flexible-board-layout`: Define game board areas with percentage-based, grid-based, or constraint-based sizing (width/height limits, aspect ratio preservation)
- `responsive-content-scaling`: Scale images and content proportionally within areas without distortion using CSS object-fit and aspect-ratio
- `layout-viewport-adaptation`: Automatically adjust board layout for different viewport sizes and device orientations
- `area-customization`: Allow players to resize and reposition board areas with persistent preferences stored locally

### Modified Capabilities
<!-- No existing capability requirements change with this update -->

## Impact

- **Components Affected**: `CanvasGameBoard.tsx` (main layout), `GameBoardView` or similar (board container), individual area components
- **Styling**: CSS/Tailwind modifications for responsive layout; new CSS Grid or Flexbox patterns
- **State Management**: New layout preferences stored in localStorage or similar
- **No Game Logic Changes**: Layout is purely UI-level, doesn't affect game engine, networking, or game rules
- **Testing**: Responsive layout tests; visual regression tests recommended across different viewport sizes
- **Assets**: Existing card images and graphics work as-is; CSS layout system adapts content to them
