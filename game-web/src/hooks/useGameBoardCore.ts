import { useEffect, useState } from 'react';
import type { CharacterCard, GameState } from '@portale-von-molthar/shared';
import { useDialog } from '../contexts/DialogContext';
import { getNeighborOpponents } from '../lib/opponentUtils';

export interface GameBoardProps {
  G: GameState;
  ctx: { phase?: string } & Record<string, unknown>;
  moves: Record<string, (...args: unknown[]) => void>;
  events?: Record<string, (...args: unknown[]) => void>;
  playerID: string | null;
  isActive: boolean;
  matchData?: Array<{ id: number; name?: string }>;
}

export interface GameOverState {
  ranking: Array<{ playerId: string; name: string; powerPoints: number; diamonds: number }>;
  reason?: string;
}

/**
 * Task 1.2/D1: derived game state, dialog wiring and shared handlers that both
 * `CanvasGameBoard` and `MobileGameBoard` consume identically, so spiellogic
 * never diverges between the two views (design.md D1/Migration Plan).
 */
export function useGameBoardCore(props: GameBoardProps) {
  const { G, ctx, moves, playerID, isActive, matchData } = props;
  const dialog = useDialog();

  function resolvePlayerName(pid: string, fallback: string): string {
    const id = parseInt(pid, 10);
    return matchData?.find(p => p.id === id)?.name || fallback;
  }

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
  const activatedCharacters = me?.activatedCharacters ?? [];
  const activatedCards = activatedCharacters.map(s => s.card);
  const canAct = isActive && actionCount < maxActions;

  // ── Contextual action-bar eligibility (mirrors canvasRegions.ts button visibility) ─
  const hasFreeReplaceAbility = me?.activeAbilities?.some(a => a.type === 'replacePearlSlotsBeforeFirstAction') ?? false;
  const canReplacePearlSlotsFree = isActive && actionCount === 0 && hasFreeReplaceAbility && !(G.replacePearlSlotsAbilityUsed ?? false);
  const canReplacePearlSlots = !canReplacePearlSlotsFree && canAct;
  const canDiscardHand = isActive && G.requiresHandDiscard && actionCount >= maxActions;
  // Task 4.2 fix: mirrors canvasRegions.ts hasSwapAbility — button only exists before the first action.
  const canSwapPortal = isActive && actionCount === 0 && (me?.activeAbilities ?? []).some(a => a.type === 'changeCharacterActions');

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

  // ── Detail / preview view state ─────────────────────────────────────────────
  const [activeCharacterIndex, setActiveCharacterIndex] = useState<number | null>(null);
  const activeCharacter = activeCharacterIndex !== null && activeCharacterIndex < activatedCharacters.length
    ? activatedCharacters[activeCharacterIndex]
    : null;

  const [activeOwnPortalSlot, setActiveOwnPortalSlot] = useState<number | null>(null);
  const [previewAuslageCard, setPreviewAuslageCard] = useState<CharacterCard | null>(null);
  const [activeOpponentCharacter, setActiveOpponentCharacter] = useState<{ playerId: string; index: number } | null>(null);
  const [activeOpponentPortalCard, setActiveOpponentPortalCard] = useState<{ playerId: string; slotIndex: number } | null>(null);

  const [pendingTakeCardFromDisplay, setPendingTakeCardFromDisplay] = useState<{ card: CharacterCard; slotIndex: number } | null>(null);
  const [pendingTakeCardFromDeck, setPendingTakeCardFromDeck] = useState<{ card: CharacterCard; faceDown: boolean } | null>(null);

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

  // ── Auto-open dialogs when the game requires a reactive decision ───────────
  useEffect(() => {
    if (G.pendingStealOpponentHandCard && myPlayerID === activePlayerID && dialog.dialog.type !== 'steal-opponent-hand-card') {
      dialog.openStealOpponentHandCardDialog();
    }
  }, [G.pendingStealOpponentHandCard, myPlayerID, activePlayerID, dialog.dialog.type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (G.pendingDiscardOpponentCharacter && myPlayerID === activePlayerID && dialog.dialog.type !== 'discard-opponent-character') {
      dialog.openDiscardOpponentCharacterDialog();
    }
  }, [G.pendingDiscardOpponentCharacter, myPlayerID, activePlayerID]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Gameover state ────────────────────────────────────────────────────────
  const gameover = (ctx as { gameover?: GameOverState }).gameover;

  // ── Task 4.2 fix: Escape key closes detail modals — moved here (from
  // CanvasGameBoard) so both CanvasGameBoard and MobileGameBoard get it. ────
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
  }, [
    activeCharacterIndex, activeOwnPortalSlot, activeOpponentCharacter, activeOpponentPortalCard, previewAuslageCard,
  ]);

  // ── Shared action handlers (identical eligibility rules to CanvasGameBoard) ─
  function takeCharacterFromDisplay(slotIndex: number) {
    const card = characterSlots[slotIndex];
    if (!card) return;
    if (canAct) {
      if (me && me.portal.length >= 2) {
        const portalCharacters = me.portal.map(entry => entry.card);
        dialog.openReplacementDialog(card, portalCharacters, true, true);
      } else {
        setPendingTakeCardFromDisplay({ card, slotIndex });
      }
    } else {
      setPreviewAuslageCard(card);
    }
  }

  function takeCharacterFromDeck() {
    if (!me || G.characterDeck.length === 0 || !canAct || phase !== 'takingActions') return;
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
      if (!topCard) return;
      const portalSlots: (CharacterCard | null)[] = [me.portal[0]?.card ?? null, me.portal[1]?.card ?? null];
      moves.peekCharacterDeck();
      dialog.openReplacementDialog(topCard, portalSlots, true, true);
    } else {
      takeCharCard();
    }
  }

  function takePearlFromMarket(pearlIdx: number) {
    if (!pearlSlots[pearlIdx] || !canAct) return;
    moves.takePearlCard(pearlIdx);
  }

  function takePearlFromDeck() {
    if (G.pearlDeck.length === 0 || !canAct || phase !== 'takingActions') return;
    moves.takePearlCard(-1);
  }

  function openOwnPortalSlot(slotIndex: number) {
    if (!me || !me.portal[slotIndex]) return;
    if (canAct) {
      const entry = me.portal[slotIndex];
      dialog.openActivationDialog(entry.card, slotIndex);
    } else {
      setActiveOwnPortalSlot(slotIndex);
    }
  }

  function openPortalSwap(slotIndex: number) {
    if (!canSwapPortal) return;
    const portalEntry = me?.portal[slotIndex];
    if (!portalEntry) return;
    dialog.openSwapPortalCharacterDialog(portalEntry.card, slotIndex, G.characterSlots ?? []);
  }

  /** Task 6.5/6.8: opponent portal card — preview it, or open the shared-activation
   * dialog when eligible (isActive, direct neighbor, irrlicht/sharedActivation card). */
  function openOpponentPortalSlot(ownerPlayerId: string, slotIndex: number) {
    const ownerPlayer = G.players?.[ownerPlayerId];
    const entry = ownerPlayer?.portal[slotIndex];
    if (!entry) return;
    const isNeighbor = getNeighborOpponents(G, myPlayerID).some(n => n.playerId === ownerPlayerId);
    const isIrrlicht = entry.card.abilities.some(a => a.type === 'irrlicht') || entry.card.sharedActivation;
    if (canAct && isNeighbor && isIrrlicht) {
      dialog.openActivationDialog(entry.card, slotIndex, ownerPlayerId);
    } else {
      setActiveOpponentPortalCard({ playerId: ownerPlayerId, slotIndex });
    }
  }

  /** Task 6.8: opponent activated character — always just a preview, never actionable. */
  function openOpponentActivatedCharacter(playerId: string, index: number) {
    setActiveOpponentCharacter({ playerId, index });
  }

  function replacePearlSlots() {
    if (!canReplacePearlSlots) return;
    moves.replacePearlSlots?.();
  }

  function replacePearlSlotsAbility() {
    if (!canReplacePearlSlotsFree) return;
    moves.replacePearlSlotsAbility?.();
  }

  function openHandDiscardDialog() {
    if (me && G.excessCardCount > 0) {
      dialog.openDiscardDialog(me.hand, G.excessCardCount, G.currentHandLimit);
    }
  }

  function rehandCards() {
    moves.rehandCards?.();
    setRehandDone(true);
  }

  function endTurn() {
    moves.endTurn?.();
  }

  return {
    dialog,
    resolvePlayerName,
    myPlayerID,
    me,
    phase,
    playerList,
    activePlayerID,
    activePlayerIndex,
    activePlayer,
    maxActions,
    actionCount,
    canAct,
    characterSlots,
    pearlSlots,
    playerDiamonds,
    playerPortal,
    playerHand,
    activatedCharacters,
    activatedCards,
    disconnectedPlayerName,
    activeCharacterIndex, setActiveCharacterIndex, activeCharacter,
    activeOwnPortalSlot, setActiveOwnPortalSlot,
    previewAuslageCard, setPreviewAuslageCard,
    activeOpponentCharacter, setActiveOpponentCharacter, activeOpponentCharacterData,
    activeOpponentPortalCard, setActiveOpponentPortalCard, activeOpponentPortalCardData,
    pendingTakeCardFromDisplay, setPendingTakeCardFromDisplay,
    pendingTakeCardFromDeck, setPendingTakeCardFromDeck,
    rehandDone, hasChangeHandAbility,
    gameover,
    canReplacePearlSlotsFree,
    canReplacePearlSlots,
    canDiscardHand,
    canSwapPortal,
    takeCharacterFromDisplay,
    takeCharacterFromDeck,
    takePearlFromMarket,
    takePearlFromDeck,
    openOwnPortalSlot,
    openPortalSwap,
    openOpponentPortalSlot,
    openOpponentActivatedCharacter,
    replacePearlSlots,
    replacePearlSlotsAbility,
    openHandDiscardDialog,
    rehandCards,
    endTurn,
  };
}

export type GameBoardCore = ReturnType<typeof useGameBoardCore>;
