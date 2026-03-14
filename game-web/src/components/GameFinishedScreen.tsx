import type { IGameState } from '../lib/types';
import { getWinnerInfo, formatWinnerAnnouncement } from '../game/engine/finalRound';
import '../styles/Components.css';

interface GameFinishedScreenProps {
  gameState: IGameState;
  onPlayAgain: () => void;
}

export function GameFinishedScreen({
  gameState,
  onPlayAgain,
}: GameFinishedScreenProps) {
  const winnerInfo = getWinnerInfo(gameState);
  const announcement = formatWinnerAnnouncement(gameState);

  // Sort players by power points (descending) then diamonds (descending)
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (b.portal.powerPoints !== a.portal.powerPoints) {
      return b.portal.powerPoints - a.portal.powerPoints;
    }
    return b.portal.diamonds - a.portal.diamonds;
  });

  return (
    <div className="game-finished-screen">
      <div className="finished-container">
        <div className="finished-header">
          <h1 className="finished-title">🎊 Game Over! 🎊</h1>
          <p className="finished-announcement">{announcement}</p>
        </div>

        {/* Winner Info */}
        {winnerInfo && (
          <div className="winner-card">
            <div className="winner-badge">👑</div>
            <h2 className="winner-name">{winnerInfo.playerName}</h2>
            <div className="winner-stats">
              <div className="stat">
                <span className="stat-label">Power Points</span>
                <span className="stat-value">⚡{winnerInfo.powerPoints}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Diamonds</span>
                <span className="stat-value">💎{winnerInfo.diamonds}</span>
              </div>
            </div>
          </div>
        )}

        {/* Final Standings */}
        <div className="final-standings">
          <h3 className="standings-title">Final Standings</h3>
          <div className="standings-table">
            {sortedPlayers.map((player, idx) => (
              <div key={player.id} className={`standing-row ${idx === 0 ? 'winner' : ''}`}>
                <div className="standing-rank">
                  {idx === 0 && '🥇'}
                  {idx === 1 && '🥈'}
                  {idx === 2 && '🥉'}
                  {idx >= 3 && `#${idx + 1}`}
                </div>
                <div className="standing-name">{player.name}</div>
                <div className="standing-stats">
                  <span className="standing-stat">⚡{player.portal.powerPoints}</span>
                  <span className="standing-stat">💎{player.portal.diamonds}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          className="btn btn-large btn-success"
          onClick={onPlayAgain}
        >
          🎲 Play Again
        </button>
      </div>
    </div>
  );
}
