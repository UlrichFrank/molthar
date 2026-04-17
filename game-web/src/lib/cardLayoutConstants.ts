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
// Portal slot cards are 50% larger than auslage cards; vertically centered in player zone
export const SLOT_W = Math.round(CARD_W * 1.0); // 134
export const SLOT_H = Math.round(CARD_H * 1.0); // 207
export const SLOT_GAP = Math.round(CARD_GAP * 1.0); // 23
export const SLOT_AREA_X = PORTAL_X + Math.round((PORTAL_W - (2 * SLOT_W + SLOT_GAP)) / 2);
export const SLOT_AREA_Y = PORTAL_Y + Math.floor((ZONE_PLAYER_H - SLOT_H) / 2); // vertically centered

// === Hand Cards Positioning (fanned layout in left third) ===
// Hand cards are 90% size of portal slot cards
export const HAND_AREA_X = PORTAL_X + 10; // Small inset from left edge
export const HAND_AREA_W = Math.max(120, Math.floor(PORTAL_W / 3)); // Left third of player area
export const HAND_CENTER_Y = PORTAL_Y + ZONE_PLAYER_H * 0.5; // Vertically centered
export const HAND_CARD_W = Math.round(SLOT_W * 1.0); // 121
export const HAND_CARD_H = Math.round(SLOT_H * 1.0); // 186
export const HAND_MAX = 9; // Maximum hand cards to display

// === Canvas UI Panel (action counter + end-turn / discard button) ===
// Bottom-left of the player area, mirroring the previous React overlay position
export const UI_PANEL_X = 15;
export const UI_PANEL_Y = BASE_H - 75; // = 725
export const UI_PANEL_W = 185;
export const UI_PANEL_H = 55;

// === Activated Characters Grid Positioning (right of portal slots) ===
// Grid displays 2 rows × 3 columns of activated character cards at 90% size (6 per page)
// Positioned directly right of the 2nd portal slot with small gap
export const ACTIVATED_GRID_X = SLOT_AREA_X + 2 * (SLOT_W + SLOT_GAP) + 10; // Right of 2nd portal slot with margin
export const ACTIVATED_GRID_Y = PORTAL_Y; // Align with portal top
export const ACTIVATED_CARD_W = Math.round(CARD_W * 0.90); // 80
export const ACTIVATED_CARD_H = Math.round(CARD_H * 0.90); // 124
export const ACTIVATED_CARD_GAP = Math.round(CARD_GAP * 0.90); // 14
export const ACTIVATED_GRID_COLS = 3;
export const ACTIVATED_GRID_ROWS = 2;
export const ACTIVATED_PAGE_SIZE = 6; // Cards per page (3×2 grid)
export const ACTIVATED_GRID_H = ACTIVATED_GRID_ROWS * ACTIVATED_CARD_H + (ACTIVATED_GRID_ROWS - 1) * ACTIVATED_CARD_GAP;

// === Activated Characters Pagination Arrows ===
export const ACTIVATED_ARROW_SIZE = 14; // Triangle arrow size in px
export const ACTIVATED_ARROW_MARGIN = 4; // Gap between grid edge and arrow
export const ACTIVATED_ARROW_COLOR_INACTIVE = '#aaaaaa';
export const ACTIVATED_ARROW_COLOR_ACTIVE = '#ffffff';
export const ACTIVATED_ARROW_COLOR_HOVER = '#dddddd';

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

// === Portal Image Dimensions (aspect ratio 1325:1030 relative to character card height) ===
// The portal image file is 1325 px tall, character card image is 1030 px tall.
// Scale proportionally so the rendered portal image matches the rendered slot card height.
export const PORTAL_IMG_H = Math.round(SLOT_H * 1325 / 1030);
// Vertically center the portal image around the slot card center
export const PORTAL_IMG_Y = Math.round(SLOT_AREA_Y + SLOT_H / 2 - PORTAL_IMG_H / 2);

// === Opponent Zone Scaling Constants ===
// OPP_SCALE: base fit factor × 1.5 (50% larger than minimum-fit, intentionally overflows zone edges).
// Base: min(ZONE_CENTER_H / PORTAL_W, MARGIN_H / ZONE_PLAYER_H) ≈ 0.387
export const OPP_SCALE = Math.min(ZONE_CENTER_H / PORTAL_W, MARGIN_H / ZONE_PLAYER_H) * 2.0;

// Scaled virtual zone dimensions (matches the player zone at OPP_SCALE)
export const OPP_SCALED_W = Math.round(PORTAL_W * OPP_SCALE);
export const OPP_SCALED_H = Math.round(ZONE_PLAYER_H * OPP_SCALE);

// Card dimensions in opponent zones (scale from portal card sizes)
export const OPP_SLOT_W = Math.round(SLOT_W * OPP_SCALE);
export const OPP_SLOT_H = Math.round(SLOT_H * OPP_SCALE);
export const OPP_SLOT_GAP = Math.max(1, Math.round(SLOT_GAP * OPP_SCALE));
// Portal image height for opponent zones (same ratio as player portal, scaled)
export const OPP_PORTAL_IMG_H = Math.round(PORTAL_IMG_H * OPP_SCALE);
export const OPP_ACT_W = Math.round(ACTIVATED_CARD_W * OPP_SCALE);
export const OPP_ACT_H = Math.round(ACTIVATED_CARD_H * OPP_SCALE);
export const OPP_ACT_GAP = Math.max(1, Math.round(ACTIVATED_CARD_GAP * OPP_SCALE));
export const OPP_HAND_W = Math.round(HAND_CARD_W * OPP_SCALE);
export const OPP_HAND_H = Math.round(HAND_CARD_H * OPP_SCALE); // scales with portal card size

// Relative offsets from the virtual zone's top-left corner (i.e. position in scaled player space)
export const OPP_HAND_REL_X = Math.round((HAND_AREA_X - PORTAL_X) * OPP_SCALE);
export const OPP_HAND_REL_Y = Math.round((HAND_CENTER_Y - PORTAL_Y) * OPP_SCALE); // center-y of hand area
export const OPP_SLOT_REL_X = Math.round((SLOT_AREA_X - PORTAL_X) * OPP_SCALE);
export const OPP_SLOT_REL_Y = Math.round((SLOT_AREA_Y - PORTAL_Y) * OPP_SCALE);
// Y offset from virtual zone top-left (-hh): centers portal image around slot card center
export const OPP_PORTAL_IMG_REL_Y = Math.round(OPP_SLOT_REL_Y + OPP_SLOT_H / 2 - OPP_PORTAL_IMG_H / 2);
export const OPP_ACT_REL_X = Math.round((ACTIVATED_GRID_X - PORTAL_X) * OPP_SCALE);
export const OPP_ACT_REL_Y = Math.round((ACTIVATED_GRID_Y - PORTAL_Y) * OPP_SCALE);

/**
 * Get portal image filename based on colorIndex and starting player status.
 */
export function getPortalImageName(colorIndex: number, isStartingPlayer: boolean): string {
  if (isStartingPlayer) return `Portal-Startspieler${colorIndex}.jpeg`;
  return `Portal${colorIndex}.jpeg`;
}

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
 * Returns the four opponent zone bounding boxes and their rotation in degrees.
 * Order: [left (90°), top-left (180°), top-right (180°), right (270°)]
 * Matches the layout used in drawOpponentPortals / buildOpponentsArray.
 */
export function getOpponentZones(): Array<{ zone: { x: number; y: number; w: number; h: number }; rotationDeg: number }> {
  const halfCenter = (BASE_W - 2 * MARGIN_H) / 2;
  return [
    { zone: { x: 0,                     y: ZONE_TOP_H, w: MARGIN_H,   h: ZONE_CENTER_H }, rotationDeg: 90 },
    { zone: { x: MARGIN_H,              y: 0,          w: halfCenter, h: ZONE_TOP_H },    rotationDeg: 180 },
    { zone: { x: MARGIN_H + halfCenter, y: 0,          w: halfCenter, h: ZONE_TOP_H },    rotationDeg: 180 },
    { zone: { x: BASE_W - MARGIN_H,     y: ZONE_TOP_H, w: MARGIN_H,   h: ZONE_CENTER_H }, rotationDeg: 270 },
  ];
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
