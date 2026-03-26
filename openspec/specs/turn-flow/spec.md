# Turn Flow Specification

## Purpose
Core game setup, per-turn action economy, end-of-turn constraints, and game completion rules for the Molthar web game.

## Requirements

### Requirement: Game Setup
The system SHALL initialize a new game with shuffled pearl and character decks, shared face-up cards, and player state for every seat.

#### Scenario: Start a new match
- GIVEN a new match is created with 2 to 5 players
- WHEN the game state is initialized
- THEN the system creates one player state per seat in play order
- AND each player starts with three pearl cards in hand
- AND the system reveals four pearl cards and two character cards in the central market
- AND the system records a starting player

### Requirement: Three-Action Turn Economy
The system SHALL limit each player turn to three standard actions unless a character ability explicitly modifies that allowance.

#### Scenario: Spend actions during a turn
- GIVEN it is a player's turn
- WHEN the player takes pearls, replaces pearls, places a character, or activates a character
- THEN each such move consumes one action
- AND the player cannot take a fourth standard action in the same turn without an active rule exception

### Requirement: Turn Completion
The system SHALL reset turn-local action usage when a player ends the turn and pass play to the next player in order.

#### Scenario: End the turn
- GIVEN a player has finished the desired actions for the turn
- WHEN the player ends the turn
- THEN the turn action counter resets for the next turn
- AND play advances to the next player in player order

### Requirement: Hand Limit Enforcement
The system MUST enforce the hand limit at the end of a turn.

#### Scenario: End turn with too many pearl cards
- GIVEN a player finishes the turn with more pearl cards in hand than the current hand limit allows
- WHEN the turn reaches hand-limit enforcement
- THEN the player must discard excess pearl cards
- AND the turn is not considered cleanly finished until the excess cards are removed

### Requirement: Final Round and Winner Resolution
The system SHALL trigger the final round once a player reaches at least 12 power points and determine the winner after the final round completes.

#### Scenario: Trigger the final round
- GIVEN no final round is active
- AND a player activates a character and reaches 12 or more power points
- WHEN that activation resolves
- THEN the system marks the game as being in the final round
- AND records which player triggered the final round

#### Scenario: Resolve the winner
- GIVEN the final round has completed
- WHEN the game ends
- THEN the system compares all players by total power points
- AND the player with the highest total wins
- AND a tie MUST be broken by the higher diamond count
