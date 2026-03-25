## ADDED Requirements

### Requirement: Visual distinction for non-active player indicator
The turn indicator SHALL display with blue color styling when the indicator is showing information about a non-active player, providing clear visual feedback that the current viewing context is a different player's turn.

#### Scenario: Non-active player indicator is blue
- **WHEN** the turn indicator is displayed for a non-active player
- **THEN** the indicator background or text color is blue (e.g., #3B82F6)

#### Scenario: Active player indicator uses default color
- **WHEN** the turn indicator is displayed for the active player
- **THEN** the indicator uses the default/standard color styling

### Requirement: Player ID display in turn indicator
The turn indicator SHALL display the player ID (player name/number) along with the turn position, showing the format "Player X Y/Z" where X is the player identifier, Y is the current turn number, and Z is the total number of turns.

#### Scenario: Non-active player indicator shows player ID
- **WHEN** the turn indicator displays for a non-active player
- **THEN** the text reads "Player X Y/Z" (e.g., "Player 2 1/3")

#### Scenario: Active player indicator shows player ID
- **WHEN** the turn indicator displays for the active player
- **THEN** the text reads "Player X Y/Z" (e.g., "Player 1 1/3")

### Requirement: Player ID source
The system SHALL receive the player ID from the parent component through props, allowing clear identification of which player the indicator refers to.

#### Scenario: Component receives playerName or playerID
- **WHEN** TurnIndicatorDisplay component is rendered
- **THEN** it receives a prop containing the player name or ID
- **AND** this information is incorporated into the displayed text
