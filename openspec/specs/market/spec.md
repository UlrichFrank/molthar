# Market Specification

## Purpose
Shared face-up card availability, deck and discard handling, and portal placement constraints for the Molthar play area.

## Requirements

### Requirement: Central Market Layout
The system SHALL maintain a central market with two visible character cards and four visible pearl cards.

#### Scenario: Populate the market
- GIVEN a game has been initialized
- WHEN the shared table state is created
- THEN exactly two character cards are revealed for drafting
- AND exactly four pearl cards are revealed for drafting
- AND character and pearl cards come from separate decks

### Requirement: Taking a Pearl Card
The system SHALL allow a player to take one visible pearl card or the top pearl deck card as a single action.

#### Scenario: Take a visible pearl card
- GIVEN it is a player's turn and actions remain
- WHEN the player takes one of the four visible pearl cards
- THEN that card is added to the player's hand
- AND the empty pearl slot is refilled from the pearl deck if possible

#### Scenario: Take a pearl card from the deck
- GIVEN it is a player's turn and actions remain
- WHEN the player chooses the hidden pearl deck instead of a visible slot
- THEN the top pearl deck card is added to the player's hand
- AND the visible pearl slots remain otherwise unchanged

### Requirement: Replacing the Visible Pearl Row
The system SHALL support replacing all four visible pearl cards as a single action.

#### Scenario: Refresh the pearl row
- GIVEN it is a player's turn and actions remain
- WHEN the player chooses to replace the visible pearl row
- THEN all currently visible pearl cards move to the pearl discard pile
- AND up to four new pearl cards are drawn into the market

### Requirement: Swap Symbol Refresh
The system SHALL refresh the visible character row when a newly revealed pearl card shows the swap symbol.

#### Scenario: Reveal a swap-symbol pearl card
- GIVEN a player takes a visible pearl card and the empty pearl slot is being refilled
- AND the newly revealed pearl card contains the swap symbol
- WHEN the refill completes during normal play
- THEN both currently visible character cards are discarded
- AND the character row is replenished with two newly drawn character cards

### Requirement: Taking and Placing a Character Card
The system SHALL allow a player to take one visible character card or the top character deck card and place it on the portal.

#### Scenario: Place a character on an empty portal slot
- GIVEN it is a player's turn and the player's portal has fewer than two inactive character cards
- WHEN the player takes a character card from a visible slot or the deck
- THEN the card is placed onto the player's portal
- AND the visible character market refills back to two cards if possible

### Requirement: Portal Capacity
The system MUST enforce a maximum of two character cards on a player's portal before activation.

#### Scenario: Replace a character on a full portal
- GIVEN a player's portal already contains two character cards
- WHEN the player wants to place another character card
- THEN the system requires one existing portal card to be discarded first
- AND only then may the new card occupy the freed portal slot

### Requirement: Deck Recovery
The system SHALL recycle the matching discard pile when a shared draw deck is empty.

#### Scenario: Refill from discard pile
- GIVEN a pearl or character deck is empty
- AND the corresponding discard pile contains cards
- WHEN the system needs another card for refill or drawing
- THEN the discard pile is reshuffled into a new draw deck
- AND drawing continues from that reshuffled deck
