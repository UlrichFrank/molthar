## ADDED Requirements

### Requirement: Define board areas using CSS Grid with flexible sizing
Game board areas (player hands, deck, face-up cards, opponent indicators) SHALL be laid out using CSS Grid with support for percentage widths, CSS `fr` units, min/max constraints, and aspect-ratio preservation.

#### Scenario: Area sized using CSS Grid fr units
- **WHEN** an area is defined with `grid-column: span 3 / 12` (3 of 12 columns)
- **THEN** the area occupies 25% of the grid width (3÷12)
- **AND** resizing the parent container adjusts the area proportionally
- **AND** the layout remains stable without horizontal scroll

#### Scenario: Area sized with percentage-based width and height
- **WHEN** an area is configured with `width: 35%` and `height: 40%`
- **THEN** the area occupies 35% of parent width and 40% of parent height
- **AND** resizing the parent automatically adjusts the area's dimensions
- **AND** no content overflow or clipping occurs

#### Scenario: Area with maximum width constraint
- **WHEN** an area specifies `max-width: 300px` and `width: 50%`
- **THEN** the area width is min(50% of parent, 300px)
- **AND** on screens where 50% would exceed 300px, it caps at 300px
- **AND** on smaller screens, the area remains flexible within the constraint

#### Scenario: Area maintains aspect ratio
- **WHEN** an area is configured with `aspect-ratio: 1.5` (16:9 equivalent)
- **THEN** resizing the parent maintains the 1.5:1 ratio automatically
- **AND** the area grows/shrinks proportionally without distortion

### Requirement: Support Flexbox layout within areas
Content within board areas (cards, icons, text) SHALL use Flexbox for alignment and spacing, enabling responsive item distribution.

#### Scenario: Card items wrap to new line on small screens
- **WHEN** a player hand contains 7 cards in a flex container with `flex-wrap: wrap`
- **AND** viewport width decreases below 600px
- **THEN** cards wrap to multiple rows
- **AND** each card maintains its size and aspect ratio
- **AND** spacing between cards adapts proportionally

#### Scenario: Flex items distribute space evenly
- **WHEN** action buttons are in a flex container with `justify-content: space-around`
- **AND** viewport width changes
- **THEN** buttons remain evenly distributed across available space
- **AND** buttons never overlap or get hidden

### Requirement: Load default layout for viewport size
The system SHALL apply pre-optimized layout presets based on the device viewport size (mobile, tablet, desktop).

#### Scenario: Mobile portrait layout loads automatically
- **WHEN** viewport width ≤ 640px and height > width
- **THEN** the system loads mobile-portrait layout preset
- **AND** player hand displays full width at bottom
- **AND** face-up cards displayed above with 60% height
- **AND** deck and opponents fit in remaining space

#### Scenario: Tablet landscape layout loads automatically
- **WHEN** viewport width 768-1024px and width > height
- **THEN** the system loads tablet-landscape preset
- **AND** player hand uses 25-30% width on left side
- **AND** face-up cards occupy center 50% of width
- **AND** deck and opponents use remaining space

#### Scenario: Desktop layout loads automatically
- **WHEN** viewport width > 1024px
- **THEN** the system loads desktop preset
- **AND** full game board visible with optimal spacing
- **AND** player hand width 20-25% with plenty of margin
- **AND** face-up cards fill 50-60% of width

#### Scenario: Layout updates on viewport resize
- **WHEN** viewport is resized (e.g., window dragged on desktop or device rotated)
- **THEN** the layout automatically switches to appropriate preset
- **AND** transition happens smoothly within 300ms
- **AND** game state is preserved (no loss of card position or turn info)
