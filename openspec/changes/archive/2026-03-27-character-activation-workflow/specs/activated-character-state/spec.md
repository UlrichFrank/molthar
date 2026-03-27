## ADDED Requirements

### Requirement: Activated character state reflects removal from portal
The system SHALL ensure that the activated character state correctly represents a card that has been removed from the portal.

#### Scenario: Activated property indicates 180-degree rotation
- **WHEN** a character card has `activated: true`
- **THEN** the card is displayed rotated 180 degrees in the activated characters grid

#### Scenario: Activated characters grid only shows removed cards
- **WHEN** rendering the activated characters section
- **THEN** only cards with `activated: true` and NOT in portal are displayed

### Requirement: ActivatedCharacter interface models the card state correctly
The system SHALL use the ActivatedCharacter interface to track all information needed for an activated card.

#### Scenario: ActivatedCharacter contains card data
- **WHEN** a character card is activated
- **THEN** the ActivatedCharacter contains the full `CharacterCard` object with cost, power points, diamonds, and abilities

#### Scenario: ActivatedCharacter tracks activation state
- **WHEN** a card is activated
- **THEN** `ActivatedCharacter.activated` is `true` and indicates the rotation state

#### Scenario: ActivatedCharacter has unique ID
- **WHEN** a character card is activated
- **THEN** the ActivatedCharacter has a unique ID to distinguish it from the original card in the market

### Requirement: Portal consistency after activation
The system SHALL ensure the portal array remains consistent after card activation.

#### Scenario: Portal array has no null or undefined entries
- **WHEN** a card is activated and removed
- **THEN** the portal array contains no null, undefined, or empty slots

#### Scenario: Portal slot indices are contiguous
- **WHEN** portal has cards removed
- **THEN** remaining cards have indices 0, 1, 2... (no gaps)

### Requirement: Activated character state persists across turns
The system SHALL maintain the activated character state throughout the game.

#### Scenario: Activated card remains active next turn
- **WHEN** a character card is activated in turn 1
- **THEN** it remains in the activated characters grid in turn 2 and beyond

#### Scenario: Multiple cards can be activated
- **WHEN** player activates multiple character cards across turns
- **THEN** all activated cards are displayed in the activated characters grid

