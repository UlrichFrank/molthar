## ADDED Requirements

### Requirement: Hand card hover positioning uses shared calculations
The system SHALL use getHandCardPosition() helper from cardLayoutConstants to calculate hand card button overlay positions, ensuring they match rendered positions exactly.

#### Scenario: Hand card button positions match rendered positions
- **WHEN** CardButtonOverlay generates hand card buttons for a 3-card hand
- **THEN** for each button, the (cx, cy, angle) matches the position calculated in gameRender.drawHandCards
- **AND** no additional position offset or adjustment is applied

#### Scenario: Hand fan angle is calculated consistently
- **WHEN** hand count varies (1, 3, 5 cards)
- **THEN** fan angle is calculated as `Math.min(60, 12 * Math.max(0, count - 1))`
- **AND** angle is converted to radians: `(fanAngleDeg * Math.PI) / 180`
- **AND** all code paths (render, hit test, button overlay) use identical formula

### Requirement: Hand card overlap positioning is consistent
The system SHALL apply hand card overlap calculations consistently across rendering and hit test code.

#### Scenario: Overlap is calculated correctly
- **WHEN** positioning hand cards
- **THEN** overlap factor is `HAND_CARD_W * 0.5`
- **AND** card offsetX is calculated as `(cardIndex - (cardCount - 1) / 2) * overlap * 0.6`
- **AND** all modules (render, hit test, overlay) use identical overlap formula

### Requirement: Hand card rotation angle is applied to button overlay
The system SHALL apply the calculated rotation angle (radians) to hand card button overlays so they rotate with their rendered cards.

#### Scenario: Button overlay includes rotation angle
- **WHEN** CardButtonOverlay creates a hand card button
- **THEN** the button object includes an `angle` property in radians
- **AND** the angle matches the value returned by getHandCardPosition()

#### Scenario: Rotated buttons are positioned relative to center
- **WHEN** a hand card is rotated by angle radians
- **THEN** the button position (cx, cy) is the rotation center
- **AND** visual rendering applies the rotation transform: `rotate(angle) translate(offset)`
