import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';

export type DialogType = 'none' | 'replacement' | 'activation' | 'discard';

export interface DialogContextType {
  activeDialog: DialogType;
  dialogContext: {
    newCharacter?: CharacterCard;
    portalCharacters?: CharacterCard[];
    character?: CharacterCard;
    portalSlotIndex?: number;
    hand?: PearlCard[];
    excessCardCount?: number;
    currentHandLimit?: number;
  };
  openReplacementDialog: (newCharacter: CharacterCard, portalCharacters: CharacterCard[]) => void;
  openActivationDialog: (character: CharacterCard, portalSlotIndex: number) => void;
  openDiscardDialog: (hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>('none');
  const [dialogContext, setDialogContext] = useState<DialogContextType['dialogContext']>({});

  const openReplacementDialog = useCallback((newCharacter: CharacterCard, portalCharacters: CharacterCard[]) => {
    setActiveDialog('replacement');
    setDialogContext({ newCharacter, portalCharacters });
  }, []);

  const openActivationDialog = useCallback((character: CharacterCard, portalSlotIndex: number) => {
    setActiveDialog('activation');
    setDialogContext({ character, portalSlotIndex });
  }, []);

  const openDiscardDialog = useCallback((hand: PearlCard[], excessCardCount: number, currentHandLimit: number) => {
    setActiveDialog('discard');
    setDialogContext({ hand, excessCardCount, currentHandLimit });
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog('none');
    setDialogContext({});
  }, []);

  const value: DialogContextType = {
    activeDialog,
    dialogContext,
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
