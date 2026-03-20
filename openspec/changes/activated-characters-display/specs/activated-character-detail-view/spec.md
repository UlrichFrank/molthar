## ADDED Requirements

### Requirement: Detail view modal display
When a player clicks on an activated character card in the grid, the system SHALL display an enlarged detail view of that card in a centered modal. The detail view SHALL show the full-sized character card and fit entirely within the viewport without requiring scrolling.

#### Scenario: Detail view opens on card click
- **WHEN** a player clicks on an activated character card in the grid
- **THEN** a centered modal appears displaying the selected character card enlarged to full size
- **AND** the modal is positioned in the center of the screen/viewport

#### Scenario: Detail view content fits without scroll
- **WHEN** the detail view modal is displayed
- **THEN** the entire card image and any accompanying stats/text fit within the viewport
- **AND** no scrolling is required to view the full content

#### Scenario: Detail view shows card details
- **WHEN** the detail view is displayed
- **THEN** the character card image is shown at full size
- **AND** relevant card information (name, power points, cost, abilities) is visible

### Requirement: Modal dismissal
The detail view modal SHALL close when the player clicks the card or anywhere on the modal, returning focus to the main game board.

#### Scenario: Modal closes on card click
- **WHEN** a player clicks on the displayed card in the detail view
- **THEN** the modal closes and returns to the main board view

#### Scenario: Modal closes on background click
- **WHEN** a player clicks on the modal background (outside the card)
- **THEN** the modal closes and returns to the main board view

#### Scenario: Keyboard escape closes modal
- **WHEN** the player presses the Escape key while the detail view is open
- **THEN** the modal closes and returns to the main board view

### Requirement: Modal styling and appearance
The detail view modal SHALL have a semi-transparent background overlay, clear card focus, and be visually distinct from the main board.

#### Scenario: Modal background is semi-transparent
- **WHEN** the detail view is open
- **THEN** the area outside the card is covered with a semi-transparent dark overlay (e.g., rgba(0,0,0,0.5))
