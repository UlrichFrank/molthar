/**
 * CanvasRegion — unified descriptor for all interactive canvas elements.
 * Covers: auslage cards, portal slots, hand cards, activated characters,
 *         decks, canvas UI buttons (End Turn, Discard Cards), and
 *         opponent portal cards (irrlicht shared activation).
 *
 * Single source of truth for both hit-testing and drawing effects.
 */

import type { GameState, ActivatedCharacter } from '@portale-von-molthar/shared';
import {
  AUSLAGE_START_X, AUSLAGE_START_Y, CARD_W, CARD_H, CARD_GAP,
  SLOT_W, SLOT_H,
  HAND_CARD_W, HAND_CARD_H, HAND_MAX,
  ACTIVATED_PAGE_SIZE,
  ACTIVATED_GRID_X, ACTIVATED_GRID_Y,
  ACTIVATED_GRID_COLS, ACTIVATED_GRID_ROWS,
  ACTIVATED_CARD_W, ACTIVATED_CARD_GAP, ACTIVATED_GRID_H,
  ACTIVATED_ARROW_SIZE, ACTIVATED_ARROW_MARGIN,
  CHAR_DECK_X, CHAR_DECK_Y, PEARL_DECK_X, PEARL_DECK_Y,
  DECK_CARD_W, DECK_CARD_H,
  UI_PANEL_X, UI_PANEL_Y, UI_PANEL_W, UI_PANEL_H,
  OPP_SCALED_W, OPP_SCALED_H, OPP_SLOT_W, OPP_SLOT_H, OPP_SLOT_GAP,
  OPP_SLOT_REL_X, OPP_SLOT_REL_Y,
  OPP_ACT_REL_X, OPP_ACT_REL_Y, OPP_ACT_W, OPP_ACT_H, OPP_ACT_GAP,
  OPP_SCALE,
  getHandCardPosition,
  getPortalSlotPosition,
  getActivatedCardPosition,
  getOpponentZones,
} from './cardLayoutConstants';

export type CanvasRegionType =
  | 'auslage-card'
  | 'portal-slot'
  | 'portal-swap-btn'
  | 'hand-card'
  | 'activated-character'
  | 'deck-character'
  | 'deck-pearl'
  | 'ui-discard-cards'
  | 'ui-replace-pearl-slots'
  | 'ui-replace-pearl-slots-ability'
  | 'opponent-portal-card'
  | 'opponent-activated-character'
  | 'activated-page-arrow';

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
  /** For 'activated-page-arrow' regions: navigation direction */
  direction?: 'prev' | 'next';
  /** For 'activated-page-arrow' regions: 'own' or opponent player ID */
  arrowPlayerId?: string;
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

export interface NeighborOpponent {
  playerId: string;
  portal: ActivatedCharacter[];
  /** Zone index in getOpponentZones(): 0=left, 1=top-left, 2=top-right, 3=right */
  zoneIndex: 0 | 1 | 2 | 3;
}

/**
 * Build (or update in-place) the full CanvasRegion list from the current game state.
 * Preserves hoverProgress/flashProgress from existing regions to avoid animation resets.
 *
 * @param G                   Current game state
 * @param playerID            Local player's ID
 * @param isActive            Whether the local player is currently active
 * @param existing            Previous regions array (for animation state preservation)
 * @param allOpponentPortals  All opponents (all four zones) for portal-card regions
 */
export interface CanvasLabels {
  swap: string;
  discardCards: string;
  freePearlReplace: string;
}

export function buildCanvasRegions(
  G: GameState,
  playerID: string,
  isActive: boolean,
  existing: CanvasRegion[] = [],
  allOpponentPortals: NeighborOpponent[] = [],
  labels?: CanvasLabels,
  ownActivatedPage: number = 0,
  opponentActivatedPages: Record<string, number> = {}
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

  // --- Portal slots (only when occupied) ---
  for (let i = 0; i < 2; i++) {
    if (!me?.portal[i]) continue;
    const { slotX, slotY } = getPortalSlotPosition(i);
    regions.push({
      type: 'portal-slot', id: i,
      x: slotX, y: slotY, w: SLOT_W, h: SLOT_H,
      ...animState(existing, 'portal-slot', i),
    });
  }

  // --- Portal swap buttons (below each occupied portal slot, only when changeCharacterActions active and actionCount === 0) ---
  const hasSwapAbility = isActive &&
    (G.actionCount ?? 0) === 0 &&
    (me?.activeAbilities ?? []).some(a => a.type === 'changeCharacterActions');
  if (hasSwapAbility) {
    const SWAP_BTN_H = 24;
    const SWAP_BTN_GAP = 4;
    for (let i = 0; i < 2; i++) {
      if (me?.portal[i]) {
        const { slotX, slotY } = getPortalSlotPosition(i);
        regions.push({
          type: 'portal-swap-btn', id: i,
          x: slotX, y: slotY + SLOT_H + SWAP_BTN_GAP,
          w: SLOT_W, h: SWAP_BTN_H,
          ...animState(existing, 'portal-swap-btn', i),
        });
      }
    }
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

  // --- Activated characters (page-sliced, absolute id) ---
  {
    const allActivated = me?.activatedCharacters ?? [];
    const totalActivated = allActivated.length;
    const pageStart = ownActivatedPage * ACTIVATED_PAGE_SIZE;
    const pageSlice = allActivated.slice(pageStart, pageStart + ACTIVATED_PAGE_SIZE);
    for (let i = 0; i < pageSlice.length; i++) {
      const absoluteIndex = pageStart + i;
      const { cardX, cardY, w, h } = getActivatedCardPosition(i); // page-local index for position
      regions.push({
        type: 'activated-character', id: absoluteIndex,
        x: cardX, y: cardY, w, h,
        angle: Math.PI,
        ...animState(existing, 'activated-character', absoluteIndex),
      });
    }

    // --- Pagination arrows (own player) ---
    const arrowHalfSize = ACTIVATED_ARROW_SIZE / 2;
    const arrowCY = ACTIVATED_GRID_Y + ACTIVATED_GRID_H / 2;
    const gridWidth = ACTIVATED_GRID_COLS * ACTIVATED_CARD_W + (ACTIVATED_GRID_COLS - 1) * ACTIVATED_CARD_GAP;

    // Left (prev) arrow
    const leftArrowX = ACTIVATED_GRID_X - ACTIVATED_ARROW_MARGIN - ACTIVATED_ARROW_SIZE;
    regions.push({
      type: 'activated-page-arrow', id: 'own:prev',
      direction: 'prev', arrowPlayerId: 'own',
      x: leftArrowX, y: arrowCY - arrowHalfSize,
      w: ACTIVATED_ARROW_SIZE, h: ACTIVATED_ARROW_SIZE,
      enabled: ownActivatedPage > 0,
      ...animState(existing, 'activated-page-arrow', 'own:prev'),
    });

    // Right (next) arrow
    const rightArrowX = ACTIVATED_GRID_X + gridWidth + ACTIVATED_ARROW_MARGIN;
    regions.push({
      type: 'activated-page-arrow', id: 'own:next',
      direction: 'next', arrowPlayerId: 'own',
      x: rightArrowX, y: arrowCY - arrowHalfSize,
      w: ACTIVATED_ARROW_SIZE, h: ACTIVATED_ARROW_SIZE,
      enabled: totalActivated > ACTIVATED_PAGE_SIZE * (ownActivatedPage + 1),
      ...animState(existing, 'activated-page-arrow', 'own:next'),
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

  // --- Replace pearl slots button (below pearl deck) ---
  {
    const REPLACE_BTN_H = 24;
    const REPLACE_BTN_GAP = 4;
    const actionCount = G.actionCount ?? 0;
    const maxActions = G.maxActions ?? 3;
    const hasFreeAbility = me?.activeAbilities?.some(a => a.type === 'replacePearlSlotsBeforeFirstAction') ?? false;
    const freeAbilityAvailable = isActive && actionCount === 0 && hasFreeAbility && !(G.replacePearlSlotsAbilityUsed ?? false);

    if (freeAbilityAvailable) {
      // Show free replace button (no action cost); hide normal button
      regions.push({
        type: 'ui-replace-pearl-slots-ability', id: 'ui-replace-pearl-slots-ability',
        x: PEARL_DECK_X - DECK_CARD_H, y: PEARL_DECK_Y + DECK_CARD_W + REPLACE_BTN_GAP,
        w: DECK_CARD_H, h: REPLACE_BTN_H,
        label: labels?.freePearlReplace ?? 'Gratis tauschen',
        enabled: true,
        ...animState(existing, 'ui-replace-pearl-slots-ability', 'ui-replace-pearl-slots-ability'),
      });
    } else if (isActive && actionCount < maxActions) {
      // Show normal replace button (costs an action)
      regions.push({
        type: 'ui-replace-pearl-slots', id: 'ui-replace-pearl-slots',
        x: PEARL_DECK_X - DECK_CARD_H, y: PEARL_DECK_Y + DECK_CARD_W + REPLACE_BTN_GAP,
        w: DECK_CARD_H, h: REPLACE_BTN_H,
        label: labels?.swap ?? 'Tauschen',
        enabled: true,
        ...animState(existing, 'ui-replace-pearl-slots', 'ui-replace-pearl-slots'),
      });
    }
  }

  // --- UI buttons (active player only) ---
  if (isActive) {
    const maxActions = G.maxActions ?? 3;
    const actionCount = G.actionCount ?? 0;

    if (G.requiresHandDiscard && actionCount >= maxActions) {
      // Show "Discard Cards" button
      regions.push({
        type: 'ui-discard-cards', id: 'ui-discard-cards',
        x: UI_PANEL_X, y: UI_PANEL_Y, w: UI_PANEL_W, h: UI_PANEL_H,
        label: labels?.discardCards ?? 'Discard Cards',
        enabled: true,
        ...animState(existing, 'ui-discard-cards', 'ui-discard-cards'),
      });
    }
    // ui-end-turn removed — end-turn is handled by HTML EndTurnButton overlay
  }

  // --- Opponent portal cards (always visible for all opponent zones) ---
  if (allOpponentPortals.length > 0) {
    const zones = getOpponentZones();
    const hw = OPP_SCALED_W / 2;
    const hh = OPP_SCALED_H / 2;

    for (const neighbor of allOpponentPortals) {
      const { zone, rotationDeg } = zones[neighbor.zoneIndex];
      const rot = (rotationDeg * Math.PI) / 180;
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;

      for (let i = 0; i < neighbor.portal.length; i++) {
        const entry = neighbor.portal[i];
        if (!entry) continue;

        // Slot position in local (rotated) coordinate system, relative to zone center
        const localX = -hw + OPP_SLOT_REL_X + i * (OPP_SLOT_W + OPP_SLOT_GAP);
        const localY = -hh + OPP_SLOT_REL_Y;
        const slotCX = localX + OPP_SLOT_W / 2;
        const slotCY = localY + OPP_SLOT_H / 2;

        // Rotate into world coordinates
        const worldX = cx + slotCX * Math.cos(rot) - slotCY * Math.sin(rot);
        const worldY = cy + slotCX * Math.sin(rot) + slotCY * Math.cos(rot);

        const regionId = `${neighbor.playerId}:${i}`;
        regions.push({
          type: 'opponent-portal-card',
          id: regionId,
          x: worldX, y: worldY,
          w: OPP_SLOT_W, h: OPP_SLOT_H,
          angle: rot,
          centered: true,
          ...animState(existing, 'opponent-portal-card', regionId),
        });
      }
    }
  }

  // --- Opponent activated characters (all opponents, all zones) ---
  {
    const playerOrder = G.playerOrder || Object.keys(G.players || {});
    const n = playerOrder.length;
    const myIndex = playerOrder.indexOf(playerID);

    function getOppAt(offset: number): { playerId: string; activatedCharacters: ActivatedCharacter[] } | null {
      const idx = ((myIndex + offset) % n + n) % n;
      if (idx === myIndex) return null;
      const pid = playerOrder[idx];
      if (!pid) return null;
      const player = G.players?.[pid];
      if (!player) return null;
      return { playerId: pid, activatedCharacters: player.activatedCharacters ?? [] };
    }

    const opponentByZone: Array<{ playerId: string; activatedCharacters: ActivatedCharacter[] } | null> = [null, null, null, null];
    if (n === 2) {
      opponentByZone[0] = getOppAt(1);
    } else if (n === 3) {
      opponentByZone[0] = getOppAt(1);
      opponentByZone[3] = getOppAt(-1);
    } else if (n === 4) {
      opponentByZone[0] = getOppAt(1);
      opponentByZone[1] = getOppAt(2);
      opponentByZone[3] = getOppAt(-1);
    } else if (n >= 5) {
      opponentByZone[0] = getOppAt(1);
      opponentByZone[1] = getOppAt(-2);
      opponentByZone[2] = getOppAt(2);
      opponentByZone[3] = getOppAt(-1);
    }

    const zones = getOpponentZones();
    const hw = OPP_SCALED_W / 2;
    const hh = OPP_SCALED_H / 2;

    // Scaled arrow constants for opponent zones
    const oppArrowSize = Math.max(4, Math.round(ACTIVATED_ARROW_SIZE * OPP_SCALE));
    const oppArrowMargin = Math.max(1, Math.round(ACTIVATED_ARROW_MARGIN * OPP_SCALE));
    const oppGridW = ACTIVATED_GRID_COLS * OPP_ACT_W + (ACTIVATED_GRID_COLS - 1) * OPP_ACT_GAP;
    const oppGridH = ACTIVATED_GRID_ROWS * OPP_ACT_H + (ACTIVATED_GRID_ROWS - 1) * OPP_ACT_GAP;

    for (let zoneIndex = 0; zoneIndex < 4; zoneIndex++) {
      const opp = opponentByZone[zoneIndex];
      if (!opp || opp.activatedCharacters.length === 0) continue;
      const { zone, rotationDeg } = zones[zoneIndex];
      const rot = (rotationDeg * Math.PI) / 180;
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;

      const oppPage = opponentActivatedPages[opp.playerId] ?? 0;
      const oppPageStart = oppPage * ACTIVATED_PAGE_SIZE;
      const oppPageSlice = opp.activatedCharacters.slice(oppPageStart, oppPageStart + ACTIVATED_PAGE_SIZE);

      for (let i = 0; i < oppPageSlice.length; i++) {
        const col = i % ACTIVATED_GRID_COLS;
        const row = Math.floor(i / ACTIVATED_GRID_COLS);
        const localX = -hw + OPP_ACT_REL_X + col * (OPP_ACT_W + OPP_ACT_GAP);
        const localY = -hh + OPP_ACT_REL_Y + row * (OPP_ACT_H + OPP_ACT_GAP);
        const slotCX = localX + OPP_ACT_W / 2;
        const slotCY = localY + OPP_ACT_H / 2;

        const worldX = cx + slotCX * Math.cos(rot) - slotCY * Math.sin(rot);
        const worldY = cy + slotCX * Math.sin(rot) + slotCY * Math.cos(rot);

        const absoluteIndex = oppPageStart + i;
        const regionId = `${opp.playerId}:${absoluteIndex}`;
        regions.push({
          type: 'opponent-activated-character',
          id: regionId,
          x: worldX, y: worldY,
          w: OPP_ACT_W, h: OPP_ACT_H,
          angle: rot + Math.PI,
          centered: true,
          ...animState(existing, 'opponent-activated-character', regionId),
        });
      }

      // --- Opponent pagination arrows (in virtual coordinates, rotated) ---
      const oppGridCenterLocalY = -hh + OPP_ACT_REL_Y + oppGridH / 2;

      // Left (prev) arrow
      const leftLocalCX = -hw + OPP_ACT_REL_X - oppArrowMargin - oppArrowSize / 2;
      const leftWorldX = cx + leftLocalCX * Math.cos(rot) - oppGridCenterLocalY * Math.sin(rot);
      const leftWorldY = cy + leftLocalCX * Math.sin(rot) + oppGridCenterLocalY * Math.cos(rot);
      regions.push({
        type: 'activated-page-arrow', id: `${opp.playerId}:prev`,
        direction: 'prev', arrowPlayerId: opp.playerId,
        x: leftWorldX, y: leftWorldY,
        w: oppArrowSize, h: oppArrowSize,
        angle: rot,
        centered: true,
        enabled: oppPage > 0,
        ...animState(existing, 'activated-page-arrow', `${opp.playerId}:prev`),
      });

      // Right (next) arrow
      const rightLocalCX = -hw + OPP_ACT_REL_X + oppGridW + oppArrowMargin + oppArrowSize / 2;
      const rightWorldX = cx + rightLocalCX * Math.cos(rot) - oppGridCenterLocalY * Math.sin(rot);
      const rightWorldY = cy + rightLocalCX * Math.sin(rot) + oppGridCenterLocalY * Math.cos(rot);
      regions.push({
        type: 'activated-page-arrow', id: `${opp.playerId}:next`,
        direction: 'next', arrowPlayerId: opp.playerId,
        x: rightWorldX, y: rightWorldY,
        w: oppArrowSize, h: oppArrowSize,
        angle: rot,
        centered: true,
        enabled: opp.activatedCharacters.length > ACTIVATED_PAGE_SIZE * (oppPage + 1),
        ...animState(existing, 'activated-page-arrow', `${opp.playerId}:next`),
      });
    }
  }

  return regions;
}
