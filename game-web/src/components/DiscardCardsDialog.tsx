import { useState, useMemo } from 'react';
import type { PearlCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle, GameDialogActions, CardPicker } from './GameDialog';

interface DiscardCardsDialogProps {
  hand: PearlCard[];
  excessCardCount: number;
  currentHandLimit: number;
  onDiscard: (selectedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function DiscardCardsDialog({
  hand,
  excessCardCount,
  currentHandLimit,
  onDiscard,
  onCancel,
}: DiscardCardsDialogProps) {
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const isValidSelection = useMemo(() => {
    return selectedCardIndices.size === excessCardCount;
  }, [selectedCardIndices, excessCardCount]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCardIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCardIndices(newSelected);
  };

  const handleDiscard = () => {
    if (isValidSelection) {
      onDiscard(Array.from(selectedCardIndices).sort());
    }
  };

  return (
    <GameDialog>
      <GameDialogTitle>Discard Pearl Cards</GameDialogTitle>

      <div className="game-dialog-info">
        <p className="game-dialog-info-text">
          Hand size: <strong>{hand.length}</strong> cards
        </p>
        <p className="game-dialog-info-text">
          Hand limit: <strong>{currentHandLimit}</strong> cards
        </p>
        <p className="game-dialog-info-text game-dialog-info-text--warning">
          You must discard <strong>{excessCardCount}</strong> card{excessCardCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div>
        <h3 style={{ margin: '0.5rem 0', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>
          Select {excessCardCount} card{excessCardCount !== 1 ? 's' : ''} to discard
        </h3>
        <CardPicker
          cards={hand}
          selected={selectedCardIndices}
          onToggle={toggleCard}
          getImageSrc={(card) => `/assets/Perlenkarte${card.value}${[3,4,5].includes(card.value) ? '-neu' : ''}.png`}
          getAlt={(card) => `Pearl ${card.value}`}
        />
      </div>

      <GameDialogActions
        confirmLabel={isValidSelection ? 'Confirm Discard' : 'Invalid Selection'}
        confirmDisabled={!isValidSelection}
        onConfirm={handleDiscard}
        onCancel={onCancel}
      />
    </GameDialog>
  );
}
