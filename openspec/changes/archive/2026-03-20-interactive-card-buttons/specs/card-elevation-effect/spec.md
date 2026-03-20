## ADDED Requirements

### Requirement: Cards Elevate on Hover
Cards in the display area SHALL visually elevate when hovered to indicate interactivity.

#### Scenario: Smooth elevation animation
- **WHEN** user hovers over a card
- **THEN** card smoothly translates upward (4-6px lift)
- **AND** animation duration is 200ms or less
- **AND** easing is smooth (ease-out recommended)
- **AND** elevation is achieved via CSS transform (GPU-accelerated)

#### Scenario: Shadow effect accompanies elevation
- **WHEN** card is elevated
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
- **WHEN** card is disabled
- **THEN** hover does not cause elevation
- **AND** card remains at normal height
- **AND** no shadow effect is applied
- **AND** visual distinction from enabled cards is clear

### Requirement: Multiple Cards Can Elevate Independently
Multiple cards can be hovered and elevated simultaneously (e.g., during card selection scenario).

#### Scenario: Elevate card A then B while A is elevated
- **WHEN** card A is hovered and elevated
- **AND** user then hovers card B without leaving A
- **THEN** card B elevates
- **AND** card A remains elevated if still under mouse
- **AND** both cards show elevation effects independently
- **AND** no visual artifacts or z-index conflicts

#### Scenario: Stacking order with elevated cards
- **WHEN** cards are overlapping and both elevated
- **THEN** proper z-index ordering prevents one from hiding another
- **AND** all card details are visible
- **AND** visual hierarchy is maintained
