## MODIFIED Requirements

### Requirement: Cards Elevate on Hover
Cards in the display area SHALL visually elevate when hovered to indicate interactivity. This applies to auslage cards, portal slot cards, hand cards, AND activated character grid cards.

#### Scenario: Smooth elevation animation
- **WHEN** user hovers over any card (auslage, portal, hand, or activated character grid)
- **THEN** card smoothly translates upward (4-6px lift)
- **AND** animation duration is 200ms or less
- **AND** easing is smooth (ease-out recommended)
- **AND** elevation is achieved via CSS transform (GPU-accelerated)

#### Scenario: Shadow effect accompanies elevation
- **WHEN** card is elevated on hover
- **THEN** box-shadow is added to create depth perception
- **AND** shadow is subtle (not overpowering)
- **AND** shadow size increases slightly as card lifts
- **AND** shadow color matches game theme

#### Scenario: Elevation reverts on hover leave
- **WHEN** user mouse leaves card
- **THEN** card smoothly descends back to normal position
- **AND** animation duration matches hover animation (200ms)
- **AND** shadow effect is removed
- **AND** visual transition is smooth

#### Scenario: No elevation for disabled cards
- **WHEN** card is disabled or in non-interactive state
- **THEN** hover does not cause elevation
- **AND** card remains at normal height
- **AND** no shadow effect is applied
- **AND** visual distinction from enabled cards is clear

#### Scenario: Activated character grid cards elevate on hover
- **WHEN** user hovers over an activated character card in the grid
- **THEN** the card uses identical elevation effect as other interactive cards
- **AND** 4-6px lift is applied with 200ms smooth animation
- **AND** box-shadow matches other card types

### Requirement: Multiple Cards Can Elevate Independently
Multiple cards can be hovered and elevated simultaneously (e.g., during card selection or when scanning activated characters grid).

#### Scenario: Elevate card A then B while A is elevated
- **WHEN** user hovers over card A, then hovers over card B (without leaving A)
- **THEN** both cards are elevated simultaneously with independent animations
- **AND** each card maintains its own elevation state
- **AND** moving back to A keeps A elevated
