/**
 * Render Functions Library
 * Zentrale Zeichenfunktionen für alle Game Elements
 * Wird von CanvasGameBoard aufgerufen
 */

import { drawImageOrFallback } from './imageLoaderV2';

export interface DrawConfig {
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
  isDragging: boolean;
  dragX: number;
  dragY: number;
}

export interface CardData {
  name: string;
  value?: number;
}

export interface PortalSlot {
  card: CardData;
  activated: boolean;
}

export interface PlayerPortalData {
  diamonds: number;
  portal: (PortalSlot | null)[];
  hand: CardData[];
}

// Model Koordinaten (1200×800, 3:2 ratio)
const BASE_W = 1200;
const BASE_H = 800;

// Layout proportions from original board.css (viewport-relative, converted to model coords)
const ZONE_TOP_H = 200; // Höhe der oberen Zonen (px)
// Linke/rechte Bereichsbreite soll gleich der Höhe der Top-Zonen sein
const MARGIN_H = ZONE_TOP_H; // Seitenbreite (wird für linke/rechte Zonen genutzt)
const ZONE_CENTER_H = 320; // Höhe der zentralen Auslage
// Player zone height: fill remaining space so it touches bottom of the canvas
const ZONE_PLAYER_H = BASE_H - ZONE_TOP_H - ZONE_CENTER_H;

// Card dimensions (Auslage): increased by 50%
const CARD_W = Math.round(59 * 1.5); // 89
const CARD_H = Math.round(92 * 1.5); // 138
const CARD_GAP = Math.round(10 * 1.5); // 15

export function drawBackground(ctx: CanvasRenderingContext2D) {
  // Dark game board background
  ctx.fillStyle = '#0E1E2B';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  // Try to draw Spielfläche as background (if available)
  drawImageOrFallback(ctx, 'Spielflaeche.png', 0, 0, BASE_W, BASE_H);

  // Optional: Draw zone guides (for debugging, can be disabled)
  ctx.strokeStyle = 'rgba(255, 230, 0, 0.15)';
  ctx.lineWidth = 1;

  // Horizontal guides
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(BASE_W, 0);
  ctx.stroke(); // Header line

  ctx.beginPath();
  ctx.moveTo(0, ZONE_TOP_H);
  ctx.lineTo(BASE_W, ZONE_TOP_H);
  ctx.stroke(); // Top zones end

  ctx.beginPath();
  ctx.moveTo(0, ZONE_TOP_H + ZONE_CENTER_H);
  ctx.lineTo(BASE_W, ZONE_TOP_H + ZONE_CENTER_H);
  ctx.stroke(); // Player zone start

  // Vertical guides
  ctx.beginPath();
  ctx.moveTo(MARGIN_H, 0);
  ctx.lineTo(MARGIN_H, BASE_H);
  ctx.stroke(); // Left margin

  ctx.beginPath();
  ctx.moveTo(BASE_W - MARGIN_H, 0);
  ctx.lineTo(BASE_W - MARGIN_H, BASE_H);
  ctx.stroke(); // Right margin

  ctx.setLineDash([]);
}

export function drawAuslage(
  ctx: CanvasRenderingContext2D,
  characterSlots: CardData[],
  pearlSlots: CardData[],
  config: DrawConfig
) {
  console.log('🎨 Drawing auslage with character slots:', characterSlots.length, characterSlots);
  console.log('🎨 Drawing auslage with pearl slots:', pearlSlots.length, pearlSlots);
  
  // Auslage in center zone - respects zone boundaries like HTML <div>
  const centerX = MARGIN_H;
  const centerW = BASE_W - 2 * MARGIN_H;
  const auslageY = ZONE_TOP_H;
  const auslageH = ZONE_CENTER_H;

  // Draw Auslage background (fits within zone)
  drawImageOrFallback(ctx, 'Auslage.png', centerX, auslageY, centerW, auslageH);

  // Optional: Draw semi-transparent overlay for better readability (disabled for now)
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  // ctx.fillRect(centerX, auslageY, centerW, auslageH);

  // Draw cards on top
  const startX = centerX + (centerW - (6 * CARD_W + 5 * CARD_GAP)) / 2;
  // Place Auslage at 5% from top of Auslage area
  const startY = ZONE_TOP_H + ZONE_CENTER_H * 0.05;

  // Ensure we always render 2 character slots + 4 pearl slots (6 slots total)
  const chars = [characterSlots[0] || null, characterSlots[1] || null];
  const pearls = [pearlSlots[0] || null, pearlSlots[1] || null, pearlSlots[2] || null, pearlSlots[3] || null];
  const allCards = [...chars, ...pearls];

  allCards.forEach((card, idx) => {
    const x = startX + idx * (CARD_W + CARD_GAP);
    const y = startY;

    const isSelected =
      (idx < 2 && config.selectedCharacter === idx) ||
      (idx >= 2 && config.selectedPearl === idx - 2);

    if (!card) {
      // Draw empty slot placeholder
      ctx.fillStyle = '#2b3440';
      ctx.fillRect(x, y, CARD_W, CARD_H);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, CARD_W, CARD_H);

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = idx < 2 ? `Char ${idx + 1}` : `Pearl ${idx - 1}`;
      ctx.fillText(label, x + CARD_W / 2, y + CARD_H / 2);
      return;
    }

    // Draw card image
    let filename = 'Charakterkarte Hinten.jpeg';
    let label = 'Card';

    if (idx < 2) {
      // Character card - try to resolve numeric id from card.name or card.id
      const maybeName = (card as any).name || '';
      const maybeId = String((card as any).id || '');
      const matchName = String(maybeName).match(/(\d+)/);
      const matchId = maybeId.match(/(\d+)/);
      const charNum = matchName ? matchName[1] : matchId ? matchId[1] : null;
      if (charNum) {
        filename = `Charakterkarte${charNum}.jpeg`;
      } else {
        // fallback to back image if we can't find a numeric id
        filename = 'Charakterkarte Hinten.jpeg';
      }
      label = maybeName || `Char ${charNum ?? '?'}`;
    } else {
      // Pearl card
      const value = ((card as any).value || 1);
      filename = `Perlenkarte${value}.jpeg`;
      label = String(value);
    }

    drawImageOrFallback(ctx, filename, x, y, CARD_W, CARD_H, label);

    // Draw selection border if selected
    if (isSelected) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, CARD_W, CARD_H);
    }
  });
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

  // Portal container background (fallback if image not loaded)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
  ctx.fillRect(portalX, portalY, portalW, portalH);
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
      // Draw actual character card image (resolve numeric id from name or id)
      const maybeName = (slot.card as any).name || '';
      const maybeId = String((slot.card as any).id || '');
      const matchName = String(maybeName).match(/(\d+)/);
      const matchId = maybeId.match(/(\d+)/);
      const charNum = matchName ? matchName[1] : matchId ? matchId[1] : null;
      const filename = charNum ? `Charakterkarte${charNum}.jpeg` : 'Charakterkarte Hinten.jpeg';
      drawImageOrFallback(
        ctx,
        filename,
        x,
        y,
        slotW,
        slotH,
        maybeName || `Char ${charNum ?? '?'}`
      );
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

  // Hand cards (right side)
  const handStartX = slotAreaX + 280;
  const handY = slotAreaY;
  // Hand cards displayed twice as large
  const handCardW = 59 * 1.0; // 59
  const handCardH = 92 * 1.0; // 92

  portal.hand.slice(0, 6).forEach((card, idx) => {
    const x = handStartX + idx * (handCardW + 5);
    const y = handY;
    const isSelected = config.selectedHandIndices.includes(idx);

    // Draw actual pearl card image
    const value = ((card as unknown) as { value?: number }).value || 1;
    drawImageOrFallback(
      ctx,
      `Perlenkarte${value}.jpeg`,
      x,
      y,
      handCardW,
      handCardH,
      String(value)
    );

    // Draw selection border if selected
    if (isSelected) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, handCardW, handCardH);
    }
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

  // Action buttons: place to the right of the player area (in the right margin)
  const btnX = BASE_W - MARGIN_H + 10; // small inset from the right-side player margin
  const btnW = 130;
  const btnH = 35;
  const btnY = ZONE_TOP_H + ZONE_CENTER_H + 40;

  const buttons = [
    { label: '💎 Pearl', y: btnY },
    { label: '🎭 Char', y: btnY + btnH + 8 },
    { label: '➡️ End', y: btnY + (btnH + 8) * 2 },
  ];

  buttons.forEach((btn) => {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.fillRect(btnX, btn.y, btnW, btnH);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btn.y, btnW, btnH);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btnX + btnW / 2, btn.y + btnH / 2);
  });
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
