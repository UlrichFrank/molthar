import React, { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';
import { GameDialog, GameDialogTitle, GameDialogActions, CardPicker } from './GameDialog';

interface CharacterActivationDialogProps {
  availableCharacters: Array<{ card: CharacterCard; slotIndex: number }>;
  hand: PearlCard[];
  diamonds: number;
  onActivate: (characterSlotIndex: number, usedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function CharacterActivationDialog({
  availableCharacters,
  hand,
  diamonds,
  onActivate,
  onCancel,
}: CharacterActivationDialogProps) {
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const selectedCharacter = availableCharacters[0]?.card;
  const selectedCharacterSlot = availableCharacters[0]?.slotIndex ?? null;

  const isValidPayment = useMemo(() => {
    if (!selectedCharacter) return false;
    const selectedCards = Array.from(selectedCardIndices).map(idx => hand[idx]);
    return validateCostPayment(selectedCharacter.cost, selectedCards, diamonds);
  }, [selectedCardIndices, selectedCharacter, hand, diamonds]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCardIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCardIndices(newSelected);
  };

  const handleActivate = () => {
    if (isValidPayment && selectedCharacterSlot !== null) {
      onActivate(selectedCharacterSlot, Array.from(selectedCardIndices));
    }
  };

  return (
    <GameDialog>
      <GameDialogTitle>Activate Character</GameDialogTitle>

      <div className="flex flex-wrap justify-center gap-1.5 bg-white/10 p-1.5 rounded-lg sm:gap-2.5 sm:p-2">
        {availableCharacters.map(({ card, slotIndex }) => (
          <img
            key={slotIndex}
            src={`/assets/${encodeURIComponent(card.imageName)}`}
            alt={card.name}
            className="w-auto h-full max-h-[200px] object-contain block rounded-lg sm:max-h-[280px]"
          />
        ))}
      </div>

      {selectedCharacter && (
        <>
          {import.meta.env.VITE_DEBUG_COST === 'true' && (
            <div className="game-dialog-info">
              <p className="game-dialog-info-text">Cost: {getCostSummary(selectedCharacter.cost)}</p>
              <p className="game-dialog-info-text">{describeCost(selectedCharacter.cost)}</p>
              {diamonds > 0 && (
                <p className="game-dialog-info-text">💎 {diamonds} available (reduces cost)</p>
              )}
            </div>
          )}

          <div>
            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>
              Select Cards to Pay ({selectedCardIndices.size} selected)
            </h3>
            <CardPicker
              cards={hand}
              selected={selectedCardIndices}
              onToggle={toggleCard}
              getImageSrc={(card) => `/assets/Perlenkarte${card.value}.png`}
              getAlt={(card) => `Pearl ${card.value}`}
            />
          </div>
        </>
      )}

      <GameDialogActions
        confirmLabel={isValidPayment ? 'Activate' : 'Invalid Payment'}
        confirmDisabled={!isValidPayment}
        onConfirm={handleActivate}
        onCancel={onCancel}
      />
    </GameDialog>
  );
}
