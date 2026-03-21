## ADDED Requirements

### Requirement: Hover feedback aligns with card position
The system SHALL display hover/selection feedback that aligns perfectly with the rendered card image at its exact position.

#### Scenario: Hand card hover overlay aligns with rendered card
- **WHEN** user hovers over a hand card
- **THEN** hover overlay (glow, highlight, or border) appears at the exact position and angle of the rendered card
- **AND** overlay has no offset or misalignment

#### Scenario: Portal card hover overlay aligns with rendered card
- **WHEN** user hovers over a portal card
- **THEN** hover overlay appears at the exact position of the rendered card
- **AND** overlay is centered within the portal slot boundaries

### Requirement: Card button overlay uses corrected positioning
The system SHALL update CardButtonOverlay to use the corrected positioning from cardLayoutConstants for all card button calculations.

#### Scenario: CardButtonOverlay imports from cardLayoutConstants
- **WHEN** CardButtonOverlay.tsx is loaded
- **THEN** it imports card layout constants and helper functions from cardLayoutConstants.ts
- **AND** does not define local copies of CARD_W, CARD_H, CARD_GAP, or layout offsets

#### Scenario: Button overlay positioning precision matches renderer
- **WHEN** CardButtonOverlay calculates button positions for hand, portal, or auslage cards
- **THEN** position calculations use identical formulas as gameRender.ts
- **AND** precision (rounding, coordinate system) matches the renderer

### Requirement: No visual regression from positioning fix
The system SHALL ensure that fixing card positioning does not introduce visual inconsistencies or layout shifts.

#### Scenario: Auslage card positions unchanged
- **WHEN** the positioning fix is applied
- **THEN** auslage card positions remain exactly as before
- **AND** auslage cards are already correctly positioned

#### Scenario: Hand cards maintain fan layout appearance
- **WHEN** the positioning fix corrects hand card positions
- **THEN** visual fan-out layout appears smooth and correct
- **AND** no cards are misaligned or overlapping incorrectly

#### Scenario: Portal cards maintain grid layout appearance
- **WHEN** the positioning fix corrects portal card positions
- **THEN** portal cards remain in a clean horizontal line
- **AND** all cards are equidistant with consistent gaps
