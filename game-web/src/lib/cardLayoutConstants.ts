/**
 * Centralized Card Layout Constants
 * Single source of truth for all card positioning, dimensions, and layout calculations
 * Used by: gameRender.ts, gameHitTest.ts, CardButtonOverlay.tsx
 *
 * Layout Overview:
 * - BASE_W=1200, BASE_H=800 (3:2 aspect ratio)
 * - ZONE_TOP_H=200: opponent area
 * - MARGIN_H=200: left/right margins
 * - ZONE_CENTER_H=320: auslage (marketplace) area
 * - ZONE_PLAYER_H=280: player area (hand + portal)
 */

// === Model Canvas Dimensions ===
export const BASE_W = 1200;
export const BASE_H = 800;

// === Layout Zone Heights ===
export const ZONE_TOP_H = 200; // Height of top zones (opponent area)
export const MARGIN_H = ZONE_TOP_H; // Left/right margin width
export const ZONE_CENTER_H = 320; // Height of center auslage zone
export const ZONE_PLAYER_H = BASE_H - ZONE_TOP_H - ZONE_CENTER_H; // Height of player area

// === Card Dimensions ===
// All cards enlarged by 50% from original 59×92
export const CARD_W = Math.round(59 * 1.5); // 89
export const CARD_H = Math.round(92 * 1.5); // 138
export const CARD_GAP = Math.round(10 * 1.5); // 15

// === Auslage (Marketplace) Positioning ===
export const AUSLAGE_CENTER_X = MARGIN_H;
export const AUSLAGE_CENTER_W = BASE_W - 2 * MARGIN_H;
export const AUSLAGE_START_X = AUSLAGE_CENTER_X + (AUSLAGE_CENTER_W - (6 * CARD_W + 5 * CARD_GAP)) / 2;
export const AUSLAGE_START_Y = ZONE_TOP_H + ZONE_CENTER_H * 0.05; // 5% from top of auslage zone

// === Portal Positioning ===
export const PORTAL_X = MARGIN_H;
export const PORTAL_W = BASE_W - 2 * MARGIN_H;
export const PORTAL_Y = ZONE_TOP_H + ZONE_CENTER_H;

// === Portal Slot Positioning (4 character slots, center area) ===
// Vertically centered at 35% of player zone (measured from portalY); horizontally shifted 3% to the right
export const SLOT_AREA_X = PORTAL_X + PORTAL_W / 3 + PORTAL_W * 0.03;
export const SLOT_AREA_Y = PORTAL_Y + ZONE_PLAYER_H * 0.35;
export const SLOT_W = CARD_W;
export const SLOT_H = CARD_H;
export const SLOT_GAP = CARD_GAP;

// === Hand Cards Positioning (fanned layout in left third) ===
// Hand cards are 90% size of regular cards
export const HAND_AREA_X = PORTAL_X + 10; // Small inset from left edge
export const HAND_AREA_W = Math.max(120, Math.floor(PORTAL_W / 3)); // Left third of player area
export const HAND_CENTER_Y = PORTAL_Y + ZONE_PLAYER_H * 0.5; // Vertically centered
export const HAND_CARD_W = Math.round(CARD_W * 0.9); // 80
export const HAND_CARD_H = Math.round(CARD_H * 0.9); // 124
export const HAND_MAX = 9; // Maximum hand cards to display

// === Button Positioning (right margin) ===
export const BTN_X = BASE_W - MARGIN_H + 10;
export const BTN_W = 130;
export const BTN_H = 35;
export const BTN_Y_1 = PORTAL_Y + 40;
export const BTN_Y_2 = BTN_Y_1 + BTN_H + 8;
export const BTN_Y_3 = BTN_Y_1 + (BTN_H + 8) * 2;

/**
 * Calculate hand card position with fan-out layout
 * @param handCount Total number of cards in hand
 * @param cardIndex Index of the card (0-based)
 * @returns {cx, cy, angle} - center coordinates and rotation angle in radians
 */
export function getHandCardPosition(handCount: number, cardIndex: number) {
  const handCenterX = HAND_AREA_X + HAND_AREA_W / 2;
  
  // Fan spread: 12 degrees per extra card, capped at 60 degrees total
  const fanAngleDeg = Math.min(60, 12 * Math.max(0, handCount - 1));
  const fanAngle = (fanAngleDeg * Math.PI) / 180;
  
  // Overlap factor for spacing
  const overlap = HAND_CARD_W * 0.5;
  
  // Position along the fan arc
  const t = handCount > 1 ? cardIndex / (handCount - 1) : 0.5;
  const angle = -fanAngle / 2 + t * fanAngle; // radians, negative = counter-clockwise
  
  // Horizontal offset to center the fan within hand area
  const offsetX = (cardIndex - (handCount - 1) / 2) * overlap * 0.6;
  const cx = handCenterX + offsetX;
  const cy = HAND_CENTER_Y;
  
  return { cx, cy, angle };
}

/**
 * Calculate portal slot position
 * @param slotIndex Slot index (0-3)
 * @returns {slotX, slotY, w, h} - position and dimensions
 */
export function getPortalSlotPosition(slotIndex: number) {
  const slotX = SLOT_AREA_X + slotIndex * (SLOT_W + SLOT_GAP);
  const slotY = SLOT_AREA_Y;
  
  return {
    slotX,
    slotY,
    w: SLOT_W,
    h: SLOT_H,
  };
}
