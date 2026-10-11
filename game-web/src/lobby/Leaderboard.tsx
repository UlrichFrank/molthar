import { useEffect, useState } from 'react';
import { SERVER_URL } from './useLobbyClient';
import { useTranslation } from '../i18n/useTranslation';

interface Entry {
  name: string;
  games: number;
  wins: number;
  points: number;
  diamonds: number;
  best: number;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`${SERVER_URL}/leaderboard`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((list: Entry[]) => setEntries(list))
      .catch(() => setFailed(true));
  }, []);

  return (
    <section className="lb-panel">
      <h2 className="lb-panel-title">{t('lobby.leaderboard')}</h2>
      {failed && <p className="lb-error">{t('lobby.leaderboardFailed')}</p>}
      {entries && entries.length === 0 && <p>{t('lobby.leaderboardEmpty')}</p>}
      {entries && entries.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ opacity: 0.7 }}>
              <th style={{ textAlign: 'left' }}>#</th>
              <th style={{ textAlign: 'left' }}>{t('endgame.player')}</th>
              <th>{t('lobby.lbWins')}</th>
              <th>{t('lobby.lbGames')}</th>
              <th>Ø {t('endgame.points')}</th>
              <th>{t('lobby.lbBest')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 20).map((e, i) => (
              <tr key={e.name} style={{ textAlign: 'center' }}>
                <td style={{ textAlign: 'left' }}>{i + 1}</td>
                <td style={{ textAlign: 'left' }}>{e.name}</td>
                <td>{e.wins}</td>
                <td>{e.games}</td>
                <td>{(e.points / e.games).toFixed(1)}</td>
                <td>{e.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
