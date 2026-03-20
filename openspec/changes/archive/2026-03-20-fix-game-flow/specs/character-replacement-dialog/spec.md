## MODIFIED Requirements

### Requirement: Character Replacement Dialog Trigger
**MODIFIED**: Changed from manual button-driven to automatic on card take with full portal.

The character replacement dialog SHALL be shown automatically (without user action) when a player attempts to take a character card while their portal is full (2 cards occupied). This is part of the card-taking action, not a separate action.

#### Scenario: Dialog triggers automatically on full portal character take
- **WHEN** player clicks a character card in auslage and portal has 2 cards
- **THEN** replacement dialog opens immediately, showing new card and portal options, no move yet executed

#### Scenario: Dialog does not consume an action
- **WHEN** dialog is open and player selects a replacement
- **THEN** the single takeCharacterCard move (which triggered dialog) is now fully executed with the replacedSlotIndex, action count increments by 1 total (not additional)

#### Scenario: Dialog only shown when portal full
- **WHEN** player clicks character card and portal has < 2 cards (has room)
- **THEN** dialog does NOT appear, character is taken directly to next available portal slot, action count increments by 1

### Requirement: Replacement Dialog UI
The character replacement dialog SHALL present a clear choice between existing portal characters without ambiguity.

#### Scenario: Dialog shows new and existing cards
- **WHEN** dialog is open
- **THEN** display clearly distinguishes new card (coming in) from existing cards (current portal) with labels and positioning

#### Scenario: Player can only replace, not skip
- **WHEN** dialog is open
- **THEN** clicking one of the two existing cards IS the only way to proceed; there is no "keep everything" option or skip button

#### Scenario: Dialog closes after selection
- **WHEN** player selects a slot to replace
- **THEN** dialog closes immediately, game state reflects the change, action count updated
