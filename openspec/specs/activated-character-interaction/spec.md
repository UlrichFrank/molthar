## ADDED Requirements

### Requirement: Grid card click detection
The system SHALL detect clicks on activated character cards in the grid and trigger the detail view modal. Each grid card SHALL have a clickable hit region corresponding to its visual position and size.

#### Scenario: Click on grid card opens detail view
- **WHEN** a player clicks on an activated character card in the grid
- **THEN** the detail view modal opens for that card

#### Scenario: Hit test detects grid card positions
- **WHEN** the canvas is rendered with activated characters grid
- **THEN** hit testing is performed for each grid card's bounding box (50% size, rotated)
- **AND** clicking within a card's bounding box triggers the detail view

#### Scenario: Clicks outside grid are not detected as grid clicks
- **WHEN** a click is detected outside the activated characters grid area
- **THEN** no grid card interaction is triggered

### Requirement: Modal interaction handling
The system SHALL handle clicks on the detail view modal to close it, including clicks on the card itself and on the background overlay.

#### Scenario: Click on card image closes modal
- **WHEN** the detail view is displayed and player clicks the card image
- **THEN** a click event is detected and the modal closes

#### Scenario: Click on overlay closes modal
- **WHEN** the detail view is displayed and player clicks the semi-transparent background
- **THEN** the click is detected and the modal closes

#### Scenario: Escape key closes modal
- **WHEN** the detail view modal is open and player presses Escape
- **THEN** a keyboard event is detected and the modal closes

### Requirement: Modal state management
The activated character detail view state SHALL be managed at the appropriate level (component state) and persist only while the modal is visible.

#### Scenario: Modal state initialized as closed
- **WHEN** the game board loads
- **THEN** no detail view modal is displayed (closed state)

#### Scenario: Modal state updates on card click
- **WHEN** a grid card is clicked
- **THEN** the modal state updates to open with the selected card's ID

#### Scenario: Modal state reverts to closed on dismiss
- **WHEN** the modal is dismissed (click or Escape)
- **THEN** the state updates back to closed and the modal disappears
