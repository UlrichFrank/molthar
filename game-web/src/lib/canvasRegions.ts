/**
 * CanvasRegion — unified descriptor for all interactive canvas elements.
 * Covers: auslage cards, portal slots, hand cards, activated characters,
 *         decks, and canvas UI buttons (End Turn, Discard Cards).
 *
 * Single source of truth for both hit-testing and drawing effects.
 */

import type { GameState } from '@portale-von-molthar/shared';
import {
  AUSLAGE_START_X, AUSLAGE_START_Y, CARD_W, CARD_H, CARD_GAP,
  SLOT_W, SLOT_H,
  HAND_CARD_W, HAND_CARD_H, HAND_MAX,
  ACTIVATED_MAX,
  CHAR_DECK_X, CHAR_DECK_Y, PEARL_DECK_X, PEARL_DECK_Y,
  DECK_CARD_W, DECK_CARD_H,
  UI_PANEL_X, UI_PANEL_Y, UI_PANEL_W, UI_PANEL_H,
  getHandCardPosition,
  getPortalSlotPosition,
  getActivatedCardPosition,
} from './cardLayoutConstants';

export type CanvasRegionType =
  | 'auslage-card'
  | 'portal-slot'
  | 'hand-card'
  | 'activated-character'
  | 'deck-character'
  | 'deck-pearl'
  | 'ui-end-turn'
  | 'ui-discard-cards';

export interface CanvasRegion {
  type: CanvasRegionType;
  id: number | string;
  /** Top-left x, or center-x when centered=true */
  x: number;
  /** Top-left y, or center-y when centered=true */
  y: number;
  w: number;
  h: number;
  /** Rotation in radians. For centered=true regions, rotated around (x,y). */
  angle?: number;
  /** When true, x/y is the CENTER of the element (used for hand cards). */
  centered?: boolean;
  /** 0–1: smooth hover glow intensity. Mutated directly by rAF loop. */
  hoverProgress: number;
  /** 0–1: click/tap flash intensity. Set to 1.0 on interaction, decays to 0. */
  flashProgress: number;
  /** Text label for UI buttons */
  label?: string;
  /** When false, no hover effect and no interaction response */
  enabled?: boolean;
}

/**
 * Hit-test a single region against a model-coordinate pointer position.
 */
export function hitTestRegion(px: number, py: number, region: CanvasRegion): boolean {
  const { x, y, w, h, angle, centered } = region;
  if (centered) {
    // x,y is center; rotate point into local space
    const a = angle ?? 0;
    const cos = Math.cos(-a);
    const sin = Math.sin(-a);
    const dx = px - x;
    const dy = py - y;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return rx >= -w / 2 && rx <= w / 2 && ry >= -h / 2 && ry <= h / 2;
  }
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

/**
 * Find the first region hit by (px, py), or null.
 */
export function hitTestRegions(px: number, py: number, regions: CanvasRegion[]): CanvasRegion | null {
  // Iterate in reverse so last-drawn (topmost) elements are hit first
  for (let i = regions.length - 1; i >= 0; i--) {
    if (hitTestRegion(px, py, regions[i])) {
      return regions[i];
    }
  }
  return null;
}

function animState(existing: CanvasRegion[], type: CanvasRegionType, id: number | string) {
  const found = existing.find(r => r.type === type && r.id === id);
  return {
    hoverProgress: found?.hoverProgress ?? 0,
    flashProgress: found?.flashProgress ?? 0,
  };
}

/**
 * Build (or update in-place) the full CanvasRegion list from the current game state.
 * Preserves hoverProgress/flashProgress from existing regions to avoid animation resets.
 *
 * @param G          Current game state
 * @param playerID   Local player's ID
 * @param isActive   Whether the local player is currently active
 * @param existing   Previous regions array (for animation state preservation)
 */
export function buildCanvasRegions(
  G: GameState,
  playerID: string,
  isActive: boolean,
  existing: CanvasRegion[] = []
): CanvasRegion[] {
  const regions: CanvasRegion[] = [];
  const me = G.players?.[playerID];
  const characterSlots = G.characterSlots ?? [];
  const pearlSlots = G.pearlSlots ?? [];

  // --- Auslage: 2 character slots (indices 0,1) ---
  for (let i = 0; i < 2; i++) {
    if (characterSlots[i]) {
      regions.push({
        type: 'auslage-card', id: i,
        x: AUSLAGE_START_X + i * (CARD_W + CARD_GAP),
        y: AUSLAGE_START_Y,
        w: CARD_W, h: CARD_H,
        ...animState(existing, 'auslage-card', i),
      });
    }
  }

  // --- Auslage: 4 pearl slots (indices 2–5) ---
  for (let i = 0; i < 4; i++) {
    const slotIndex = i + 2;
    if (pearlSlots[i]) {
      regions.push({
        type: 'auslage-card', id: slotIndex,
        x: AUSLAGE_START_X + slotIndex * (CARD_W + CARD_GAP),
        y: AUSLAGE_START_Y,
        w: CARD_W, h: CARD_H,
        ...animState(existing, 'auslage-card', slotIndex),
      });
    }
  }

  // --- Portal slots (always 2) ---
  for (let i = 0; i < 2; i++) {
    const { slotX, slotY } = getPortalSlotPosition(i);
    regions.push({
      type: 'portal-slot', id: i,
      x: slotX, y: slotY, w: SLOT_W, h: SLOT_H,
      ...animState(existing, 'portal-slot', i),
    });
  }

  // --- Hand cards ---
  const hand = me?.hand ?? [];
  const count = Math.min(hand.length, HAND_MAX);
  for (let i = 0; i < count; i++) {
    const { cx, cy, angle } = getHandCardPosition(count, i);
    regions.push({
      type: 'hand-card', id: i,
      x: cx, y: cy,
      w: HAND_CARD_W, h: HAND_CARD_H,
      angle, centered: true,
      ...animState(existing, 'hand-card', i),
    });
  }

  // --- Activated characters ---
  const activated = (me?.activatedCharacters ?? []).slice(0, ACTIVATED_MAX);
  for (let i = 0; i < activated.length; i++) {
    const { cardX, cardY, w, h } = getActivatedCardPosition(i);
    regions.push({
      type: 'activated-character', id: i,
      x: cardX, y: cardY, w, h,
      angle: Math.PI,
      ...animState(existing, 'activated-character', i),
    });
  }

  // --- Character deck ---
  if ((G.characterDeck?.length ?? 0) > 0) {
    // After 90° CCW rotation the bounding box shifts: x -= DECK_CARD_H, w = DECK_CARD_H, h = DECK_CARD_W
    regions.push({
      type: 'deck-character', id: 'deck-character',
      x: CHAR_DECK_X - DECK_CARD_H, y: CHAR_DECK_Y,
      w: DECK_CARD_H, h: DECK_CARD_W,
      ...animState(existing, 'deck-character', 'deck-character'),
    });
  }

  // --- Pearl deck ---
  if ((G.pearlDeck?.length ?? 0) > 0) {
    regions.push({
      type: 'deck-pearl', id: 'deck-pearl',
      x: PEARL_DECK_X - DECK_CARD_H, y: PEARL_DECK_Y,
      w: DECK_CARD_H, h: DECK_CARD_W,
      ...animState(existing, 'deck-pearl', 'deck-pearl'),
    });
  }

  // --- UI buttons (active player only) ---
  if (isActive) {
    const maxActions = G.maxActions ?? 3;
    const actionCount = G.actionCount ?? 0;

    if (G.requiresHandDiscard) {
      // Show "Discard Cards" button (replaces End Turn)
      regions.push({
        type: 'ui-discard-cards', id: 'ui-discard-cards',
        x: UI_PANEL_X, y: UI_PANEL_Y, w: UI_PANEL_W, h: UI_PANEL_H,
        label: 'Discard Cards',
        enabled: true,
        ...animState(existing, 'ui-discard-cards', 'ui-discard-cards'),
      });
    } else {
      // Show action counter / End Turn button
      const endTurnEnabled = actionCount >= maxActions;
      regions.push({
        type: 'ui-end-turn', id: 'ui-end-turn',
        x: UI_PANEL_X, y: UI_PANEL_Y, w: UI_PANEL_W, h: UI_PANEL_H,
        label: endTurnEnabled ? 'End Turn' : `${actionCount} / ${maxActions}`,
        enabled: endTurnEnabled,
        ...animState(existing, 'ui-end-turn', 'ui-end-turn'),
      });
    }
  }

  return regions;
}
