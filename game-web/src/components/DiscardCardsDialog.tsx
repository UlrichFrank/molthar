import React, { useState, useMemo } from 'react';
import type { PearlCard } from '@portale-von-molthar/shared';
import '../styles/discardCardsDialog.css';

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
    <div className="discard-cards-dialog-overlay">
      <div className="discard-cards-dialog">
        <h2>Discard Pearl Cards</h2>

        <div className="info-section">
          <p className="info-text">
            Hand size: <strong>{hand.length}</strong> cards
          </p>
          <p className="info-text">
            Hand limit: <strong>{currentHandLimit}</strong> cards
          </p>
          <p className="info-text warning">
            You must discard <strong>{excessCardCount}</strong> card{excessCardCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="hand-section">
          <h3>Select {excessCardCount} card{excessCardCount !== 1 ? 's' : ''} to discard</h3>
          <div className="hand-grid">
            {hand.map((card, idx) => (
              <button
                key={idx}
                className={`hand-card-selector ${selectedCardIndices.has(idx) ? 'selected' : ''}`}
                onClick={() => toggleCard(idx)}
              >
                <div className="card-value">{card.value}</div>
                {card.hasSwapSymbol && <div className="swap-symbol">⟳</div>}
              </button>
            ))}
          </div>
        </div>

        {selectedCardIndices.size > 0 && !isValidSelection && (
          <div className="error-message">
            Selected: {selectedCardIndices.size} card{selectedCardIndices.size !== 1 ? 's' : ''}
            (need {excessCardCount})
          </div>
        )}

        <div className="actions">
          <button
            className="btn-confirm"
            onClick={handleDiscard}
            disabled={!isValidSelection}
          >
            {isValidSelection ? 'Confirm Discard' : 'Invalid Selection'}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
