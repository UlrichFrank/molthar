import type { CharacterCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface CharacterReplacementDialogProps {
  newCard: CharacterCard;
  portalCards: CharacterCard[];
  onSelect: (replacedSlotIndex: number) => void;
  onDiscard: () => void;
  canDiscard?: boolean;
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

export function CharacterReplacementDialog({ newCard, portalCards, onSelect, onDiscard, canDiscard = true }: CharacterReplacementDialogProps) {
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
              className="game-dialog-card-btn"
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
          style={{ flex: 'none', padding: '0.6rem 2rem', opacity: canDiscard ? 1 : 0.4, cursor: canDiscard ? 'pointer' : 'not-allowed' }}
          onClick={canDiscard ? onDiscard : undefined}
          disabled={!canDiscard}
        >
          Verwerfen
        </button>
      </div>
    </GameDialog>
  );
}
