## ADDED Requirements

### Requirement: Portal slot hover positioning uses shared calculations
The system SHALL use getPortalSlotPosition() helper from cardLayoutConstants to calculate portal slot button overlay positions, ensuring they match rendered positions exactly.

#### Scenario: Portal slot button positions match rendered positions
- **WHEN** CardButtonOverlay generates portal slot buttons for 4 slots
- **THEN** for each button, the (slotX, slotY, w, h) matches the position calculated in gameRender.drawPlayerPortal
- **AND** no additional position offset or adjustment is applied

#### Scenario: Slot positions are horizontally laid out with gaps
- **WHEN** positioning portal slots 0-3
- **THEN** each slot starts at slotX = SLOT_AREA_X + (slotIndex * (SLOT_W + SLOT_GAP))
- **AND** all slots have identical SLOT_W and SLOT_H dimensions
- **AND** gap between slots is SLOT_GAP

### Requirement: Portal slot positioning is consistent with hit test
The system SHALL ensure portal slot button overlay positions match hit test calculations in gameHitTest.hitTestPortalSlots().

#### Scenario: Hit test and overlay use same positioning
- **WHEN** hitTestPortalSlots() and CardButtonOverlay calculate portal slot positions
- **THEN** both use getPortalSlotPosition() from cardLayoutConstants
- **AND** hit test rectangles (x, y, w, h) match button overlay rectangles exactly

#### Scenario: Portal slot activation trigger is at slot center
- **WHEN** a player clicks a portal slot for activation
- **THEN** hit test detects it using the rectangle returned by getPortalSlotPosition()
- **AND** dialog trigger point is the center of the slot (slotX + SLOT_W/2, slotY + SLOT_H/2)

### Requirement: Portal slot vertical alignment is correct
The system SHALL position portal slots at a consistent vertical position that matches the rendered player portal area.

#### Scenario: Slot Y-coordinate is at portal area
- **WHEN** getPortalSlotPosition() is called
- **THEN** slotY always equals SLOT_AREA_Y
- **AND** all 4 slots are vertically aligned

### Requirement: Portal character position aligns with slot
The system SHALL render portal character cards (portraits) centered within their slot boundaries.

#### Scenario: Character card is centered in slot
- **WHEN** a character card is rendered in portal slot 0-3
- **THEN** the card center is at (slotX + SLOT_W/2, slotY + SLOT_H/2)
- **AND** card dimensions fit within slot boundaries with appropriate padding
