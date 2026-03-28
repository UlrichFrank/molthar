import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';

export type DialogState =
  | { type: 'none' }
  | { type: 'replacement'; newCharacter: CharacterCard; portalCharacters: CharacterCard[] }
  | { type: 'activation'; character: CharacterCard; portalSlotIndex: number }
  | { type: 'discard'; hand: PearlCard[]; excessCardCount: number; currentHandLimit: number };

export interface DialogContextType {
  dialog: DialogState;
  openReplacementDialog: (newCharacter: CharacterCard, portalCharacters: CharacterCard[]) => void;
  openActivationDialog: (character: CharacterCard, portalSlotIndex: number) => void;
  openDiscardDialog: (hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  const openReplacementDialog = useCallback((newCharacter: CharacterCard, portalCharacters: CharacterCard[]) => {
    setDialog({ type: 'replacement', newCharacter, portalCharacters });
  }, []);

  const openActivationDialog = useCallback((character: CharacterCard, portalSlotIndex: number) => {
    setDialog({ type: 'activation', character, portalSlotIndex });
  }, []);

  const openDiscardDialog = useCallback((hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => {
    setDialog({ type: 'discard', hand, excessCardCount, currentHandLimit });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ type: 'none' });
  }, []);

  const value: DialogContextType = {
    dialog,
    openReplacementDialog,
    openActivationDialog,
    openDiscardDialog,
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
