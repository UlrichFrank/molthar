import type { PlayerState } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';
import { useDialog } from '../contexts/DialogContext';
import { useTranslation } from '../i18n/useTranslation';

interface StealOpponentHandCardDialogProps {
  opponents: PlayerState[];
  onSteal: (targetPlayerId: string, handCardIndex: number) => void;
}

export function StealOpponentHandCardDialog({ opponents, onSteal }: StealOpponentHandCardDialogProps) {
  const { t } = useTranslation();
  const { dialog, selectStealOpponent } = useDialog();
  const selectedPlayerId = dialog.type === 'steal-opponent-hand-card' ? dialog.selectedPlayerId : null;

  const opponentsWithCards = opponents.filter(p => p.hand.length > 0);
  const selectedOpponent = selectedPlayerId ? opponentsWithCards.find(p => p.id === selectedPlayerId) : null;

  return (
    <GameDialog>
      <GameDialogTitle>{t('steal.title')}</GameDialogTitle>

      {selectedOpponent === null || selectedOpponent === undefined ? (
        // Stufe 1: Gegner auswählen
        <div>
          <p style={{ margin: '0 0 1rem', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
            {t('steal.chooseOpponent')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {opponentsWithCards.map(opponent => (
              <button
                key={opponent.id}
                onClick={() => selectStealOpponent(opponent.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  background: 'rgba(30,41,59,0.8)',
                  border: '2px solid #475569',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#f1f5f9',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#475569')}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: opponent.hand.length }).map((_, i) => (
                    <img
                      key={i}
                      src="/assets/Perlenkarte Hinten.png"
                      alt="Karte"
                      style={{ width: 28, height: 40, borderRadius: 3, objectFit: 'cover' }}
                    />
                  ))}
                </div>
                <span>{opponent.name} ({opponent.hand.length} {opponent.hand.length !== 1 ? t('steal.cards') : t('steal.card')})</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Stufe 2: Karte des gewählten Gegners auswählen
        <div>
          <p style={{ margin: '0 0 1rem', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
            {t('steal.chooseCardFrom', { name: selectedOpponent.name })}
          </p>
          <div className="game-dialog-card-grid">
            {selectedOpponent.hand.map((card, idx) => (
              <button
                key={card.id}
                className="game-dialog-card-btn"
                onClick={() => onSteal(selectedOpponent.id, idx)}
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
