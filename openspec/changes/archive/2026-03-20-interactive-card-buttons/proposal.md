## Why

Currently, cards in the game board display area are static and don't provide clear visual feedback when players interact with them. Players need intuitive, button-like behavior for cards to make gameplay more discoverable and feel more responsive. Adding hover effects (card elevation) and click-to-select functionality makes the UI feel modern and improves user experience.

## What Changes

- Cards in the face-up display area (Auslage) become interactive buttons
- Hover effect: Cards slightly elevate/lift when mouse hovers over them (visual feedback)
- Click effect: Cards can be selected/taken through mouse click interaction
- Selected cards show visual indication (highlight, glow, or border)
- Touch support: Cards respond to touch on mobile devices (tactile feedback)
- Cursor changes to pointer on hover to indicate interactivity
- Smooth animations for hover/elevation transitions (no jarring jumps)
- Disabled state: Cards can be disabled to prevent selection when appropriate

## Capabilities

### New Capabilities
- `interactive-card-buttons`: Cards in face-up display behave as interactive buttons with hover/click states
- `card-elevation-effect`: Hover effect that visually lifts cards when mouse moves over them
- `card-selection-feedback`: Visual feedback indicating card is selected (highlight, glow, border)
- `touch-card-interaction`: Touch support for selecting cards on mobile/tablet devices

### Modified Capabilities
<!-- No existing capabilities are modified; this is additive functionality -->

## Impact

- **Components Affected**: CanvasGameBoard.tsx (card rendering), game hit-test and event system
- **CSS/Styling**: New card button styles, hover effects, transitions, accessibility focus states
- **User Interaction**: Cards now respond to mouse hover, clicks, and touch events
- **Accessibility**: Focus states for keyboard navigation, screen reader support
- **No Game Logic Changes**: Game engine unaffected; only UI/interaction layer
- **Browser APIs**: Uses standard CSS hover, pointer events, and touch events
- **Performance**: Minimal impact (CSS-based animations are GPU-accelerated)
- **Mobile/Touch**: Fully supported without additional complexity
