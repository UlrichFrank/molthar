## ADDED Requirements

### Requirement: Character card lifecycle from market to portal
The system SHALL track the journey of a character card from the market (Auslage) to the player's portal.

#### Scenario: Card taken from market to portal
- **WHEN** player takes a character card from the market
- **THEN** the card is added to `player.portal` array with `activated: false`

#### Scenario: Card location is mutually exclusive
- **WHEN** a character card is in the player's portal with `activated: false`
- **THEN** it cannot simultaneously appear in the activated characters section

### Requirement: Character card lifecycle from portal to activated
The system SHALL track the journey of a character card from the player's portal to the activated characters section.

#### Scenario: Card activated from portal
- **WHEN** player activates a character card from their portal
- **THEN** the card's `activated` property changes to `true`

#### Scenario: Card removed from portal when activated
- **WHEN** a character card is activated (activated = true)
- **THEN** the card is removed from the `player.portal` array

#### Scenario: Activated card location is exclusive
- **WHEN** a character card is activated (activated = true)
- **THEN** it no longer exists in the `player.portal` array

### Requirement: Portal maintains correct card count
The system SHALL ensure the portal array accurately reflects the number of inactive cards.

#### Scenario: Portal slot becomes empty after activation
- **WHEN** player activates the card in portal slot 0
- **THEN** portal array length decreases by 1 and the slot is removed (not left as null)

#### Scenario: Player can take new card after activation
- **WHEN** player has activated a portal card, freeing up space
- **THEN** they can immediately take a new character card from the market

