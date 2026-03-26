## ADDED Requirements

### Requirement: Direct Pearl Card Taking
The system SHALL take a pearl card from the auslage to the player's hand immediately upon click, without any selection step or confirmation dialog.

#### Scenario: Click pearl card → card taken to hand
- **WHEN** player clicks a pearl card in the auslage (face-up slots 2-3)
- **THEN** game engine executes takePearlCard(slotIndex), card is removed from auslage and added to hand, action count increments by 1

#### Scenario: Click pearl card with full hand
- **WHEN** player clicks a pearl card but hand already has 5 cards (hand limit reached)
- **THEN** game engine rejects the move silently, no cards taken, no action consumed, UI reflects game state unchanged

#### Scenario: No more actions available
- **WHEN** action count >= 3 (player already took 3 actions this turn)
- **THEN** pearl cards in auslage are not clickable/highlighted, click has no effect

### Requirement: Direct Character Card Taking
The system SHALL take a character card from the auslage to the player's portal immediately upon click. If the portal has space (< 2 cards), card is added directly. If portal is full (2 cards), the character replacement dialog is shown instead.

#### Scenario: Click character with empty portal
- **WHEN** player clicks a character card in the auslage (face-up slots 0-1) and portal is empty
- **THEN** game engine executes takeCharacterCard(slotIndex), card is removed from auslage and added to portal slot 0, action count increments by 1

#### Scenario: Click character with 1 card in portal
- **WHEN** player clicks a character card in the auslage and portal has exactly 1 card
- **THEN** game engine executes takeCharacterCard(slotIndex), card is removed from auslage and added to portal slot 1, action count increments by 1

#### Scenario: Click character with full portal
- **WHEN** player clicks a character card in the auslage and portal already has 2 cards (full)
- **THEN** character replacement dialog is shown with the new card and existing portal cards, no move executed yet, action count unchanged

### Requirement: No Selection State
The system SHALL NOT maintain a selection state (selectedPearl, selectedCharacter, selectedHandIndices) in the UI component. All card interactions are immediate and dispatch moves directly.

#### Scenario: Click multiple cards in one action
- **WHEN** player clicks card A, then immediately clicks card B before first click resolves
- **THEN** first click is processed (move dispatched), second click is processed only if actionCount < 3 after first move

#### Scenario: No visual selection highlighting
- **WHEN** player hovers over or clicks a card
- **THEN** card is NOT visually highlighted/selected; no selection feedback is shown

### Requirement: Action Count >= 3 Blocking
The system SHALL prevent any card clicks from dispatching moves when action count has reached 3 (all actions for the turn consumed).

#### Scenario: Click blocked at action limit
- **WHEN** actionCount == 3 and player clicks any card in auslage
- **THEN** click has no effect, move is not dispatched, card is not taken

#### Scenario: Visual feedback for action limit
- **WHEN** actionCount == 3
- **THEN** game board shows visual indicator (disabled look or message) that no more actions are available, "End Turn" button becomes prominent
