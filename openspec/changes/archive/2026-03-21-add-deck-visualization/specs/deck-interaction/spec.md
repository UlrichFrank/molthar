## ADDED Requirements

### Requirement: Blind card draw from character deck
The system SHALL allow the player to draw a card from the character deck by clicking on the deck. The drawn card SHALL be selected as if the player had clicked a face-up character card, triggering the same card placement action.

#### Scenario: Click on character deck draws a character
- **WHEN** the player clicks on the character deck during the takingActions phase
- **THEN** a character card is drawn from the deck and selected for placement (equivalent to clicking a face-up character card)

#### Scenario: Character deck must have cards to draw
- **WHEN** the player attempts to click on an empty character deck
- **THEN** no action is triggered (deck is not clickable when empty)

#### Scenario: Cannot draw when not in action phase
- **WHEN** the player clicks on the character deck during a non-action phase (e.g., discardingExcessCards or gameFinished)
- **THEN** no action is triggered

### Requirement: Blind card draw from pearl deck
The system SHALL allow the player to draw a card from the pearl deck by clicking on the deck. The drawn card SHALL be selected as if the player had clicked a face-up pearl card, triggering the same card taking action.

#### Scenario: Click on pearl deck draws a pearl
- **WHEN** the player clicks on the pearl deck during the takingActions phase
- **THEN** a pearl card is drawn from the deck and selected for taking (equivalent to clicking a face-up pearl card)

#### Scenario: Pearl deck must have cards to draw
- **WHEN** the player attempts to click on an empty pearl deck
- **THEN** no action is triggered (deck is not clickable when empty)

#### Scenario: Cannot draw when not in action phase
- **WHEN** the player clicks on the pearl deck during a non-action phase
- **THEN** no action is triggered

### Requirement: Deck click region detection
The system SHALL detect clicks on the character and pearl deck regions with rectangular hit testing. Each deck SHALL have a defined bounding box that captures the visual stack area.

#### Scenario: Hit test identifies character deck clicks
- **WHEN** a click is detected within the character deck bounding box
- **THEN** the hit test returns a hit with type `deck-character`

#### Scenario: Hit test identifies pearl deck clicks
- **WHEN** a click is detected within the pearl deck bounding box
- **THEN** the hit test returns a hit with type `deck-pearl`

#### Scenario: Click outside deck regions is not detected as deck click
- **WHEN** a click is detected outside both deck bounding boxes
- **THEN** the hit test does not return a deck hit type
