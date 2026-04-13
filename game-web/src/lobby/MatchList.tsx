import type { Match } from './useLobbyClient';
import { useTranslation } from '../i18n/useTranslation';

interface MatchListProps {
  matches: Match[];
  loadingMatches: boolean;
  playerNameSet: boolean;
  onRefresh: () => void;
  onJoin: (match: Match) => void;
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
            return (
              <li key={match.matchID} className="match-item">
                <span className="match-id">{match.matchID.slice(0, 8)}…</span>
                <span className="match-players">👥 {joined}/{total}</span>
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
