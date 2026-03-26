## ADDED Requirements

### Requirement: Hand card limit calculation
The system SHALL calculate the maximum allowed hand size as 5 base cards plus any bonus hand capacity granted by active character cards.

#### Scenario: Base hand limit with no active characters
- **WHEN** the player has no active character cards
- **THEN** the maximum hand size is 5 cards

#### Scenario: Hand limit with active character cards
- **WHEN** the player has active character cards that grant +2 bonus hand capacity
- **THEN** the maximum hand size is 7 cards (5 base + 2 bonus)

### Requirement: Hand limit check after action completion
The system SHALL check whether the current hand card count exceeds the maximum allowed size immediately after all player actions are completed.

#### Scenario: Hand within limit after actions
- **WHEN** all player actions are complete and hand contains 4 cards (within 5-card limit)
- **THEN** no discard flow is triggered

#### Scenario: Hand exceeds limit after actions
- **WHEN** all player actions are complete and hand contains 8 cards with a 7-card limit
- **THEN** the discard requirement is triggered and the requires-discard flag is set to true

#### Scenario: Hand exactly at limit
- **WHEN** all player actions are complete and hand contains 5 cards (exactly at 5-card limit)
- **THEN** no discard flow is triggered

### Requirement: Discard requirement state tracking
The system SHALL maintain a game state flag (requires-discard) that tracks whether the player must discard cards to comply with hand limits.

#### Scenario: Flag set when limit exceeded
- **WHEN** hand size exceeds the limit after action completion
- **THEN** the requires-discard flag is set to true

#### Scenario: Flag cleared after successful discard
- **WHEN** player confirms discard of cards and hand returns to within limit
- **THEN** the requires-discard flag is set to false

#### Scenario: Flag cleared after discard cancellation
- **WHEN** player cancels the discard dialog without discarding cards
- **THEN** the requires-discard flag is set to false (allowing turn to end)

### Requirement: Turn end prevention when discard required
The system SHALL not allow the player to end their turn when the requires-discard flag is true and hand still exceeds the limit.

#### Scenario: Cannot end turn while requiring discard
- **WHEN** hand exceeds limit and requires-discard flag is true
- **THEN** the "End Turn" button is disabled or discard must occur first

#### Scenario: Can end turn after discard completes
- **WHEN** player has discarded cards and hand is within limit
- **THEN** the "End Turn" button is enabled
