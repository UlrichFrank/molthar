import React, { useRef, useEffect, useState } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import { buildCanvasRegions, hitTestRegions } from '../lib/canvasRegions';
import type { CanvasRegion } from '../lib/canvasRegions';
import {
  drawBackground,
  drawAuslage,
  drawPlayerPortal,
  drawActivatedCharactersGrid,
  drawUIButton,
  drawOpponentActionCounter,
  drawRegionEffects,
} from '../lib/gameRender';
import { preloadAllImages } from '../lib/imageLoaderV2';
import { ActivatedCharacterDetailView } from './ActivatedCharacterDetailView';
import { DialogProvider, useDialog } from '../contexts/DialogContext';
import { CharacterReplacementDialog } from './CharacterReplacementDialog';
import { CharacterActivationDialog } from './CharacterActivationDialog';
import { DiscardCardsDialog } from './DiscardCardsDialog';
import { PlayerNameDisplay } from './PlayerNameDisplay';
import '../styles/dialogs.css';

interface CanvasGameBoardProps {
  G: GameState;
  ctx: { phase?: string } & Record<string, unknown>;
  moves: Record<string, (...args: unknown[]) => void>;
  events?: Record<string, (...args: unknown[]) => void>;
  playerID: string | null;
  isActive: boolean;
}

const BASE_W = 1200;
const BASE_H = 800;

interface ModelCoords { x: number; y: number }

function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    if (!ref.current) return;
    const calc = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const aspect = BASE_W / BASE_H;
      const newW = Math.min(rect.width, rect.height * aspect);
      const newH = newW / aspect;
      setSize({ w: newW, h: newH });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

export function CanvasGameBoard(props: CanvasGameBoardProps) {
  return (
    <DialogProvider>
      <CanvasGameBoardContent {...props} />
    </DialogProvider>
  );
}

function CanvasGameBoardContent(props: CanvasGameBoardProps) {
  const { G, ctx, moves, events, playerID, isActive } = props;
  const dialog = useDialog();
  const { ref, w: viewportW, h: viewportH } = useContainerSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const myPlayerID = playerID || (G.playerOrder && G.playerOrder[0]) || Object.keys(G.players || {})[0];
  const me = G.players?.[myPlayerID];
  const phase = ctx.phase || 'takingActions';
  const playerList = G.playerOrder || Object.keys(G.players || {});
  const activePlayerID = (ctx.currentPlayer as string) || playerList[0];
  const activePlayerIndex = playerList.indexOf(activePlayerID);
  const activePlayer = G.players?.[activePlayerID];
  const maxActions = typeof G.maxActions === 'number' ? G.maxActions : 3;
  const actionCount = typeof G.actionCount === 'number' ? G.actionCount : 0;
  const characterSlots = G.characterSlots || [];
  const pearlSlots = G.pearlSlots || [];
  const playerDiamonds = me?.diamonds ?? 0;
  const playerPortal = me?.portal ?? [];
  const playerHand = me?.hand ?? [];
  const activatedCards = (me?.activatedCharacters ?? []).map(s => s.card);

  // ── CSS canvas size ─────────────────────────────────────────────────────────
  const aspect = BASE_W / BASE_H;
  const cssW = Math.min(viewportW, viewportH * aspect);
  const cssH = cssW / aspect;

  // ── Detail view state (stays in React) ─────────────────────────────────────
  const [activeCharacterIndex, setActiveCharacterIndex] = useState<number | null>(null);
  const activatedCharacters = me?.activatedCharacters ?? [];
  const activeCharacter = activeCharacterIndex !== null && activeCharacterIndex < activatedCharacters.length
    ? activatedCharacters[activeCharacterIndex]
    : null;

  // ── Refs for rAF loop (avoids stale closures) ───────────────────────────────
  const regionsRef = useRef<CanvasRegion[]>([]);
  const hoverKeyRef = useRef<string | null>(null); // "${type}:${id}"
  const cssWRef = useRef(cssW);
  const cssHRef = useRef(cssH);
  const gRef = useRef(G);
  const phaseRef = useRef(phase);
  const isActiveRef = useRef(isActive);
  const myPlayerIDRef = useRef(myPlayerID);
  const activePlayerIDRef = useRef(activePlayerID);
  const activePlayerRef = useRef(activePlayer);
  const imagesLoadedRef = useRef(false);
  const rafIdRef = useRef(0);
  /** Set to true whenever a redraw is needed; cleared after drawing. */
  const dirtyRef = useRef(true);
  /** Cached 2d context to avoid getContext() every frame. */
  const draw2dRef = useRef<CanvasRenderingContext2D | null>(null);

  // Keep refs in sync and mark dirty on any change
  useEffect(() => {
    cssWRef.current = cssW;
    cssHRef.current = cssH;
    dirtyRef.current = true;
  }, [cssW, cssH]);
  useEffect(() => { gRef.current = G; dirtyRef.current = true; }, [G]);
  useEffect(() => { phaseRef.current = phase; dirtyRef.current = true; }, [phase]);
  useEffect(() => { isActiveRef.current = isActive; dirtyRef.current = true; }, [isActive]);
  useEffect(() => { myPlayerIDRef.current = myPlayerID; }, [myPlayerID]);
  useEffect(() => { activePlayerIDRef.current = activePlayerID; }, [activePlayerID]);
  useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);

  // Rebuild regions when game state changes (in-place to preserve animation)
  useEffect(() => {
    regionsRef.current = buildCanvasRegions(G, myPlayerID, isActive, regionsRef.current);
  }, [G, myPlayerID, isActive]);

  // ── Canvas size setup (on viewport resize) ──────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || cssW === 0 || cssH === 0) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvas = canvasRef.current;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    // Cache context after resize (resize invalidates it)
    draw2dRef.current = canvas.getContext('2d');
  }, [cssW, cssH]);

  // ── Image preload ───────────────────────────────────────────────────────────
  useEffect(() => {
    preloadAllImages()
      .then(() => { imagesLoadedRef.current = true; dirtyRef.current = true; })
      .catch(err => console.error('Failed to load card images:', err));
  }, []);

  // ── rAF loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let lastTime = performance.now();

    function animate(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const regions = regionsRef.current;
      const hoverKey = hoverKeyRef.current;

      // Animate each region; track whether any animation is still in motion
      let animating = false;
      for (const region of regions) {
        const isHoverTarget = hoverKey === `${region.type}:${region.id}`;
        const targetHover = isHoverTarget && region.enabled !== false ? 1 : 0;

        if (Math.abs(region.hoverProgress - targetHover) > 0.005) {
          region.hoverProgress += (targetHover - region.hoverProgress) * Math.min(1, dt * 8);
          animating = true;
        } else {
          region.hoverProgress = targetHover;
        }

        if (region.flashProgress > 0.005) {
          region.flashProgress = Math.max(0, region.flashProgress - dt * 5);
          animating = true;
        } else if (region.flashProgress > 0) {
          region.flashProgress = 0;
        }
      }

      // Only redraw when state changed or an animation is running
      if ((dirtyRef.current || animating) && cssWRef.current > 0 && imagesLoadedRef.current) {
        const drawCtx = draw2dRef.current ?? canvasRef.current?.getContext('2d') ?? null;
        if (drawCtx) {
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const scale = Math.min(cssWRef.current / BASE_W, cssHRef.current / BASE_H);
          drawCtx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
          renderFrame(drawCtx, regions);
          dirtyRef.current = false;
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    }

    rafIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Frame render (reads latest values from refs) ─────────────────────────────
  function renderFrame(drawCtx: CanvasRenderingContext2D, regions: CanvasRegion[]) {
    const G = gRef.current;
    const phase = phaseRef.current;
    const myPlayerID = myPlayerIDRef.current;
    const isActive = isActiveRef.current;
    const activePlayer = activePlayerRef.current;
    const activePlayerID = activePlayerIDRef.current;

    const me = G.players?.[myPlayerID];
    const characterSlots = G.characterSlots ?? [];
    const pearlSlots = G.pearlSlots ?? [];
    const playerDiamonds = me?.diamonds ?? 0;
    const playerPortal = me?.portal ?? [];
    const playerHand = me?.hand ?? [];
    const activatedCards_ = (me?.activatedCharacters ?? []).map(s => s.card);

    const charDeckHover = regions.find(r => r.type === 'deck-character')?.hoverProgress ?? 0;
    const pearlDeckHover = regions.find(r => r.type === 'deck-pearl')?.hoverProgress ?? 0;

    drawBackground(drawCtx);
    drawAuslage(drawCtx, characterSlots, pearlSlots,
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] },
      G.characterDeck?.length ?? 0, G.pearlDeck?.length ?? 0,
      charDeckHover, pearlDeckHover);
    drawPlayerPortal(drawCtx, { diamonds: playerDiamonds, portal: playerPortal, hand: playerHand },
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] });
    drawActivatedCharactersGrid(drawCtx, activatedCards_,
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] });

    // Canvas UI panel
    if (isActive) {
      const uiRegion = regions.find(r => r.type === 'ui-end-turn' || r.type === 'ui-discard-cards');
      if (uiRegion) drawUIButton(drawCtx, uiRegion);
    } else {
      const playerList_ = G.playerOrder || Object.keys(G.players || {});
      const activePlayerIndex_ = playerList_.indexOf(activePlayerID);
      const name = activePlayer?.name || `Player ${activePlayerIndex_ + 1}`;
      drawOpponentActionCounter(drawCtx, G, name);
    }

    // Hover glow + click flash (second pass)
    drawRegionEffects(drawCtx, regions);
  }

  // ── Coordinate conversion ────────────────────────────────────────────────────
  function toModelCoords(clientX: number, clientY: number): ModelCoords {
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    const scale = Math.min(canvasRect.width / BASE_W, canvasRect.height / BASE_H);
    return {
      x: (clientX - canvasRect.left) / scale,
      y: (clientY - canvasRect.top) / scale,
    };
  }

  // ── Pointer handlers ─────────────────────────────────────────────────────────
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== 'mouse') return;

    const { x, y } = toModelCoords(e.clientX, e.clientY);
    const region = hitTestRegions(x, y, regionsRef.current);
    const newKey = region && region.enabled !== false ? `${region.type}:${region.id}` : null;

    if (newKey !== hoverKeyRef.current) {
      hoverKeyRef.current = newKey;
      dirtyRef.current = true; // trigger animation start
      canvasRef.current!.style.cursor = newKey ? 'pointer' : 'default';
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toModelCoords(e.clientX, e.clientY);
    const region = hitTestRegions(x, y, regionsRef.current);

    if (!region || region.enabled === false) return;

    // Touch: no hover state
    if (e.pointerType === 'touch') {
      hoverKeyRef.current = null;
    }

    // Flash feedback
    region.flashProgress = 1.0;
    dirtyRef.current = true;

    // Dispatch action
    if (region.type === 'ui-end-turn' || region.type === 'ui-discard-cards') {
      handleUIClick(region);
    } else if (isActive) {
      handleCardClick(region);
    }
  };

  const onPointerLeave = () => {
    if (hoverKeyRef.current !== null) {
      hoverKeyRef.current = null;
      dirtyRef.current = true;
    }
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  };

  // ── UI button clicks ──────────────────────────────────────────────────────────
  function handleUIClick(region: CanvasRegion) {
    if (region.type === 'ui-end-turn') {
      moves.endTurn?.();
    } else if (region.type === 'ui-discard-cards') {
      if (me && G.excessCardCount > 0) {
        dialog.openDiscardDialog(me.hand, G.excessCardCount, G.currentHandLimit);
      }
    }
  }

  // ── Card clicks ───────────────────────────────────────────────────────────────
  function handleCardClick(region: CanvasRegion) {
    if (G.actionCount >= G.maxActions) return;

    const phase = phaseRef.current;
    if ((region.type === 'deck-character' || region.type === 'deck-pearl') && phase !== 'takingActions') {
      return;
    }

    switch (region.type) {
      case 'auslage-card': {
        const id = region.id as number;
        if (id < 2) {
          const newCharacter = characterSlots[id];
          if (!newCharacter) break;
          if (me && me.portal.length >= 2) {
            const portalCharacters = me.portal.map(entry => entry.card);
            dialog.openReplacementDialog(newCharacter, portalCharacters);
          } else {
            moves.takeCharacterCard(id);
          }
        } else {
          const pearlIdx = id - 2;
          if (!pearlSlots[pearlIdx]) break;
          moves.takePearlCard(pearlIdx);
        }
        break;
      }

      case 'portal-slot': {
        const slotIndex = region.id as number;
        if (me && me.portal[slotIndex]) {
          const entry = me.portal[slotIndex];
          dialog.openActivationDialog(entry.card, slotIndex);
        }
        break;
      }

      case 'activated-character': {
        const index = region.id as number;
        setActiveCharacterIndex(index);
        break;
      }

      case 'deck-character': {
        if (G.characterDeck.length === 0) break;
        if (me && me.portal.length >= 2) {
          const topCard = G.characterDeck[G.characterDeck.length - 1];
          if (!topCard) break;
          const portalCharacters = me.portal.map(entry => entry.card);
          dialog.openReplacementDialog(topCard, portalCharacters);
        } else {
          moves.takeCharacterCard(-1);
        }
        break;
      }

      case 'deck-pearl': {
        if (G.pearlDeck.length === 0) break;
        moves.takePearlCard(-1);
        break;
      }
    }
  }

  // ── Escape key for detail modal ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCharacterIndex !== null) {
        setActiveCharacterIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCharacterIndex]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0f1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={{
            display: 'block',
            borderRadius: 12,
            background: '#0E1E2B',
            cursor: 'default',
            touchAction: 'none',
          }}
        />

        {/* Player Name Display */}
        {me && <PlayerNameDisplay playerName={me.name} />}
      </div>

      {/* Dialog Modals */}
      {dialog.dialog.type === 'replacement' && (
        <CharacterReplacementDialog
          newCard={dialog.dialog.newCharacter}
          portalCards={dialog.dialog.portalCharacters}
          onSelect={(replacedSlotIndex) => {
            if (dialog.dialog.type === 'replacement') {
              const characterIndex = (G.characterSlots || []).findIndex(
                card => card?.id === dialog.dialog.newCharacter.id
              );
              // characterIndex === -1 means card came from the deck
              moves.takeCharacterCard(characterIndex, replacedSlotIndex);
            }
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {dialog.dialog.type === 'activation' && me && (
        <CharacterActivationDialog
          availableCharacters={[{
            card: dialog.dialog.character,
            slotIndex: dialog.dialog.portalSlotIndex,
          }]}
          hand={me.hand}
          diamonds={me.diamonds}
          activeAbilities={me.activeAbilities}
          activatedCharacters={me.activatedCharacters}
          onActivate={(portalSlotIndex, selections) => {
            moves.activatePortalCard(portalSlotIndex, selections);
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {dialog.dialog.type === 'discard' && (
        <DiscardCardsDialog
          hand={dialog.dialog.hand}
          excessCardCount={dialog.dialog.excessCardCount}
          currentHandLimit={dialog.dialog.currentHandLimit}
          onDiscard={(selectedCardIndices) => {
            moves.discardCardsForHandLimit(selectedCardIndices);
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {/* Activated Character Detail View Modal */}
      <ActivatedCharacterDetailView
        character={activeCharacter || null}
        onClose={() => setActiveCharacterIndex(null)}
      />
    </div>
  );
}

export default CanvasGameBoard;
