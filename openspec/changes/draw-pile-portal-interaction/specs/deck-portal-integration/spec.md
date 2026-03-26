## ADDED Requirements

### Requirement: Character deck portal card draw
The system SHALL treat a blind card drawn from the character deck identically to clicking a face-up character card. The drawn card SHALL be selected and placed in the Portal through the same action flow.

#### Scenario: Deck draw triggers portal selection
- **WHEN** the player clicks on the character deck during the takingActions phase and the deck has cards remaining
- **THEN** the top card from the character deck is selected and the Portal action flow is triggered, equivalent to clicking a face-up character card

#### Scenario: Deck draw selects top card
- **WHEN** a character card is drawn from the deck
- **THEN** the card selected is the top card of the `characterDeck` array (index 0)

#### Scenario: Deck draw respects phase gating
- **WHEN** the player clicks on the character deck during a non-action phase (e.g., discardingExcessCards, gameFinished)
- **THEN** no card is drawn and no Portal action is triggered

### Requirement: Character deck portal integration with Portal slots
The system SHALL ensure that cards drawn from the character deck fill Portal slots identically to cards selected from face-up display cards.

#### Scenario: Portal slots accept deck-drawn cards
- **WHEN** a character card is drawn from the deck and placed in the Portal
- **THEN** the Portal slot is populated and rendered the same as if selected from face-up cards

#### Scenario: Multiple deck selections allowed
- **WHEN** the player draws multiple cards from the deck during the same takingActions phase
- **THEN** each draw fills the next available Portal slot until Portal is full or deck is empty
