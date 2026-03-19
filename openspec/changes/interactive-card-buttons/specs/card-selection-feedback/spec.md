## ADDED Requirements

### Requirement: Selected Cards Show Visual Indication
Selected cards SHALL display clear visual feedback distinguishing them from unselected cards.

#### Scenario: Selected card shows outline
- **WHEN** card is selected by clicking
- **THEN** card shows subtle outline (1-2px border or highlight)
- **AND** outline color contrasts with card background
- **AND** outline is distinct from hover state
- **AND** outline persists until card is deselected

#### Scenario: Selected card shows glow or shadow
- **WHEN** card is selected
- **THEN** card shows glow effect or enhanced shadow
- **AND** glow is subtle but noticeable
- **AND** glow color matches game theme or indicates selection
- **AND** glow effect is visible over other elements

#### Scenario: Multiple cards can be selected
- **WHEN** multiple cards are selected (if game allows it)
- **THEN** each selected card shows individual selection indication
- **AND** indicators are consistent across all selected cards
- **AND** selected cards remain visually distinct from unselected

#### Scenario: Selection indication works with hover
- **WHEN** hovering over a selected card
- **THEN** both hover effect and selection indication are visible
- **AND** effects don't conflict visually
- **AND** clear which card is hovered and which is selected

#### Scenario: Deselection removes visual indication
- **WHEN** user clicks to deselect a card
- **THEN** selection indication (outline, glow) is removed
- **AND** card returns to normal state
- **AND** animation back to normal is smooth

### Requirement: Selection State Persists
Card selection state SHALL persist across interactions until explicitly changed.

#### Scenario: Selected card remains selected after hover
- **WHEN** card is selected
- **AND** user hovers then unhover without clicking
- **THEN** card remains selected
- **AND** selection indication is always visible
- **AND** hover effects apply on top of selection

#### Scenario: Selection persists across turn phases
- **WHEN** card is selected during a turn
- **AND** turn phase changes
- **THEN** selection state is maintained (unless game logic clears it)
- **AND** visual indication remains

### Requirement: Disabled Cards Cannot Be Selected
Cards that are disabled by game logic SHALL not be selectable.

#### Scenario: Click on disabled card has no effect
- **WHEN** card is disabled
- **AND** user clicks it
- **THEN** card is not selected
- **AND** no selection change occurs
- **AND** game state is unchanged

#### Scenario: Disabled card shows disabled styling
- **WHEN** card is disabled
- **THEN** card appears faded or dimmed
- **AND** visual styling clearly indicates disabled state
- **AND** user understands card cannot be selected
