## MODIFIED Requirements

### Requirement: Display Active Player Indicator
The system SHALL display a text indicator showing which player is currently active and turn context. The indicator format SHALL be "Player X Y/Z" where X is the player number, Y is the current turn number, and Z is the total number of turns. The indicator color SHALL be blue when displaying non-active player information, and standard colors for active player information.

#### Scenario: Player indicator displays on turn start
- **WHEN** a player's turn begins
- **THEN** the indicator updates to show "Player N Y/Z" where N is the current player number, Y is the turn number, and Z is total turns

#### Scenario: Player indicator updates on turn end
- **WHEN** a player ends their turn and the next player becomes active
- **THEN** the indicator updates to display the new active player's number with updated turn information

#### Scenario: Indicator displays blue for non-active players
- **WHEN** the turn indicator is rendered and the local player is not the active player
- **THEN** the indicator background or text color is blue (#3B82F6 or similar)

#### Scenario: Indicator displays standard color for active player
- **WHEN** the turn indicator is rendered and the local player is the active player
- **THEN** the indicator uses standard color styling

#### Scenario: Indicator visibility in multiplayer
- **WHEN** multiple players are in a game
- **THEN** all players see the same turn indicator format and content (consistent game state)

### Requirement: Show Player Order Context
The system SHALL display the player turn order context showing which turn in the sequence is currently happening.

#### Scenario: Turn position is displayed
- **WHEN** the game is in progress
- **THEN** the indicator shows Y/Z format where Y is the current turn and Z is the total expected turns

#### Scenario: Player order is known
- **WHEN** the game is in progress
- **THEN** players can see their position in the turn order through the player number and turn context

## REMOVED Requirements

### Requirement: Display Active Player Indicator (Legacy)
**Reason**: The separate "Player X Active" indicator is redundant. This information is now consolidated into the turn indicator display which shows player ID alongside turn context.
**Migration**: The turn indicator now displays "Player X Y/Z" format which inherently shows which player is active and their turn position. The legacy "Player X Active" component can be removed from the CanvasGameBoard.
