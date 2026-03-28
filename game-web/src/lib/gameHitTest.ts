/**
 * Hit Detection System für Canvas-basierte Spielelemente
 * Konvertiert Pointer-Koordinaten zu Spielobjekt-IDs
 * Uses shared card layout constants from cardLayoutConstants.ts
 */

import {
  BASE_W,
  BASE_H,
  ZONE_TOP_H,
  MARGIN_H,
  ZONE_CENTER_H,
  ZONE_PLAYER_H,
  CARD_W,
  CARD_H,
  CARD_GAP,
  AUSLAGE_START_X,
  AUSLAGE_START_Y,
  PORTAL_X,
  PORTAL_W,
  PORTAL_Y,
  SLOT_AREA_X,
  SLOT_AREA_Y,
  SLOT_W,
  SLOT_H,
  SLOT_GAP,
  HAND_AREA_X,
  HAND_AREA_W,
  HAND_CENTER_Y,
  HAND_CARD_W,
  HAND_CARD_H,
  HAND_MAX,
  ACTIVATED_GRID_X,
  ACTIVATED_GRID_Y,
  ACTIVATED_CARD_W,
  ACTIVATED_CARD_H,
  ACTIVATED_CARD_GAP,
  ACTIVATED_MAX,
  DECK_CARD_W,
  DECK_CARD_H,
  CHAR_DECK_X,
  CHAR_DECK_Y,
  PEARL_DECK_X,
  PEARL_DECK_Y,
  getHandCardPosition,
  getPortalSlotPosition,
  getActivatedCardPosition,
} from './cardLayoutConstants';

export interface HitTarget {
  type: 'auslage-card' | 'portal-slot' | 'hand-card' | 'activated-character' | 'deck-character' | 'deck-pearl' | 'none';
  id: number | string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Teste ob Punkt in Rectangle ist
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Finde welche Auslage-Karte geklickt wurde (0-5)
 */
export function hitTestAuslage(x: number, y: number): number | null {
  for (let i = 0; i < 6; i++) {
    const cardX = AUSLAGE_START_X + i * (CARD_W + CARD_GAP);
    const cardY = AUSLAGE_START_Y;

    if (pointInRect(x, y, cardX, cardY, CARD_W, CARD_H)) {
      return i;
    }
  }
  return null;
}

/**
 * Finde welcher Portal-Slot geklickt wurde (0-1, max 2 slots)
 */
export function hitTestPortalSlots(x: number, y: number): number | null {
  for (let i = 0; i < 2; i++) {
    const slotX = SLOT_AREA_X + i * (SLOT_W + SLOT_GAP);
    const slotY = SLOT_AREA_Y;

    if (pointInRect(x, y, slotX, slotY, SLOT_W, SLOT_H)) {
      return i;
    }
  }
  return null;
}

/**
 * Finde welche Hand-Karte geklickt wurde (0-8, max 9 cards)
 * Uses getHandCardPosition() from cardLayoutConstants for consistent positioning
 */
export function hitTestHandCards(x: number, y: number): number | null {
  // Test all possible hand card positions
  for (let i = 0; i < HAND_MAX; i++) {
    const pos = getHandCardPosition(HAND_MAX, i);
    const { cx, cy, angle } = pos;

    // inverse-rotate point to test against axis-aligned rect
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const dx = x - cx;
    const dy = y - cy;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;

    if (rx >= -HAND_CARD_W / 2 && rx <= HAND_CARD_W / 2 && ry >= -HAND_CARD_H / 2 && ry <= HAND_CARD_H / 2) {
      return i;
    }
  }
  return null;
}

/**
 * Finde welche aktivierte Charakterkarte geklickt wurde (0-11, max 12 cards)
 * Activated cards are displayed in a 3x4 grid to the right of the portal
 */
export function hitTestActivatedGrid(x: number, y: number): number | null {
  // Test all possible grid positions
  for (let i = 0; i < ACTIVATED_MAX; i++) {
    const { cardX, cardY, w, h } = getActivatedCardPosition(i);
    
    if (pointInRect(x, y, cardX, cardY, w, h)) {
      return i;
    }
  }
  return null;
}

/**
 * Check if click is on character deck
 * Decks are rotated 90°, so we test the rotated bounds
 * After 90° CCW rotation: bounding box shifts left by DECK_CARD_H
 */
export function hitTestCharacterDeck(x: number, y: number, deckCount: number): boolean {
  if (deckCount <= 0) return false;

  // Character deck bounds - account for 90° rotation
  // After 90° CCW rotation, the deck extends from (x - DECK_CARD_H, y) to (x, y + DECK_CARD_W)
  const deckX = CHAR_DECK_X - DECK_CARD_H;
  const deckWidth = DECK_CARD_H;
  const deckHeight = DECK_CARD_W;

  return pointInRect(x, y, deckX, CHAR_DECK_Y, deckWidth, deckHeight);
}

/**
 * Check if click is on pearl deck
 * Decks are rotated 90°, so we test the rotated bounds
 * After 90° CCW rotation: bounding box shifts left by DECK_CARD_H
 */
export function hitTestPearlDeck(x: number, y: number, deckCount: number): boolean {
  if (deckCount <= 0) return false;

  // Pearl deck bounds - account for 90° rotation
  // After 90° CCW rotation, the deck extends from (x - DECK_CARD_H, y) to (x, y + DECK_CARD_W)
  const deckX = PEARL_DECK_X - DECK_CARD_H;
  const deckWidth = DECK_CARD_H;
  const deckHeight = DECK_CARD_W;

  return pointInRect(x, y, deckX, PEARL_DECK_Y, deckWidth, deckHeight);
}

/**
 * Haupt-Hit-Detection: Welches Objekt wurde geklickt?
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param characterDeckCount - Number of cards in character deck (optional, for deck hit testing)
 * @param pearlDeckCount - Number of cards in pearl deck (optional, for deck hit testing)
 */
export function hitTest(x: number, y: number, characterDeckCount: number = 0, pearlDeckCount: number = 0): HitTarget {
  // Character Deck
  if (hitTestCharacterDeck(x, y, characterDeckCount)) {
    const deckX = CHAR_DECK_X - DECK_CARD_H; // After 90° rotation, shifts left
    const deckWidth = DECK_CARD_H;
    const deckHeight = DECK_CARD_W;
    return {
      type: 'deck-character',
      id: 'deck-character',
      x: deckX,
      y: CHAR_DECK_Y,
      w: deckWidth,
      h: deckHeight,
    };
  }

  // Pearl Deck
  if (hitTestPearlDeck(x, y, pearlDeckCount)) {
    const deckX = PEARL_DECK_X - DECK_CARD_H; // After 90° rotation, shifts left
    const deckWidth = DECK_CARD_H;
    const deckHeight = DECK_CARD_W;
    return {
      type: 'deck-pearl',
      id: 'deck-pearl',
      x: deckX,
      y: PEARL_DECK_Y,
      w: deckWidth,
      h: deckHeight,
    };
  }

  // Auslage
  const auslageIdx = hitTestAuslage(x, y);
  if (auslageIdx !== null) {
    const cardX = AUSLAGE_START_X + auslageIdx * (CARD_W + CARD_GAP);
    return {
      type: 'auslage-card',
      id: auslageIdx,
      x: cardX,
      y: AUSLAGE_START_Y,
      w: CARD_W,
      h: CARD_H,
    };
  }

  // Portal Slots
  const slotIdx = hitTestPortalSlots(x, y);
  if (slotIdx !== null) {
    const slotX = SLOT_AREA_X + slotIdx * (SLOT_W + SLOT_GAP);
    return {
      type: 'portal-slot',
      id: slotIdx,
      x: slotX,
      y: SLOT_AREA_Y,
      w: SLOT_W,
      h: SLOT_H,
    };
  }

  // Hand Cards
  const handIdx = hitTestHandCards(x, y);
  if (handIdx !== null) {
    const cardX = HAND_AREA_X + handIdx * (HAND_CARD_W + 5);
    return {
      type: 'hand-card',
      id: handIdx,
      x: cardX,
      y: HAND_CENTER_Y,
      w: HAND_CARD_W,
      h: HAND_CARD_H,
    };
  }

  // Activated Characters Grid
  const activatedIdx = hitTestActivatedGrid(x, y);
  if (activatedIdx !== null) {
    const { cardX, cardY, w, h } = getActivatedCardPosition(activatedIdx);
    return {
      type: 'activated-character',
      id: activatedIdx,
      x: cardX,
      y: cardY,
      w: w,
      h: h,
    };
  }

  return { type: 'none', id: '', x: 0, y: 0, w: 0, h: 0 };
}
