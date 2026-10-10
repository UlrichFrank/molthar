import { useMemo } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import { useTranslation } from '../../i18n/useTranslation';
import { AVATAR_COLORS } from './avatarColors';

interface MobileStatusBarProps {
  G: GameState;
  myPlayerID: string;
  activePlayerID: string;
  actionCount: number;
  maxActions: number;
  resolvePlayerName: (pid: string, fallback: string) => string;
}


/**
 * Own status only (name, rank, points, diamonds, actions). Opponents are always
 * visible in `OpponentStrip` below, so nothing has to be tapped open to see them.
 * The right edge stays free for the fixed icon buttons (App.css .in-game-actions).
 */
export function MobileStatusBar({ G, myPlayerID, activePlayerID, actionCount, maxActions, resolvePlayerName }: MobileStatusBarProps) {
  const { t } = useTranslation();
  const player = G.players?.[myPlayerID];

  const rank = useMemo(() => {
    const mine = player?.powerPoints ?? 0;
    return 1 + Object.values(G.players ?? {}).filter(p => p && p.powerPoints > mine).length;
  }, [G.players, player?.powerPoints]);

  if (!player) return <div className="mobile-status-bar" />;
  const total = (G.playerOrder || Object.keys(G.players || {})).length;
  const isTurn = myPlayerID === activePlayerID;
  const name = resolvePlayerName(myPlayerID, player.name);
  const color = AVATAR_COLORS[((player.colorIndex ?? 1) - 1) % AVATAR_COLORS.length];

  return (
    <div className="mobile-status-bar">
      <div
        data-testid="mobile-status-detail"
        className={'mobile-status-detail mobile-status-detail--own' + (isTurn ? ' mobile-status-detail--turn' : '')}
      >
        <span className="mobile-status-detail-circle" style={{ background: color }}>{name.charAt(0).toUpperCase() || '?'}</span>
        <span className="mobile-status-detail-name">{name}</span>
        {isTurn && <span className="mobile-status-turn-badge">{t('mobile.yourTurnBadge')}</span>}
        <span className="mobile-status-detail-rank">{t('mobile.rank', { rank, total })}</span>
        <span className="mobile-status-detail-points">★{player.powerPoints}</span>
        <span className="mobile-status-detail-diamonds">💎{player.diamondCards?.length ?? 0}</span>
        {isTurn && (
          <span className="mobile-status-detail-actions" title={t('mobile.actionsLabel')}>
            {actionCount}/{maxActions}
          </span>
        )}
      </div>
    </div>
  );
}
