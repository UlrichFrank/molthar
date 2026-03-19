/**
 * Hit Detection System für Canvas-basierte Spielelemente
 * Konvertiert Pointer-Koordinaten zu Spielobjekt-IDs
 */

export interface HitTarget {
  type: 'auslage-card' | 'portal-slot' | 'hand-card' | 'button' | 'none';
  id: number | string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Model Koordinaten und Layout (müssen mit gameRender.ts sync sein)
const BASE_W = 1200;

// Layout proportions
const ZONE_TOP_H = 200; // Höhe der oberen Zonen (px)
// Seitenbreite soll der Höhe der Top-Zonen entsprechen
const MARGIN_H = ZONE_TOP_H; // linke/rechte Bereichsbreite (px)
const ZONE_CENTER_H = 320; // Höhe der zentralen Auslage

// Card dimensions (Auslage) — must match gameRender.ts
const CARD_W = Math.round(59 * 1.5); // 89
const CARD_H = Math.round(92 * 1.5); // 138
const CARD_GAP = Math.round(10 * 1.5); // 15

// Calculated positions for Auslage
const AUSLAGE_CENTER_X = MARGIN_H;
const AUSLAGE_CENTER_W = BASE_W - 2 * MARGIN_H;
const AUSLAGE_START_X = AUSLAGE_CENTER_X + (AUSLAGE_CENTER_W - (6 * CARD_W + 5 * CARD_GAP)) / 2;
// Place Auslage 5% from top of the Auslage area to match rendering
const AUSLAGE_START_Y = ZONE_TOP_H + ZONE_CENTER_H * 0.05;

// Portal positions
const PORTAL_X = MARGIN_H;
const PORTAL_W = BASE_W - 2 * MARGIN_H;
const PORTAL_Y = ZONE_TOP_H + ZONE_CENTER_H;

// Slot positions within portal
const SLOT_AREA_X = PORTAL_X + PORTAL_W / 3;
const SLOT_AREA_Y = PORTAL_Y + 40;
const SLOT_W = 50;
const SLOT_H = 75;
const SLOT_GAP = 12;

// Hand positions within portal
const HAND_START_X = SLOT_AREA_X + 280;
const HAND_START_Y = SLOT_AREA_Y;
const HAND_CARD_W = 38;
const HAND_CARD_H = 56;

// Button positions
const BTN_X = BASE_W - MARGIN_H - 140;
const BTN_W = 130;
const BTN_H = 35;
const BTN_Y_1 = PORTAL_Y + 40;
const BTN_Y_2 = BTN_Y_1 + BTN_H + 8;
const BTN_Y_3 = BTN_Y_1 + (BTN_H + 8) * 2;

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
 * Finde welche Hand-Karte geklickt wurde (0-5)
 */
export function hitTestHandCards(x: number, y: number): number | null {
  for (let i = 0; i < 6; i++) {
    const cardX = HAND_START_X + i * (HAND_CARD_W + 5);
    const cardY = HAND_START_Y;

    if (pointInRect(x, y, cardX, cardY, HAND_CARD_W, HAND_CARD_H)) {
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

/**
 * Berechne Swap-Distance für Drag-Operationen
 */
export function getDragDistance(startX: number, startY: number, endX: number, endY: number): number {
  const dx = endX - startX;
  const dy = endY - startY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Test ob Drag "significantly" war (> Threshold)
 */
export function isSignificantDrag(distance: number, threshold = 30): boolean {
  return distance > threshold;
}
