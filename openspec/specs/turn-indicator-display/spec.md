# turn-indicator-display Specification

## Purpose
TBD - created by archiving change turn-action-counter-display. Update Purpose after archive.
## Requirements
### Requirement: Display Active Player Indicator
The system SHALL display a text indicator showing which player is currently active (e.g., "Player 1 Active") positioned at the bottom-left of the game board.

#### Scenario: Player indicator displays on turn start
- **WHEN** a player's turn begins
- **THEN** the indicator updates to show "Player N Active" where N is the current player number

#### Scenario: Player indicator updates on turn end
- **WHEN** a player ends their turn and the next player becomes active
- **THEN** the indicator updates to display the new active player's number

#### Scenario: Indicator visibility in multiplayer
- **WHEN** multiple players are in a game
- **THEN** all players see the same active player indicator (consistent game state)

### Requirement: Show Player Order Context
The system SHALL display or reference the player turn order so players understand the sequence.

#### Scenario: Player order is known
- **WHEN** the game is in progress
- **THEN** players can see or infer their position in the turn order

