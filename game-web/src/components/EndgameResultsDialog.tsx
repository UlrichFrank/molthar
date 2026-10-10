import React, { useState, useEffect } from 'react';
import { GameDialog } from './GameDialog';
import { useTranslation } from '../i18n/useTranslation';

interface RankingEntry {
  playerId: string;
  name: string;
  powerPoints: number;
  diamonds: number;
}

interface EndgameResultsDialogProps {
  ranking: RankingEntry[];
  myPlayerId: string;
  reason?: string;
}

const RANK_LABELS = ['🥇', '🥈', '🥉'];
const COUNTDOWN_SECONDS = 30;

export function EndgameResultsDialog({ ranking, myPlayerId, reason }: EndgameResultsDialogProps) {
  const { t } = useTranslation();
  const terminated = reason === 'terminated';
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          window.dispatchEvent(new CustomEvent('pvm:gameOver'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLeave = () => {
    window.dispatchEvent(new CustomEvent('pvm:gameOver'));
  };

  // Detect tie at top: ranking[0] and ranking[1] have identical scores
  const isTie =
    ranking.length >= 2 &&
    ranking[0].powerPoints === ranking[1].powerPoints &&
    ranking[0].diamonds === ranking[1].diamonds;

  return (
    <GameDialog>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ margin: 0, color: '#f6ecce', fontSize: '1.4rem', textAlign: 'center' }}>
          {t('endgame.title')}
        </h2>

        {terminated && (
          <p style={{ margin: 0, color: '#c9bb94', fontSize: '0.875rem', textAlign: 'center' }}>
            {t('endgame.terminated')}
          </p>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
              <th style={thStyle}>{t('endgame.rank')}</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>{t('endgame.player')}</th>
              <th style={thStyle}>{t('endgame.points')}</th>
              <th style={thStyle}>💎</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => {
              const isWinner = !terminated && (i === 0 || (isTie && i === 1));
              const isMe = p.playerId === myPlayerId;
              return (
                <tr key={p.playerId} style={{
                  background: isWinner ? 'rgba(161,130,0,0.12)' : 'transparent',
                  borderBottom: '1px solid #1e293b',
                }}>
                  <td style={{ ...tdStyle, textAlign: 'center', fontSize: '1.1rem' }}>
                    {RANK_LABELS[i] ?? `${i + 1}.`}
                  </td>
                  <td style={{ ...tdStyle, color: isWinner ? '#e2b23c' : '#f6ecce', fontWeight: isWinner ? 700 : 400 }}>
                    {p.name}
                    {isMe && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#c9bb94' }}>{t('endgame.me')}</span>}
                    {isWinner && !terminated && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#fbbf24' }}>★</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#f6ecce', fontWeight: 600 }}>
                    {p.powerPoints}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#67e8f9' }}>
                    {p.diamonds}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleLeave}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#6b2418', border: '1px solid #d96a5b',
              borderRadius: 8, color: '#f6ecce', fontSize: '0.95rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t('endgame.backToLobby')}
          </button>
          <span style={{ color: '#a89a72', fontSize: '0.8rem' }}>
            {t('endgame.autoLeave', { countdown })}
          </span>
        </div>
      </div>
    </GameDialog>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem', color: '#a89a72',
  fontSize: '0.75rem', fontWeight: 600, textAlign: 'center',
};
const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.6rem', fontSize: '0.9rem',
};
