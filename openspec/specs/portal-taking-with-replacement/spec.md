## ADDED Requirements

### Requirement: Automatic Portal Replacement Dialog on Full Portal
When player clicks to take a character card and their portal is already full (has 2 characters), the character replacement dialog SHALL appear automatically without consuming an action. The player must select which existing character to replace.

#### Scenario: Portal full - replacement dialog shown on click
- **WHEN** player clicks a character card in the auslage and their portal already has 2 characters
- **THEN** character replacement dialog appears immediately showing: new card, two existing portal cards, option to select which slot to replace, no move executed yet, action count unchanged

#### Scenario: Player selects replacement slot
- **WHEN** replacement dialog is open and player selects a portal slot to replace
- **THEN** game engine executes takeCharacterCard(slotIndex, replacedSlotIndex), new character added to portal at selected slot, old character moved to discard pile, action count increments by 1, dialog closes

#### Scenario: Player cancels replacement dialog
- **WHEN** replacement dialog is open and player clicks "Cancel" button
- **THEN** dialog closes without executing any move, character card remains in auslage, action count unchanged, game state unchanged

#### Scenario: Cannot take character with full portal without replacement
- **WHEN** player's portal is full and they click a character card
- **THEN** character is NOT immediately added to portal; replacement dialog MUST be shown first

### Requirement: Portal Replacement Dialog Properties
The character replacement dialog SHALL show both the new card being taken and the two existing portal cards, allowing the player to make an informed replacement decision.

#### Scenario: Dialog shows all three cards
- **WHEN** replacement dialog is open
- **THEN** display shows: (1) new character card image/name at top, (2) existing portal character 1 with "Replace?" button, (3) existing portal character 2 with "Replace?" button

#### Scenario: Dialog shows card details
- **WHEN** replacement dialog is open
- **THEN** each card displayed shows: card image/name, power points, any relevant abilities or special symbols

#### Scenario: Dialog prevents ambiguous selection
- **WHEN** replacement dialog is open
- **THEN** clicking a slot button is the ONLY way to proceed; accidental double-clicks or rapid clicks do not execute multiple replacements
