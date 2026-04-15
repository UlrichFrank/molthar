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
      <h2>
        {t('matches.title')}
        <button
          className="refresh-btn"
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
            const participantNames = match.players
              .filter(p => p.name !== undefined)
              .map(p => p.name)
              .join(', ');

            return (
              <li key={match.matchID} className="match-item">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {match.createdAt != null && (
                      <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem' }}>
                        🕐 {formatMatchTime(match.createdAt)}
                      </span>
                    )}
                    <span className="match-players">👥 {joined}/{total}</span>
                  </div>
                  {creatorName && (
                    <span style={{ fontSize: '0.82rem', color: 'rgba(203,213,225,0.85)' }}>
                      {t('matches.creator')}: <strong>{creatorName}</strong>
                    </span>
                  )}
                  {participantNames && (
                    <span style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.7)' }}>
                      {t('matches.participants')}: {participantNames}
                    </span>
                  )}
                </div>
                <button onClick={() => onJoin(match)} disabled={!playerNameSet}>
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
