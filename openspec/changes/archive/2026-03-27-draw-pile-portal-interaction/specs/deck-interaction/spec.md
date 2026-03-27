## MODIFIED Requirements

### Requirement: Blind card draw from character deck
The system SHALL allow the player to draw a card from the character deck by clicking on the deck. The drawn card SHALL be selected as if the player had clicked a face-up character card, triggering the same card placement action in the Portal system.

#### Scenario: Click on character deck draws a character
- **WHEN** the player clicks on the character deck during the takingActions phase and the deck has cards remaining
- **THEN** a character card is drawn from the deck and selected for placement in the Portal, equivalent to clicking a face-up character card

#### Scenario: Character deck must have cards to draw
- **WHEN** the player attempts to click on an empty character deck
- **THEN** no action is triggered (deck is not clickable when empty)

#### Scenario: Cannot draw when not in action phase
- **WHEN** the player clicks on the character deck during a non-action phase (e.g., discardingExcessCards or gameFinished)
- **THEN** no action is triggered

### Requirement: Deck click region detection
The system SHALL detect clicks on the character deck region with rectangular hit testing. The deck SHALL have a defined bounding box that captures the visual stack area.

#### Scenario: Hit test identifies character deck clicks
- **WHEN** a click is detected within the character deck bounding box
- **THEN** the hit test returns a hit with type `deck-character`

#### Scenario: Click outside deck region is not detected as deck click
- **WHEN** a click is detected outside the character deck bounding box
- **THEN** the hit test does not return a `deck-character` hit type
