import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';

export type DialogState =
  | { type: 'none' }
  | { type: 'replacement'; newCharacter: CharacterCard; portalCharacters: CharacterCard[]; canDiscard: boolean; canCancel?: boolean }
  | { type: 'activation'; character: CharacterCard; portalSlotIndex: number; ownerPlayerId?: string }
  | { type: 'discard'; hand: PearlCard[]; excessCardCount: number; currentHandLimit: number }
  | { type: 'steal-opponent-hand-card'; selectedPlayerId: string | null }
  | { type: 'swap-portal-character'; portalCard: CharacterCard; portalSlotIndex: number; tableCards: (CharacterCard | undefined)[] }
  | { type: 'take-back-played-pearl' }
  | { type: 'discard-opponent-character' };

export interface DialogContextType {
  dialog: DialogState;
  openReplacementDialog: (newCharacter: CharacterCard, portalCharacters: CharacterCard[], canDiscard?: boolean, canCancel?: boolean) => void;
  openActivationDialog: (character: CharacterCard, portalSlotIndex: number, ownerPlayerId?: string) => void;
  openDiscardDialog: (hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => void;
  openStealOpponentHandCardDialog: () => void;
  selectStealOpponent: (playerId: string | null) => void;
  openSwapPortalCharacterDialog: (portalCard: CharacterCard, portalSlotIndex: number, tableCards: (CharacterCard | undefined)[]) => void;
  openTakeBackPlayedPearlDialog: () => void;
  openDiscardOpponentCharacterDialog: () => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  const openReplacementDialog = useCallback((newCharacter: CharacterCard, portalCharacters: CharacterCard[], canDiscard = true, canCancel = false) => {
    setDialog({ type: 'replacement', newCharacter, portalCharacters, canDiscard, canCancel });
  }, []);

  const openActivationDialog = useCallback((character: CharacterCard, portalSlotIndex: number, ownerPlayerId?: string) => {
    setDialog({ type: 'activation', character, portalSlotIndex, ownerPlayerId });
  }, []);

  const openDiscardDialog = useCallback((hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => {
    setDialog({ type: 'discard', hand, excessCardCount, currentHandLimit });
  }, []);

  const openStealOpponentHandCardDialog = useCallback(() => {
    setDialog({ type: 'steal-opponent-hand-card', selectedPlayerId: null });
  }, []);

  const selectStealOpponent = useCallback((playerId: string | null) => {
    setDialog(prev =>
      prev.type === 'steal-opponent-hand-card'
        ? { ...prev, selectedPlayerId: playerId }
        : prev
    );
  }, []);

  const openSwapPortalCharacterDialog = useCallback((portalCard: CharacterCard, portalSlotIndex: number, tableCards: (CharacterCard | undefined)[]) => {
    setDialog({ type: 'swap-portal-character', portalCard, portalSlotIndex, tableCards });
  }, []);

  const openTakeBackPlayedPearlDialog = useCallback(() => {
    setDialog({ type: 'take-back-played-pearl' });
  }, []);

  const openDiscardOpponentCharacterDialog = useCallback(() => {
    setDialog({ type: 'discard-opponent-character' });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ type: 'none' });
  }, []);

  const value: DialogContextType = {
    dialog,
    openReplacementDialog,
    openActivationDialog,
    openDiscardDialog,
    openStealOpponentHandCardDialog,
    selectStealOpponent,
    openSwapPortalCharacterDialog,
    openTakeBackPlayedPearlDialog,
    openDiscardOpponentCharacterDialog,
    closeDialog,
  };

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
