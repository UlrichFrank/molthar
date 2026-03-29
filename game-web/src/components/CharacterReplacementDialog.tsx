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

      <div className="flex flex-col items-center gap-4 mb-6">
        <CharacterImage
          card={newCard}
          className="w-auto max-h-[200px] object-contain block rounded-lg"
        />

        <div className="text-[#16c784] text-2xl">↓</div>

        <div className="flex gap-6 justify-center">
          {portalCards.map((card, idx) => (
            <button
              key={idx}
              className="appearance-none bg-transparent border-none outline-none p-0 cursor-pointer hover:-translate-y-0.5 transition-transform"
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
