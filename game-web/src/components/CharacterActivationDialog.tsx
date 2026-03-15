import React, { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';
import '../styles/characterActivationDialog.css';

interface CharacterActivationDialogProps {
  availableCharacters: Array<{ card: CharacterCard; slotIndex: number }>;
  hand: PearlCard[];
  diamonds: number;
  portalSlotIndex: number;
  onActivate: (characterSlotIndex: number, usedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function CharacterActivationDialog({
  availableCharacters,
  hand,
  diamonds,
  portalSlotIndex,
  onActivate,
  onCancel,
}: CharacterActivationDialogProps) {
  const [selectedCharacterSlot, setSelectedCharacterSlot] = useState<number | null>(
    availableCharacters.length > 0 ? availableCharacters[0].slotIndex : null
  );
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const selectedCharacter = availableCharacters.find(
    (c) => c.slotIndex === selectedCharacterSlot
  )?.card;

  const isValidPayment = useMemo(() => {
    if (!selectedCharacter) return false;
    return validateCostPayment(selectedCharacter.cost, Array.from(selectedCardIndices), hand, diamonds);
  }, [selectedCharacterSlot, selectedCardIndices, selectedCharacter, hand, diamonds]);

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
    <div className="character-activation-dialog-overlay">
      <div className="character-activation-dialog">
        <h2>Activate Character</h2>
        
        <div className="character-selection">
          <h3>Select Character to Activate (Portal Slot {portalSlotIndex + 1})</h3>
          <div className="available-characters">
            {availableCharacters.map(({ card, slotIndex }) => (
              <button
                key={slotIndex}
                className={`character-choice card-with-image ${
                  selectedCharacterSlot === slotIndex ? 'selected' : ''
                }`}
                style={{
                  backgroundImage: `url(/assets/Charakterkarte${card.name.match(/\d+/)?.[0] || 'unknown'}.jpeg)`,
                }}
                onClick={() => {
                  setSelectedCharacterSlot(slotIndex);
                  setSelectedCardIndices(new Set());
                }}
                title={`${card.name} - Cost: ${getCostSummary(card.cost)}`}
              >
                <div className="character-choice-overlay">
                  <div className="character-name">{card.name}</div>
                  <div className="character-cost">{getCostSummary(card.cost)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCharacter && (
          <>
            <div className="cost-section">
              <h3>Cost: {getCostSummary(selectedCharacter.cost)}</h3>
              <p className="cost-description">{describeCost(selectedCharacter.cost)}</p>
              {diamonds > 0 && (
                <p className="diamond-bonus">💎 {diamonds} available (reduces cost)</p>
              )}
            </div>

            <div className="hand-section">
              <h3>Select Cards to Pay ({selectedCardIndices.size} selected)</h3>
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
          </>
        )}

        <div className="actions">
          <button
            className="btn-activate"
            onClick={handleActivate}
            disabled={!isValidPayment}
          >
            {isValidPayment ? 'Activate' : 'Invalid Payment'}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>

        {!isValidPayment && selectedCardIndices.size > 0 && selectedCharacter && (
          <div className="error-message">
            The selected cards do not satisfy the cost for {selectedCharacter.name}. Please adjust your selection.
          </div>
        )}
      </div>
    </div>
  );
}
