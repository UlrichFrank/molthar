import type { CharacterCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface CharacterSwapDialogProps {
  portalCard: CharacterCard;
  portalSlotIndex: number;
  tableCards: (CharacterCard | undefined)[];
  onSwap: (tableSlotIndex: number) => void;
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

export function CharacterSwapDialog({ portalCard, tableCards, onSwap, onCancel }: CharacterSwapDialogProps) {
  const validTableCards = tableCards
    .map((card, idx) => ({ card, idx }))
    .filter((entry): entry is { card: CharacterCard; idx: number } => entry.card !== undefined);

  return (
    <GameDialog>
      <GameDialogTitle>Portal-Karte tauschen</GameDialogTitle>
      <p style={{ margin: '0 0 1.5rem', textAlign: 'center' }}>
        Wähle eine Auslage-Karte zum Tauschen:
      </p>

      <div className="flex flex-col items-center gap-4 mb-6">
        <CharacterImage
          card={portalCard}
          className="w-auto max-h-[200px] object-contain block rounded-lg"
        />

        <div className="text-[#a5b4fc] text-2xl">⇄</div>

        <div className="flex gap-6 justify-center">
          {validTableCards.map(({ card, idx }) => (
            <button
              key={idx}
              className="game-dialog-card-btn"
              onClick={() => onSwap(idx)}
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
          Abbrechen
        </button>
      </div>
    </GameDialog>
  );
}
