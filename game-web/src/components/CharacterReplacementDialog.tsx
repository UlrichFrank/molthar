import React from 'react';
import type { CharacterCard } from '@portale-von-molthar/shared';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-[#1a1a2e] border-2 border-[#16c784] rounded-xl p-8 max-w-xl max-h-[80vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h2 className="mt-0 mb-4 text-[#16c784] text-center">Replace Portal Card</h2>
        <p className="mt-0 mb-6 text-[#ccc] text-center">Both portal slots are full. Choose which card to replace:</p>

        <div className="flex flex-col gap-6 mb-6">
          <div className="text-center">
            <h3 className="mt-0 mb-4 text-white text-base">New Card</h3>
            <div
              className="character-card card-with-image w-[120px] h-auto mx-auto block"
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

          <div className="text-center text-[#16c784] text-2xl my-2">↓</div>

          <div>
            <h3 className="mt-0 mb-4 text-white text-base">Select Slot to Replace</h3>
            <div className="flex gap-4 justify-center flex-wrap">
              {portalCards.map((card, idx) => (
                <button
                  key={idx}
                  className="bg-transparent border-2 border-[#444] rounded-lg p-2 cursor-pointer flex flex-col items-center gap-2 hover:border-[#16c784] hover:shadow-[0_0_12px_rgba(22,199,132,0.3)] transition-all duration-200"
                  onClick={() => onSelect(idx)}
                >
                  <div
                    className="character-card card-with-image w-[100px] h-auto"
                    style={{
                      backgroundImage: `url(${getCharacterCardImage(card.name)})`,
                    }}
                    title={card.name}
                  >
                    <span className="card-fallback">
                      <span className="name">{card.name}</span>
                    </span>
                  </div>
                  <p className="m-0 text-sm text-[#ccc]">Slot {idx + 1}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            className="px-6 py-3 bg-[#444] text-white border border-[#666] rounded-md cursor-pointer text-base hover:bg-[#555] hover:border-[#888] active:scale-[0.98] transition-all duration-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
