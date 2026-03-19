## ADDED Requirements

### Requirement: Detect viewport size and apply appropriate layout preset
The system SHALL automatically detect viewport dimensions (mobile, tablet, desktop) and apply layout presets optimized for each size category.

#### Scenario: Mobile portrait viewport detected
- **WHEN** viewport width ≤ 640px and height > width
- **THEN** system detects mobile-portrait orientation
- **AND** applies mobile-portrait layout preset automatically
- **AND** player hand displays at bottom with 50-60% height
- **AND** face-up cards display at top with 30-40% height
- **AND** opponent indicators and deck fit in available space

#### Scenario: Mobile landscape viewport detected
- **WHEN** viewport width 640-1024px and width > height
- **THEN** system detects mobile-landscape orientation
- **AND** applies mobile-landscape layout preset
- **AND** player hand displays on right side with 30% width
- **AND** face-up cards occupy center 50-60% of width
- **AND** layout is optimized for thumb-reachable controls

#### Scenario: Tablet viewport detected
- **WHEN** viewport width 768-1024px
- **THEN** system detects tablet layout
- **AND** applies tablet-optimized preset with balanced spacing
- **AND** player hand uses 25-30% of width
- **AND** face-up cards use 50-60% of width
- **AND** deck and opponents fit in remaining space

#### Scenario: Desktop viewport detected
- **WHEN** viewport width > 1024px
- **THEN** system detects desktop layout
- **AND** applies desktop preset with ample spacing
- **AND** all areas are fully visible without scrolling
- **AND** maximum readability and interactivity

### Requirement: Update layout when viewport size changes
The system SHALL automatically refresh the board layout when viewport is resized, without requiring user intervention or causing game disruption.

#### Scenario: Window resize triggers layout update
- **WHEN** user resizes desktop browser window from 1920px to 800px width
- **THEN** layout automatically transitions to tablet preset within 300ms
- **AND** game state is preserved (no loss of cards, players, or turn info)
- **AND** transition is smooth with no flickering

#### Scenario: Device orientation change triggers layout update
- **WHEN** user rotates mobile device from portrait to landscape
- **THEN** layout automatically rotates and transitions to landscape preset
- **AND** game continues without interruption
- **AND** all content remains visible and accessible

#### Scenario: No layout thrashing during resize
- **WHEN** user is actively dragging window edge to resize (continuous resize)
- **THEN** layout transitions smoothly without jank or stuttering
- **AND** performance remains above 30 FPS during resize
- **AND** game remains playable during and after resize

### Requirement: Provide responsive layout presets for common devices
The system SHALL include pre-configured layout presets optimized for common device types and viewport sizes.

#### Scenario: iPhone preset applied
- **WHEN** viewport dimensions match typical iPhone (375-430px width, portrait)
- **THEN** hand displays full width at bottom
- **AND** face-up cards display above with optimal size for thumb reach
- **AND** opponent names stacked vertically on left/right edges

#### Scenario: iPad preset applied
- **WHEN** viewport dimensions match tablet (768-1024px)
- **THEN** layout distributes space evenly
- **AND** hand uses 25% width on right, face-up cards use 50% center, deck on left
- **AND** player can see entire board without scrolling

#### Scenario: Desktop preset applied
- **WHEN** viewport width > 1024px
- **THEN** layout uses generous margins and spacing
- **AND** all elements optimally sized for mouse/keyboard interaction
- **AND** full visual clarity with no crowding

### Requirement: Use CSS media queries for layout breakpoints
The system SHALL use CSS media queries (Tailwind breakpoints or custom) to define layout switching points.

#### Scenario: Tailwind sm breakpoint (640px) triggers layout change
- **WHEN** viewport width crosses 640px threshold
- **THEN** CSS `@media (min-width: 640px)` rules are applied
- **AND** layout transitions to tablet/landscape preset
- **AND** all flex and grid properties update accordingly

#### Scenario: Tailwind md breakpoint (768px) triggers layout change
- **WHEN** viewport width crosses 768px threshold
- **THEN** layout transitions to optimized tablet preset
- **AND** all area sizing rules update
- **AND** all content remains accessible without overflow

#### Scenario: Tailwind lg breakpoint (1024px) triggers layout change
- **WHEN** viewport width crosses 1024px threshold
- **THEN** layout transitions to desktop preset
- **AND** full spacing and margins applied
- **AND** maximum visual clarity achieved
