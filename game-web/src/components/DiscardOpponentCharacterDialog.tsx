import type { PlayerState } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface DiscardOpponentCharacterDialogProps {
  /** Opponents in turn order starting from next player, filtered to those with portal cards */
  opponents: PlayerState[];
  onDiscard: (targetPlayerId: string, portalEntryId: string) => void;
}

export function DiscardOpponentCharacterDialog({ opponents, onDiscard }: DiscardOpponentCharacterDialogProps) {
  const opponentsWithCards = opponents.filter(p => p.portal.length > 0);

  return (
    <GameDialog>
      <GameDialogTitle>Gegner-Karte entfernen</GameDialogTitle>
      <p style={{ margin: '0 0 1rem', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
        Wähle eine Portal-Karte eines Gegners zum Entfernen:
      </p>

      {opponentsWithCards.map(opponent => (
        <div key={opponent.id} style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
            {opponent.name}
          </p>
          <div className="game-dialog-card-grid">
            {opponent.portal.map(entry => (
              <button
                key={entry.id}
                className="game-dialog-card-btn"
                onClick={() => onDiscard(opponent.id, entry.id)}
              >
                <img
                  src={`/assets/${encodeURIComponent(entry.card.imageName)}`}
                  alt={entry.card.name}
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </GameDialog>
  );
}
