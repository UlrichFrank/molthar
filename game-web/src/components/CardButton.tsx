/**
 * CardButton Component
 * Provides interactive overlay for game cards with hover and selection feedback
 * Handles pointer events, touch events, keyboard navigation, and accessibility
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from '../styles/cardButtons.module.css';
import type { HitTarget } from '../lib/gameHitTest';

export interface CardButtonProps {
  id: string | number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: HitTarget['type'];
  angle?: number; // Rotation angle in radians (for hand cards)
  isSelected?: boolean;
  isDisabled?: boolean;
  isHovered?: boolean;
  onPointerEnter?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  scaleX?: number;
  scaleY?: number;
}

export const CardButton = React.forwardRef<HTMLButtonElement, CardButtonProps>(
  (
    {
      id,
      x,
      y,
      w,
      h,
      type,
      angle = 0,
      isSelected = false,
      isDisabled = false,
      isHovered = false,
      onPointerEnter,
      onPointerLeave,
      onClick,
      onFocus,
      onBlur,
      ariaLabel,
      scaleX = 1,
      scaleY = 1,
    },
    ref
  ) => {
    const [touchHover, setTouchHover] = useState(false);
    const pointerTypeRef = useRef<string>('');

    // Detect pointer type (mouse vs touch)
    const handlePointerEnter = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        pointerTypeRef.current = e.pointerType;
        
        // For touch, we'll use touchHover state for visual feedback
        if (e.pointerType === 'touch') {
          setTouchHover(true);
        }
        
        onPointerEnter?.(e);
      },
      [onPointerEnter]
    );

    const handlePointerLeave = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        setTouchHover(false);
        onPointerLeave?.(e);
      },
      [onPointerLeave]
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        // For touch, toggle the touch hover state
        if (e.pointerType === 'touch') {
          setTouchHover((prev) => !prev);
        }
      },
      []
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      [isDisabled, onClick]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        // Allow Enter and Space to activate the button
        if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
          e.preventDefault();
          // Trigger click handler
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          });
          e.currentTarget.dispatchEvent(clickEvent);
        }
      },
      [isDisabled]
    );

    // Build className
    const classNames = [styles.cardButton];
    
    if (type === 'auslage-card') {
      classNames.push(styles.auslageCardButton);
    } else if (type === 'hand-card') {
      classNames.push(styles.handCardButton);
    } else if (type === 'portal-slot') {
      classNames.push(styles.portalSlotButton);
    }
    
    if (isSelected) {
      classNames.push(styles.selected);
    }
    
    if (touchHover) {
      classNames.push(styles.touchHover);
    }
    
    if (isDisabled) {
      classNames.push(styles.disabled);
    }

    // Calculate absolute position (already in model coordinates)
    const left = x * scaleX;
    const top = y * scaleY;
    const width = w * scaleX;
    const height = h * scaleY;

    // Build transform: translate to center, rotate, translate back
    const angleInDegrees = (angle * 180) / Math.PI;
    const transform = angle !== 0 ? `translate(${width / 2}px, ${height / 2}px) rotate(${angleInDegrees}deg) translate(${-width / 2}px, ${-height / 2}px)` : undefined;

    return (
      <button
        ref={ref}
        type="button"
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          transformOrigin: 'center',
          transform: transform,
        }}
        className={classNames.join(' ')}
        disabled={isDisabled}
        aria-pressed={isSelected}
        aria-label={ariaLabel || `Card ${id}`}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  }
);

CardButton.displayName = 'CardButton';
