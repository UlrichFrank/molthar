import React, { useRef, useEffect, useState } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import type { HitTarget } from '../lib/gameHitTest';
import { hitTest } from '../lib/gameHitTest';
import { drawBackground, drawAuslage, drawPlayerPortal, drawActivatedCharactersGrid, drawUI } from '../lib/gameRender';
import { preloadAllImages } from '../lib/imageLoaderV2';
import CardButtonOverlay from './CardButtonOverlay';
import { ActivatedCharacterDetailView } from './ActivatedCharacterDetailView';
import { ActionCounterDisplay } from './ActionCounterDisplay';
import { PlayerNameDisplay } from './PlayerNameDisplay';
import { DialogProvider, useDialog } from '../contexts/DialogContext';
import { CharacterReplacementDialog } from './CharacterReplacementDialog';
import { CharacterActivationDialog } from './CharacterActivationDialog';
import { DiscardCardsDialog } from './DiscardCardsDialog';
import '../styles/dialogModal.css';
import '../styles/turnActionCounter.css';
import '../styles/playerNameDisplay.css';

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

interface ModelCoords {
  x: number;
  y: number;
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

  // Preload images on mount
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  useEffect(() => {
    preloadAllImages()
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((err) => console.error('Failed to load some card images:', err));
  }, []);

  const [hoveredCard, setHoveredCard] = useState<HitTarget | null>(null);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState<number | null>(null);
  const [hoveredDeck, setHoveredDeck] = useState<'character' | 'pearl' | null>(null);

  // Berechne Sichtbare Größe (Letterboxed)
  const aspect = BASE_W / BASE_H; // 1.5 (3:2)
  const cssW = Math.min(viewportW, viewportH * aspect);
  const cssH = cssW / aspect;

  // Spieler-Info
  const myPlayerID = playerID || (G.playerOrder && G.playerOrder[0]) || Object.keys(G.players || {})[0];
  const me = G.players?.[myPlayerID];
  const phase = ctx.phase || 'takingActions';
  
  // Calculate active player index and current/max actions
  const playerList = G.playerOrder || Object.keys(G.players || {});
  const activePlayerID = (ctx.currentPlayer as string) || playerList[0];
  const activePlayerIndex = playerList.indexOf(activePlayerID);
  const activePlayer = G.players?.[activePlayerID];
  
  // Ensure maxActions and actionCount are properly initialized
  const maxActions = typeof G.maxActions === 'number' ? G.maxActions : 3;
  const actionCount = typeof G.actionCount === 'number' ? G.actionCount : 0;
  const currentActions = Math.max(0, maxActions - actionCount);
  const totalPlayers = playerList.length;
  
  // Fallback für fehlende Daten
  const characterSlots = G.characterSlots || [];
  const pearlSlots = G.pearlSlots || [];
  const playerDiamonds = me?.diamonds ?? 0;
  const playerPortal = me?.portal ?? [];
  const playerHand = me?.hand ?? [];

  // Extract activated characters
  const activatedCharacters = me?.activatedCharacters ?? [];
  const activeCharacter = activeCharacterIndex !== null && activeCharacterIndex < activatedCharacters.length
    ? activatedCharacters[activeCharacterIndex]
    : null;

  /**
   * Konvertiere CSS-Koordinaten zu Model-Koordinaten
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
    
    // Auslage - no selection highlighting
    // @ts-expect-error - PearlCard and CharacterCard don't have exact CardData interface but work for rendering
    drawAuslage(canvasCtx, characterSlots, pearlSlots, {
      selectedPearl: null,
      selectedCharacter: null,
      selectedHandIndices: [],
    }, G.characterDeck?.length ?? 0, G.pearlDeck?.length ?? 0, hoveredDeck);

    // Portal - no selection highlighting
    // @ts-expect-error: PearlCard[] doesn't match CardData[] but works for rendering
    drawPlayerPortal(canvasCtx, {
      diamonds: playerDiamonds,
      portal: playerPortal,
      // @ts-expect-error - PearlCard values work for rendering
      hand: playerHand,
    }, {
      selectedPearl: null,
      selectedCharacter: null,
      selectedHandIndices: [],
    });

    // Activated characters grid - shows all activated character cards
    const activatedCards = (me?.activatedCharacters ?? [])
      .map(slot => slot.card);
    drawActivatedCharactersGrid(canvasCtx, activatedCards, {
      selectedPearl: null,
      selectedCharacter: null,
      selectedHandIndices: [],
    });

    // UI - show action counter
    drawUI(canvasCtx, phase);
  }

  /**
   * Layout Canvas und Render
   */
  // Pointer Events: Click only (no drag)
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = toModelCoords(e.clientX, e.clientY);
    const hitTarget = hitTest(coords.x, coords.y, G.characterDeck?.length ?? 0, G.pearlDeck?.length ?? 0);

    if (hitTarget.type === 'none') {
      return;
    }

    // Handle button clicks - ALWAYS allow buttons (including End Turn button)
    if (hitTarget.type === 'button') {
      handleButtonClick(hitTarget.id as string);
      return;
    }

    // Handle card clicks only if player is active
    if (!isActive) {
      return;
    }

    // Handle card clicks
    handleCardClick(hitTarget);
  };

  // Track hover over cards and decks for visual feedback
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = toModelCoords(e.clientX, e.clientY);
    const hitTarget = hitTest(coords.x, coords.y, G.characterDeck?.length ?? 0, G.pearlDeck?.length ?? 0);
    
    // Update hovered card state for button overlay
    setHoveredCard(hitTarget);
    
    // Update hovered deck state
    if (hitTarget.type === 'deck-character') {
      setHoveredDeck('character');
    } else if (hitTarget.type === 'deck-pearl') {
      setHoveredDeck('pearl');
    } else {
      setHoveredDeck(null);
    }
  };

  // Clear hovered card and deck when pointer leaves canvas
  const onPointerLeave = () => {
    setHoveredCard(null);
    setHoveredDeck(null);
  };

  /**
   * Behandle Card-Klicks (Auslage, Hand, Portal Slots) - Direct Take Model
   * Click pearl/character → immediately dispatched move
   */
  function handleCardClick(target: HitTarget) {
    // Validate action count - prevent actions when all available actions are used
    if (G.actionCount >= G.maxActions) {
      return;
    }

    // Deck clicks only allowed during takingActions phase
    if ((target.type === 'deck-character' || target.type === 'deck-pearl') && phase !== 'takingActions') {
      return;
    }

    switch (target.type) {
      case 'auslage-card': {
        const id = target.id as number;
        if (id < 2) {
          // Character card - slot index 0 or 1
          const newCharacter = characterSlots[id];
          if (!newCharacter) break;
          
          // Check if player's portal is full (2 characters)
          if (me && me.portal.length >= 2) {
            // Portal is full - show replacement dialog
            const portalCharacters = me.portal.map((entry) => entry.card);
            dialog.openReplacementDialog(newCharacter, portalCharacters);
          } else {
            // Portal not full - take character directly
            moves.takeCharacterCard(id);
          }
        } else {
          // Pearl card - slot index 2-3, subtract 2 to get pearl array index
          const pearlIdx = id - 2;
          const pearlCard = pearlSlots[pearlIdx];
          if (!pearlCard) break;
          
          moves.takePearlCard(pearlIdx);
        }
        break;
      }

      case 'portal-slot': {
        const slotIndex = target.id as number;
        // Show activation dialog when player's own portal slot is clicked
        if (me && me.portal[slotIndex]) {
          const entry = me.portal[slotIndex];
          dialog.openActivationDialog(entry.card, slotIndex);
        }
        break;
      }

      case 'activated-character': {
        const index = target.id as number;
        // Open detail view modal for activated character
        setActiveCharacterIndex(index);
        break;
      }

      case 'deck-character': {
        // Draw character card from deck (blind draw, no selection)
        // Uses same Portal action flow as clicking face-up cards, but with -1 index to signal deck draw
        // Backend (takeCharacterCard move) extracts top card from characterDeck[0]
        if (G.actionCount >= G.maxActions) {
          return;
        }
        if (G.characterDeck.length === 0) {
          return;
        }

        // Check if player's portal is full (2 characters)
        if (me && me.portal.length >= 2) {
          // Portal is full - show replacement dialog
          // For blind draw, we use a placeholder with "Blind Draw" as name
          const placeholderCard = { name: 'Blind Draw', imageName: 'Charakterkarte Hinten.png' };
          const portalCharacters = me.portal.map((entry) => entry.card);
          dialog.openReplacementDialog(placeholderCard, portalCharacters);
          // Set a flag to indicate this is a blind draw that needs special handling
          // We'll store the action as a pending move in state
          // For now, we'll handle this by closing the dialog and calling with -1 index
        } else {
          // Portal not full - take card directly
          moves.takeCharacterCard(-1);
        }
        break;
      }

      case 'deck-pearl': {
        // Draw random pearl card from deck
        if (G.actionCount >= G.maxActions) {
          return;
        }
        if (G.pearlDeck.length === 0) {
          return;
        }
        moves.takePearlCard(-1); // -1 indicates blind draw from deck
        break;
      }
    }
  }

  /**
   * Handle button clicks - End Turn button
   */
  function handleButtonClick(buttonId: string) {
    switch (buttonId) {
      case 'end-turn':
        // Call the endTurn move to validate hand limit and potentially trigger discard
        if (moves.endTurn) {
          moves.endTurn();
        } else {
          console.error('ERROR: moves.endTurn is not available!');
        }
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
  }, [cssW, cssH, G, phase, imagesLoaded]);

  // Handle Escape key to close detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCharacterIndex !== null) {
        setActiveCharacterIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCharacterIndex]);



  // Handle End Turn action
  const handleEndTurn = () => {
    // Call the endTurn move to validate hand limit and potentially trigger discard
    if (moves.endTurn) {
      moves.endTurn();
    } else {
      console.error('ERROR: moves.endTurn is not available!');
    }
  };

  // Handle Discard Cards button click - open dialog
  const handleDiscardCards = () => {
    if (me && G.excessCardCount > 0) {
      dialog.openDiscardDialog(me.hand, G.excessCardCount, G.currentHandLimit);
    }
  };

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
      {/* Canvas container with relative positioning for overlay */}
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
            cursor: 'pointer',
            touchAction: 'none',
          }}
        />
        
        {/* Interactive card button overlay */}
        <CardButtonOverlay
          G={G}
          canvasWidth={cssW}
          canvasHeight={cssH}
          selectedHandIndices={[]}
          hoveredCard={hoveredCard}
          phase={phase}
          onCardClick={handleCardClick}
          onCardHover={setHoveredCard}
        />

        {/* Action Counter Display - overlaid on canvas */}
        <ActionCounterDisplay
          currentActions={currentActions}
          maxActions={maxActions}
          isActivePlayer={myPlayerID === activePlayerID}
          playerName={activePlayer?.name || `Player ${activePlayerIndex + 1}`}
          requiresHandDiscard={G.requiresHandDiscard}
          onDiscardCards={handleDiscardCards}
          onEndTurn={handleEndTurn}
        />

        {/* Player Name Display - above hand cards */}
        {me && (
          <PlayerNameDisplay 
            playerName={me.name}
          />
        )}
      </div>

      {/* Dialog Modals */}
      {dialog.activeDialog === 'replacement' && dialog.dialogContext.newCharacter && dialog.dialogContext.portalCharacters && (
        <CharacterReplacementDialog
          newCard={dialog.dialogContext.newCharacter}
          portalCards={dialog.dialogContext.portalCharacters}
          onSelect={(replacedSlotIndex) => {
            // Check if this is a blind draw (newCharacter.name === 'Blind Draw')
            const isBlindDraw = dialog.dialogContext.newCharacter.name === 'Blind Draw';

            if (isBlindDraw) {
              // For blind draw, use -1 as the character index
              moves.takeCharacterCard(-1, replacedSlotIndex);
            } else {
              // Find the character card index in the auslage
              const characterIndex = (G.characterSlots || []).findIndex(
                (card) => card?.id === dialog.dialogContext.newCharacter?.id
              );
              if (characterIndex >= 0) {
                moves.takeCharacterCard(characterIndex, replacedSlotIndex);
              }
            }
            dialog.closeDialog();
          }}
          onCancel={() => {
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.activeDialog === 'activation' && dialog.dialogContext.character !== undefined && dialog.dialogContext.portalSlotIndex !== undefined && me && (
        <CharacterActivationDialog
          availableCharacters={[{
            card: dialog.dialogContext.character,
            slotIndex: dialog.dialogContext.portalSlotIndex,
          }]}
          hand={me.hand}
          diamonds={me.diamonds}
          portalSlotIndex={dialog.dialogContext.portalSlotIndex}
          onActivate={(portalSlotIndex, usedCardIndices) => {
            moves.activatePortalCard(portalSlotIndex, usedCardIndices);
            dialog.closeDialog();
          }}
          onCancel={() => {
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.activeDialog === 'discard' && dialog.dialogContext.hand && dialog.dialogContext.excessCardCount !== undefined && dialog.dialogContext.currentHandLimit !== undefined && (
        <DiscardCardsDialog
          hand={dialog.dialogContext.hand}
          excessCardCount={dialog.dialogContext.excessCardCount}
          currentHandLimit={dialog.dialogContext.currentHandLimit}
          onDiscard={(selectedCardIndices) => {
            console.log('Discarding cards:', selectedCardIndices);
            moves.discardCardsForHandLimit(selectedCardIndices);
            dialog.closeDialog();
          }}
          onCancel={() => {
            dialog.closeDialog();
          }}
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
