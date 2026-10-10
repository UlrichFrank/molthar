import { useTranslation } from '../i18n/useTranslation';

interface EndTurnButtonProps {
  isActive: boolean;
  actionCount: number;
  maxActions: number;
  onEndTurn: () => void;
}

export function EndTurnButton({ isActive, actionCount, maxActions, onEndTurn }: EndTurnButtonProps) {
  const { t } = useTranslation();
  if (!isActive || actionCount < maxActions) return null;

  return (
    <button
      onClick={onEndTurn}
      style={{
        background: 'linear-gradient(180deg, #a8392b, #8c2a1e)',
        border: '1px solid #d96a5b',
        borderRadius: 8,
        padding: '6px 18px',
        color: '#f6ecce',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
        transition: 'background 0.15s, border-color 0.15s',
        marginTop: 4,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.filter = '';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
      }}
    >
      {t('game.endTurn')}
    </button>
  );
}
