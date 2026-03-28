/**
 * Centralized Card Layout Constants
 * Single source of truth for all card positioning, dimensions, and layout calculations
 * Used by: gameRender.ts, gameHitTest.ts, canvasRegions.ts
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
export const ZONE_CENTER_H = 310; // Height of center auslage zone
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

// === Portal Slot Positioning (2 character slots max, center area) ===
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

// === Canvas UI Panel (action counter + end-turn / discard button) ===
// Bottom-left of the player area, mirroring the previous React overlay position
export const UI_PANEL_X = 15;
export const UI_PANEL_Y = BASE_H - 75; // = 725
export const UI_PANEL_W = 185;
export const UI_PANEL_H = 55;

// === Activated Characters Grid Positioning (right of portal slots) ===
// Grid displays 3 rows × 4 columns of activated character cards at 50% size
// Positioned directly right of the 2nd portal slot with small gap
export const ACTIVATED_GRID_X = SLOT_AREA_X + 2 * (SLOT_W + SLOT_GAP) + 10; // Right of 2nd portal slot with margin
export const ACTIVATED_GRID_Y = PORTAL_Y; // Align with portal top
export const ACTIVATED_CARD_W = Math.round(CARD_W * 0.5); // 44
export const ACTIVATED_CARD_H = Math.round(CARD_H * 0.5); // 69
export const ACTIVATED_CARD_GAP = Math.round(CARD_GAP * 0.5); // 7
export const ACTIVATED_GRID_COLS = 4;
export const ACTIVATED_GRID_ROWS = 3;
export const ACTIVATED_MAX = ACTIVATED_GRID_COLS * ACTIVATED_GRID_ROWS; // 12

// === Deck Stack Positioning & Dimensions ===
// Decks are positioned below face-up cards with 90° rotation
export const DECK_CARD_W = CARD_W; // Deck card width (before rotation)
export const DECK_CARD_H = CARD_H; // Deck card height (before rotation)
export const DECK_ROTATION = (Math.PI / 2); // 90 degrees in radians
export const DECK_CARD_OFFSET = 2; // Pixel offset between stacked cards for 3D effect
export const DECK_MAX_VISIBLE = 7; // Maximum number of cards visible in the stack
export const DECK_BELOW_OFFSET_Y = 20; // Space between auslage cards and deck below

// Character deck positioning (left edge aligned with left character card, with CARD_H/3 offset for rotation)
export const CHAR_DECK_X = AUSLAGE_START_X + CARD_H; // Left-aligned with slight offset due to rotation
export const CHAR_DECK_Y = AUSLAGE_START_Y + CARD_H + DECK_BELOW_OFFSET_Y;

// Pearl deck positioning (right edge aligned with right pearl card)
// Right edge of rightmost pearl card: AUSLAGE_START_X + 5 * (CARD_W + CARD_GAP) + CARD_W
// After 90° rotation, deck width is CARD_H, so: right_edge - CARD_H + (CARD_H/3) for rotation alignment
export const PEARL_DECK_X = AUSLAGE_START_X + 5 * (CARD_W + CARD_GAP) + CARD_W - CARD_H + CARD_H;
export const PEARL_DECK_Y = AUSLAGE_START_Y + CARD_H + DECK_BELOW_OFFSET_Y;

// === Deck Maximum Sizes (for proportional rendering) ===
// Maximum initial deck sizes used for proportional card count calculation
// Formula: visibleCards = Math.ceil(currentCount / maxDeckSize * 7)
export const CHARACTER_DECK_MAX_SIZE = 52; // 54 total character cards - 2 in initial auslage
export const PEARL_DECK_MAX_SIZE = 56; // 8 values × 7 copies per value

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

/**
 * Calculate activated character grid card position
 * @param cardIndex Card index in the grid (0-11, row-major order)
 * @returns {cardX, cardY, w, h} - position and dimensions
 */
export function getActivatedCardPosition(cardIndex: number) {
  const col = cardIndex % ACTIVATED_GRID_COLS;
  const row = Math.floor(cardIndex / ACTIVATED_GRID_COLS);
  
  const cardX = ACTIVATED_GRID_X + col * (ACTIVATED_CARD_W + ACTIVATED_CARD_GAP);
  const cardY = ACTIVATED_GRID_Y + row * (ACTIVATED_CARD_H + ACTIVATED_CARD_GAP);
  
  return {
    cardX,
    cardY,
    w: ACTIVATED_CARD_W,
    h: ACTIVATED_CARD_H,
  };
}
