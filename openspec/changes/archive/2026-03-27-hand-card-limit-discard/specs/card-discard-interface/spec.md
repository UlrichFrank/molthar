## ADDED Requirements

### Requirement: Discard button visibility and state
The system SHALL display a discard button positioned above the "End Turn" button. The button SHALL be enabled only when the requires-discard flag is true.

#### Scenario: Button hidden when no discard needed
- **WHEN** hand is within the limit
- **THEN** the discard button is disabled or hidden

#### Scenario: Button visible and enabled when discard needed
- **WHEN** hand exceeds the limit after action completion
- **THEN** the discard button is visible and enabled above "End Turn"

#### Scenario: Button state persists during turn
- **WHEN** the requires-discard flag is true
- **THEN** the discard button remains enabled until discard is confirmed or cancelled

### Requirement: Discard dialog presentation
The system SHALL display a modal dialog when the discard button is clicked. The dialog SHALL allow the player to select cards from their hand and confirm or cancel the discard action.

#### Scenario: Dialog opens on button click
- **WHEN** the player clicks the discard button
- **THEN** a modal dialog appears showing all cards currently in hand

#### Scenario: Card selection in dialog
- **WHEN** the discard dialog is open
- **THEN** the player can click/tap on cards to select them for discard (visual feedback indicates selection)

#### Scenario: Selecting enough cards to comply with limit
- **WHEN** the player has selected cards to discard such that remaining cards are within limit
- **THEN** the selection is valid and "Confirm Discard" button is enabled

#### Scenario: Cannot confirm without meeting limit
- **WHEN** the player has selected too few cards to reach the hand limit
- **THEN** the "Confirm Discard" button is disabled or shows validation message

### Requirement: Dialog cancel action
The system SHALL allow the player to cancel the discard dialog without discarding any cards.

#### Scenario: Cancel button closes dialog
- **WHEN** the player clicks "Cancel" in the discard dialog
- **THEN** the dialog closes without modifying the hand

#### Scenario: Discard flag preserved on cancel
- **WHEN** the player cancels the discard dialog and hand still exceeds limit
- **THEN** the requires-discard flag remains true and discard button stays enabled

#### Scenario: Discard flag cleared on cancel
- **WHEN** the player cancels the discard dialog
- **THEN** the player can still click the discard button again to try different card selections

### Requirement: Confirm discard action
The system SHALL remove selected cards from the player's hand and move them to the discard pile when the "Confirm Discard" button is clicked.

#### Scenario: Selected cards removed from hand
- **WHEN** the player confirms discard
- **THEN** the selected cards are immediately removed from the player's hand

#### Scenario: Cards moved to discard pile
- **WHEN** the player confirms discard
- **THEN** the discarded cards are added to the discard pile

#### Scenario: Dialog closes after confirmation
- **WHEN** the player clicks "Confirm Discard" and cards are removed
- **THEN** the dialog closes automatically

#### Scenario: Discard flag cleared after successful discard
- **WHEN** the player confirms discard and hand is within limit
- **THEN** the requires-discard flag is set to false and discard button becomes disabled

### Requirement: Dialog card display
The system SHALL display all cards currently in the player's hand within the discard dialog with clear visual indication of current hand size vs. limit.

#### Scenario: Hand size indicator
- **WHEN** the discard dialog is open
- **THEN** the dialog shows "Hand: X/Y" where X is current hand size and Y is the limit

#### Scenario: Selected card count indicator
- **WHEN** the player has selected cards in the dialog
- **THEN** the dialog shows how many cards are selected for discard
