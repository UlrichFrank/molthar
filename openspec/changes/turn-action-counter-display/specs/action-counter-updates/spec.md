## ADDED Requirements

### Requirement: Real-time Counter Updates
The system SHALL update the action counter in real-time whenever actions are consumed or the maximum changes.

#### Scenario: Counter updates immediately on action
- **WHEN** a player takes an action
- **THEN** the counter updates within 100ms to reflect remaining actions

#### Scenario: Counter updates on ability bonus
- **WHEN** a character ability grants bonus actions to the current player
- **THEN** the counter updates to show the new maximum (e.g., "Actions: 2/4")

#### Scenario: Counter updates on ability activation
- **WHEN** the active player activates a character ability that increases action count
- **THEN** the counter recalculates and displays the updated maximum

### Requirement: Action Consumption Tracking
The system SHALL correctly track and display the number of actions consumed during the current turn.

#### Scenario: Action consumed by card play
- **WHEN** a player plays or takes a card from the marketplace
- **THEN** the action counter decrements by 1

#### Scenario: Action consumed by ability activation
- **WHEN** a player activates a character ability from their portal
- **THEN** the action counter decrements by 1

#### Scenario: No action consumed by invalid action
- **WHEN** a player attempts an invalid action (e.g., exceeds action limit)
- **THEN** the counter does not change

### Requirement: Bonus Action Persistence
The system SHALL maintain bonus actions for the duration of the turn and reset on turn end.

#### Scenario: Bonus actions last through turn
- **WHEN** a player receives bonus actions mid-turn
- **THEN** the bonus actions remain available for the rest of that turn

#### Scenario: Bonus actions reset on turn end
- **WHEN** a player's turn ends
- **THEN** the next player's counter resets to base actions (3) with no carried-over bonuses
