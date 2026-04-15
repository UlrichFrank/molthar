import type { Match } from './useLobbyClient';
import { useTranslation } from '../i18n/useTranslation';

interface MatchListProps {
  matches: Match[];
  loadingMatches: boolean;
  playerNameSet: boolean;
  onRefresh: () => void;
  onJoin: (match: Match) => void;
}

function formatMatchTime(createdAt: number): string {
  const d = new Date(createdAt);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;

  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
  return `${date} ${time}`;
}

export function MatchList({ matches, loadingMatches, playerNameSet, onRefresh, onJoin }: MatchListProps) {
  const { t } = useTranslation();
  return (
    <div className="lobby-section">
      <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{t('matches.title')}</span>
        <button
          className="match-join-btn"
          onClick={onRefresh}
          disabled={loadingMatches}
          title={t('matches.title')}
        >
          {loadingMatches ? '⏳' : '🔄'}
        </button>
      </h2>
      {matches.length === 0 ? (
        <p className="no-matches">{t('matches.noMatches')}</p>
      ) : (
        <ul className="match-list">
          {matches.map((match) => {
            const joined = match.players.filter(p => p.name !== undefined).length;
            const total = match.players.length;
            const creatorName = match.players[0]?.name;
            // Participants = everyone except slot 0 (creator)
            const otherPlayers = match.players.slice(1);

            return (
              <li key={match.matchID} className="match-item">
                <div className="match-item-info">
                  <div className="match-item-header">
                    {match.createdAt != null && (
                      <span className="match-time">🕐 {formatMatchTime(match.createdAt)}</span>
                    )}
                    <span className="match-players">👥 {joined}/{total}</span>
                    {match.setupData?.withSpecialCards && (
                      <span className="match-mode-badge">{t('lobby.modeSpecial')}</span>
                    )}
                  </div>
                  {creatorName && (
                    <div className="match-creator">
                      {t('matches.creator')}: <strong>{creatorName}</strong>
                    </div>
                  )}
                  {otherPlayers.length > 0 && (
                    <table className="match-player-table">
                      <tbody>
                        {otherPlayers.map((p) => (
                          <tr key={p.id}>
                            <td>{p.id + 1}</td>
                            <td className={p.name ? undefined : 'match-slot-empty'}>
                              {p.name ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <button
                  className="match-join-btn"
                  onClick={() => onJoin(match)}
                  disabled={!playerNameSet}
                >
                  {t('matches.join')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
