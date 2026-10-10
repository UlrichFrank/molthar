/**
 * Render Functions Library
 * Zentrale Zeichenfunktionen für alle Game Elements
 * Wird von CanvasGameBoard aufgerufen
 */

import type { CharacterCard, PearlCard, ActivatedCharacter, GameState } from '@portale-von-molthar/shared';
import { drawImageOrFallback, getImage, getScaledDimensions } from './imageLoaderV2';
import { drawTable, placeOnTable, seededRandom } from './tableStyle';
import type { CanvasRegion } from './canvasRegions';
import {
  BASE_W,
  ZONE_TOP_H,
  MARGIN_H,
  ZONE_CENTER_H,
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
  HAND_CARD_W,
  HAND_CARD_H,
  HAND_MAX,
  ACTIVATED_CARD_W,
  ACTIVATED_CARD_GAP,
  ACTIVATED_PAGE_SIZE,
  ACTIVATED_ARROW_SIZE,
  ACTIVATED_ARROW_MARGIN,
  ACTIVATED_ARROW_COLOR_INACTIVE,
  ACTIVATED_ARROW_COLOR_ACTIVE,
  ACTIVATED_ARROW_COLOR_HOVER,
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
  OPP_HAND_REL_Y,
  OPP_SLOT_REL_X,
  OPP_SLOT_REL_Y,
  OPP_ACT_REL_X,
  OPP_ACT_REL_Y,
  OPP_PORTAL_IMG_H,
  OPP_PORTAL_IMG_REL_Y,
  ACTIVATED_GRID_COLS,
  ACTIVATED_GRID_ROWS,
  OPP_SCALE,
  getPortalImageName,
  getOpponentZones,
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

/** Opaque portal photo laid on the table: rounded corners, drop shadow and a slight tilt. */
function drawPortalImage(
  ctx: CanvasRenderingContext2D,
  filename: string,
  x: number, y: number, w: number, h: number,
  key: string,
) {
  const img = getImage(filename);
  if (!img) {
    drawImageOrFallback(ctx, filename, x, y, w, h);
    return;
  }
  const { w: sw, h: sh } = getScaledDimensions(img, w, h);
  placeOnTable(ctx, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh, key, (lx, ly) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(lx, ly, sw, sh, 10);
    ctx.clip();
    ctx.drawImage(img, lx, ly, sw, sh);
    // gentle edge darkening so the photo sits in the felt
    const edge = ctx.createLinearGradient(lx, ly, lx, ly + sh);
    edge.addColorStop(0, 'rgba(0,0,0,0.18)');
    edge.addColorStop(0.2, 'rgba(0,0,0,0)');
    edge.addColorStop(0.8, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = edge;
    ctx.fillRect(lx, ly, sw, sh);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 235, 190, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(lx, ly, sw, sh, 10);
    ctx.stroke();
  }, { rotDeg: 0.7, offset: 1.5, radius: 10, shadow: 1.2 });
}

/**
 * The market mat: a parchment/leather pad with embossed outlines for the six face-up slots and
 * the two draw piles, so the cards visibly belong where they lie.
 */
function drawAuslageMat(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const mw = Math.min(w - 28, 6 * CARD_W + 5 * CARD_GAP + 150);
  const mx = x + (w - mw) / 2, my = y + 6, mh = h - 14;
  placeOnTable(ctx, mx, my, mw, mh, 'auslage-mat', (lx, ly) => {
    const ox = lx - mx, oy = ly - my; // shift from model space into the (jittered) local space
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(lx, ly, mw, mh, 16);
    ctx.clip();

    const paper = ctx.createLinearGradient(lx, ly, lx + mw * 0.3, ly + mh);
    paper.addColorStop(0, '#d8bd96');
    paper.addColorStop(0.5, '#cfae82');
    paper.addColorStop(1, '#c19f74');
    ctx.fillStyle = paper;
    ctx.fillRect(lx, ly, mw, mh);

    const rnd = seededRandom('auslage-paper');
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(70,40,10,0.06)';
      ctx.fillRect(lx + rnd() * mw, ly + rnd() * mh, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    const glow = ctx.createRadialGradient(lx + mw / 2, ly + mh * 0.4, 20, lx + mw / 2, ly + mh * 0.4, mw * 0.6);
    glow.addColorStop(0, 'rgba(255, 244, 214, 0.25)');
    glow.addColorStop(1, 'rgba(60, 30, 5, 0.28)');
    ctx.fillStyle = glow;
    ctx.fillRect(lx, ly, mw, mh);

    // embossed outlines for card slots and the two piles
    ctx.strokeStyle = 'rgba(70, 42, 14, 0.35)';
    ctx.fillStyle = 'rgba(70, 42, 14, 0.07)';
    ctx.lineWidth = 2;
    const outline = (rx: number, ry: number, rw: number, rh: number) => {
      ctx.beginPath();
      ctx.roundRect(rx + ox - 5, ry + oy - 5, rw + 10, rh + 10, 9);
      ctx.fill();
      ctx.stroke();
    };
    for (let i = 0; i < 6; i++) outline(AUSLAGE_START_X + i * (CARD_W + CARD_GAP), AUSLAGE_START_Y, CARD_W, CARD_H);
    outline(CHAR_DECK_X - DECK_CARD_H, CHAR_DECK_Y, DECK_CARD_H, DECK_CARD_W);
    outline(PEARL_DECK_X - DECK_CARD_H, PEARL_DECK_Y, DECK_CARD_H, DECK_CARD_W);

    // stitched border
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = 'rgba(70, 42, 14, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(lx + 9, ly + 9, mw - 18, mh - 18, 11);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = 'rgba(40, 22, 6, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lx, ly, mw, mh, 16);
    ctx.stroke();
  }, { rotDeg: 0, offset: 0, radius: 16, shadow: 1.3 });
}

export function drawBackground(ctx: CanvasRenderingContext2D) {
  drawTable(ctx);
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
    const backImage = deckType === 'character' ? 'Charakterkarte Hinten.png' : 'Perlenkarte Hinten.png';
    // Every card of the pile lies slightly askew, like a pile that was shuffled by hand.
    placeOnTable(ctx, offsetX, offsetY, DECK_CARD_W, DECK_CARD_H, `${deckType}-deck-${i}`, (lx, ly) => {
      if (isTopCard && peekedCard) {
        drawImageOrFallback(ctx, peekedCard.imageName, lx, ly, DECK_CARD_W, DECK_CARD_H, peekedCard.name);
      } else {
        drawImageOrFallback(ctx, backImage, lx, ly, DECK_CARD_W, DECK_CARD_H, 'Deck');
      }
    }, { rotDeg: isTopCard ? 1.2 : 2.8, offset: 2.2, shadow: i === 0 ? 1 : 0.35 });
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
  pearlSlots: (PearlCard | null)[],
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
  drawAuslageMat(ctx, centerX, auslageY, centerW, auslageH);

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
      placeOnTable(ctx, x, startY, CARD_W, CARD_H, `auslage-char-${idx}-${card.id}`, (lx, ly) => {
        drawImageOrFallback(ctx, card.imageName, lx, ly, CARD_W, CARD_H, card.name);
        if (config.selectedCharacter === idx) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.strokeRect(lx, ly, CARD_W, CARD_H);
        }
      });
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
      const pearlImg = card.isJoker ? 'PerlenkarteJoker.png' : card.hasRefreshSymbol ? `Perlenkarte${card.value}-neu.png` : `Perlenkarte${card.value}.png`;
      placeOnTable(ctx, x, startY, CARD_W, CARD_H, `auslage-pearl-${pearlIdx}-${card.id}`, (lx, ly) => {
        drawImageOrFallback(ctx, pearlImg, lx, ly, CARD_W, CARD_H, String(card.value));
        if (config.selectedPearl === pearlIdx) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.strokeRect(lx, ly, CARD_W, CARD_H);
        }
      });
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
  drawPortalImage(ctx, portalImg, PORTAL_X, PORTAL_IMG_Y, PORTAL_W, PORTAL_IMG_H, `portal-${colorIndex}`);

  // Diamonds (left side) — rendered as character card backs
  const DIAMOND_CARD_W = 28;
  const DIAMOND_CARD_H = 36;
  const DIAMOND_CARD_GAP = 4;
  const diamondX = PORTAL_X + 20;
  const diamondY = PORTAL_Y + 20;
  const gap = portal.diamonds > 6 ? 2 : DIAMOND_CARD_GAP;
  for (let i = 0; i < portal.diamonds; i++) {
    const x = diamondX + i * (DIAMOND_CARD_W + gap);
    placeOnTable(ctx, x, diamondY, DIAMOND_CARD_W, DIAMOND_CARD_H, `diamond-${i}`, (lx, ly) => {
      drawImageOrFallback(ctx, 'Charakterkarte Hinten.png', lx, ly, DIAMOND_CARD_W, DIAMOND_CARD_H);
    }, { rotDeg: 9, offset: 2, shadow: 0.6, radius: 3 });
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
      placeOnTable(ctx, x, y, slotW, slotH, `slot-${slot.card.id}`, (lx, ly) => {
        drawImageOrFallback(ctx, slot.card.imageName, lx, ly, slotW, slotH, slot.card.name);
      }, { rotDeg: 1.6, offset: 2.5 });
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
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;

    const pearlImg = card.isJoker ? 'PerlenkarteJoker.png' : card.hasRefreshSymbol ? `Perlenkarte${card.value}-neu.png` : `Perlenkarte${card.value}.png`;
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
  _config: DrawConfig,
  page: number = 0,
) {
  if (!activatedCards || activatedCards.length === 0) {
    return;
  }

  const pageStart = page * ACTIVATED_PAGE_SIZE;
  const cardsToDisplay = activatedCards.slice(pageStart, pageStart + ACTIVATED_PAGE_SIZE);

  cardsToDisplay.forEach((card, idx) => {
    const { cardX, cardY, w, h } = getActivatedCardPosition(idx); // page-local index

    ctx.save();
    ctx.translate(cardX + w / 2, cardY + h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(cardX + w / 2), -(cardY + h / 2));

    placeOnTable(ctx, cardX, cardY, w, h, `activated-${card.id}`, (lx, ly) => {
      drawImageOrFallback(ctx, card.imageName, lx, ly, w, h, card.name);
    }, { rotDeg: 2.6, offset: 2.5 });

    ctx.restore();
  });
}

/**
 * Draw pagination arrows (◄ / ►) for an activated-characters grid.
 * Arrows are always rendered; color indicates active/inactive/hover state.
 *
 * @param ctx           Canvas rendering context (may be in a transformed state for opponent zones)
 * @param totalCount    Total number of activated characters (all pages)
 * @param currentPage   Currently displayed page (0-based)
 * @param gridX         Left edge of the grid in current coordinate space
 * @param gridY         Top edge of the grid in current coordinate space
 * @param gridH         Height of the grid
 * @param arrowSize     Triangle arrow size
 * @param arrowMargin   Gap between grid edge and arrow
 * @param gridWidth     Total pixel width of the grid (cols*cardW + (cols-1)*cardGap)
 * @param pageSize      Number of cards per page
 * @param prevHover     0–1 hover progress for the prev arrow
 * @param nextHover     0–1 hover progress for the next arrow
 */
export function drawActivatedPageArrows(
  ctx: CanvasRenderingContext2D,
  totalCount: number,
  currentPage: number,
  gridX: number,
  gridY: number,
  gridH: number,
  arrowSize: number = ACTIVATED_ARROW_SIZE,
  arrowMargin: number = ACTIVATED_ARROW_MARGIN,
  gridWidth: number = ACTIVATED_GRID_COLS * ACTIVATED_CARD_W + (ACTIVATED_GRID_COLS - 1) * ACTIVATED_CARD_GAP,
  pageSize: number = ACTIVATED_PAGE_SIZE,
  prevHover: number = 0,
  nextHover: number = 0,
) {
  const arrowCY = gridY + gridH / 2;
  const half = arrowSize / 2;

  const prevEnabled = currentPage > 0;
  const nextEnabled = totalCount > pageSize * (currentPage + 1);

  // Left (prev) arrow ◄
  const leftX = gridX - arrowMargin - arrowSize;
  const prevColor = !prevEnabled
    ? ACTIVATED_ARROW_COLOR_INACTIVE
    : prevHover > 0.01
      ? blendColors(ACTIVATED_ARROW_COLOR_ACTIVE, ACTIVATED_ARROW_COLOR_HOVER, prevHover)
      : ACTIVATED_ARROW_COLOR_ACTIVE;

  ctx.save();
  ctx.fillStyle = prevColor;
  ctx.beginPath();
  ctx.moveTo(leftX, arrowCY);              // left tip
  ctx.lineTo(leftX + arrowSize, arrowCY - half); // top right
  ctx.lineTo(leftX + arrowSize, arrowCY + half); // bottom right
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right (next) arrow ►
  const rightX = gridX + gridWidth + arrowMargin;
  const nextColor = !nextEnabled
    ? ACTIVATED_ARROW_COLOR_INACTIVE
    : nextHover > 0.01
      ? blendColors(ACTIVATED_ARROW_COLOR_ACTIVE, ACTIVATED_ARROW_COLOR_HOVER, nextHover)
      : ACTIVATED_ARROW_COLOR_ACTIVE;

  ctx.save();
  ctx.fillStyle = nextColor;
  ctx.beginPath();
  ctx.moveTo(rightX + arrowSize, arrowCY);  // right tip
  ctx.lineTo(rightX, arrowCY - half);        // top left
  ctx.lineTo(rightX, arrowCY + half);        // bottom left
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Linearly blend two hex colors by factor t (0=a, 1=b) */
function blendColors(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

/**
 * Draw portal swap buttons (⇄) below each occupied portal slot,
 * and the replace-pearl-slots button below the pearl deck.
 * Handles regions of type 'portal-swap-btn', 'ui-replace-pearl-slots', and 'ui-replace-pearl-slots-ability'.
 */
export function drawPortalSwapButtons(ctx: CanvasRenderingContext2D, regions: CanvasRegion[]) {
  const swapRegions = regions.filter(r =>
    r.type === 'portal-swap-btn' ||
    r.type === 'ui-replace-pearl-slots' ||
    r.type === 'ui-replace-pearl-slots-ability'
  );
  for (const region of swapRegions) {
    const { x, y, w, h, hoverProgress, type, label } = region;
    ctx.save();

    // Background — ability button uses green tint to signal "free action"
    const alpha = 0.75 + hoverProgress * 0.25;
    const isFreeAbility = type === 'ui-replace-pearl-slots-ability';
    ctx.fillStyle = isFreeAbility
      ? `rgba(22, 199, 132, ${alpha})`
      : `rgba(99, 102, 241, ${alpha})`;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Border with hover glow
    ctx.strokeStyle = hoverProgress > 0.01
      ? `rgba(255, 215, 0, ${0.5 + hoverProgress * 0.5})`
      : isFreeAbility ? 'rgba(110, 231, 183, 0.8)' : 'rgba(165, 180, 252, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isFreeAbility && label) {
      // Show label text for the free ability button
      ctx.font = `bold ${Math.round(h * 0.55)}px Arial`;
      ctx.fillText(label, x + w / 2, y + h / 2);
    } else {
      // ⇄ symbol for portal swap and normal replace
      ctx.font = `bold ${Math.round(h * 0.7)}px Arial`;
      ctx.fillText('⇄', x + w / 2, y + h / 2);
    }

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
  playerId?: string;
  colorIndex: number;
  isStartingPlayer: boolean;
  portal: ActivatedCharacter[];
  activatedCharacters: ActivatedCharacter[];
  handCount: number;
  activatedPage?: number;
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
  activatedPage: number = 0,
  prevArrowHover: number = 0,
  nextArrowHover: number = 0,
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
  drawPortalImage(ctx, portalImg, -hw, -hh + OPP_PORTAL_IMG_REL_Y, OPP_SCALED_W, OPP_PORTAL_IMG_H, `opp-portal-${data.playerId ?? data.colorIndex}`);

  // 2. Portal slot cards — same relative position as in the player zone
  for (let i = 0; i < 2; i++) {
    const slotX = -hw + OPP_SLOT_REL_X + i * (OPP_SLOT_W + OPP_SLOT_GAP);
    const slotY = -hh + OPP_SLOT_REL_Y;
    const entry = data.portal[i];
    if (entry) {
      placeOnTable(ctx, slotX, slotY, OPP_SLOT_W, OPP_SLOT_H, `slot-${entry.card.id}`, (lx, ly) => {
        drawImageOrFallback(ctx, entry.card.imageName, lx, ly, OPP_SLOT_W, OPP_SLOT_H, entry.card.name);
      }, { rotDeg: 1.6, offset: 1.5, shadow: 0.8 });
    }
  }

  // 3. Activated characters grid — right of portal slots (from opponent's perspective)
  const oppPageStart = activatedPage * ACTIVATED_PAGE_SIZE;
  const oppPageSlice = data.activatedCharacters.slice(oppPageStart, oppPageStart + ACTIVATED_PAGE_SIZE);
  for (let i = 0; i < oppPageSlice.length; i++) {
    const col = i % ACTIVATED_GRID_COLS;
    const row = Math.floor(i / ACTIVATED_GRID_COLS);
    const actX = -hw + OPP_ACT_REL_X + col * (OPP_ACT_W + OPP_ACT_GAP);
    const actY = -hh + OPP_ACT_REL_Y + row * (OPP_ACT_H + OPP_ACT_GAP);
    const card = oppPageSlice[i]!;
    ctx.save();
    ctx.translate(actX + OPP_ACT_W / 2, actY + OPP_ACT_H / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(actX + OPP_ACT_W / 2), -(actY + OPP_ACT_H / 2));
    placeOnTable(ctx, actX, actY, OPP_ACT_W, OPP_ACT_H, `activated-${card.card.id}`, (lx, ly) => {
      drawImageOrFallback(ctx, card.card.imageName, lx, ly, OPP_ACT_W, OPP_ACT_H, card.card.name);
    }, { rotDeg: 2.6, offset: 1.5, shadow: 0.8 });
    ctx.restore();
  }

  // 3b. Opponent pagination arrows (in the zone's rotated coordinate space)
  {
    const oppArrowSize = Math.max(4, Math.round(ACTIVATED_ARROW_SIZE * OPP_SCALE));
    const oppArrowMargin = Math.max(1, Math.round(ACTIVATED_ARROW_MARGIN * OPP_SCALE));
    const oppGridW = ACTIVATED_GRID_COLS * OPP_ACT_W + (ACTIVATED_GRID_COLS - 1) * OPP_ACT_GAP;
    const oppGridH = ACTIVATED_GRID_ROWS * OPP_ACT_H + (ACTIVATED_GRID_ROWS - 1) * OPP_ACT_GAP;
    const oppGridX = -hw + OPP_ACT_REL_X;
    const oppGridY = -hh + OPP_ACT_REL_Y;
    drawActivatedPageArrows(
      ctx,
      data.activatedCharacters.length,
      activatedPage,
      oppGridX, oppGridY, oppGridH,
      oppArrowSize, oppArrowMargin,
      oppGridW, ACTIVATED_PAGE_SIZE,
      prevArrowHover, nextArrowHover,
    );
  }

  // 4. Hand cards — face-down stack, left side (from opponent's perspective)
  if (data.handCount > 0) {
    // The face-down hand lies just left of the portal photo (not at the far end of the virtual zone).
    const portalPhoto = getImage(portalImg);
    const photoW = portalPhoto ? getScaledDimensions(portalPhoto, OPP_SCALED_W, OPP_PORTAL_IMG_H).w : OPP_SCALED_W;
    const handX = -photoW / 2 - OPP_HAND_W - 14;
    const handY = -hh + OPP_HAND_REL_Y - OPP_HAND_H / 2;
    placeOnTable(ctx, handX, handY, OPP_HAND_W, OPP_HAND_H, `opp-hand-${data.playerId ?? ''}`, (lx, ly) => {
      drawImageOrFallback(ctx, 'Perlenkarte Hinten.png', lx, ly, OPP_HAND_W, OPP_HAND_H, '?');
    }, { rotDeg: 3, offset: 1.5, shadow: 0.8 });
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
  regions: import('./canvasRegions').CanvasRegion[] = [],
) {
  const zones = getOpponentZones().map(({ zone, rotationDeg }) => ({ zone, deg: rotationDeg }));

  const drawScrollInZone = (zone: { x: number; y: number; w: number; h: number }, deg: number) => {
    const maxDim = Math.min(zone.w, zone.h) * 0.95;
    const x = zone.x + zone.w / 2 - maxDim / 2;
    const y = zone.y + zone.h / 2 - maxDim / 2;
    drawImageOrFallback(ctx, 'Schriftrolle.png', x, y, maxDim, maxDim, 'SR', deg);
  };

  zones.forEach(({ zone, deg }, i) => {
    const data = opponents[i];
    if (data) {
      const page = data.activatedPage ?? 0;
      const prevHover = regions.find(r => r.type === 'activated-page-arrow' && r.id === `${data.playerId}:prev`)?.hoverProgress ?? 0;
      const nextHover = regions.find(r => r.type === 'activated-page-arrow' && r.id === `${data.playerId}:next`)?.hoverProgress ?? 0;
      drawOpponentZone(ctx, zone, data, deg, page, prevHover, nextHover);
    } else if (i === 0 || i === 3) {
      // Empty side seats keep a rolled-up scroll lying on the table; empty top seats stay bare felt.
      drawScrollInZone(zone, deg);
    }
  });
}
