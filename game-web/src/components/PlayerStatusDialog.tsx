import type { PlayerState } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';
import { getAbilityDisplay } from '../lib/abilityDisplayMap';
import { useTranslation } from '../i18n/useTranslation';

interface PlayerStatusDialogProps {
  playerState: PlayerState;
  playerName?: string;
  onClose: () => void;
}

export function PlayerStatusDialog({ playerState, playerName, onClose }: PlayerStatusDialogProps) {
  const { t } = useTranslation();
  const blueAbilities = playerState.activeAbilities.filter(a => a.persistent);
  const displayName = playerName ?? playerState.name;

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>{displayName}</GameDialogTitle>
      <div style={{ display: 'flex', gap: 24, marginBottom: 12, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fde68a' }}>
            {playerState.powerPoints}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{t('player.points')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#67e8f9' }}>
            💎 {playerState.diamonds}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{t('player.diamonds')}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
          {t('player.activeAbilities')}
        </div>
        {blueAbilities.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
            {t('player.noAbilities')}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {blueAbilities.map((ability, i) => {
              const display = getAbilityDisplay(ability.type);
              return (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#e2e8f0' }}>
                  <span style={{ fontSize: '0.9rem', minWidth: 28, textAlign: 'center' }}>{display.symbol}</span>
                  <span>{t(display.nameKey)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </GameDialog>
  );
}
