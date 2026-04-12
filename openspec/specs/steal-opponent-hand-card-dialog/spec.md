## ADDED Requirements

### Requirement: Card selection in step 2 triggers the steal move
When the player is in step 2 (opponent selected), clicking a card button SHALL call the steal move with the opponent's player ID and the card's index, then close the dialog.

#### Scenario: Player clicks a card in step 2
- **WHEN** the player has selected an opponent in step 1
- **WHEN** the player clicks one of the face-up card buttons in step 2
- **THEN** `resolveStealOpponentHandCard(opponentId, cardIndex)` is called with the correct arguments
- **THEN** the dialog closes immediately

### Requirement: Face-down card image in step 1 resolves correctly
Step 1 SHALL display face-down pearl card thumbnails using the asset path `/assets/Perlenkarte Hinten.png` (matching the filename in the assets directory).

#### Scenario: Step 1 renders opponent card backs
- **WHEN** the steal dialog opens and shows the list of opponents
- **THEN** each opponent's card thumbnails use `/assets/Perlenkarte Hinten.png` as the image source
- **THEN** no broken image icons are shown

### Requirement: Move guard failures return INVALID_MOVE
The `resolveStealOpponentHandCard` move SHALL return `INVALID_MOVE` (not `undefined`) when any guard condition fails, so boardgame.io correctly rejects the move and preserves game state integrity.

#### Scenario: Move called when steal is not pending
- **WHEN** `resolveStealOpponentHandCard` is called but `G.pendingStealOpponentHandCard` is false
- **THEN** the move returns `INVALID_MOVE`
- **THEN** no state mutation occurs

#### Scenario: Move called targeting self
- **WHEN** `resolveStealOpponentHandCard` is called with `targetPlayerId === ctx.currentPlayer`
- **THEN** the move returns `INVALID_MOVE`

#### Scenario: Move called with invalid card index
- **WHEN** `resolveStealOpponentHandCard` is called with an `handCardIndex` out of range for the target's hand
- **THEN** the move returns `INVALID_MOVE`
