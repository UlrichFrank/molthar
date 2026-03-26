## ADDED Requirements

### Requirement: Card is removed from portal array during activation
The system SHALL remove a character card from the player's portal array when the `activatePortalCard` move is executed.

#### Scenario: Card spliced from portal at correct index
- **WHEN** player calls `activatePortalCard(portalSlotIndex: 0)` with a valid card
- **THEN** the card at index 0 is removed from the portal array

#### Scenario: Other cards shift to fill the gap
- **WHEN** portal has [Card A, Card B] and Card A is activated
- **THEN** portal becomes [Card B] (indices shift, no null slots)

#### Scenario: Removal happens after validation
- **WHEN** cost validation fails for a card
- **THEN** the card is NOT removed from the portal

#### Scenario: Removal happens before game state is returned
- **WHEN** activation succeeds
- **THEN** the card is removed from the portal array in the updated GameState

### Requirement: Card cannot be activated twice
The system SHALL prevent a card from being activated if it's no longer in the portal.

#### Scenario: Cannot activate card that was already removed
- **WHEN** a card has been activated and removed from portal
- **THEN** `activatePortalCard` with that portal slot index is rejected

#### Scenario: Portal index is validated
- **WHEN** player tries to activate a card with an out-of-bounds index
- **THEN** the move is rejected and no card is removed

### Requirement: Activated card remains accessible
The system SHALL ensure that after removal from portal, the activated card is still tracked and accessible.

#### Scenario: Activated card appears in activated characters section
- **WHEN** a card is removed from portal and marked activated
- **THEN** the card is accessible via the activated characters grid

#### Scenario: Activated card properties are preserved
- **WHEN** a card is removed from portal
- **THEN** its cost, power points, diamonds, and abilities are preserved in the activated state

