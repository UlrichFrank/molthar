/**
 * CardButtonOverlay Component
 * Manages and renders interactive card button overlays on top of the canvas
 * Handles layout synchronization with canvas rendering
 */

import React, { useCallback, useMemo } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import type { HitTarget } from '../lib/gameHitTest';
import { hitTestAuslage, hitTestPortalSlots, hitTestHandCards } from '../lib/gameHitTest';
import { CardButton } from './CardButton';

// Layout constants (must match gameRender.ts and gameHitTest.ts)
const BASE_W = 1200;
const BASE_H = 800;
const ZONE_TOP_H = 200;
const MARGIN_H = ZONE_TOP_H;
const ZONE_CENTER_H = 320;

const CARD_W = Math.round(59 * 1.5);
const CARD_H = Math.round(92 * 1.5);
const CARD_GAP = Math.round(10 * 1.5);

const AUSLAGE_CENTER_X = MARGIN_H;
const AUSLAGE_CENTER_W = BASE_W - 2 * MARGIN_H;
const AUSLAGE_START_X = AUSLAGE_CENTER_X + (AUSLAGE_CENTER_W - (6 * CARD_W + 5 * CARD_GAP)) / 2;
const AUSLAGE_START_Y = ZONE_TOP_H + ZONE_CENTER_H * 0.05;

const PORTAL_X = MARGIN_H;
const PORTAL_W = BASE_W - 2 * MARGIN_H;
const PORTAL_Y = ZONE_TOP_H + ZONE_CENTER_H;
const ZONE_PLAYER_H = BASE_H - ZONE_TOP_H - ZONE_CENTER_H;

const SLOT_AREA_X = PORTAL_X + PORTAL_W / 3 + PORTAL_W * 0.03;
const SLOT_AREA_Y = PORTAL_Y + ZONE_PLAYER_H * 0.65;
const SLOT_W = CARD_W;
const SLOT_H = CARD_H;
const SLOT_GAP = CARD_GAP;

const HAND_AREA_X = PORTAL_X + 10;
const HAND_AREA_W = Math.max(120, Math.floor(PORTAL_W / 3));
const HAND_CENTER_Y = PORTAL_Y + ZONE_PLAYER_H * 0.5;
const HAND_CARD_W = Math.round(CARD_W * 0.9);
const HAND_CARD_H = Math.round(CARD_H * 0.9);
const HAND_MAX = 9;

interface CardButtonOverlayProps {
  G: GameState;
  canvasWidth: number;
  canvasHeight: number;
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
  hoveredCard: HitTarget | null;
  phase: string;
  onCardClick: (target: HitTarget) => void;
  onCardHover?: (target: HitTarget | null) => void;
}

/**
 * Calculate the scale factor from model coordinates to CSS pixels
 */
function getScaleFactor(canvasWidth: number, canvasHeight: number): number {
  return Math.min(canvasWidth / BASE_W, canvasHeight / BASE_H);
}

/**
 * Determine if a card should be disabled based on game phase and state
 * Selection-based disabling has been removed - cards are clickable in takingActions phase
 */
function isCardDisabled(
  cardType: string,
  cardId: number | string,
  phase: string
): boolean {
  // Only disable during finished phase
  if (phase === 'finished') {
    return true;
  }
  
  return false;
}

export const CardButtonOverlay: React.FC<CardButtonOverlayProps> = ({
  G,
  canvasWidth,
  canvasHeight,
  selectedPearl,
  selectedCharacter,
  selectedHandIndices,
  hoveredCard,
  phase,
  onCardClick,
  onCardHover,
}) => {
  const scale = getScaleFactor(canvasWidth, canvasHeight);
  
  // Generate auslage card buttons
  const auslageButtons = useMemo(() => {
    const buttons = [];
    const characterSlots = G.characterSlots || [];
    const pearlSlots = G.pearlSlots || [];
    
    // Character cards (indices 0-1)
    for (let i = 0; i < Math.min(2, characterSlots.length); i++) {
      const cardX = AUSLAGE_START_X + i * (CARD_W + CARD_GAP);
      const isDisabled = isCardDisabled('auslage-card', i, phase);
      
      buttons.push({
        id: i,
        x: cardX,
        y: AUSLAGE_START_Y,
        w: CARD_W,
        h: CARD_H,
        type: 'auslage-card' as const,
        isSelected: false,
        isDisabled,
        target: { type: 'auslage-card' as const, id: i, x: cardX, y: AUSLAGE_START_Y, w: CARD_W, h: CARD_H },
      });
    }
    
    // Pearl cards (indices 2-5, representing pearl slots)
    for (let i = 0; i < Math.min(4, pearlSlots.length); i++) {
      const slotIndex = 2 + i;
      const cardX = AUSLAGE_START_X + slotIndex * (CARD_W + CARD_GAP);
      const isDisabled = isCardDisabled('auslage-card', slotIndex, phase);
      
      buttons.push({
        id: slotIndex,
        x: cardX,
        y: AUSLAGE_START_Y,
        w: CARD_W,
        h: CARD_H,
        type: 'auslage-card' as const,
        isSelected: false,
        isDisabled,
        target: { type: 'auslage-card' as const, id: slotIndex, x: cardX, y: AUSLAGE_START_Y, w: CARD_W, h: CARD_H },
      });
    }
    
    return buttons;
  }, [G.characterSlots, G.pearlSlots, phase]);
  
  // Generate hand card buttons
  const handButtons = useMemo(() => {
    const buttons = [];
    const hand = G.players?.[Object.keys(G.players || {})[0]]?.hand || [];
    
    const count = Math.min(hand.length, HAND_MAX);
    const handCenterX = HAND_AREA_X + HAND_AREA_W / 2;
    const fanAngleDeg = Math.min(60, 12 * Math.max(0, count - 1));
    const fanAngle = (fanAngleDeg * Math.PI) / 180;
    const overlap = HAND_CARD_W * 0.5;
    
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const angle = -fanAngle / 2 + t * fanAngle;
      const offsetX = (i - (count - 1) / 2) * overlap * 0.6;
      const cx = handCenterX + offsetX;
      const cy = HAND_CENTER_Y;
      
      const isDisabled = isCardDisabled('hand-card', i, phase);
      
      buttons.push({
        id: i,
        x: cx,
        y: cy,
        w: HAND_CARD_W,
        h: HAND_CARD_H,
        type: 'hand-card' as const,
        angle,
        isSelected: false,
        isDisabled,
        target: { type: 'hand-card' as const, id: i, x: cx, y: cy, w: HAND_CARD_W, h: HAND_CARD_H },
      });
    }
    
    return buttons;
  }, [G.players, phase]);
  
  // Generate portal slot buttons
  const portalButtons = useMemo(() => {
    const buttons = [];
    
    for (let i = 0; i < 4; i++) {
      const slotX = SLOT_AREA_X + i * (SLOT_W + SLOT_GAP);
      const slotY = SLOT_AREA_Y;
      
      // Portal slots are interactive for placing cards
      buttons.push({
        id: i,
        x: slotX,
        y: slotY,
        w: SLOT_W,
        h: SLOT_H,
        type: 'portal-slot' as const,
        isSelected: false,
        isDisabled: false,
        target: { type: 'portal-slot' as const, id: i, x: slotX, y: slotY, w: SLOT_W, h: SLOT_H },
      });
    }
    
    return buttons;
  }, []);
  
  const handleCardHover = useCallback(
    (target: HitTarget | null) => {
      onCardHover?.(target);
    },
    [onCardHover]
  );

  const handlePointerEnter = useCallback(
    (target: HitTarget) => {
      handleCardHover(target);
    },
    [handleCardHover]
  );

  const handlePointerLeave = useCallback(() => {
    handleCardHover(null);
  }, [handleCardHover]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      {/* Auslage cards */}
      {auslageButtons.map((btn) => (
        <CardButton
          key={`auslage-${btn.id}`}
          id={btn.id}
          x={btn.x}
          y={btn.y}
          w={btn.w}
          h={btn.h}
          type={btn.type}
          isSelected={btn.isSelected}
          isDisabled={btn.isDisabled}
          isHovered={hoveredCard?.type === btn.type && hoveredCard?.id === btn.id}
          scaleX={scale}
          scaleY={scale}
          onPointerEnter={() => handlePointerEnter(btn.target)}
          onPointerLeave={() => handlePointerLeave()}
          onClick={() => onCardClick(btn.target)}
          ariaLabel={`${btn.type === 'auslage-card' ? 'Card' : ''} slot ${btn.id}`}
        />
      ))}

      {/* Hand cards */}
      {handButtons.map((btn) => (
        <CardButton
          key={`hand-${btn.id}`}
          id={btn.id}
          x={btn.x}
          y={btn.y}
          w={btn.w}
          h={btn.h}
          type={btn.type}
          isSelected={btn.isSelected}
          isDisabled={btn.isDisabled}
          isHovered={hoveredCard?.type === btn.type && hoveredCard?.id === btn.id}
          scaleX={scale}
          scaleY={scale}
          onPointerEnter={() => handlePointerEnter(btn.target)}
          onPointerLeave={() => handlePointerLeave()}
          onClick={() => onCardClick(btn.target)}
          ariaLabel={`Hand card ${btn.id + 1}`}
        />
      ))}

      {/* Portal slots */}
      {portalButtons.map((btn) => (
        <CardButton
          key={`portal-${btn.id}`}
          id={btn.id}
          x={btn.x}
          y={btn.y}
          w={btn.w}
          h={btn.h}
          type={btn.type}
          isSelected={btn.isSelected}
          isDisabled={btn.isDisabled}
          isHovered={hoveredCard?.type === btn.type && hoveredCard?.id === btn.id}
          scaleX={scale}
          scaleY={scale}
          onPointerEnter={() => handlePointerEnter(btn.target)}
          onPointerLeave={() => handlePointerLeave()}
          onClick={() => onCardClick(btn.target)}
          ariaLabel={`Portal slot ${btn.id + 1}`}
        />
      ))}
    </div>
  );
};

export default CardButtonOverlay;
