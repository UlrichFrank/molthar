## ADDED Requirements

### Requirement: Centralized card layout constants module
The system SHALL provide a single shared module (`cardLayoutConstants.ts`) that defines all card dimensions, positioning offsets, and layout calculations. All other modules (gameRender, gameHitTest, CardButtonOverlay) SHALL import from this module instead of defining local constants.

#### Scenario: Constants are accessible from shared module
- **WHEN** gameRender.ts, gameHitTest.ts, or CardButtonOverlay.tsx imports cardLayoutConstants
- **THEN** they can access CARD_W, CARD_H, CARD_GAP, BASE_W, BASE_H, ZONE_TOP_H, MARGIN_H, ZONE_CENTER_H, ZONE_PLAYER_H, and all layout positioning constants
- **AND** only one set of constant definitions exists across the codebase

#### Scenario: Layout constants match original values
- **WHEN** cardLayoutConstants.ts is created
- **THEN** CARD_W = 89 (59 * 1.5), CARD_H = 138 (92 * 1.5), CARD_GAP = 15 (10 * 1.5)
- **AND** BASE_W = 1200, BASE_H = 800, ZONE_TOP_H = 200, MARGIN_H = 200, ZONE_CENTER_H = 320

### Requirement: Hand card positioning helper function
The system SHALL provide a helper function `getHandCardPosition(handCount: number, cardIndex: number)` that returns exact (cx, cy, angle) for a hand card in fan layout.

#### Scenario: Function returns correct fan positions
- **WHEN** getHandCardPosition is called with handCount=5, cardIndex=2
- **THEN** it returns (cx, cy, angle) values that match the calculated position used in gameRender.drawHandCards
- **AND** angle is radians, adjusted for fan spread based on card count

#### Scenario: Single card in hand is centered
- **WHEN** getHandCardPosition is called with handCount=1, cardIndex=0
- **THEN** it returns centered position (handCenterX, HAND_CENTER_Y, angle=0)

### Requirement: Portal slot positioning helper function
The system SHALL provide a helper function `getPortalSlotPosition(slotIndex: number)` that returns exact (slotX, slotY, w, h) for a portal slot.

#### Scenario: Function returns correct slot positions
- **WHEN** getPortalSlotPosition is called with slotIndex=0, 1, 2, 3
- **THEN** it returns positioning that matches rendered portal slots in gameRender.drawPlayerPortal

#### Scenario: Slot positions account for gaps
- **WHEN** getPortalSlotPosition is called sequentially for slotIndex=0,1,2,3
- **THEN** slots are spaced with SLOT_GAP between them
- **AND** overall portal layout fits within PORTAL_W bounds

### Requirement: No duplicate constant definitions
After implementation, the system SHALL NOT have duplicate definitions of CARD_W, CARD_H, CARD_GAP, or positioning constants in multiple files.

#### Scenario: All files import from shared module
- **WHEN** codebase is searched for duplicate constant definitions
- **THEN** only `cardLayoutConstants.ts` defines these constants
- **AND** gameRender.ts, gameHitTest.ts, CardButtonOverlay.tsx import from cardLayoutConstants.ts

## MODIFIED Requirements

### Requirement: Interactive card button overlay positioning
The system SHALL render interactive card buttons (hover effects, selection feedback) at positions that exactly match the rendered card positions.

#### Scenario: Hand card buttons align with rendered cards
- **WHEN** CardButtonOverlay renders hand card buttons
- **THEN** button positions (cx, cy, angle) are calculated using getHandCardPosition() from cardLayoutConstants
- **AND** hover overlay aligns perfectly with rendered card image

#### Scenario: Portal slot buttons align with rendered slots
- **WHEN** CardButtonOverlay renders portal slot buttons
- **THEN** button positions are calculated using getPortalSlotPosition() from cardLayoutConstants
- **AND** activation dialog trigger point matches slot center
