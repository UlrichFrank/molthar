import type { CharacterCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle, GameDialogActions } from './GameDialog';

interface CharacterTakePreviewDialogProps {
  card: CharacterCard;
  faceDown?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}

export function CharacterTakePreviewDialog({ card, faceDown = false, onConfirm, onCancel }: CharacterTakePreviewDialogProps) {
  return (
    <GameDialog>
      <GameDialogTitle>{onConfirm ? 'Charakterkarte nehmen?' : 'Charakterkarte'}</GameDialogTitle>

      <div className="flex flex-col items-center gap-4 mb-6">
        {faceDown ? (
          <img
            src={`/assets/${encodeURIComponent('Charakterkarte Hinten.png')}`}
            alt="Charakterkarte (verdeckt)"
            className="w-auto max-h-[200px] object-contain block rounded-lg"
          />
        ) : (
          <img
            src={`/assets/${encodeURIComponent(card.imageName)}`}
            alt={card.name}
            className="w-auto max-h-[200px] object-contain block rounded-lg"
          />
        )}
      </div>

      {onConfirm ? (
        <GameDialogActions
          confirmLabel="Nehmen"
          cancelLabel="Abbrechen"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ) : (
        <div className="game-dialog-actions" style={{ justifyContent: 'center' }}>
          <button className="game-dialog-btn-cancel" style={{ flex: 'none', padding: '0.6rem 2rem' }} onClick={onCancel}>
            Schließen
          </button>
        </div>
      )}
    </GameDialog>
  );
}
