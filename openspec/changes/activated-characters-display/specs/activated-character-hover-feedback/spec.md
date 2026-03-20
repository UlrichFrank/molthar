## ADDED Requirements

### Requirement: Activated character card hover feedback
When a player hovers over an activated character card in the grid, the card SHALL visually highlight using the same elevation effect (lift + shadow) applied to other interactive cards on the board.

#### Scenario: Card lifts on hover
- **WHEN** a player hovers over an activated character card in the grid
- **THEN** the card smoothly translates upward (4-6px lift)
- **AND** the animation duration is 200ms or less
- **AND** easing is smooth (ease-out recommended)

#### Scenario: Shadow effect on hover
- **WHEN** a card is elevated on hover
- **THEN** a box-shadow is added to create depth perception
- **AND** shadow is subtle but noticeable
- **AND** shadow size matches that of auslage and portal card hovers

#### Scenario: Hover effect reverts
- **WHEN** the player mouse leaves an activated character card
- **THEN** the card smoothly descends back to normal position
- **AND** the shadow effect is removed
- **AND** visual transition is smooth (200ms)

#### Scenario: No hover effect on touch devices
- **WHEN** a player uses a touch device
- **THEN** hover effects are not applied (use active/pressed state instead per device capability)
- **AND** the card responds to touch feedback (tap highlight)
