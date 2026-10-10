import type { Match } from './useLobbyClient';
import { useTranslation } from '../i18n/useTranslation';

interface MatchListProps {
  matches: Match[];
  loadingMatches: boolean;
  /** The last poll failed — the list below is stale, not necessarily empty. */
  loadFailed: boolean;
  playerNameSet: boolean;
  onRefresh: () => void;
  onJoin: (match: Match) => void;
}

export function MatchList({ matches, loadingMatches, loadFailed, playerNameSet, onRefresh, onJoin }: MatchListProps) {
  const { t } = useTranslation();
  return (
    <section className="lb-panel">
      <div className="lb-panel-head">
        <h2>{t('lobby.openTables')}</h2>
        <button className="lb-link" onClick={onRefresh} disabled={loadingMatches}>
          {loadingMatches ? '…' : '↻'}
        </button>
      </div>
      {loadFailed ? (
        <p className="lb-error lb-error--inline">{t('matches.loadFailed')}</p>
      ) : matches.length === 0 ? (
        <p className="lb-empty">{t('matches.noMatches')}</p>
      ) : (
        <ul className="lb-tables">
          {matches.map((match) => {
            const joined = match.players.filter(p => p.name !== undefined).length;
            const npcNames = new Map((match.setupData?.npcSlots ?? []).map(s => [s.playerIndex, s.name]));
            const seats = match.players
              .map(p => p.name ?? npcNames.get(p.id) ?? t('waiting.free'))
              .join(', ');
            return (
              <li key={match.matchID} className="lb-table">
                <div className="lb-table-info">
                  <div className="lb-table-title">
                    {t('matches.creator')} {match.players[0]?.name ?? '?'}
                    {match.setupData?.withSpecialCards && (
                      <span className="lb-badge">{t('lobby.modeSpecial')}</span>
                    )}
                  </div>
                  <div className="lb-table-meta">
                    {joined}/{match.players.length} · {seats}
                  </div>
                </div>
                <button className="lb-btn lb-btn--small" onClick={() => onJoin(match)} disabled={!playerNameSet}>
                  {t('matches.join')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
