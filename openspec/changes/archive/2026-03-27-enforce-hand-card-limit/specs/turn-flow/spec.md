# Turn Flow Specification - Delta

## MODIFIED Requirements

### Requirement: Hand Limit Enforcement
The system MUST enforce the hand limit at the end of a turn. The hand limit is 5 pearl cards plus 1 additional card for each activated character with a hand-limit-increase modifier. When a player ends their turn with more pearl cards than the current hand limit allows, the system SHALL present a discard dialog to select which cards to remove.

#### Scenario: End turn with too many pearl cards
- **GIVEN** a player finishes the turn with more pearl cards in hand than the current hand limit allows
- **WHEN** the turn reaches hand-limit enforcement
- **THEN** the discard dialog is presented to the player
- AND the player must select the correct number of excess cards to discard
- AND the turn is not considered cleanly finished until the excess cards are removed and discard dialog is confirmed

#### Scenario: Hand limit with character modifiers
- **GIVEN** a player has 2 activated characters with `handLimitPlusOne` ability and 9 pearl cards in hand
- **WHEN** the player ends their turn
- **THEN** the hand limit is calculated as 7 (base 5 + 2 from `handLimitModifier`)
- AND the discard dialog prompts to discard 2 excess cards

#### Scenario: Player cancels discard
- **GIVEN** the discard dialog is open
- **WHEN** the player cancels without confirming discard
- **THEN** the turn end is aborted
- AND the player returns to the game board to take more actions or try again
