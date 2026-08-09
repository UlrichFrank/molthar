import { GameDialog } from './GameDialog';
import { useTranslation } from '../i18n/useTranslation';

interface PlayerDisconnectDialogProps {
  playerName: string;
}

export function PlayerDisconnectDialog({ playerName }: PlayerDisconnectDialogProps) {
  const { t } = useTranslation();
  return (
    <GameDialog>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>
          ⏳
        </div>
        <div style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 600 }}>
          {t('disconnect.waiting', { name: playerName })}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
          {t('disconnect.connectionLost')}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </GameDialog>
  );
}
