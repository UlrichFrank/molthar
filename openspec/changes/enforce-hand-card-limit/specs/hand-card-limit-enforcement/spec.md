# Hand Card Limit Enforcement Specification

## Purpose
Enforce the maximum number of pearl cards a player can hold at end-of-turn, with modifiers from activated character abilities.

## Requirements

### Requirement: Hand Limit State Storage
The system SHALL store the hand limit modifier in the player's game state (`PlayerState.handLimitModifier`) to track cumulative increases from activated characters.

#### Scenario: Initialize hand limit modifier
- **GIVEN** a new game is created
- **WHEN** players are initialized
- **THEN** each player's `handLimitModifier` is set to 0

#### Scenario: Hand limit modifier persists in game state
- **GIVEN** a player has activated characters that grant hand-limit-increase
- **WHEN** the game state is saved/loaded
- **THEN** the `handLimitModifier` value is preserved accurately

### Requirement: Hand Limit Calculation
The system SHALL calculate the current hand limit as 5 pearl cards plus the value of `player.handLimitModifier` from game state.

#### Scenario: Base hand limit with no modifiers
- **GIVEN** a player has `handLimitModifier = 0`
- **WHEN** hand limit is calculated
- **THEN** the hand limit is 5 pearl cards

#### Scenario: Hand limit with character modifiers
- **GIVEN** a player has `handLimitModifier = 2` from activated characters
- **WHEN** hand limit is calculated
- **THEN** the hand limit is 7 pearl cards (5 base + 2 modifiers)

#### Scenario: Hand limit modifier updated on activation
- **GIVEN** a character with `handLimitPlusOne` ability is activated
- **WHEN** the activation move completes
- **THEN** the player's `handLimitModifier` is incremented by 1

### Requirement: Hand Limit Validation
The system SHALL validate at end-of-turn that the player's hand does not exceed the current hand limit.

#### Scenario: Hand within limit
- **GIVEN** a player has 4 pearl cards in hand and limit is 5
- **WHEN** the player ends their turn
- **THEN** validation passes and turn proceeds normally

#### Scenario: Hand exceeds limit
- **GIVEN** a player has 7 pearl cards in hand and limit is 5
- **WHEN** the player ends their turn
- **THEN** validation fails and the discard dialog is presented
- AND the turn cannot complete until excess cards are discarded

#### Scenario: Hand exactly at limit
- **GIVEN** a player has 5 pearl cards in hand and limit is 5
- **WHEN** the player ends their turn
- **THEN** validation passes and turn proceeds normally

### Requirement: Discard Count Validation
The system SHALL ensure the correct number of excess cards are discarded.

#### Scenario: Correct discard count
- **GIVEN** a player has 8 pearl cards and limit is 5
- **WHEN** the player selects exactly 3 cards to discard
- **THEN** the discard is accepted and the turn completes

#### Scenario: Insufficient discard
- **GIVEN** a player has 8 pearl cards and limit is 5
- **WHEN** the player selects only 2 cards to discard
- **THEN** the system rejects the selection with an error message

#### Scenario: Excess discard selection
- **GIVEN** a player has 8 pearl cards and limit is 5
- **WHEN** the player selects 4 cards to discard
- **THEN** the system rejects the selection with an error message
