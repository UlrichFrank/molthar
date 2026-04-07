import type { PearlCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface TakeBackPlayedPearlDialogProps {
  /** Cards from pearlDiscardPile that match playedRealPearlIds (filtered by caller) */
  playedCards: PearlCard[];
  onTakeBack: (pearlId: string) => void;
  onDismiss: () => void;
}

export function TakeBackPlayedPearlDialog({ playedCards, onTakeBack, onDismiss }: TakeBackPlayedPearlDialogProps) {
  const isEmpty = playedCards.length === 0;

  return (
    <GameDialog>
      <GameDialogTitle>Perlenkarte zurückholen</GameDialogTitle>

      {isEmpty ? (
        <button
          onClick={onDismiss}
          style={{
            display: 'block',
            width: '100%',
            padding: '1.5rem 1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            textAlign: 'center',
          }}
        >
          Nur virtuelle Perlenkarten wurden gespielt.
        </button>
      ) : (
        <div>
          <p style={{ margin: '0 0 1rem', textAlign: 'center', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
            Wähle eine Karte zum Zurückholen:
          </p>
          <div className="game-dialog-card-grid">
            {playedCards.map(card => (
              <button
                key={card.id}
                className="game-dialog-card-btn"
                onClick={() => onTakeBack(card.id)}
              >
                <img
                  src={`/assets/Perlenkarte${card.value}.png`}
                  alt={`Perle ${card.value}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </GameDialog>
  );
}
