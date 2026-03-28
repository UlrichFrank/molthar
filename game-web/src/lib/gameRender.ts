/**
 * Render Functions Library
 * Zentrale Zeichenfunktionen für alle Game Elements
 * Wird von CanvasGameBoard aufgerufen
 */

import type { CharacterCard, PearlCard, ActivatedCharacter } from '@portale-von-molthar/shared';
import { drawImageOrFallback } from './imageLoaderV2';
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
  getHandCardPosition,
  getPortalSlotPosition,
  getActivatedCardPosition,
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
 * @param isHovered - Whether the deck is currently being hovered
 */
export function drawDeckStack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cardCount: number,
  rotation: number = DECK_ROTATION,
  deckType: 'character' | 'pearl' = 'character',
  isHovered: boolean = false,
  maxDeckSize?: number
) {
  // Don't draw empty decks
  if (cardCount <= 0) return;

  // Determine the maximum deck size for proportional mapping
  // Uses deck-type-specific constants: CHARACTER_DECK_MAX_SIZE=52, PEARL_DECK_MAX_SIZE=56
  const actualMaxDeckSize = maxDeckSize ?? (deckType === 'character' ? CHARACTER_DECK_MAX_SIZE : PEARL_DECK_MAX_SIZE);

  // Calculate visible cards using proportional mapping formula: visibleCards = Math.ceil(currentCount / maxDeckSize * 7)
  // This ensures: while currentCount > 0, always visibleCards >= 1 (prevents empty display gap)
  // Example: With 52 character cards max:
  //   - At 52 cards: ceil(52/52 * 7) = 7 cards shown
  //   - At 26 cards: ceil(26/52 * 7) = 4 cards shown
  //   - At 1 card: ceil(1/52 * 7) = 1 card shown
  const visibleCards = Math.ceil(cardCount / actualMaxDeckSize * DECK_MAX_VISIBLE);

  // Save the current canvas state before applying rotation
  ctx.save();

  // Move to the position and rotate
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Draw card backs with stacking offset
  for (let i = 0; i < visibleCards; i++) {
    const offsetX = i * DECK_CARD_OFFSET;
    const offsetY = i * DECK_CARD_OFFSET;

    // Draw card back image (rotated cards show the back)
    const backImage = deckType === 'character' ? 'Charakterkarte Hinten.png' : 'Perlenkarte Hinten.png';
    drawImageOrFallback(ctx, backImage, offsetX, offsetY, DECK_CARD_W, DECK_CARD_H, 'Deck');

    // If hovered, add a highlighted effect on the top card
    if (isHovered && i === visibleCards - 1) {
      // Draw a shadow/lift effect for the top card
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = -4;
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX + 1, offsetY + 1, DECK_CARD_W - 2, DECK_CARD_H - 2);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }

  // Restore the canvas state
  ctx.restore();
}

export function drawAuslage(
  ctx: CanvasRenderingContext2D,
  characterSlots: CharacterCard[],
  pearlSlots: PearlCard[],
  config: DrawConfig,
  characterDeckCount: number = 0,
  pearlDeckCount: number = 0,
  hoveredDeck: 'character' | 'pearl' | null = null
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
      drawImageOrFallback(ctx, `Perlenkarte${card.value}.png`, x, startY, CARD_W, CARD_H, String(card.value));
      if (config.selectedPearl === pearlIdx) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, startY, CARD_W, CARD_H);
      }
    }
  }

  // Draw character deck below the character cards
  drawDeckStack(
    ctx,
    CHAR_DECK_X,
    CHAR_DECK_Y,
    characterDeckCount,
    DECK_ROTATION,
    'character',
    hoveredDeck === 'character'
  );

  // Draw pearl deck below the pearl cards
  drawDeckStack(
    ctx,
    PEARL_DECK_X,
    PEARL_DECK_Y,
    pearlDeckCount,
    DECK_ROTATION,
    'pearl',
    hoveredDeck === 'pearl'
  );
}

export function drawPlayerPortal(
  ctx: CanvasRenderingContext2D,
  portal: PlayerPortalData,
  config: DrawConfig
) {
  const portalX = MARGIN_H;
  const portalW = BASE_W - 2 * MARGIN_H;
  const portalY = ZONE_TOP_H + ZONE_CENTER_H;
  const portalH = ZONE_PLAYER_H;

  // Draw Kleiderschrank Portal background (if available)
  drawImageOrFallback(ctx, 'Kleiderschrank Portal.png', portalX, portalY, portalW, portalH);

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(portalX, portalY, portalW, portalH);

  // Diamonds (left side)
  const diamondX = portalX + 20;
  const diamondY = portalY + 20;
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (let i = 0; i < portal.diamonds; i++) {
    ctx.fillText('💎', diamondX + i * 30, diamondY);
  }

  // Portal slots (center)
  // Center vertically at 65% of the player zone and shift 3% to the right
  const slotAreaX = portalX + portalW / 3 + portalW * 0.02;
  const slotAreaY = portalY + portalH * 0.35;
  const slotW = CARD_W;
  const slotH = CARD_H;
  const slotGap = CARD_GAP;

  portal.portal.forEach((slot, idx) => {
    const x = slotAreaX + idx * (slotW + slotGap);
    const y = slotAreaY;

    if (slot) {
      drawImageOrFallback(ctx, slot.card.imageName, x, y, slotW, slotH, slot.card.name);
    } else {
      // Empty slot
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, slotW, slotH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, slotW, slotH);

      ctx.fillStyle = '#cbd5e0';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`S${idx + 1}`, x + slotW / 2, y + slotH / 2);
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

    drawImageOrFallback(ctx, `Perlenkarte${card.value}.png`, -HAND_CARD_W / 2, -HAND_CARD_H / 2, HAND_CARD_W, HAND_CARD_H, String(card.value));

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

export function drawUI(ctx: CanvasRenderingContext2D, phase: string = 'takingActions') {
  // Phase info (top-left)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(MARGIN_H + 10, 5, 200, 28);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN_H + 10, 5, 200, 28);

  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Phase: ${phase}`, MARGIN_H + 15, 10);
}

/**
 * Draw opponent portals
 * Layout: 
 *   - Spieler 2 (left): Links neben Auslage, mittlere Höhe (90° rotation)
 *   - Spieler 3 (top-left): Oben-links von Auslage (180° rotation)
 *   - Spieler 4 (top-right): Oben-rechts von Auslage (180° rotation)
 *   - Spieler 5 (right): Rechts neben Auslage, mittlere Höhe (270° rotation)
 * 
 * Schriftrolle.png wird für alle Spieler gezeichnet, die nicht mitspielen
 * Bilder werden auf 95% der Zonengröße skaliert ohne zu verzerren
 */
export function drawOpponentPortals(ctx: CanvasRenderingContext2D, numOpponents: number) {
  // Define the 4 portal zones (gestrichelt umrahmt areas)
  // Spieler 2 & 5: auf gleicher Höhe wie Auslage (ZONE_CENTER)
  // Spieler 3 & 4: oben und unten von Auslage
  const zoneLeft = { x: 0, y: ZONE_TOP_H, w: MARGIN_H, h: ZONE_CENTER_H };
  const zoneTopLeft = { x: MARGIN_H, y: 0, w: (BASE_W - 2 * MARGIN_H) / 2, h: ZONE_TOP_H };
  const zoneTopRight = { x: MARGIN_H + (BASE_W - 2 * MARGIN_H) / 2, y: 0, w: (BASE_W - 2 * MARGIN_H) / 2, h: ZONE_TOP_H };
  const zoneRight = { x: BASE_W - MARGIN_H, y: ZONE_TOP_H, w: MARGIN_H, h: ZONE_CENTER_H };

  // Helper to scale image to 95% of zone size without distortion
  // Uses 95% of the smaller dimension to ensure it fits
  const getSizedDimensions = (zone: typeof zoneLeft) => {
    const maxDim = Math.min(zone.w, zone.h) * 0.95;
    return { w: maxDim, h: maxDim }; // Square scaling prevents distortion
  };

  // Helper to center image in zone with rotation
  const drawInZone = (zone: typeof zoneLeft, image: string, label: string, rotation: number = 0) => {
    const { w, h } = getSizedDimensions(zone);
    const x = zone.x + zone.w / 2 - w / 2;
    const y = zone.y + zone.h / 2 - h / 2;
    drawImageOrFallback(ctx, image, x, y, w, h, label, rotation);
  };

  // Always draw Spieler 2 (left) if in game
  if (numOpponents >= 1) {
    drawInZone(zoneLeft, 'Gegner Portal2.png', 'P2', 90);
  }

  // Always draw Spieler 3 (top-left) if in game
  if (numOpponents >= 2) {
    drawInZone(zoneTopLeft, 'Gegner Portal3.png', 'P3', 180);
  } else {
    drawInZone(zoneTopLeft, 'Schriftrolle.png', 'SR', 180);
  }

  // Always draw Spieler 4 (top-right) if in game
  if (numOpponents >= 3) {
    drawInZone(zoneTopRight, 'Gegner Portal4.png', 'P4', 180);
  } else {
    drawInZone(zoneTopRight, 'Schriftrolle.png', 'SR', 180);
  }

  // Always draw Spieler 5 (right) if in game
  if (numOpponents >= 4) {
    drawInZone(zoneRight, 'Gegner Portal5.png', 'P5', 270);
  } else {
    drawInZone(zoneRight, 'Schriftrolle.png', 'SR', 270);
  }
}
