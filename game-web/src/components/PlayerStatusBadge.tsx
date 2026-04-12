import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { PlayerState } from '@portale-von-molthar/shared';
import { getAbilityDisplay } from '../lib/abilityDisplayMap';
import { PlayerStatusDialog } from './PlayerStatusDialog';

interface PlayerStatusBadgeProps {
  playerState: PlayerState;
  playerName?: string;
  actionCount?: number;
  maxActions?: number;
}

function getActionColor(actionCount: number, maxActions: number): { color: string; textColor?: string } {
  const remaining = maxActions - actionCount;
  if (remaining > 1) return { color: '#22c55e' };
  if (remaining === 1) return { color: '#facc15', textColor: '#000' };
  return { color: '#ef4444' };
}

export function PlayerStatusBadge({ playerState, playerName, actionCount, maxActions }: PlayerStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const blueAbilities = playerState.activeAbilities.filter(a => a.persistent);
  const visibleAbilities = blueAbilities.slice(0, 5);
  const extraCount = blueAbilities.length - visibleAbilities.length;

  const showActionCounter = actionCount !== undefined && maxActions !== undefined;
  const actionColors = showActionCounter ? getActionColor(actionCount!, maxActions!) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          borderRadius: 6,
          padding: '4px 8px',
          color: '#e2e8f0',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
          transition: 'background 0.15s, border-color 0.15s',
          maxWidth: 220,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30, 41, 59, 0.95)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148, 163, 184, 0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15, 23, 42, 0.88)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148, 163, 184, 0.35)';
        }}
      >
        {playerName && (
          <span style={{
            fontSize: '0.7rem',
            color: '#cbd5e1',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            width: '100%',
            textAlign: 'center',
          }}>
            {playerName}
          </span>
        )}

        <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#fde68a' }}>★ {playerState.powerPoints}</span>
          <span style={{ color: 'rgba(148,163,184,0.5)' }}>|</span>
          <span style={{ color: '#67e8f9' }}>💎 {playerState.diamonds}</span>

          {showActionCounter && actionColors && (
            <>
              <span style={{ color: 'rgba(148,163,184,0.5)' }}>|</span>
              <span
                data-testid="action-counter"
                data-action-color={actionColors.color}
                style={{ color: actionColors.textColor ?? actionColors.color, fontWeight: 700 }}
              >
                {actionCount}/{maxActions}
              </span>
            </>
          )}

          {visibleAbilities.length > 0 && (
            <>
              <span style={{ color: 'rgba(148,163,184,0.5)' }}>|</span>
              <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {visibleAbilities.map((ability, i) => (
                  <span key={i} title={getAbilityDisplay(ability.type).name} style={{ fontSize: '0.7rem' }}>
                    {getAbilityDisplay(ability.type).symbol}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>+{extraCount}</span>
                )}
              </span>
            </>
          )}
        </span>
      </button>

      {isOpen && createPortal(
        <PlayerStatusDialog
          playerState={playerState}
          playerName={playerName}
          onClose={() => setIsOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
