import React from 'react';
import type { CharacterCard } from '@portale-von-molthar/shared';
import '../styles/characterReplacementDialog.css';

interface CharacterReplacementDialogProps {
  newCard: CharacterCard;
  portalCards: CharacterCard[];
  onSelect: (replacedSlotIndex: number) => void;
  onCancel: () => void;
}

export function CharacterReplacementDialog(props: CharacterReplacementDialogProps) {
  const { newCard, portalCards, onSelect, onCancel } = props;

  const getCharacterCardImage = (cardName: string): string => {
    const match = cardName.match(/(\d+)/);
    if (match) {
      const num = match[1];
      return `/assets/Charakterkarte${num}.png`;
    }
    return '/assets/Charakterkarte Hinten.png';
  };

  return (
    <div className="replacement-dialog-overlay">
      <div className="replacement-dialog">
        <h2>Replace Portal Card</h2>
        <p>Both portal slots are full. Choose which card to replace:</p>
        
        <div className="replacement-container">
          <div className="new-card-section">
            <h3>New Card</h3>
            <div
              className="character-card card-with-image"
              style={{
                backgroundImage: `url(${getCharacterCardImage(newCard.name)})`,
              }}
              title={newCard.name}
            >
              <span className="card-fallback">
                <span className="name">{newCard.name}</span>
              </span>
            </div>
          </div>

          <div className="or-divider">↓</div>

          <div className="portal-slots-section">
            <h3>Select Slot to Replace</h3>
            <div className="portal-slots">
              {portalCards.map((card, idx) => (
                <button
                  key={idx}
                  className="replacement-option"
                  onClick={() => onSelect(idx)}
                >
                  <div
                    className="character-card card-with-image"
                    style={{
                      backgroundImage: `url(${getCharacterCardImage(card.name)})`,
                    }}
                    title={card.name}
                  >
                    <span className="card-fallback">
                      <span className="name">{card.name}</span>
                    </span>
                  </div>
                  <p>Slot {idx + 1}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
