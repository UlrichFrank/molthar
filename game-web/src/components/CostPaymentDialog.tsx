import React, { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';
import '../styles/costPaymentDialog.css';

interface CostPaymentDialogProps {
  character: CharacterCard;
  hand: PearlCard[];
  diamonds: number;
  onPay: (usedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function CostPaymentDialog({
  character,
  hand,
  diamonds,
  onPay,
  onCancel,
}: CostPaymentDialogProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const isValidPayment = useMemo(() => {
    // Convert selected indices to actual PearlCard objects for validation
    const selectedCards = Array.from(selectedIndices).map(idx => hand[idx]);
    return validateCostPayment(character.cost, selectedCards, diamonds);
  }, [selectedIndices, character.cost, hand, diamonds]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handlePay = () => {
    if (isValidPayment) {
      onPay(Array.from(selectedIndices));
    }
  };

  return (
    <div className="cost-payment-dialog-overlay">
      <div className="cost-payment-dialog">
        <h2>Activate Character</h2>
        
        <div className="character-info">
          <div className="character-name">{character.name}</div>
          <div className="character-stats">
            <span className="power">⚡ {character.powerPoints}</span>
            <span className="diamonds">💎 {character.diamonds}</span>
          </div>
        </div>

        <div className="cost-section">
          <h3>Cost: {getCostSummary(character.cost)}</h3>
          <p className="cost-description">{describeCost(character.cost)}</p>
        </div>

        <div className="hand-section">
          <h3>Select Cards to Pay ({selectedIndices.size} selected)</h3>
          {diamonds > 0 && (
            <p className="diamond-bonus">💎 {diamonds} available (reduces cost)</p>
          )}
          
          <div className="hand-grid">
            {hand.map((card, idx) => (
              <button
                key={idx}
                className={`hand-card-selector ${selectedIndices.has(idx) ? 'selected' : ''}`}
                onClick={() => toggleCard(idx)}
              >
                <div className="card-value">{card.value}</div>
                {card.hasSwapSymbol && <div className="swap-symbol">⟳</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="actions">
          <button
            className="btn-pay"
            onClick={handlePay}
            disabled={!isValidPayment}
          >
            {isValidPayment ? 'Pay & Activate' : 'Invalid Payment'}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>

        {!isValidPayment && selectedIndices.size > 0 && (
          <div className="error-message">
            The selected cards do not satisfy the cost. Please adjust your selection.
          </div>
        )}
      </div>
    </div>
  );
}
