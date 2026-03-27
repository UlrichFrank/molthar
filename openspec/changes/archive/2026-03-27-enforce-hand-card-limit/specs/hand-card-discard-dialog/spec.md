# Hand Card Discard Dialog Specification

## Purpose
Present a user interface that allows players to select which pearl cards to discard when their hand exceeds the limit at end-of-turn.

## Requirements

### Requirement: Dialog Display
The system SHALL display a dialog when a player ends their turn with more pearl cards than the current hand limit allows.

#### Scenario: Discard dialog appears
- **GIVEN** a player ends their turn with 8 pearl cards and the hand limit is 5
- **WHEN** the end-turn validation detects excess cards
- **THEN** the discard dialog is displayed modally
- AND the dialog blocks further interaction with the game board
- AND the turn cannot advance until the dialog is dismissed

#### Scenario: Dialog shows correct information
- **WHEN** the discard dialog is displayed
- **THEN** it shows the current hand size (8 cards)
- AND it shows the hand limit (5 cards)
- AND it shows the number of excess cards (3 cards)

### Requirement: Card Selection
The system SHALL allow the player to select cards to discard and SHALL validate the selection.

#### Scenario: Select cards for discard
- **GIVEN** the discard dialog is open and hand has 8 cards
- **WHEN** the player clicks on 3 pearl cards to select them
- **THEN** the selected cards are highlighted/marked visually
- AND the discard button shows the count (e.g., "Discard 3 Cards")

#### Scenario: Deselect card
- **GIVEN** the discard dialog has 3 cards selected
- **WHEN** the player clicks on an already-selected card
- **THEN** that card is deselected
- AND the display updates to show the new count

#### Scenario: Card selection shows values
- **WHEN** the discard dialog is displayed
- **THEN** each pearl card displays its value (1-8)
- AND cards with swap symbols display the swap indicator

### Requirement: Discard Confirmation
The system SHALL confirm discard selection and prevent invalid selections.

#### Scenario: Valid discard confirmation
- **GIVEN** the player has selected exactly 3 cards (matching excess count)
- **WHEN** the player clicks the "Confirm Discard" or "Discard" button
- **THEN** the selected cards are removed from the hand
- AND the cards are moved to the discard pile (Ablagestapel)
- AND the dialog closes
- AND the turn completes

#### Scenario: Invalid selection - too few cards
- **GIVEN** the player has selected only 2 cards but needs to discard 3
- **WHEN** the player attempts to click the confirm button
- **THEN** the confirm button is disabled or shows an error
- AND the dialog remains open

#### Scenario: Cancel dialog
- **GIVEN** the discard dialog is open
- **WHEN** the player clicks a cancel button (if provided)
- **THEN** the dialog closes WITHOUT discarding cards
- AND the turn end attempt is rejected
- AND the discard dialog reappears on next turn-end attempt

### Requirement: Visual Feedback
The system SHALL provide clear visual feedback during card selection.

#### Scenario: Selection styling
- **GIVEN** the discard dialog is open
- **WHEN** the player hovers over a card
- **THEN** the card shows a visual hover effect (highlight, outline, or cursor change)

#### Scenario: Confirm button state
- **GIVEN** the dialog is open
- **WHEN** the player has selected the wrong number of cards
- **THEN** the confirm button is visually disabled (grayed out, no-cursor)
- AND when the correct number is selected
- **THEN** the confirm button becomes visually enabled (colored, clickable)
