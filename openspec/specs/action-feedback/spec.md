## ADDED Requirements

### Requirement: Action Counter Display
The system SHALL display the current action count and maximum (e.g., "Actions: 2/3") prominently on the game board so players know how many actions remain in their turn.

#### Scenario: Action counter shows 0/3 at start of turn
- **WHEN** player's turn begins (phase = takingActions, actionCount reset to 0)
- **THEN** game board displays "Actions: 0/3" or equivalent counter, clearly visible

#### Scenario: Action counter updates on card take
- **WHEN** player clicks a card and move is executed
- **THEN** action counter immediately updates (e.g., 0/3 → 1/3), visual refresh is immediate

#### Scenario: Counter shows visual limit reached at 3/3
- **WHEN** actionCount reaches 3
- **THEN** action counter displays "Actions: 3/3" with visual styling (e.g., red/orange highlight) to indicate limit reached

#### Scenario: Counter styling changes when limited
- **WHEN** actionCount >= 3
- **THEN** card slots in auslage show disabled appearance (faded, non-clickable) to reinforce that no more actions available

### Requirement: Move Validation Feedback
The system SHALL provide clear feedback when a card click fails validation (hand full, action limit, etc.) without executing a move.

#### Scenario: Hand full - move rejected silently
- **WHEN** player clicks a pearl card but hand already has 5 cards
- **THEN** no move is executed, card remains in auslage, action count unchanged, no error dialog shown (game rules prevent this scenario naturally)

#### Scenario: Action limit - click disabled
- **WHEN** actionCount >= 3 and player attempts to click a card
- **THEN** click has no effect, move not dispatched, UI shows disabled state

### Requirement: Real-time Game State Reflection
The system SHALL reflect all game state changes immediately in the UI without any pending selections or intermediate states.

#### Scenario: Card disappears immediately on take
- **WHEN** player clicks a pearl card in the auslage
- **THEN** within ~50ms, card is no longer visible in auslage slot, hand count updates, action counter updates

#### Scenario: Portal display updates on character take
- **WHEN** player clicks a character card and it's added to portal
- **THEN** within ~50ms, portal slot displays new character, portal character count updates

#### Scenario: No ghost selections
- **WHEN** any move is executed
- **THEN** no cards remain highlighted/selected from previous interactions, UI shows only actual game state
