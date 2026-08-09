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

/** From 4 players on, the bar switches to the compact size tier (see mobile.css). */
const COMPACT_FROM_PLAYERS = 4;

/**
 * Task 3.1-3.5/D4: "Variante C" — fixed player order (own player first), exactly
 * one expanded detail box, the rest compact avatars. Tapping an avatar moves the
 * detail box to that player's fixed slot without reordering anyone.
 *
 * The detail box is laid out on two internal lines (name + "am Zug" pill / rank,
 * points, diamonds, action counter) so that a full 5-player bar still fits into a
 * single row on a 360px viewport without clipping.
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
  const isCompact = order.length >= COMPACT_FROM_PLAYERS;

  return (
    <div className={'mobile-status-bar' + (isCompact ? ' mobile-status-bar--compact' : '')}>
      {order.map(pid => {
        const player = G.players?.[pid];
        if (!player) return null;
        const isOwn = pid === myPlayerID;
        const isTurn = pid === activePlayerID;
        const name = resolvePlayerName(pid, player.name);
        const initial = name.charAt(0).toUpperCase() || '?';
        const color = AVATAR_COLORS[((player.colorIndex ?? 1) - 1) % AVATAR_COLORS.length];
        const rank = ranks[pid] ?? 1;

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
                + (isOwn ? ' mobile-status-detail--own' : ' mobile-status-detail--tappable')
                + (isTurn ? ' mobile-status-detail--turn' : '')
              }
              title={isOwn ? undefined : t('mobile.viewOpponentDetail')}
            >
              <span className="mobile-status-detail-circle" style={{ background: color }}>{initial}</span>
              <span className="mobile-status-detail-info">
                <span className="mobile-status-detail-line">
                  <span className="mobile-status-detail-name">{name}</span>
                  {isTurn && <span className="mobile-status-turn-badge">{t('mobile.yourTurnBadge')}</span>}
                </span>
                <span className="mobile-status-detail-meta">
                  <span className="mobile-status-detail-rank">
                    {isCompact ? t('mobile.rankShort', { rank }) : t('mobile.rank', { rank, total: order.length })}
                  </span>
                  <span className="mobile-status-detail-points">★{player.powerPoints}</span>
                  <span className="mobile-status-detail-diamonds">💎{player.diamondCards?.length ?? 0}</span>
                  {isTurn && (
                    <span className="mobile-status-detail-actions" title={t('mobile.actionsLabel')}>
                      {actionCount}/{maxActions}
                    </span>
                  )}
                </span>
              </span>
              {!isOwn && <span className="mobile-status-detail-chevron">▸</span>}
            </div>
          );
        }

        return (
          <button
            key={pid}
            type="button"
            data-testid="mobile-status-avatar"
            className={'mobile-status-avatar' + (isOwn ? ' mobile-status-avatar--own' : '')}
            onClick={() => setExpandedId(pid)}
            aria-label={name}
          >
            <span className="mobile-status-avatar-circle" style={{ background: color }}>
              {initial}
              {isTurn && <span className="mobile-status-avatar-turn-dot" />}
            </span>
            <span className="mobile-status-avatar-points">★{player.powerPoints}</span>
          </button>
        );
      })}
    </div>
  );
}
