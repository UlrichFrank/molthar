import type { PlayerState } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';
import { CharacterAbilityList } from './CharacterAbilityList';
import { useTranslation } from '../i18n/useTranslation';

interface DiscardOpponentCharacterDialogProps {
  /** Opponents in turn order starting from next player, filtered to those with portal cards */
  opponents: PlayerState[];
  onDiscard: (targetPlayerId: string, portalEntryId: string) => void;
}

export function DiscardOpponentCharacterDialog({ opponents, onDiscard }: DiscardOpponentCharacterDialogProps) {
  const { t } = useTranslation();
  const opponentsWithCards = opponents.filter(p => p.portal.length > 0);

  return (
    <GameDialog>
      <GameDialogTitle>{t('discardOpponent.title')}</GameDialogTitle>
      <p style={{ margin: '0 0 1rem', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
        {t('discardOpponent.description')}
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
                <CharacterAbilityList card={entry.card} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </GameDialog>
  );
}
