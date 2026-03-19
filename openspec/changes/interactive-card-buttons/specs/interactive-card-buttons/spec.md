## ADDED Requirements

### Requirement: Card Elements Detect Mouse Hover
Cards in the face-up display area SHALL detect when the mouse hovers over them and respond with visual feedback.

#### Scenario: Mouse enters card area
- **WHEN** user moves mouse over a card in the face-up display
- **THEN** the card is marked as hovered
- **AND** hover CSS class is applied to the card element
- **AND** CSS transition animates the hover effect smoothly

#### Scenario: Mouse leaves card area
- **WHEN** user moves mouse away from a hovered card
- **THEN** the card's hover state is removed
- **AND** CSS transition animates back to normal state
- **AND** animation completes within 200ms

#### Scenario: Multiple cards can be hovered
- **WHEN** user moves mouse from one card to another
- **THEN** previous card's hover state is removed
- **AND** new card's hover state is applied
- **AND** transitions happen smoothly without visual artifacts

### Requirement: Click Card to Select
Players SHALL be able to click cards to select/take them from the display.

#### Scenario: Click on card selects it
- **WHEN** user clicks on a card in face-up display
- **THEN** the card is marked as selected
- **AND** game logic processes the selection
- **AND** selected state is visually indicated

#### Scenario: Click on already selected card
- **WHEN** user clicks on an already selected card
- **THEN** the card is deselected (toggle behavior)
- **AND** visual indication is removed
- **AND** game state is updated

#### Scenario: Click on disabled card does nothing
- **WHEN** card is disabled/unselectable and user clicks it
- **THEN** no selection occurs
- **AND** click is ignored
- **AND** cursor shows not-allowed state on hover

### Requirement: Visual Feedback for Card States
Cards SHALL provide clear visual indication of their state (normal, hover, selected, disabled).

#### Scenario: Normal card state
- **WHEN** card is at rest (no hover, not selected)
- **THEN** card displays at normal elevation
- **AND** default styling is applied
- **AND** cursor is default arrow

#### Scenario: Hovered card state
- **WHEN** card is hovered
- **THEN** card appears elevated (lifted slightly)
- **AND** shadow effect shows depth
- **AND** cursor changes to pointer
- **AND** animation is smooth (no jarring jumps)

#### Scenario: Selected card state
- **WHEN** card is selected
- **THEN** card shows visual indication (outline, glow, or border)
- **AND** indication is distinct from hover state
- **AND** selected state persists even without hover

#### Scenario: Disabled card state
- **WHEN** card is disabled
- **THEN** card appears dimmed/faded
- **AND** cursor shows not-allowed symbol
- **AND** hover effect is not applied
- **AND** clicking disabled card has no effect

### Requirement: Cursor Feedback
The cursor SHALL change to indicate card interactivity.

#### Scenario: Pointer cursor on card hover
- **WHEN** user hovers over an enabled card
- **THEN** cursor changes to pointer (hand) icon
- **AND** cursor change is immediate
- **AND** cursor reflects interactivity

#### Scenario: Not-allowed cursor on disabled card
- **WHEN** user hovers over a disabled card
- **THEN** cursor changes to not-allowed symbol
- **AND** visual feedback indicates card cannot be selected
