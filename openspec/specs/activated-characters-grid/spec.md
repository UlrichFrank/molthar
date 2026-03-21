## ADDED Requirements

### Requirement: Activated characters grid display
The system SHALL render all activated character cards in a 3×4 grid (12 maximum visible cards) positioned to the right of the player portal. Each card SHALL be displayed at 50% of standard card size and rotated 180°.

#### Scenario: Grid renders with activated cards
- **WHEN** the game board is displayed and the player has activated characters
- **THEN** a 3×4 grid is shown to the right of the portal containing all activated character cards at 50% size and rotated 180°

#### Scenario: Grid empty when no activated characters
- **WHEN** the player has no activated characters
- **THEN** the grid area is not displayed or shows as empty

#### Scenario: Grid caps at 12 visible cards
- **WHEN** a player has activated more than 12 characters (hypothetically)
- **THEN** only the first 12 are displayed in the grid; additional cards are not shown (or handled per implementation decision)

### Requirement: Grid layout spacing
The activated characters grid SHALL use consistent spacing between cards. Cards are arranged in 3 rows and 4 columns with equal gaps and padding.

#### Scenario: Cards positioned in grid correctly
- **WHEN** the grid is rendered
- **THEN** each card occupies a specific grid cell with consistent horizontal and vertical spacing (padding/gap)

#### Scenario: Grid positioned right of portal
- **WHEN** the game board is rendered
- **THEN** the grid's left edge is positioned at PORTAL_X + PORTAL_W + margin (right side of the portal)
- **AND** the grid's top edge aligns with the portal's top edge (PORTAL_Y)

### Requirement: Card rotation
Each activated character card in the grid SHALL be rotated 180° to visually distinguish them from inactive (portal) cards.

#### Scenario: Card rotated 180 degrees
- **WHEN** an activated character card is rendered in the grid
- **THEN** the card image is rotated 180° clockwise around its center point
