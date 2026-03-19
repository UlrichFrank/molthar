import React, { useRef, useEffect, useState } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import type { HitTarget } from '../lib/gameHitTest';
import { hitTest, getDragDistance, isSignificantDrag } from '../lib/gameHitTest';
import { drawBackground, drawAuslage, drawPlayerPortal, drawUI, drawOpponentPortals } from '../lib/gameRender';
import { preloadAllImages } from '../lib/imageLoaderV2';

interface CanvasGameBoardProps {
  G: GameState;
  ctx: { phase?: string } & Record<string, unknown>;
  moves: Record<string, (...args: unknown[]) => void>;
  events?: Record<string, (...args: unknown[]) => void>;
  playerID: string | null;
  isActive: boolean;
}

// Model Koordinaten (3:2 Ratio)
const BASE_W = 1200;
const BASE_H = 800;
const DRAG_THRESHOLD = 30; // pixel movement before drag triggers

interface ModelCoords {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  draggedObject: HitTarget | null;
}

interface Selection {
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
}

function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    if (!ref.current) return;
    
    // Initial size
    const rect = ref.current.getBoundingClientRect();
    const aspect = BASE_W / BASE_H;
    const newW = Math.min(rect.width, rect.height * aspect);
    const newH = newW / aspect;
    setSize({ w: newW, h: newH });

    // ResizeObserver for responsive updates
    const ro = new ResizeObserver(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const aspect = BASE_W / BASE_H;
      const newW = Math.min(rect.width, rect.height * aspect);
      const newH = newW / aspect;
      setSize({ w: newW, h: newH });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

export function CanvasGameBoard(props: CanvasGameBoardProps) {
  const { G, ctx, moves, events, playerID, isActive } = props;
  const { ref, w: viewportW, h: viewportH } = useContainerSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  console.log('🎮 CanvasGameBoard rendered with G:', G);
  console.log('📊 CharacterSlots:', G.characterSlots, 'PearlSlots:', G.pearlSlots);

  // Preload images on mount
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  useEffect(() => {
    preloadAllImages()
      .then(() => {
        console.log('✅ All card images loaded');
        setImagesLoaded(true);
      })
      .catch((err) => console.warn('⚠️ Some images failed to load:', err));
  }, []);

  const [selection, setSelection] = useState<Selection>({
    selectedPearl: null,
    selectedCharacter: null,
    selectedHandIndices: [],
  });

  const [drag, setDrag] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    draggedObject: null,
  });

  // Berechne Sichtbare Größe (Letterboxed)
  const aspect = BASE_W / BASE_H; // 1.5 (3:2)
  const cssW = Math.min(viewportW, viewportH * aspect);
  const cssH = cssW / aspect;

  // Spieler-Info
  const myPlayerID = playerID || (G.playerOrder && G.playerOrder[0]) || Object.keys(G.players || {})[0];
  const me = G.players?.[myPlayerID];
  const phase = ctx.phase || 'takingActions';
  
  // Fallback für fehlende Daten
  const characterSlots = G.characterSlots || [];
  const pearlSlots = G.pearlSlots || [];
  const playerDiamonds = me?.diamonds ?? 0;
  const playerPortal = me?.portal ?? [];
  const playerHand = me?.hand ?? [];

  /**
   * Konvertiere CSS-Koordinaten zu Model-Koordinaten
   */
  function toModelCoords(clientX: number, clientY: number): ModelCoords {
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    const scale = Math.min(canvasRect.width / BASE_W, canvasRect.height / BASE_H);
    const x = (clientX - canvasRect.left) / scale;
    const y = (clientY - canvasRect.top) / scale;
    return { x, y };
  }

  /**
   * Zeichne Canvas basierend auf Game State
   */
  function draw(canvasCtx: CanvasRenderingContext2D) {
    
    // Draw using helper functions
    drawBackground(canvasCtx);
    
    // Draw opponent portals based on player count
    const numPlayers = Object.keys(G.players || {}).length;
    const numOpponents = Math.max(0, numPlayers - 1);
    if (numOpponents > 0) {
      drawOpponentPortals(canvasCtx, numOpponents);
    }
    
    // Auslage
    // @ts-expect-error - PearlCard and CharacterCard don't have exact CardData interface but work for rendering
    drawAuslage(canvasCtx, characterSlots, pearlSlots, {
      selectedPearl: selection.selectedPearl,
      selectedCharacter: selection.selectedCharacter,
      selectedHandIndices: selection.selectedHandIndices,
      isDragging: drag.isDragging,
      dragX: drag.currentX,
      dragY: drag.currentY,
    });

    // Portal - @ts-expect-error: PearlCard[] doesn't match CardData[] but works for rendering
    drawPlayerPortal(canvasCtx, {
      diamonds: playerDiamonds,
      portal: playerPortal,
      // @ts-expect-error - PearlCard values work for rendering
      hand: playerHand,
    }, {
      selectedPearl: selection.selectedPearl,
      selectedCharacter: selection.selectedCharacter,
      selectedHandIndices: selection.selectedHandIndices,
      isDragging: drag.isDragging,
      dragX: drag.currentX,
      dragY: drag.currentY,
    });

    // UI
    drawUI(canvasCtx, phase);

    // Draw dragging feedback
    if (drag.isDragging && drag.draggedObject) {
      const target = drag.draggedObject;
      
      // Draw semi-transparent card at drag position
      canvasCtx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      canvasCtx.fillRect(
        drag.currentX - target.w / 2,
        drag.currentY - target.h / 2,
        target.w,
        target.h
      );
      canvasCtx.strokeStyle = '#FFD700';
      canvasCtx.lineWidth = 3;
      canvasCtx.strokeRect(
        drag.currentX - target.w / 2,
        drag.currentY - target.h / 2,
        target.w,
        target.h
      );
    }
  }

  /**
   * Layout Canvas und Render
   */
  // Pointer Events: Down, Move, Up
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    
    const coords = toModelCoords(e.clientX, e.clientY);
    const hitTarget = hitTest(coords.x, coords.y);

    if (hitTarget.type === 'none') return;

    console.log('🖱️ Down:', hitTarget.type, hitTarget.id, 'at', Math.round(coords.x), Math.round(coords.y));

    // Start drag
    setDrag({
      isDragging: true,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      draggedObject: hitTarget,
    });

    // Handle immediate selections for buttons
    if (hitTarget.type === 'button') {
      handleButtonClick(hitTarget.id as string);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.isDragging) return;

    const coords = toModelCoords(e.clientX, e.clientY);
    setDrag((prev) => ({
      ...prev,
      currentX: coords.x,
      currentY: coords.y,
    }));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.isDragging || !drag.draggedObject) {
      setDrag({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        draggedObject: null,
      });
      return;
    }

    const coords = toModelCoords(e.clientX, e.clientY);
    const distance = getDragDistance(drag.startX, drag.startY, coords.x, coords.y);
    const dragTarget = hitTest(coords.x, coords.y);

    // Handle drag completion
    if (isSignificantDrag(distance, DRAG_THRESHOLD)) {
      handleDragDrop(drag.draggedObject, dragTarget);
    } else {
      // Simple click
      handleCardClick(drag.draggedObject);
    }

    setDrag({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      draggedObject: null,
    });
  };

  /**
   * Behandle Card-Klicks (Auslage, Hand, Portal Slots)
   */
  function handleCardClick(target: HitTarget) {
    switch (target.type) {
      case 'auslage-card': {
        const id = target.id as number;
        if (id < 2) {
          // Character
          setSelection((prev) => ({
            ...prev,
            selectedCharacter: prev.selectedCharacter === id ? null : id,
            selectedPearl: null,
          }));
        } else {
          // Pearl
          const pearlIdx = id - 2;
          setSelection((prev) => ({
            ...prev,
            selectedPearl: prev.selectedPearl === pearlIdx ? null : pearlIdx,
            selectedCharacter: null,
          }));
        }
        break;
      }

      case 'hand-card': {
        const id = target.id as number;
        setSelection((prev) => ({
          ...prev,
          selectedHandIndices: prev.selectedHandIndices.includes(id)
            ? prev.selectedHandIndices.filter((x) => x !== id)
            : [...prev.selectedHandIndices, id],
        }));
        break;
      }

      case 'portal-slot': {
        const id = target.id as number;
        if (selection.selectedHandIndices.length > 0) {
          moves.activatePortalCard(id, selection.selectedHandIndices);
          setSelection((prev) => ({ ...prev, selectedHandIndices: [] }));
        }
        break;
      }
    }
  }

  /**
   * Behandle Drag & Drop
   */
  function handleDragDrop(fromTarget: HitTarget, toTarget: HitTarget) {
    console.log('🎯 Drag:', fromTarget.type, fromTarget.id, '→', toTarget.type, toTarget.id);

    // Drag hand card to portal slot
    if (
      fromTarget.type === 'hand-card' &&
      toTarget.type === 'portal-slot' &&
      typeof fromTarget.id === 'number' &&
      typeof toTarget.id === 'number'
    ) {
      if (!selection.selectedHandIndices.includes(fromTarget.id)) {
        selection.selectedHandIndices.push(fromTarget.id);
      }
      moves.activatePortalCard(toTarget.id, selection.selectedHandIndices);
      setSelection((prev) => ({ ...prev, selectedHandIndices: [] }));
    }

    // Drag auslage card to hand (take card)
    if (fromTarget.type === 'auslage-card' && typeof fromTarget.id === 'number') {
      if (fromTarget.id < 2) {
        // Character
        moves.takeCharacterCard(fromTarget.id);
      } else {
        // Pearl
        moves.takePearlCard(fromTarget.id - 2);
      }
      setSelection((prev) => ({ ...prev, selectedCharacter: null, selectedPearl: null }));
    }
  }

  /**
   * Behandle Button-Klicks
   */
  function handleButtonClick(buttonId: string) {
    switch (buttonId) {
      case 'take-pearl':
        if (selection.selectedPearl !== null) {
          moves.takePearlCard(selection.selectedPearl);
          setSelection((prev) => ({ ...prev, selectedPearl: null }));
        }
        break;

      case 'activate-character':
        if (selection.selectedCharacter !== null) {
          moves.takeCharacterCard(selection.selectedCharacter);
          setSelection((prev) => ({ ...prev, selectedCharacter: null }));
        }
        break;

      case 'end-turn':
        events?.endTurn?.();
        setSelection({ selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] });
        break;
    }
  }

  /**
   * Layout Canvas und Render Loop
   */
  useEffect(() => {
    if (!canvasRef.current || cssW === 0 || cssH === 0) {
      return;
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvas = canvasRef.current;

    // CSS Size (sichtbar)
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    // Internal Size (Device Pixels)
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    const drawCtx = canvas.getContext('2d')!;
    const scale = Math.min(cssW / BASE_W, cssH / BASE_H);
    
    // Setup transform for DPR and scaling
    drawCtx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

    draw(drawCtx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cssW, cssH, G, selection, drag, phase, imagesLoaded]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0f1e',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 100,
      }}>
        Canvas: {cssW.toFixed(0)}×{cssH.toFixed(0)}px<br/>
        Players: {Object.keys(G.players || {}).length}<br/>
        Auslage: {(G.characterSlots || []).length + (G.pearlSlots || []).length} cards
      </div>
      
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: 'block',
          borderRadius: 12,
          background: '#0E1E2B',
          cursor: drag.isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
    </div>
  );
}

export default CanvasGameBoard;
