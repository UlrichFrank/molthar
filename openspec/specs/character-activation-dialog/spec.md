## MODIFIED Requirements

### Requirement: Character Activation Dialog Trigger
**MODIFIED**: Now triggered on portal slot click (separate from card-taking). Dialog is only shown when player clicks their own portal slot to activate a character, not when taking a character.

The character activation dialog SHALL be shown when a player clicks a character card in their own portal, allowing them to select cards to pay the cost and activate the character for power points.

#### Scenario: Dialog opens on portal slot click
- **WHEN** player clicks a character slot in their portal
- **THEN** character activation dialog opens showing: character card, cost requirement, player's hand cards for selection, cost validation status

#### Scenario: Dialog does not open on opponent portal
- **WHEN** player clicks an opponent's portal (e.g., OpponentPortals display)
- **THEN** dialog does NOT open, click is ignored

#### Scenario: Dialog only opens for un-activated characters
- **WHEN** player clicks a character slot that is already activated (marked as activated in current turn)
- **THEN** dialog does NOT open, click has no effect

#### Scenario: Dialog allows cost selection
- **WHEN** dialog is open and player clicks cards in their hand
- **THEN** selected cards are highlighted, cost validation status updates in real-time showing if cost is valid

#### Scenario: Player confirms activation
- **WHEN** dialog is open, cost is valid (selected cards satisfy cost), and player clicks "Activate"
- **THEN** game engine executes activatePortalCard(portalSlotIndex, usedCardIndices), character marked as activated, power points awarded, action count increments by 1, dialog closes

#### Scenario: Player cancels activation
- **WHEN** dialog is open and player clicks "Cancel"
- **THEN** dialog closes, no move executed, hand cards unchanged, action count unchanged

### Requirement: Activation Dialog Validation
The dialog SHALL validate the cost in real-time and only enable the "Activate" button when cost is valid.

#### Scenario: Activate button disabled for invalid cost
- **WHEN** selected cards do NOT satisfy the character cost
- **THEN** "Activate" button is disabled (grayed out), showing message like "Invalid Payment"

#### Scenario: Activate button enabled for valid cost
- **WHEN** selected cards DO satisfy the character cost exactly
- **THEN** "Activate" button is enabled, ready to click

#### Scenario: Cost updates on card selection
- **WHEN** player clicks cards in hand to change selection
- **THEN** cost validation updates immediately, button state reflects new validity
