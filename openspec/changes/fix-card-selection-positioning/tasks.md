# Task Checklist: Fix Card Selection Positioning

## 1. Create Shared Card Layout Constants Module

- [ ] 1.1 Create file: game-web/src/lib/cardLayoutConstants.ts
- [ ] 1.2 Add BASE layout constants: BASE_W=1200, BASE_H=800
- [ ] 1.3 Add zone height constants: ZONE_TOP_H, MARGIN_H, ZONE_CENTER_H, ZONE_PLAYER_H
- [ ] 1.4 Add card dimension constants: CARD_W, CARD_H, CARD_GAP (matching gameRender.ts values)
- [ ] 1.5 Add auslage positioning constants: AUSLAGE_CENTER_X, AUSLAGE_CENTER_W, AUSLAGE_START_X, AUSLAGE_START_Y
- [ ] 1.6 Add hand area constants: HAND_AREA_X, HAND_AREA_W, HAND_CENTER_Y, HAND_CARD_W, HAND_CARD_H, HAND_MAX
- [ ] 1.7 Add portal area constants: SLOT_AREA_X, SLOT_AREA_Y, SLOT_W, SLOT_H, SLOT_GAP
- [ ] 1.8 Verify all constants match current values in gameRender.ts exactly

## 2. Implement Hand Card Positioning Helper

- [ ] 2.1 Add getHandCardPosition(handCount: number, cardIndex: number) function to cardLayoutConstants.ts
- [ ] 2.2 Implement fan angle calculation: Math.min(60, 12 * Math.max(0, count - 1))
- [ ] 2.3 Implement overlap calculation: HAND_CARD_W * 0.5
- [ ] 2.4 Calculate card X offset: (cardIndex - (cardCount - 1) / 2) * overlap * 0.6
- [ ] 2.5 Calculate center X: HAND_AREA_X + HAND_AREA_W / 2
- [ ] 2.6 Calculate card Y: HAND_CENTER_Y
- [ ] 2.7 Calculate rotation angle in radians from fan spread
- [ ] 2.8 Return { cx, cy, angle } object
- [ ] 2.9 Test: getHandCardPosition(3, 1) returns center card with angle 0
- [ ] 2.10 Test: getHandCardPosition(5, 0) returns left card with negative angle

## 3. Implement Portal Slot Positioning Helper

- [ ] 3.1 Add getPortalSlotPosition(slotIndex: number) function to cardLayoutConstants.ts
- [ ] 3.2 Calculate slotX: SLOT_AREA_X + (slotIndex * (SLOT_W + SLOT_GAP))
- [ ] 3.3 Set slotY: SLOT_AREA_Y
- [ ] 3.4 Set slot width: SLOT_W
- [ ] 3.5 Set slot height: SLOT_H
- [ ] 3.6 Return { slotX, slotY, w: SLOT_W, h: SLOT_H } object
- [ ] 3.7 Test: getPortalSlotPosition(0) returns first slot position
- [ ] 3.8 Test: getPortalSlotPosition(3) returns fourth slot position with correct offset

## 4. Update gameRender.ts to Use Shared Constants

- [ ] 4.1 Import cardLayoutConstants at top of gameRender.ts
- [ ] 4.2 Remove local CARD_W definition (line 44)
- [ ] 4.3 Remove local CARD_H definition (line 45)
- [ ] 4.4 Remove local CARD_GAP definition (line 46)
- [ ] 4.5 Remove local ZONE_TOP_H, MARGIN_H, ZONE_CENTER_H, ZONE_PLAYER_H, BASE_W, BASE_H definitions
- [ ] 4.6 Import or reference these from cardLayoutConstants
- [ ] 4.7 Test: npm run build succeeds with no errors
- [ ] 4.8 Test: Canvas rendering looks identical to before (no visual change)

## 5. Update gameHitTest.ts to Use Shared Constants

- [ ] 5.1 Import cardLayoutConstants at top of gameHitTest.ts
- [ ] 5.2 Remove local CARD_W definition
- [ ] 5.3 Remove local CARD_H definition  
- [ ] 5.4 Remove local zone height constants
- [ ] 5.5 Import all layout constants from cardLayoutConstants
- [ ] 5.6 Remove local hand positioning calculations (use getHandCardPosition)
- [ ] 5.7 Remove local portal positioning calculations (use getPortalSlotPosition)
- [ ] 5.8 Update hitTestHandCards() to use getHandCardPosition() helper
- [ ] 5.9 Update hitTestPortalSlots() to use getPortalSlotPosition() helper
- [ ] 5.10 Test: npm run build succeeds
- [ ] 5.11 Test: Hit test still correctly detects card clicks (no functional change)

## 6. Update CardButtonOverlay.tsx to Use Shared Constants

- [ ] 6.1 Import cardLayoutConstants at top of CardButtonOverlay.tsx
- [ ] 6.2 Remove local CARD_W definition (line 20)
- [ ] 6.3 Remove local CARD_H definition (line 21)
- [ ] 6.4 Remove local zone height constants
- [ ] 6.5 Import all layout constants from cardLayoutConstants
- [ ] 6.6 Update auslageButtons useMemo to use cardLayoutConstants
- [ ] 6.7 Update handButtons useMemo to use getHandCardPosition() helper
- [ ] 6.8 Update portalButtons useMemo to use getPortalSlotPosition() helper
- [ ] 6.9 Verify button positions (cx, cy, angle) match rendering exactly
- [ ] 6.10 Test: npm run build succeeds
- [ ] 6.11 Test: Card hover overlays align perfectly with rendered cards

## 7. Fix Hand Card Positioning in CardButtonOverlay

- [ ] 7.1 In handButtons useMemo, replace manual position calculations with getHandCardPosition()
- [ ] 7.2 Remove manual fan angle calculation
- [ ] 7.3 Remove manual overlap calculation
- [ ] 7.4 Add angle property to button object from getHandCardPosition()
- [ ] 7.5 Test: Hand card buttons are positioned at exact center of rendered cards
- [ ] 7.6 Test: Rotation angle matches rendered card rotation
- [ ] 7.7 Test: Single card hand is centered with angle=0
- [ ] 7.8 Test: Multi-card hand has correct fan spread and angles

## 8. Fix Portal Slot Positioning in CardButtonOverlay

- [ ] 8.1 In portalButtons useMemo, replace manual slot calculations with getPortalSlotPosition()
- [ ] 8.2 Remove manual slotX offset calculations
- [ ] 8.3 Remove manual slotY position calculation
- [ ] 8.4 Update portal button constructor to use getPortalSlotPosition() return values
- [ ] 8.5 Test: Portal slot buttons align with rendered slot boundaries
- [ ] 8.6 Test: All 4 slots maintain correct horizontal spacing
- [ ] 8.7 Test: Slot activation click point is at slot center

## 9. Verify and Test Positioning

- [ ] 9.1 Visual test: Take a screenshot of hand cards - overlay borders should match card edges
- [ ] 9.2 Visual test: Take a screenshot of portal cards - overlay borders should match card edges
- [ ] 9.3 Interactive test: Click and drag to select hand cards - clicks should register on correct cards
- [ ] 9.4 Interactive test: Hover over hand cards - hover effect should appear on correct card
- [ ] 9.5 Interactive test: Hover over portal cards - hover effect should appear on correct card
- [ ] 9.6 No regression: Auslage cards should still position correctly (unchanged)
- [ ] 9.7 No regression: Card rendering appearance should be identical to before
- [ ] 9.8 Console check: No errors or warnings during gameplay

## 10. Code Cleanup and Documentation

- [ ] 10.1 Verify no duplicate constant definitions remain in any file
- [ ] 10.2 Add JSDoc comments to cardLayoutConstants.ts explaining layout zones and proportions
- [ ] 10.3 Add JSDoc to getHandCardPosition() describing fan layout calculation
- [ ] 10.4 Add JSDoc to getPortalSlotPosition() describing slot layout
- [ ] 10.5 Add comment in CardButtonOverlay explaining position calculation imports
- [ ] 10.6 Add comment in gameHitTest explaining constant/helper imports
- [ ] 10.7 Add comment in gameRender explaining constant/helper imports
- [ ] 10.8 Review code for any remaining hard-coded position values

## 11. Build and Type Safety

- [ ] 11.1 Run npm run build - should succeed with no errors
- [ ] 11.2 Run npx tsc --noEmit - should have no TypeScript errors
- [ ] 11.3 Verify bundle size hasn't increased significantly
- [ ] 11.4 Check browser console for warnings during development

## 12. Final Verification

- [ ] 12.1 Play a quick game: Take pearl cards and verify positioning is correct
- [ ] 12.2 Play a quick game: Take character cards and verify portal positioning is correct
- [ ] 12.3 Play a quick game: Hover over hand cards - verify selection feedback aligns
- [ ] 12.4 Play a quick game: Hover over portal cards - verify selection feedback aligns
- [ ] 12.5 Multi-device test: Load on mobile - verify touch clicks register on correct cards
- [ ] 12.6 Multi-device test: Load on tablet - verify positions remain correct at different scales
