import React, { useRef, useEffect, useState } from 'react';
import type { GameState, PlayerState } from '@portale-von-molthar/shared';
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
import { ActivatedCharacterDetailView } from './ActivatedCharacterDetailView';
import { DialogProvider, useDialog } from '../contexts/DialogContext';
import { CharacterReplacementDialog } from './CharacterReplacementDialog';
import { CharacterTakePreviewDialog } from './CharacterTakePreviewDialog';
import { CharacterActivationDialog } from './CharacterActivationDialog';
import { DiscardCardsDialog } from './DiscardCardsDialog';
import { StealOpponentHandCardDialog } from './StealOpponentHandCardDialog';
import { CharacterSwapDialog } from './CharacterSwapDialog';
import { TakeBackPlayedPearlDialog } from './TakeBackPlayedPearlDialog';
import { DiscardOpponentCharacterDialog } from './DiscardOpponentCharacterDialog';
import { PlayerStatusBadge } from './PlayerStatusBadge';
import { EndTurnButton } from './EndTurnButton';
import { DeckReshuffleAnimation } from './DeckReshuffleAnimation';
import { EndgameResultsDialog } from './EndgameResultsDialog';
import { PlayerDisconnectDialog } from './PlayerDisconnectDialog';
import '../styles/dialogs.css';
import { useTranslation } from '../i18n/useTranslation';

interface CanvasGameBoardProps {
  G: GameState;
  ctx: { phase?: string } & Record<string, unknown>;
  moves: Record<string, (...args: unknown[]) => void>;
  events?: Record<string, (...args: unknown[]) => void>;
  playerID: string | null;
  isActive: boolean;
  matchData?: Array<{ id: number; name?: string }>;
}

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

/** Returns player IDs for the four opponent zones [left, top-left, top-right, right], or null for empty slots. */
function buildOpponentsPlayerIDs(G: GameState, myPlayerID: string): Array<string | null> {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  const myIndex = playerOrder.indexOf(myPlayerID);

  function getOpponentId(offset: number): string | null {
    const idx = ((myIndex + offset) % n + n) % n;
    if (idx === myIndex) return null;
    return playerOrder[idx] ?? null;
  }

  if (n <= 1) return [null, null, null, null];
  if (n === 2) return [getOpponentId(1), null, null, null];
  if (n === 3) return [getOpponentId(1), null, null, getOpponentId(-1)];
  if (n === 4) return [getOpponentId(1), getOpponentId(2), null, getOpponentId(-1)];
  return [getOpponentId(1), getOpponentId(-2), getOpponentId(2), getOpponentId(-1)];
}

/** Returns the two direct neighbors (left = zoneIndex 0, right = zoneIndex 3) for irrlicht regions. */
function getNeighborOpponents(G: GameState, myPlayerID: string): NeighborOpponent[] {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  if (n < 2) return [];
  const myIndex = playerOrder.indexOf(myPlayerID);

  const result: NeighborOpponent[] = [];

  const leftId = playerOrder[((myIndex + 1) % n + n) % n];
  if (leftId && leftId !== myPlayerID) {
    const player = G.players?.[leftId];
    if (player) result.push({ playerId: leftId, portal: player.portal ?? [], zoneIndex: 0 });
  }

  if (n >= 3) {
    const rightId = playerOrder[((myIndex - 1) % n + n) % n];
    if (rightId && rightId !== myPlayerID) {
      const player = G.players?.[rightId];
      if (player) result.push({ playerId: rightId, portal: player.portal ?? [], zoneIndex: 3 });
    }
  }

  return result;
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

export function CanvasGameBoard(props: CanvasGameBoardProps) {
  return (
    <DialogProvider>
      <CanvasGameBoardContent {...props} />
    </DialogProvider>
  );
}

function CanvasGameBoardContent(props: CanvasGameBoardProps) {
  const { G, ctx, moves, events, playerID, isActive, matchData } = props;

  const { t } = useTranslation();

  // Resolve real player name from boardgame.io match metadata (set in lobby via updatePlayer)
  function resolvePlayerName(pid: string, fallback: string): string {
    const id = parseInt(pid, 10);
    return matchData?.find(p => p.id === id)?.name || fallback;
  }
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
  const playerDiamonds = me?.diamondCards?.length ?? 0;
  const playerPortal = me?.portal ?? [];
  const playerHand = me?.hand ?? [];
  const activatedCards = (me?.activatedCharacters ?? []).map(s => s.card);

  // ── CSS canvas size ─────────────────────────────────────────────────────────
  const aspect = BASE_W / BASE_H;
  const cssW = Math.min(viewportW, viewportH * aspect);
  const cssH = cssW / aspect;

  // ── Disconnect detection (debounced 2s to avoid load-flicker) ──────────────
  const [disconnectedPlayerName, setDisconnectedPlayerName] = useState<string | null>(null);
  useEffect(() => {
    const myId = parseInt(myPlayerID, 10);
    const offlineEntry = matchData?.find(p => p.id !== myId && p.isConnected === false);
    if (!offlineEntry) {
      setDisconnectedPlayerName(null);
      return;
    }
    const name = offlineEntry.name || `Spieler ${offlineEntry.id + 1}`;
    const timer = setTimeout(() => setDisconnectedPlayerName(name), 2000);
    return () => clearTimeout(timer);
  }, [matchData, myPlayerID]);

  // ── Pagination state for activated character grids ─────────────────────────
  const [ownActivatedPage, setOwnActivatedPage] = useState<0 | 1>(0);
  const [opponentActivatedPages, setOpponentActivatedPages] = useState<Record<string, 0 | 1>>({});
  const ownActivatedPageRef = useRef<0 | 1>(0);
  const opponentActivatedPagesRef = useRef<Record<string, 0 | 1>>({});
  // Keep refs in sync
  ownActivatedPageRef.current = ownActivatedPage;
  opponentActivatedPagesRef.current = opponentActivatedPages;

  // ── Detail view state (stays in React) ─────────────────────────────────────
  const [activeCharacterIndex, setActiveCharacterIndex] = useState<number | null>(null);
  const activatedCharacters = me?.activatedCharacters ?? [];
  const activeCharacter = activeCharacterIndex !== null && activeCharacterIndex < activatedCharacters.length
    ? activatedCharacters[activeCharacterIndex]
    : null;

  const [activeOwnPortalSlot, setActiveOwnPortalSlot] = useState<number | null>(null);
  const [previewAuslageCard, setPreviewAuslageCard] = useState<import('@portale-von-molthar/shared').CharacterCard | null>(null);
  const [activeOpponentCharacter, setActiveOpponentCharacter] = useState<{ playerId: string; index: number } | null>(null);
  const [activeOpponentPortalCard, setActiveOpponentPortalCard] = useState<{ playerId: string; slotIndex: number } | null>(null);

  // ── Preview dialogs for taking character cards ──────────────────────────────
  const [pendingTakeCardFromDisplay, setPendingTakeCardFromDisplay] = useState<{ card: import('@portale-von-molthar/shared').CharacterCard; slotIndex: number } | null>(null);
  const [pendingTakeCardFromDeck, setPendingTakeCardFromDeck] = useState<{ card: import('@portale-von-molthar/shared').CharacterCard; faceDown: boolean } | null>(null);

  // ── changeHandActions ───────────────────────────────────────────────────────
  const [rehandDone, setRehandDone] = useState(false);
  useEffect(() => { setRehandDone(false); }, [ctx.turn]);
  const hasChangeHandAbility = me?.activeAbilities.some(a => a.type === 'changeHandActions') ?? false;

  const activeOpponentCharacterData = activeOpponentCharacter
    ? (G.players?.[activeOpponentCharacter.playerId]?.activatedCharacters?.[activeOpponentCharacter.index] ?? null)
    : null;
  const activeOpponentPortalCardData = activeOpponentPortalCard
    ? (G.players?.[activeOpponentPortalCard.playerId]?.portal[activeOpponentPortalCard.slotIndex] ?? null)
    : null;

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
  }, [me?.activatedCharacters.length, ownActivatedPage]);

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

  // ── Escape key for detail modal ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCharacterIndex !== null) setActiveCharacterIndex(null);
        if (activeOwnPortalSlot !== null) setActiveOwnPortalSlot(null);
        if (activeOpponentCharacter !== null) setActiveOpponentCharacter(null);
        if (activeOpponentPortalCard !== null) setActiveOpponentPortalCard(null);
        if (previewAuslageCard !== null) setPreviewAuslageCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCharacterIndex, activeOwnPortalSlot, activeOpponentCharacter, activeOpponentPortalCard, previewAuslageCard]);

  // ── Auto-open steal dialog when flag is set and we are the active player
  useEffect(() => {
    if (G.pendingStealOpponentHandCard && myPlayerID === activePlayerID && dialog.dialog.type !== 'steal-opponent-hand-card') {
      dialog.openStealOpponentHandCardDialog();
    }
  }, [G.pendingStealOpponentHandCard, myPlayerID, activePlayerID, dialog.dialog.type]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-open discard opponent character dialog when flag is set and we are the active player
  useEffect(() => {
    if (G.pendingDiscardOpponentCharacter && myPlayerID === activePlayerID && dialog.dialog.type !== 'discard-opponent-character') {
      dialog.openDiscardOpponentCharacterDialog();
    }
  }, [G.pendingDiscardOpponentCharacter, myPlayerID, activePlayerID]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-open take-back dialog when flag is set and we are the active player
  useEffect(() => {
    if (G.pendingTakeBackPlayedPearl && myPlayerID === activePlayerID && dialog.dialog.type !== 'take-back-played-pearl') {
      dialog.openTakeBackPlayedPearlDialog();
    }
  }, [G.pendingTakeBackPlayedPearl, myPlayerID, activePlayerID]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for terminateGame event from LobbyScreen (creator only) ───────────
  useEffect(() => {
    const handler = () => { moves.terminateGame?.(); };
    window.addEventListener('pvm:terminateGame', handler);
    return () => window.removeEventListener('pvm:terminateGame', handler);
  }, [moves]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gameover state — dialog handles the pvm:gameOver dispatch via countdown ───
  const gameover = (ctx as any).gameover as { ranking: Array<{ playerId: string; name: string; powerPoints: number; diamonds: number }>; reason?: string } | undefined;

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
                onClick={() => { moves.rehandCards?.(); setRehandDone(true); }}
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

      {/* Preview dialogs for taking character cards */}
      {pendingTakeCardFromDisplay && (
        <CharacterTakePreviewDialog
          card={pendingTakeCardFromDisplay.card}
          faceDown={false}
          onConfirm={() => {
            moves.takeCharacterCard(pendingTakeCardFromDisplay.slotIndex);
            setPendingTakeCardFromDisplay(null);
          }}
          onCancel={() => setPendingTakeCardFromDisplay(null)}
        />
      )}
      {pendingTakeCardFromDeck && (
        <CharacterTakePreviewDialog
          card={pendingTakeCardFromDeck.card}
          faceDown={pendingTakeCardFromDeck.faceDown}
          onConfirm={() => {
            moves.takeCharacterCard(-1);
            setPendingTakeCardFromDeck(null);
          }}
          onCancel={() => setPendingTakeCardFromDeck(null)}
        />
      )}

      {/* Dialog Modals */}
      {dialog.dialog.type === 'replacement' && (
        <CharacterReplacementDialog
          newCard={dialog.dialog.newCharacter}
          portalCards={dialog.dialog.portalCharacters}
          canDiscard={dialog.dialog.canDiscard}
          canCancel={dialog.dialog.canCancel}
          onCancel={dialog.closeDialog}
          onSelect={(replacedSlotIndex) => {
            if (dialog.dialog.type === 'replacement') {
              const characterIndex = (G.characterSlots || []).findIndex(
                card => card?.id === dialog.dialog.newCharacter.id
              );
              // characterIndex === -1 means card came from the deck
              if (characterIndex === -1 && me && me.portal.length < 2) {
                moves.takeCharacterCard(-1);
              } else {
                moves.takeCharacterCard(characterIndex, replacedSlotIndex);
              }
            }
            dialog.closeDialog();
          }}
          onDiscard={() => {
            if (dialog.dialog.type === 'replacement') {
              const characterIndex = (G.characterSlots || []).findIndex(
                card => card?.id === dialog.dialog.newCharacter.id
              );
              moves.discardPickedCharacterCard(characterIndex);
            }
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'activation' && me && (
        <CharacterActivationDialog
          availableCharacters={[{
            card: dialog.dialog.character,
            slotIndex: dialog.dialog.portalSlotIndex,
          }]}
          hand={me.hand}
          diamonds={me.diamondCards?.length ?? 0}
          activeAbilities={me.activeAbilities}
          activatedCharacters={me.activatedCharacters}
          usedPaymentAbilityTypes={G.usedPaymentAbilityTypes ?? []}
          usedAbilitySourceCharacterIds={G.usedAbilitySourceCharacterIds ?? []}
          onActivate={(portalSlotIndex, selections) => {
            const ownerPlayerId = dialog.dialog.type === 'activation' ? dialog.dialog.ownerPlayerId : undefined;
            if (ownerPlayerId) {
              moves.activateSharedCharacter(ownerPlayerId, portalSlotIndex, selections);
            } else {
              moves.activatePortalCard(portalSlotIndex, selections);
            }
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

      {dialog.dialog.type === 'steal-opponent-hand-card' && me && (
        <StealOpponentHandCardDialog
          opponents={(G.playerOrder || [])
            .filter(id => id !== myPlayerID)
            .map(id => { const p = G.players?.[id]; return p ? { ...p, name: resolvePlayerName(id, p.name) } : undefined; })
            .filter((p): p is PlayerState => p !== undefined && p.hand.length > 0)}
          onSteal={(targetPlayerId, handCardIndex) => {
            moves.resolveStealOpponentHandCard(targetPlayerId, handCardIndex);
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'discard-opponent-character' && (
        <DiscardOpponentCharacterDialog
          opponents={(() => {
            const order = G.playerOrder || [];
            const myIdx = order.indexOf(myPlayerID ?? '');
            const rotated = myIdx >= 0
              ? [...order.slice(myIdx + 1), ...order.slice(0, myIdx)]
              : order;
            return rotated
              .filter(id => id !== myPlayerID)
              .map(id => { const p = G.players?.[id]; return p ? { ...p, name: resolvePlayerName(id, p.name) } : undefined; })
              .filter((p): p is PlayerState => p !== undefined && p.portal.length > 0);
          })()}
          onDiscard={(targetPlayerId, portalEntryId) => {
            moves.resolveDiscardOpponentCharacter(targetPlayerId, portalEntryId);
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'take-back-played-pearl' && (
        <TakeBackPlayedPearlDialog
          playedCards={(G.playedRealPearlIds ?? [])
            .map(id => (G.pearlDiscardPile ?? []).find(c => c.id === id))
            .filter((c): c is import('@portale-von-molthar/shared').PearlCard => c !== undefined)}
          onTakeBack={(pearlId) => {
            moves.resolveReturnPearl(pearlId);
            dialog.closeDialog();
          }}
          onDismiss={() => {
            moves.dismissReturnPearlDialog();
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'swap-portal-character' && (
        <CharacterSwapDialog
          portalCard={dialog.dialog.portalCard}
          portalSlotIndex={dialog.dialog.portalSlotIndex}
          tableCards={dialog.dialog.tableCards}
          onSwap={(tableSlotIndex) => {
            if (dialog.dialog.type === 'swap-portal-character') {
              moves.swapPortalCharacter(dialog.dialog.portalSlotIndex, tableSlotIndex);
            }
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
      <ActivatedCharacterDetailView
        character={activeOwnPortalSlot !== null ? (me?.portal[activeOwnPortalSlot] ?? null) : null}
        onClose={() => setActiveOwnPortalSlot(null)}
        rotated={false}
      />
      <ActivatedCharacterDetailView
        character={activeOpponentCharacterData}
        onClose={() => setActiveOpponentCharacter(null)}
      />
      <ActivatedCharacterDetailView
        character={activeOpponentPortalCardData}
        onClose={() => setActiveOpponentPortalCard(null)}
        rotated={false}
      />
      {previewAuslageCard && (
        <CharacterTakePreviewDialog
          card={previewAuslageCard}
          onCancel={() => setPreviewAuslageCard(null)}
        />
      )}

      {/* Endgame Results Dialog */}
      {gameover !== undefined && gameover.ranking && (
        <EndgameResultsDialog
          ranking={gameover.ranking.map(entry => ({
            ...entry,
            name: resolvePlayerName(entry.playerId, entry.name),
          }))}
          myPlayerId={myPlayerID}
          reason={gameover.reason}
        />
      )}

      {/* Disconnect Dialog */}
      {disconnectedPlayerName !== null && (
        <PlayerDisconnectDialog playerName={disconnectedPlayerName} />
      )}
    </div>
  );
}

export default CanvasGameBoard;
