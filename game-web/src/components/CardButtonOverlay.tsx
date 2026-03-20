/**
 * CardButtonOverlay Component
 * Manages and renders interactive card button overlays on top of the canvas
 * Uses shared card layout constants from cardLayoutConstants.ts for correct positioning
 */

import React, { useCallback, useMemo } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import type { HitTarget } from '../lib/gameHitTest';
import { hitTestAuslage, hitTestPortalSlots, hitTestHandCards } from '../lib/gameHitTest';
import {
  BASE_W,
  BASE_H,
  CARD_W,
  CARD_H,
  CARD_GAP,
  AUSLAGE_START_X,
  AUSLAGE_START_Y,
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
  getHandCardPosition,
  getPortalSlotPosition,
} from '../lib/cardLayoutConstants';
import { CardButton } from './CardButton';

interface CardButtonOverlayProps {
  G: GameState;
  canvasWidth: number;
  canvasHeight: number;
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
    
    for (let i = 0; i < count; i++) {
      // Use shared helper for consistent positioning
      const pos = getHandCardPosition(count, i);
      const { cx, cy, angle } = pos;
      
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
      // Use shared helper for consistent positioning
      const pos = getPortalSlotPosition(i);
      const { slotX, slotY } = pos;
      
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
