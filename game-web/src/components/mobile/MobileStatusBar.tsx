import { useMemo, useState } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import { useTranslation } from '../../i18n/useTranslation';

interface MobileStatusBarProps {
  G: GameState;
  myPlayerID: string;
  activePlayerID: string;
  actionCount: number;
  maxActions: number;
  resolvePlayerName: (pid: string, fallback: string) => string;
  /** Task 6.8: opens the tapped opponent's portal/activated-characters sheet. */
  onOpenOpponentDetail: (playerId: string) => void;
}

const AVATAR_COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc'];

/**
 * Task 3.1-3.5/D4: "Variante C" — fixed player order (own player first), exactly
 * one expanded detail box, the rest compact avatars. Tapping an avatar moves the
 * detail box to that player's fixed slot without reordering anyone.
 */
export function MobileStatusBar({ G, myPlayerID, activePlayerID, actionCount, maxActions, resolvePlayerName, onOpenOpponentDetail }: MobileStatusBarProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string>(myPlayerID);

  const order = useMemo(() => {
    const playerOrder = G.playerOrder || Object.keys(G.players || {});
    const myIdx = playerOrder.indexOf(myPlayerID);
    return myIdx >= 0 ? [...playerOrder.slice(myIdx), ...playerOrder.slice(0, myIdx)] : playerOrder;
  }, [G.playerOrder, G.players, myPlayerID]);

  const ranks = useMemo(() => {
    const sorted = [...order].sort((a, b) => (G.players?.[b]?.powerPoints ?? 0) - (G.players?.[a]?.powerPoints ?? 0));
    const rankMap: Record<string, number> = {};
    sorted.forEach((id, i) => { rankMap[id] = i + 1; });
    return rankMap;
  }, [order, G.players]);

  const currentExpanded = order.includes(expandedId) ? expandedId : myPlayerID;

  return (
    <div className="mobile-status-bar">
      {order.map(pid => {
        const player = G.players?.[pid];
        if (!player) return null;
        const isOwn = pid === myPlayerID;
        const isTurn = pid === activePlayerID;
        const name = resolvePlayerName(pid, player.name);
        const initial = name.charAt(0).toUpperCase() || '?';

        if (pid === currentExpanded) {
          return (
            <div
              key={pid}
              data-testid="mobile-status-detail"
              role={isOwn ? undefined : 'button'}
              tabIndex={isOwn ? undefined : 0}
              onClick={isOwn ? undefined : () => onOpenOpponentDetail(pid)}
              className={
                'mobile-status-detail'
                + (isOwn ? ' mobile-status-detail--own' : '')
                + (isTurn ? ' mobile-status-detail--turn' : '')
              }
              style={isOwn ? undefined : { cursor: 'pointer' }}
              title={isOwn ? undefined : t('mobile.viewOpponentDetail')}
            >
              <span className="mobile-status-detail-name">{initial}. {name}</span>
              <span className="mobile-status-detail-stat" style={{ color: '#94a3b8' }}>
                {t('mobile.rank', { rank: ranks[pid] ?? 1, total: order.length })}
              </span>
              <span className="mobile-status-detail-stat" style={{ color: '#fde68a' }}>★{player.powerPoints}</span>
              <span className="mobile-status-detail-stat" style={{ color: '#67e8f9' }}>💎{player.diamondCards?.length ?? 0}</span>
              {isTurn && (
                <span className="mobile-status-detail-actions" style={{ color: '#4ade80' }}>
                  {t('mobile.yourTurnBadge')} {actionCount}/{maxActions}
                </span>
              )}
              {!isOwn && <span className="mobile-status-detail-stat" style={{ color: '#64748b' }}>▸</span>}
            </div>
          );
        }

        return (
          <button
            key={pid}
            type="button"
            data-testid="mobile-status-avatar"
            className={'mobile-status-avatar' + (isOwn ? ' mobile-status-avatar--own' : '')}
            style={{ background: AVATAR_COLORS[((player.colorIndex ?? 1) - 1) % AVATAR_COLORS.length] }}
            onClick={() => setExpandedId(pid)}
            aria-label={name}
          >
            {initial}
            {isTurn && <span className="mobile-status-avatar-turn-dot" />}
            <span className="mobile-status-avatar-points">★{player.powerPoints}</span>
          </button>
        );
      })}
    </div>
  );
}
