import React from 'react';
import type { CharacterCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface CharacterReplacementDialogProps {
  newCard: CharacterCard;
  portalCards: CharacterCard[];
  onSelect: (replacedSlotIndex: number) => void;
  onCancel: () => void;
}

function CharacterImage({ card, className }: { card: CharacterCard; className?: string }) {
  return (
    <img
      src={`/assets/${encodeURIComponent(card.imageName)}`}
      alt={card.name}
      className={className}
    />
  );
}

export function CharacterReplacementDialog({ newCard, portalCards, onSelect, onCancel }: CharacterReplacementDialogProps) {
  return (
    <GameDialog>
      <GameDialogTitle>Replace Portal Card</GameDialogTitle>
      <p style={{ margin: '0 0 1.5rem', textAlign: 'center' }}>Both portal slots are full. Choose which card to replace:</p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-center">
          <CharacterImage
            card={newCard}
            className="w-auto max-h-[200px] object-contain block rounded-lg"
          />
        </div>

        <div className="text-center text-[#16c784] text-2xl">↓</div>

        <div className="flex gap-4 justify-center flex-wrap">
          {portalCards.map((card, idx) => (
            <button
              key={idx}
              className="bg-transparent border-2 border-[#444] rounded-lg p-2 cursor-pointer flex flex-col items-center gap-2 hover:border-[#16c784] hover:shadow-[0_0_12px_rgba(22,199,132,0.3)] transition-all duration-200"
              onClick={() => onSelect(idx)}
            >
              <CharacterImage
                card={card}
                className="w-auto max-h-[160px] object-contain block rounded-lg"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="game-dialog-actions" style={{ justifyContent: 'center' }}>
        <button
          className="game-dialog-btn-cancel"
          style={{ flex: 'none', padding: '0.6rem 2rem' }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </GameDialog>
  );
}
