## Context

Currently, card position/size constants are defined in **three separate locations**:
1. `gameHitTest.ts` (lines 26-27, plus hand/portal positioning)
2. `gameRender.ts` (lines 44-45, plus layout calculations)
3. `CardButtonOverlay.tsx` (lines 20-21, plus layout calculations)

Each file independently calculates hand card positions (fan-out layout) and portal card positions. While the auslage layout is consistent, hand and portal layouts have subtle differences in coordinate calculations between hit test (hitTestHandCards, hitTestPortalSlots) and rendering (drawHandCards, drawPlayerPortal).

**Current Issue:** When CardButtonOverlay renders interactive overlays (hover effects, selection feedback), it uses its own coordinate calculations. These don't perfectly align with the rendering due to:
- Slight differences in layout constant definitions
- Different approaches to fan-angle and rotation calculations
- Rounding differences in position calculations

## Goals / Non-Goals

**Goals:**
- Create single source of truth for all card layout constants (dimensions, positioning, offsets)
- Fix hand card positioning (hover overlay) to match rendered positions exactly
- Fix portal card positioning (hover overlay) to match rendered positions exactly
- Consolidate layout calculations (fan-out angles, rotation transforms, positioning)
- Enable easy future adjustments (change card size/layout once, update everywhere)

**Non-Goals:**
- Change card rendering logic itself (gameRender.ts drawing code stays the same)
- Modify hit test logic (gameHitTest.ts logic stays the same)
- Change visual appearance or layout design
- Add new card positioning features

## Decisions

**1. Create `cardLayoutConstants.ts` as Shared Module**
- *Why:* Single source of truth for all layout values
- *Where:* `game-web/src/lib/cardLayoutConstants.ts`
- *What it Contains:*
  - Card dimensions (CARD_W, CARD_H, CARD_GAP)
  - Layout zone heights (ZONE_TOP_H, MARGIN_H, ZONE_CENTER_H, ZONE_PLAYER_H, BASE_W, BASE_H)
  - Auslage positioning (AUSLAGE_START_X, AUSLAGE_START_Y)
  - Hand area dimensions (HAND_AREA_X, HAND_AREA_W, HAND_CENTER_Y, HAND_CARD_W, HAND_CARD_H, HAND_MAX)
  - Portal area dimensions (SLOT_AREA_X, SLOT_AREA_Y, SLOT_W, SLOT_GAP, SLOT_H)
  - Helper functions for calculations (getFanAngle, getHandCardPosition, getPortalSlotPosition)

**2. Extract Hand Card Positioning into Helper Function**
- *Why:* Fan-out positioning is complex; sharing it prevents divergence
- *Logic:* Takes (handCount, cardIndex) → returns (cx, cy, angle)
- *Used by:* gameRender.drawHandCards, CardButtonOverlay hand card buttons

**3. Extract Portal Slot Positioning into Helper Function**
- *Why:* Portal layout needs to be identical between rendering and hit test
- *Logic:* Takes (slotIndex) → returns (slotX, slotY, w, h)
- *Used by:* gameRender.drawPlayerPortal, CardButtonOverlay portal buttons, gameHitTest.hitTestPortalSlots

**4. Update Import Order**
- Remove local constants from: gameHitTest.ts, gameRender.ts, CardButtonOverlay.tsx
- Add import: `import { ... } from '../lib/cardLayoutConstants'`

## Risks / Trade-offs

**[Risk] Breaking Changes on Calculation Tweaks** → Mitigation: Any changes to fan-out angle or position formulas will affect all three systems simultaneously. Requires careful testing across all three. Benefit: Forces correctness since changes are visible everywhere.

**[Risk] Circular Dependencies** → Mitigation: cardLayoutConstants.ts is pure calculations (no external dependencies), imported by gameRender, gameHitTest, CardButtonOverlay. No risk of cycles.

**[Risk] Layout Assumptions Embedded in Shared Constants** → Mitigation: Document all layout assumptions (BASE_W/H ratio, zone proportions, etc.) as comments in cardLayoutConstants.ts.

## Migration Plan

**Step 1:** Create cardLayoutConstants.ts with all constants and helper functions (no behavior change yet)
**Step 2:** Update gameRender.ts to import from cardLayoutConstants (verify rendering unchanged)
**Step 3:** Update gameHitTest.ts to import from cardLayoutConstants (verify hit test unchanged)
**Step 4:** Update CardButtonOverlay.tsx to import and use helpers (verify positioning fixed)
**Step 5:** Remove local constant definitions from all three files
**Step 6:** Test card selection hover on hand and portal (verify overlay aligns with rendered cards)

## Open Questions

- Should portal slot positioning include rotation angle (for visual effects)? Currently slots are not rotated.
- Should we add comments documenting the layout zone proportions (BASE_W/H, zone heights, margin calculations) in the shared constants file?
- Are there any other files (UI, CSS, canvas transforms) that depend on these positioning constants?
