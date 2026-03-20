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
  BTN_X,
  BTN_W,
  BTN_H,
  BTN_Y_1,
  BTN_Y_2,
  BTN_Y_3,
  getHandCardPosition,
  getPortalSlotPosition,
} from './cardLayoutConstants';

export interface HitTarget {
  type: 'auslage-card' | 'portal-slot' | 'hand-card' | 'button' | 'none';
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
 * Finde welcher Portal-Slot geklickt wurde (0-3)
 */
export function hitTestPortalSlots(x: number, y: number): number | null {
  for (let i = 0; i < 4; i++) {
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
 * Finde welcher Button geklickt wurde
 */
export function hitTestButtons(x: number, y: number): string | null {
  const buttons = [
    { id: 'take-pearl', y: BTN_Y_1 },
    { id: 'activate-character', y: BTN_Y_2 },
    { id: 'end-turn', y: BTN_Y_3 },
  ];

  for (const btn of buttons) {
    if (pointInRect(x, y, BTN_X, btn.y, BTN_W, BTN_H)) {
      return btn.id;
    }
  }
  return null;
}

/**
 * Haupt-Hit-Detection: Welches Objekt wurde geklickt?
 */
export function hitTest(x: number, y: number): HitTarget {
  // Buttons first (highest priority)
  const button = hitTestButtons(x, y);
  if (button) {
    return { type: 'button', id: button, x: BTN_X, y: 0, w: BTN_W, h: BTN_H };
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
    const cardX = HAND_START_X + handIdx * (HAND_CARD_W + 5);
    return {
      type: 'hand-card',
      id: handIdx,
      x: cardX,
      y: HAND_START_Y,
      w: HAND_CARD_W,
      h: HAND_CARD_H,
    };
  }

  return { type: 'none', id: '', x: 0, y: 0, w: 0, h: 0 };
}
