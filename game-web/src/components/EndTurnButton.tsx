interface EndTurnButtonProps {
  isActive: boolean;
  actionCount: number;
  maxActions: number;
  onEndTurn: () => void;
}

export function EndTurnButton({ isActive, actionCount, maxActions, onEndTurn }: EndTurnButtonProps) {
  if (!isActive || actionCount < maxActions) return null;

  return (
    <button
      onClick={onEndTurn}
      style={{
        background: 'rgba(239, 68, 68, 0.9)',
        border: '2px solid #ef4444',
        borderRadius: 8,
        padding: '6px 18px',
        color: '#ffffff',
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
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 0.95)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.9)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
      }}
    >
      Zug beenden
    </button>
  );
}
