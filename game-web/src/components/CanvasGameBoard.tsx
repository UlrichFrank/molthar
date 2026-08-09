import React, { useRef, useEffect, useState } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import { buildCanvasRegions, hitTestRegions } from '../lib/canvasRegions';
import type { CanvasRegion, NeighborOpponent, CanvasLabels } from '../lib/canvasRegions';
import {
  drawBackground,
  drawAuslage,
  drawPlayerPortal,
  drawActivatedCharactersGrid,
  drawActivatedPageArrows,
  drawUIButton,
  drawPortalSwapButtons,
  drawRegionEffects,
  drawOpponentPortals,
} from '../lib/gameRender';
import {
  ACTIVATED_GRID_X,
  ACTIVATED_GRID_Y,
  ACTIVATED_GRID_H,
  ACTIVATED_PAGE_SIZE,
  ACTIVATED_GRID_COLS,
  ACTIVATED_CARD_W,
  ACTIVATED_CARD_GAP,
} from '../lib/cardLayoutConstants';
import type { OpponentZoneData } from '../lib/gameRender';
import { preloadAllImages } from '../lib/imageLoaderV2';
import { buildOpponentsPlayerIDs, getNeighborOpponents } from '../lib/opponentUtils';
import { DialogProvider } from '../contexts/DialogContext';
import { useGameBoardCore } from '../hooks/useGameBoardCore';
import type { GameBoardProps } from '../hooks/useGameBoardCore';
import { SharedGameDialogs } from './SharedGameDialogs';
import { PlayerStatusBadge } from './PlayerStatusBadge';
import { EndTurnButton } from './EndTurnButton';
import { DeckReshuffleAnimation } from './DeckReshuffleAnimation';
import '../styles/dialogs.css';
import { useTranslation } from '../i18n/useTranslation';

const BASE_W = 1200;
const BASE_H = 800;

function buildOpponentsArray(
  G: GameState,
  myPlayerID: string,
  opponentActivatedPages: Record<string, 0 | 1> = {},
): Array<import('../lib/gameRender').OpponentZoneData | null> {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  const myIndex = playerOrder.indexOf(myPlayerID);

  function getOpponentData(offset: number): import('../lib/gameRender').OpponentZoneData | null {
    const idx = ((myIndex + offset) % n + n) % n;
    if (idx === myIndex) return null;
    const playerId = playerOrder[idx];
    if (!playerId) return null;
    const player = G.players?.[playerId];
    if (!player) return null;
    return {
      playerId,
      colorIndex: player.colorIndex ?? 1,
      isStartingPlayer: playerId === G.startingPlayer,
      portal: player.portal ?? [],
      activatedCharacters: player.activatedCharacters ?? [],
      handCount: player.hand?.length ?? 0,
      activatedPage: opponentActivatedPages[playerId] ?? 0,
    };
  }

  if (n <= 1) return [null, null, null, null];
  if (n === 2) return [getOpponentData(1), null, null, null];
  if (n === 3) return [getOpponentData(1), null, null, getOpponentData(-1)];
  if (n === 4) return [getOpponentData(1), getOpponentData(2), null, getOpponentData(-1)];
  return [getOpponentData(1), getOpponentData(-2), getOpponentData(2), getOpponentData(-1)];
}

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

export function CanvasGameBoard(props: GameBoardProps) {
  return (
    <DialogProvider>
      <CanvasGameBoardContent {...props} />
    </DialogProvider>
  );
}

function CanvasGameBoardContent(props: GameBoardProps) {
  const { G, moves, isActive } = props;

  const { t } = useTranslation();
  const core = useGameBoardCore(props);
  const {
    resolvePlayerName, myPlayerID, me, phase, activePlayerID, activePlayer,
    maxActions, actionCount, characterSlots, pearlSlots,
    setActiveCharacterIndex,
    setActiveOwnPortalSlot,
    setPreviewAuslageCard,
    setActiveOpponentCharacter,
    setActiveOpponentPortalCard,
    setPendingTakeCardFromDisplay,
    setPendingTakeCardFromDeck,
    rehandDone, hasChangeHandAbility, rehandCards,
    gameover,
  } = core;
  const dialog = core.dialog;
  const { ref, w: viewportW, h: viewportH } = useContainerSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── CSS canvas size ─────────────────────────────────────────────────────────
  const aspect = BASE_W / BASE_H;
  const cssW = Math.min(viewportW, viewportH * aspect);
  const cssH = cssW / aspect;

  // ── Pagination state for activated character grids (canvas-only; mobile uses a scrollable sheet) ─
  const [ownActivatedPage, setOwnActivatedPage] = useState<0 | 1>(0);
  const [opponentActivatedPages, setOpponentActivatedPages] = useState<Record<string, 0 | 1>>({});
  const ownActivatedPageRef = useRef<0 | 1>(0);
  const opponentActivatedPagesRef = useRef<Record<string, 0 | 1>>({});
  // Keep refs in sync
  ownActivatedPageRef.current = ownActivatedPage;
  opponentActivatedPagesRef.current = opponentActivatedPages;

  // ── Refs for rAF loop (avoids stale closures) ───────────────────────────────
  const canvasLabelsRef = useRef<CanvasLabels>({ swap: '', discardCards: '', freePearlReplace: '' });
  const clickHintLabelRef = useRef<string>('');
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
  // Keep canvas label refs in sync with current language
  canvasLabelsRef.current = {
    swap: t('canvas.swap'),
    discardCards: t('canvas.discardCards'),
    freePearlReplace: t('canvas.freePearlReplace'),
  };
  clickHintLabelRef.current = t('canvas.clickToTake');

  // Rebuild regions when game state changes (in-place to preserve animation)
  useEffect(() => {
    const playerIds = buildOpponentsPlayerIDs(G, myPlayerID);
    const allOpponentPortals: NeighborOpponent[] = [];
    playerIds.forEach((pid, zoneIndex) => {
      if (!pid) return;
      const player = G.players?.[pid];
      if (!player) return;
      allOpponentPortals.push({ playerId: pid, portal: player.portal ?? [], zoneIndex: zoneIndex as 0 | 1 | 2 | 3 });
    });
    regionsRef.current = buildCanvasRegions(G, myPlayerID, isActive, regionsRef.current, allOpponentPortals, canvasLabelsRef.current, ownActivatedPage, opponentActivatedPages);
  }, [G, myPlayerID, isActive, ownActivatedPage, opponentActivatedPages]);

  // ── Auto-advance/reset own activated page ──────────────────────────────────
  useEffect(() => {
    const count = me?.activatedCharacters.length ?? 0;
    if (count > ACTIVATED_PAGE_SIZE && ownActivatedPage === 0) {
      setOwnActivatedPage(1);
    } else if (count <= ACTIVATED_PAGE_SIZE && ownActivatedPage === 1) {
      setOwnActivatedPage(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.activatedCharacters.length]);

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
    const playerDiamonds = me?.diamondCards?.length ?? 0;
    const playerPortal = me?.portal ?? [];
    const playerHand = me?.hand ?? [];
    const activatedCards_ = (me?.activatedCharacters ?? []).map(s => s.card);

    const charDeckHover = regions.find(r => r.type === 'deck-character')?.hoverProgress ?? 0;
    const pearlDeckHover = regions.find(r => r.type === 'deck-pearl')?.hoverProgress ?? 0;

    const ownPage = ownActivatedPageRef.current;
    const oppPages = opponentActivatedPagesRef.current;

    // Build opponents array [left, top-left, top-right, right] from playerOrder
    const opponents: Array<OpponentZoneData | null> = buildOpponentsArray(G, myPlayerID, oppPages);

    drawBackground(drawCtx);
    drawOpponentPortals(drawCtx, opponents, regions);
    drawAuslage(drawCtx, characterSlots, pearlSlots,
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] },
      G.characterDeck?.length ?? 0, G.pearlDeck?.length ?? 0,
      charDeckHover, pearlDeckHover, me?.peekedCard, clickHintLabelRef.current);
    drawPlayerPortal(drawCtx, { diamonds: playerDiamonds, portal: playerPortal, hand: playerHand },
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] },
      me?.colorIndex ?? 1,
      myPlayerID === G.startingPlayer);
    drawActivatedCharactersGrid(drawCtx, activatedCards_,
      { selectedPearl: null, selectedCharacter: null, selectedHandIndices: [] }, ownPage);
    // Draw own pagination arrows
    {
      const gridWidth = ACTIVATED_GRID_COLS * ACTIVATED_CARD_W + (ACTIVATED_GRID_COLS - 1) * ACTIVATED_CARD_GAP;
      const prevHover = regions.find(r => r.type === 'activated-page-arrow' && r.id === 'own:prev')?.hoverProgress ?? 0;
      const nextHover = regions.find(r => r.type === 'activated-page-arrow' && r.id === 'own:next')?.hoverProgress ?? 0;
      drawActivatedPageArrows(drawCtx, activatedCards_.length, ownPage,
        ACTIVATED_GRID_X, ACTIVATED_GRID_Y, ACTIVATED_GRID_H,
        undefined, undefined, gridWidth, undefined, prevHover, nextHover);
    }
    drawPortalSwapButtons(drawCtx, regions);

    // Canvas UI panel — only discard button remains; end-turn handled by HTML overlay
    if (isActive) {
      const discardRegion = regions.find(r => r.type === 'ui-discard-cards');
      if (discardRegion) drawUIButton(drawCtx, discardRegion);
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
    if (region.type === 'activated-page-arrow') {
      const { direction, arrowPlayerId } = region;
      if (!direction || !arrowPlayerId) return;
      if (arrowPlayerId === 'own') {
        setOwnActivatedPage(prev => {
          const next = direction === 'next' ? Math.min(1, prev + 1) : Math.max(0, prev - 1);
          return next as 0 | 1;
        });
      } else {
        setOpponentActivatedPages(prev => {
          const current = prev[arrowPlayerId] ?? 0;
          const next = direction === 'next' ? Math.min(1, current + 1) : Math.max(0, current - 1);
          return { ...prev, [arrowPlayerId]: next as 0 | 1 };
        });
      }
      return;
    } else if (region.type === 'ui-discard-cards' || region.type === 'ui-replace-pearl-slots' || region.type === 'ui-replace-pearl-slots-ability') {
      handleUIClick(region);
    } else if (region.type === 'activated-character') {
      // Always allow viewing activated characters
      const index = region.id as number;
      setActiveCharacterIndex(index);
    } else if (region.type === 'opponent-activated-character') {
      // Always allow viewing opponent activated characters
      const [playerId, idxStr] = (region.id as string).split(':');
      setActiveOpponentCharacter({ playerId, index: parseInt(idxStr, 10) });
    } else if (region.type === 'opponent-portal-card') {
      // Always allow viewing; irrlicht-capable cards open activation dialog for direct neighbors during own turn
      const [ownerPlayerId, slotStr] = (region.id as string).split(':');
      const slotIndex = parseInt(slotStr, 10);
      const ownerPlayer = G.players?.[ownerPlayerId];
      const entry = ownerPlayer?.portal[slotIndex];
      if (entry) {
        const isNeighbor = getNeighborOpponents(G, myPlayerID).some(n => n.playerId === ownerPlayerId);
        const isIrrlicht = entry.card.abilities.some(a => a.type === 'irrlicht') || entry.card.sharedActivation;
        if (isActive && isNeighbor && isIrrlicht && (G.actionCount ?? 0) < (G.maxActions ?? 3)) {
          dialog.openActivationDialog(entry.card, slotIndex, ownerPlayerId);
        } else {
          setActiveOpponentPortalCard({ playerId: ownerPlayerId, slotIndex });
        }
      }
    } else if (region.type === 'portal-slot') {
      // Always allow viewing own portal cards; activate if eligible
      const slotIndex = region.id as number;
      if (me && me.portal[slotIndex]) {
        if (isActive && actionCount < maxActions) {
          const entry = me.portal[slotIndex];
          dialog.openActivationDialog(entry.card, slotIndex);
        } else {
          setActiveOwnPortalSlot(slotIndex);
        }
      }
    } else if (region.type === 'auslage-card' && (region.id as number) < 2) {
      // Always allow previewing character auslage cards; take action only if eligible
      const id = region.id as number;
      const card = characterSlots[id];
      if (card) {
        if (isActive && actionCount < maxActions) {
          // Fall through to handleCardClick for full action handling
          handleCardClick(region);
        } else {
          setPreviewAuslageCard(card);
        }
      }
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
    if (region.type === 'ui-discard-cards') {
      if (me && G.excessCardCount > 0) {
        dialog.openDiscardDialog(me.hand, G.excessCardCount, G.currentHandLimit);
      }
    } else if (region.type === 'ui-replace-pearl-slots') {
      moves.replacePearlSlots?.();
    } else if (region.type === 'ui-replace-pearl-slots-ability') {
      moves.replacePearlSlotsAbility?.();
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
            dialog.openReplacementDialog(newCharacter, portalCharacters, true, true);
          } else {
            setPendingTakeCardFromDisplay({ card: newCharacter, slotIndex: id });
          }
        } else {
          const pearlIdx = id - 2;
          if (!pearlSlots[pearlIdx]) break;
          moves.takePearlCard(pearlIdx);
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
        if (!me) break;
        const hasPreviewAbility = me.activeAbilities.some(a => a.type === 'previewCharacter');
        const peekedCard = me.peekedCard ?? null;

        const takeCharCard = () => {
          const topCard = peekedCard ?? G.characterDeck[G.characterDeck.length - 1];
          if (!topCard) return;
          if (me.portal.length >= 2) {
            const portalCharacters = me.portal.map(entry => entry.card);
            dialog.openReplacementDialog(topCard, portalCharacters);
          } else {
            setPendingTakeCardFromDeck({ card: topCard, faceDown: peekedCard === null });
          }
        };

        if (hasPreviewAbility && G.actionCount === 0 && !peekedCard) {
          const topCard = G.characterDeck[G.characterDeck.length - 1];
          if (!topCard) break;
          const portalSlots: (import('@portale-von-molthar/shared').CharacterCard | null)[] = [
            me.portal[0]?.card ?? null,
            me.portal[1]?.card ?? null,
          ];
          moves.peekCharacterDeck();
          dialog.openReplacementDialog(topCard, portalSlots, true, true);
        } else {
          takeCharCard();
        }
        break;
      }

      case 'deck-pearl': {
        if (G.pearlDeck.length === 0) break;
        moves.takePearlCard(-1);
        break;
      }

      case 'portal-swap-btn': {
        const slotIndex = region.id as number;
        const portalEntry = me?.portal[slotIndex];
        if (!portalEntry) break;
        dialog.openSwapPortalCharacterDialog(portalEntry.card, slotIndex, G.characterSlots ?? []);
        break;
      }

    }
  }

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

        {/* Own player status badge — centered on portal top edge */}
        {me && (
          <div style={{
            position: 'absolute', top: '64.5%', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <PlayerStatusBadge
              playerState={me}
              playerName={resolvePlayerName(myPlayerID, me.name)}
              actionCount={isActive ? actionCount : undefined}
              maxActions={isActive ? maxActions : undefined}
              isActiveTurn={isActive}
            />
            {isActive && actionCount >= maxActions && hasChangeHandAbility && !rehandDone && (
              <button
                onClick={rehandCards}
                style={{
                  background: 'rgba(99, 102, 241, 0.9)',
                  border: '2px solid #6366f1',
                  borderRadius: 8,
                  padding: '6px 18px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'auto',
                  transition: 'background 0.15s, border-color 0.15s',
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79, 70, 229, 0.95)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#4f46e5';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99, 102, 241, 0.9)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
                }}
              >
                {t('game.rehandCards')}
              </button>
            )}
            <EndTurnButton
              isActive={isActive}
              actionCount={actionCount}
              maxActions={maxActions}
              onEndTurn={() => moves.endTurn?.()}
            />
          </div>
        )}

        {/* Opponent status badges */}
        {(() => {
          const opponentIds = buildOpponentsPlayerIDs(G, myPlayerID);
          // Zone positions as % of canvas container [left, top-left, top-right, right]
          const zoneStyles: Array<React.CSSProperties> = [
            { position: 'absolute', top: '26%', left: 6, zIndex: 100 },
            { position: 'absolute', top: 6, left: '17%', zIndex: 100 },
            { position: 'absolute', top: 6, left: '50%', zIndex: 100 },
            { position: 'absolute', top: '55%', right: 6, zIndex: 100 },
          ];
          return opponentIds.map((playerId, zoneIdx) => {
            if (!playerId) return null;
            const playerState = G.players?.[playerId];
            if (!playerState) return null;
            return (
              <div key={playerId} style={zoneStyles[zoneIdx]}>
                <PlayerStatusBadge
                  playerState={playerState}
                  playerName={resolvePlayerName(playerId, playerState.name)}
                  isActiveTurn={playerId === activePlayerID}
                  actionCount={playerId === activePlayerID ? actionCount : undefined}
                  maxActions={playerId === activePlayerID ? maxActions : undefined}
                />
              </div>
            );
          });
        })()}

        {/* Threshold-Indikator (2.1) + Final-Round-Banner (2.2) */}
        {G.finalRound && gameover === undefined && (() => {
          const leaders = Object.values(G.players ?? {})
            .filter(p => p && p.powerPoints >= 12)
            .map(p => p!.name);
          return (
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              pointerEvents: 'none', zIndex: 10,
            }}>
              <div style={{
                background: 'rgba(120,53,15,0.92)', border: '1px solid #d97706',
                borderRadius: 8, padding: '3px 12px',
                color: '#fde68a', fontSize: '0.75rem', fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {leaders.length === 1
                ? t('game.leaderHasPoints', { leaders: leaders[0] ?? '' })
                : t('game.leadersHavePoints', { leaders: leaders.join(', ') })}
              </div>
              <div style={{
                background: 'rgba(30,58,138,0.92)', border: '1px solid #3b82f6',
                borderRadius: 8, padding: '3px 12px',
                color: '#bfdbfe', fontSize: '0.75rem', fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {t('game.finalRound')}
              </div>
            </div>
          );
        })()}

        {/* Deck Reshuffle Animations — positioned near the respective deck */}
        {G.isReshufflingPearlDeck && (
          <DeckReshuffleAnimation
            deckType="pearl"
            style={{ right: '6%', top: '48%' }}
            onDone={isActive ? () => moves.acknowledgeReshuffle?.('pearl') : () => {}}
          />
        )}
        {G.isReshufflingCharacterDeck && (
          <DeckReshuffleAnimation
            deckType="character"
            style={{ left: '28%', top: '48%' }}
            onDone={isActive ? () => moves.acknowledgeReshuffle?.('character') : () => {}}
          />
        )}
        {G.isPearlRefreshTriggered && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '44%',
              transform: 'translateX(-50%)',
              background: 'rgba(30, 20, 60, 0.92)',
              color: '#e0d0ff',
              border: '2px solid #9966cc',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              pointerEvents: 'none',
              zIndex: 50,
              textAlign: 'center',
            }}
          >
            {t('game.pearlRefresh')}
          </div>
        )}
      </div>

      <SharedGameDialogs G={G} moves={moves} core={core} />
    </div>
  );
}

export default CanvasGameBoard;
