## ADDED Requirements

### Requirement: Load card abilities from cards.json
The system SHALL load special ability definitions (red and blue abilities) from each character card in `cards.json` and make them accessible via the GameState.

#### Scenario: Abilities are loaded on card creation
- **WHEN** a character card is loaded from cards.json
- **THEN** the card's abilities array (with id, type, and description) is preserved in the GameState

#### Scenario: Red abilities are accessible
- **WHEN** querying a card's abilities
- **THEN** red abilities are identified as type "red" (instant, single-use abilities)

#### Scenario: Blue abilities are accessible
- **WHEN** querying a card's abilities
- **THEN** blue abilities are identified as type "blue" (persistent, repeated-use abilities)

#### Scenario: Empty ability list is handled
- **WHEN** a card has no abilities defined
- **THEN** the card's abilities array is empty (not null or undefined)

### Requirement: Card ability structure is preserved
The system SHALL preserve the exact structure of ability objects from cards.json without modification or filtering.

#### Scenario: Ability metadata is complete
- **WHEN** an ability is loaded from cards.json
- **THEN** it contains id, type, and description fields exactly as defined in the source data

