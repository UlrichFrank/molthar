import React, { useState, useEffect } from 'react';

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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f1e2e', border: '1px solid #334155',
        borderRadius: 16, padding: '2rem 2.5rem',
        minWidth: 320, maxWidth: 480, width: '90%',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.4rem', textAlign: 'center' }}>
          {terminated ? 'Spiel beendet' : 'Spielende'}
        </h2>

        {terminated && (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center' }}>
            Das Spiel wurde vom Ersteller beendet.
          </p>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
              <th style={thStyle}>Rang</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Spieler</th>
              <th style={thStyle}>Punkte</th>
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
                  <td style={{ ...tdStyle, color: isWinner ? '#fde68a' : '#e2e8f0', fontWeight: isWinner ? 700 : 400 }}>
                    {p.name}
                    {isMe && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#94a3b8' }}>(Du)</span>}
                    {isWinner && !terminated && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#fbbf24' }}>★</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#f1f5f9', fontWeight: 600 }}>
                    {p.powerPoints}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#7dd3fc' }}>
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
              background: '#1e40af', border: '1px solid #3b82f6',
              borderRadius: 8, color: '#e0f2fe', fontSize: '0.95rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Zurück zur Lobby
          </button>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            Automatisch in {countdown}s
          </span>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem', color: '#64748b',
  fontSize: '0.75rem', fontWeight: 600, textAlign: 'center',
};
const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.6rem', fontSize: '0.9rem',
};
