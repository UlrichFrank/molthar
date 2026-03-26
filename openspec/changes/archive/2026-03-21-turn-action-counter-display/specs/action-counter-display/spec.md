## ADDED Requirements

### Requirement: Display Action Counter
The system SHALL display the current action count and maximum action count for the active player in the format "Actions: N/M" at the bottom-left of the game board.

#### Scenario: Action counter shows current actions
- **WHEN** a player's turn begins with 3 base actions
- **THEN** the counter displays "Actions: 3/3"

#### Scenario: Action counter decrements on action consumption
- **WHEN** a player takes an action (card play, activation)
- **THEN** the counter immediately updates to show remaining actions (e.g., "Actions: 2/3")

#### Scenario: Counter reaches zero
- **WHEN** all actions are consumed
- **THEN** the counter displays "Actions: 0/3" and the End Turn button becomes the only available action

### Requirement: Visual Feedback for Action State
The system SHALL use color coding to indicate action availability: green for normal state, yellow when actions are increased, red when at limit.

#### Scenario: Normal state (actions available)
- **WHEN** a player has remaining actions
- **THEN** the counter displays in green

#### Scenario: Action limit reached
- **WHEN** a player has used all available actions
- **THEN** the counter displays in red to warn that actions are exhausted

#### Scenario: Bonus actions granted
- **WHEN** a character ability grants bonus actions
- **THEN** the counter displays in yellow and updates to show new maximum

### Requirement: Numeric Precision
The system SHALL always display exact action counts to avoid player confusion.

#### Scenario: Exact count displayed
- **WHEN** a player has 1 remaining action
- **THEN** the counter shows "Actions: 1/3" (not approximations or icons)
