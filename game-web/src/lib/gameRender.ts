/**
 * Render Functions Library
 * Zentrale Zeichenfunktionen für alle Game Elements
 * Wird von CanvasGameBoard aufgerufen
 */

import type { CharacterCard, PearlCard, ActivatedCharacter, GameState } from '@portale-von-molthar/shared';
import { drawImageOrFallback } from './imageLoaderV2';
import type { CanvasRegion } from './canvasRegions';
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
  AUSLAGE_CENTER_X,
  AUSLAGE_CENTER_W,
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
  DECK_ROTATION,
  DECK_CARD_OFFSET,
  DECK_MAX_VISIBLE,
  CHAR_DECK_X,
  CHAR_DECK_Y,
  PEARL_DECK_X,
  PEARL_DECK_Y,
  CHARACTER_DECK_MAX_SIZE,
  PEARL_DECK_MAX_SIZE,
  UI_PANEL_X,
  UI_PANEL_Y,
  UI_PANEL_W,
  UI_PANEL_H,
  getHandCardPosition,
  getPortalSlotPosition,
  getActivatedCardPosition,
  PORTAL_IMG_H,
  PORTAL_IMG_Y,
  OPP_SCALED_W,
  OPP_SCALED_H,
  OPP_SLOT_W,
  OPP_SLOT_H,
  OPP_SLOT_GAP,
  OPP_ACT_W,
  OPP_ACT_H,
  OPP_ACT_GAP,
  OPP_HAND_W,
  OPP_HAND_H,
  OPP_HAND_REL_X,
  OPP_HAND_REL_Y,
  OPP_SLOT_REL_X,
  OPP_SLOT_REL_Y,
  OPP_ACT_REL_X,
  OPP_ACT_REL_Y,
  OPP_PORTAL_IMG_H,
  OPP_PORTAL_IMG_REL_Y,
  ACTIVATED_GRID_COLS,
  getPortalImageName,
} from './cardLayoutConstants';

export interface DrawConfig {
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
}

export interface PlayerPortalData {
  diamonds: number;
  portal: ActivatedCharacter[];
  hand: PearlCard[];
}

function drawEmptySlot(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.fillStyle = '#2b3440';
  ctx.fillRect(x, y, CARD_W, CARD_H);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, CARD_W, CARD_H);
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + CARD_W / 2, y + CARD_H / 2);
}

export function drawBackground(ctx: CanvasRenderingContext2D) {
  // Dark game board background
  ctx.fillStyle = '#0E1E2B';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  // Try to draw Spielfläche as background (if available)
  drawImageOrFallback(ctx, 'Spielflaeche.png', 0, 0, BASE_W, BASE_H);
}

/**
 * Draw a rotated deck stack (card pile) at the given position
 * @param ctx - Canvas rendering context
 * @param x - X coordinate of deck position (before rotation)
 * @param y - Y coordinate of deck position (before rotation)
 * @param cardCount - Number of cards remaining in the deck
 * @param rotation - Rotation angle in radians (default 90°)
 * @param deckType - 'character' or 'pearl' for different card back images
 * @param hoverProgress - 0–1 glow intensity on the top card (from CanvasRegion animation)
 */
export function drawDeckStack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cardCount: number,
  rotation: number = DECK_ROTATION,
  deckType: 'character' | 'pearl' = 'character',
  hoverProgress: number = 0,
  maxDeckSize?: number,
  peekedCard?: CharacterCard | null,
  clickHintLabel?: string
) {
  if (cardCount <= 0) return;

  const actualMaxDeckSize = maxDeckSize ?? (deckType === 'character' ? CHARACTER_DECK_MAX_SIZE : PEARL_DECK_MAX_SIZE);
  const visibleCards = Math.ceil(cardCount / actualMaxDeckSize * DECK_MAX_VISIBLE);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  for (let i = 0; i < visibleCards; i++) {
    const offsetX = i * DECK_CARD_OFFSET;
    const offsetY = i * DECK_CARD_OFFSET;
    const isTopCard = i === visibleCards - 1;
    if (isTopCard && peekedCard) {
      // Draw face-up peeked card
      drawImageOrFallback(ctx, peekedCard.imageName, offsetX, offsetY, DECK_CARD_W, DECK_CARD_H, peekedCard.name);
    } else {
      const backImage = deckType === 'character' ? 'Charakterkarte Hinten.png' : 'Perlenkarte Hinten.png';
      drawImageOrFallback(ctx, backImage, offsetX, offsetY, DECK_CARD_W, DECK_CARD_H, 'Deck');
    }
  }

  // Glow on the top card (highest index = visually on top)
  if (hoverProgress > 0.01) {
    const topOffset = (visibleCards - 1) * DECK_CARD_OFFSET;
    ctx.shadowColor = `rgba(255, 215, 0, ${hoverProgress * 0.85})`;
    ctx.shadowBlur = hoverProgress * 22;
    ctx.strokeStyle = `rgba(255, 215, 0, ${hoverProgress * 0.7})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(topOffset + 1, topOffset + 1, DECK_CARD_W - 2, DECK_CARD_H - 2);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  // Hint label when card is peeked
  if (peekedCard) {
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const topOffset = (visibleCards - 1) * DECK_CARD_OFFSET;
    ctx.fillStyle = 'rgba(15,23,42,0.82)';
    const labelW = 118;
    const labelH = 18;
    const labelX = topOffset + DECK_CARD_W + 6;
    const labelY = topOffset + DECK_CARD_H / 2 - labelH / 2;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelW, labelH, 4);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(clickHintLabel ?? '← Klick zum Nehmen', labelX + 6, labelY + labelH / 2);
  }

  ctx.restore();
}

export function drawAuslage(
  ctx: CanvasRenderingContext2D,
  characterSlots: CharacterCard[],
  pearlSlots: PearlCard[],
  config: DrawConfig,
  characterDeckCount: number = 0,
  pearlDeckCount: number = 0,
  charDeckHover: number = 0,
  pearlDeckHover: number = 0,
  peekedCharacterCard?: CharacterCard | null,
  clickHintLabel?: string
) {
  // Auslage in center zone - respects zone boundaries like HTML <div>
  const centerX = MARGIN_H;
  const centerW = BASE_W - 2 * MARGIN_H;
  const auslageY = ZONE_TOP_H;
  const auslageH = ZONE_CENTER_H;

  // Draw Auslage background (fits within zone)
  drawImageOrFallback(ctx, 'Auslage.png', centerX, auslageY, centerW, auslageH);

  // Draw cards on top
  const startX = centerX + (centerW - (6 * CARD_W + 5 * CARD_GAP)) / 2;
  // Place Auslage at 5% from top of Auslage area
  const startY = ZONE_TOP_H + ZONE_CENTER_H * 0.05;

  // Draw 2 character slots
  for (let idx = 0; idx < 2; idx++) {
    const x = startX + idx * (CARD_W + CARD_GAP);
    const card = characterSlots[idx] ?? null;
    if (!card) {
      drawEmptySlot(ctx, x, startY, `Char ${idx + 1}`);
    } else {
      drawImageOrFallback(ctx, card.imageName, x, startY, CARD_W, CARD_H, card.name);
      if (config.selectedCharacter === idx) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, startY, CARD_W, CARD_H);
      }
    }
  }

  // Draw 4 pearl slots
  for (let pearlIdx = 0; pearlIdx < 4; pearlIdx++) {
    const idx = pearlIdx + 2;
    const x = startX + idx * (CARD_W + CARD_GAP);
    const card = pearlSlots[pearlIdx] ?? null;
    if (!card) {
      drawEmptySlot(ctx, x, startY, `Pearl ${pearlIdx + 1}`);
    } else {
      const pearlImg = card.hasRefreshSymbol ? `Perlenkarte${card.value}-neu.png` : `Perlenkarte${card.value}.png`;
      drawImageOrFallback(ctx, pearlImg, x, startY, CARD_W, CARD_H, String(card.value));
      if (config.selectedPearl === pearlIdx) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, startY, CARD_W, CARD_H);
      }
    }
  }

  // Draw character deck below the character cards
  drawDeckStack(ctx, CHAR_DECK_X, CHAR_DECK_Y, characterDeckCount, DECK_ROTATION, 'character', charDeckHover, undefined, peekedCharacterCard, clickHintLabel);

  // Draw pearl deck below the pearl cards
  drawDeckStack(ctx, PEARL_DECK_X, PEARL_DECK_Y, pearlDeckCount, DECK_ROTATION, 'pearl', pearlDeckHover);
}

export function drawPlayerPortal(
  ctx: CanvasRenderingContext2D,
  portal: PlayerPortalData,
  config: DrawConfig,
  colorIndex: number = 1,
  isStartingPlayer: boolean = false,
) {
  // Draw portal background based on player's chosen color
  // Height proportional to character card (ratio 1325:1030), vertically centered around slots
  const portalImg = getPortalImageName(colorIndex, isStartingPlayer);
  drawImageOrFallback(ctx, portalImg, PORTAL_X, PORTAL_IMG_Y, PORTAL_W, PORTAL_IMG_H);

  // Diamonds (left side)
  const diamondX = PORTAL_X + 20;
  const diamondY = PORTAL_Y + 20;
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (let i = 0; i < portal.diamonds; i++) {
    ctx.fillText('💎', diamondX + i * 30, diamondY);
  }

  // Portal slots (center)
  const slotAreaX = SLOT_AREA_X;
  const slotAreaY = SLOT_AREA_Y;
  const slotW = SLOT_W;
  const slotH = SLOT_H;
  const slotGap = SLOT_GAP;

  portal.portal.forEach((slot, idx) => {
    const x = slotAreaX + idx * (slotW + slotGap);
    const y = slotAreaY;

    if (slot) {
      drawImageOrFallback(ctx, slot.card.imageName, x, y, slotW, slotH, slot.card.name);
    }
  });

  // Hand cards: render in the left third of the player area, fanned like physical cards
  const handCards = portal.hand.slice(0, HAND_MAX); // max 9 cards
  const count = handCards.length;

  handCards.forEach((card, idx) => {
    const { cx, cy, angle } = getHandCardPosition(count, idx);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const pearlImg = card.hasRefreshSymbol ? `Perlenkarte${card.value}-neu.png` : `Perlenkarte${card.value}.png`;
    drawImageOrFallback(ctx, pearlImg, -HAND_CARD_W / 2, -HAND_CARD_H / 2, HAND_CARD_W, HAND_CARD_H, String(card.value));

    // Selection border
    if (config.selectedHandIndices.includes(idx)) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(-HAND_CARD_W / 2, -HAND_CARD_H / 2, HAND_CARD_W, HAND_CARD_H);
    }

    ctx.restore();
  });
}

export function drawActivatedCharactersGrid(
  ctx: CanvasRenderingContext2D,
  activatedCards: CharacterCard[],
  config: DrawConfig
) {
  // Display up to 12 activated character cards in a 3x4 grid
  // Card images are located based on imageName field in card data
  // This uses the same image filename resolution pattern as auslage and portal rendering
  if (!activatedCards || activatedCards.length === 0) {
    return; // No activated cards to display
  }
  
  const cardsToDisplay = activatedCards.slice(0, ACTIVATED_MAX);
  
  cardsToDisplay.forEach((card, idx) => {
    const { cardX, cardY, w, h } = getActivatedCardPosition(idx);
    
    ctx.save();
    // Move to center, rotate 180°, move back
    ctx.translate(cardX + w / 2, cardY + h / 2);
    ctx.rotate(Math.PI); // 180° rotation
    ctx.translate(-(cardX + w / 2), -(cardY + h / 2));
    
    drawImageOrFallback(ctx, card.imageName, cardX, cardY, w, h, card.name);
    
    ctx.restore();
  });
}

/**
 * Draw portal swap buttons (⇄) below each occupied portal slot,
 * and the replace-pearl-slots button below the pearl deck.
 * Handles regions of type 'portal-swap-btn' and 'ui-replace-pearl-slots'.
 */
export function drawPortalSwapButtons(ctx: CanvasRenderingContext2D, regions: CanvasRegion[]) {
  const swapRegions = regions.filter(r => r.type === 'portal-swap-btn' || r.type === 'ui-replace-pearl-slots');
  for (const region of swapRegions) {
    const { x, y, w, h, hoverProgress } = region;
    ctx.save();

    // Background
    const alpha = 0.75 + hoverProgress * 0.25;
    ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Border with hover glow
    ctx.strokeStyle = hoverProgress > 0.01
      ? `rgba(255, 215, 0, ${0.5 + hoverProgress * 0.5})`
      : 'rgba(165, 180, 252, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();

    // ⇄ symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(h * 0.7)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⇄', x + w / 2, y + h / 2);

    ctx.restore();
  }
}

/**
 * Draw the action counter / End Turn / Discard Cards UI panel on canvas.
 * Called once per frame for the active player.
 */
export function drawUIButton(ctx: CanvasRenderingContext2D, region: CanvasRegion) {
  const { x, y, w, h, label, enabled, type } = region;

  // Background color based on type and state
  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (type === 'ui-discard-cards') {
    bgColor = 'rgba(239, 68, 68, 0.9)';
    borderColor = '#ef4444';
    textColor = '#ffffff';
  } else if (enabled) {
    // End Turn — enabled (actions exhausted)
    bgColor = 'rgba(239, 68, 68, 0.9)';
    borderColor = '#ef4444';
    textColor = '#ffffff';
  } else {
    // Action counter — disabled (actions remaining)
    const label_ = label ?? '';
    const parts = label_.split(' / ');
    const used = parseInt(parts[0] ?? '0', 10);
    const max = parseInt(parts[1] ?? '3', 10);
    const remaining = max - used;
    if (remaining <= 1) {
      bgColor = 'rgba(250, 204, 21, 0.9)';
      borderColor = '#facc15';
      textColor = '#000000';
    } else {
      bgColor = 'rgba(34, 197, 94, 0.9)';
      borderColor = '#22c55e';
      textColor = '#ffffff';
    }
  }

  ctx.save();

  // Background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.stroke();

  // Label
  ctx.fillStyle = textColor;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label ?? '', x + w / 2, y + h / 2);

  ctx.restore();
}

/**
 * Draw non-active player's action counter (read-only, blue).
 */
export function drawOpponentActionCounter(
  ctx: CanvasRenderingContext2D,
  G: GameState,
  activePlayerName: string
) {
  const maxActions = G.maxActions ?? 3;
  const actionCount = G.actionCount ?? 0;
  const label = `${activePlayerName} ${actionCount} / ${maxActions}`;

  ctx.save();

  ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
  ctx.beginPath();
  ctx.roundRect(UI_PANEL_X, UI_PANEL_Y, UI_PANEL_W, UI_PANEL_H, 8);
  ctx.fill();

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(UI_PANEL_X, UI_PANEL_Y, UI_PANEL_W, UI_PANEL_H, 8);
  ctx.stroke();

  ctx.fillStyle = '#3b82f6';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, UI_PANEL_X + UI_PANEL_W / 2, UI_PANEL_Y + UI_PANEL_H / 2);

  ctx.restore();
}

/**
 * Second-pass rendering: draw hover glow and click flash for all regions.
 * Call this AFTER all regular draw calls so effects appear on top.
 */
export function drawRegionEffects(ctx: CanvasRenderingContext2D, regions: CanvasRegion[]) {
  for (const region of regions) {
    // Decks draw their own glow in drawDeckStack — skip here
    if (region.type === 'deck-character' || region.type === 'deck-pearl') continue;

    if (region.hoverProgress <= 0.01 && region.flashProgress <= 0.01) continue;

    const { x, y, w, h, centered, angle, hoverProgress, flashProgress } = region;

    // Resolve top-left from centered coordinates
    const rx = centered ? x - w / 2 : x;
    const ry = centered ? y - h / 2 : y;

    ctx.save();

    if (centered && angle) {
      // Rotate around center (x, y)
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.translate(-x, -y);
    }

    // Hover: golden glow border
    if (hoverProgress > 0.01) {
      ctx.shadowColor = `rgba(255, 215, 0, ${hoverProgress * 0.85})`;
      ctx.shadowBlur = hoverProgress * 22;
      ctx.strokeStyle = `rgba(255, 215, 0, ${hoverProgress * 0.7})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(rx + 1, ry + 1, w - 2, h - 2);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    // Flash: white overlay fading out
    if (flashProgress > 0.01) {
      ctx.globalAlpha = flashProgress * 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx, ry, w, h);
    }

    ctx.restore();
  }
}

/**
 * Opponent zone data for rendering one opponent's portal area.
 */
export interface OpponentZoneData {
  colorIndex: number;
  isStartingPlayer: boolean;
  portal: ActivatedCharacter[];
  activatedCharacters: ActivatedCharacter[];
  handCount: number;
}

/**
 * Draw a single opponent zone: portal background, portal cards (face-up),
 * activated characters (face-up), and hand stack (face-down).
 * All elements are rendered rotated to match the zone's orientation.
 * @param zone Zone bounding box {x, y, w, h}
 * @param data Opponent data (colorIndex, cards, hand count)
 * @param rotationDeg Rotation in degrees (90, 180, 270)
 */
function drawOpponentZone(
  ctx: CanvasRenderingContext2D,
  zone: { x: number; y: number; w: number; h: number },
  data: OpponentZoneData,
  rotationDeg: number,
) {
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h / 2;
  const rot = (rotationDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // Virtual zone: same layout as the player zone, scaled by OPP_SCALE.
  // Origin = zone center. Top-left of virtual zone = (-hw, -hh).
  const hw = OPP_SCALED_W / 2;
  const hh = OPP_SCALED_H / 2;

  // 1. Portal background — correct aspect ratio (1325:1030), vertically centered around slots
  const portalImg = getPortalImageName(data.colorIndex, data.isStartingPlayer);
  drawImageOrFallback(ctx, portalImg, -hw, -hh + OPP_PORTAL_IMG_REL_Y, OPP_SCALED_W, OPP_PORTAL_IMG_H, `P${data.colorIndex}`);

  // 2. Portal slot cards — same relative position as in the player zone
  for (let i = 0; i < 2; i++) {
    const slotX = -hw + OPP_SLOT_REL_X + i * (OPP_SLOT_W + OPP_SLOT_GAP);
    const slotY = -hh + OPP_SLOT_REL_Y;
    const entry = data.portal[i];
    if (entry) {
      drawImageOrFallback(ctx, entry.card.imageName, slotX, slotY, OPP_SLOT_W, OPP_SLOT_H, entry.card.name);
    }
  }

  // 3. Activated characters grid — right of portal slots (from opponent's perspective)
  const maxAct = Math.min(data.activatedCharacters.length, ACTIVATED_MAX);
  for (let i = 0; i < maxAct; i++) {
    const col = i % ACTIVATED_GRID_COLS;
    const row = Math.floor(i / ACTIVATED_GRID_COLS);
    const actX = -hw + OPP_ACT_REL_X + col * (OPP_ACT_W + OPP_ACT_GAP);
    const actY = -hh + OPP_ACT_REL_Y + row * (OPP_ACT_H + OPP_ACT_GAP);
    const card = data.activatedCharacters[i]!;
    ctx.save();
    ctx.translate(actX + OPP_ACT_W / 2, actY + OPP_ACT_H / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(actX + OPP_ACT_W / 2), -(actY + OPP_ACT_H / 2));
    drawImageOrFallback(ctx, card.card.imageName, actX, actY, OPP_ACT_W, OPP_ACT_H, card.card.name);
    ctx.restore();
  }

  // 4. Hand cards — face-down stack, left side (from opponent's perspective)
  if (data.handCount > 0) {
    const handX = -hw + OPP_HAND_REL_X;
    const handY = -hh + OPP_HAND_REL_Y - OPP_HAND_H / 2;
    drawImageOrFallback(ctx, 'Perlenkarte Hinten.png', handX, handY, OPP_HAND_W, OPP_HAND_H, '?');
    // Count badge
    const badgeR = Math.max(5, Math.round(OPP_HAND_H * 0.15));
    const badgeCx = handX + OPP_HAND_W - badgeR;
    const badgeCy = handY + badgeR;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(badgeR * 1.3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(data.handCount), badgeCx, badgeCy);
  }

  ctx.restore();
}

/**
 * Draw opponent portals
 * Layout:
 *   - Zone left (90°):       Spieler rechts vom lokalen Spieler in playerOrder
 *   - Zone top-left (180°):  Spieler 2 Plätze nach links
 *   - Zone top-right (180°): Spieler 2 Plätze nach rechts (bei 4+ Spielern)
 *   - Zone right (270°):     Spieler links vom lokalen Spieler in playerOrder
 *
 * opponents: Array mit 4 Einträgen (links, oben-links, oben-rechts, rechts),
 *            null = kein Spieler → Schriftrolle
 */
export function drawOpponentPortals(
  ctx: CanvasRenderingContext2D,
  opponents: Array<OpponentZoneData | null>,
) {
  const zoneLeft     = { x: 0,                                          y: ZONE_TOP_H, w: MARGIN_H,                    h: ZONE_CENTER_H };
  const zoneTopLeft  = { x: MARGIN_H,                                   y: 0,          w: (BASE_W - 2 * MARGIN_H) / 2, h: ZONE_TOP_H };
  const zoneTopRight = { x: MARGIN_H + (BASE_W - 2 * MARGIN_H) / 2,    y: 0,          w: (BASE_W - 2 * MARGIN_H) / 2, h: ZONE_TOP_H };
  const zoneRight    = { x: BASE_W - MARGIN_H,                          y: ZONE_TOP_H, w: MARGIN_H,                    h: ZONE_CENTER_H };

  const zones = [
    { zone: zoneLeft,     deg: 90  },
    { zone: zoneTopLeft,  deg: 180 },
    { zone: zoneTopRight, deg: 180 },
    { zone: zoneRight,    deg: 270 },
  ];

  const drawScrollInZone = (zone: typeof zoneLeft, deg: number) => {
    const maxDim = Math.min(zone.w, zone.h) * 0.95;
    const x = zone.x + zone.w / 2 - maxDim / 2;
    const y = zone.y + zone.h / 2 - maxDim / 2;
    drawImageOrFallback(ctx, 'Schriftrolle.png', x, y, maxDim, maxDim, 'SR', deg);
  };

  zones.forEach(({ zone, deg }, i) => {
    const data = opponents[i];
    if (data) {
      drawOpponentZone(ctx, zone, data, deg);
    } else {
      drawScrollInZone(zone, deg);
    }
  });
}
