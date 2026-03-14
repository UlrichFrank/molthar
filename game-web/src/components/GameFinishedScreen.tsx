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

  return (
    <div className="game-finished-screen">
      <div className="finished-container">
        <h1 className="finished-title">🎊 Game Over! 🎊</h1>

        {winnerInfo && (
          <div className="winner-section">
            <h2 className="winner-name">🏆 {winnerInfo.playerName} Wins! 🏆</h2>
            <p className="winner-announcement">{announcement}</p>
          </div>
        )}

        <div className="final-standings">
          <h3 className="standings-title">Final Standings</h3>
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Power</th>
                <th>Diamonds</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players
                .map((player, idx) => ({
                  index: idx,
                  name: player.name,
                  power: player.portal.powerPoints,
                  diamonds: player.portal.diamonds,
                }))
                .sort((a, b) => {
                  if (b.power !== a.power) return b.power - a.power;
                  return b.diamonds - a.diamonds;
                })
                .map((entry, rank) => (
                  <tr
                    key={entry.index}
                    className={rank === 0 ? 'winner-row' : ''}
                  >
                    <td>#{rank + 1}</td>
                    <td>{entry.name}</td>
                    <td>⚡{entry.power}</td>
                    <td>💎{entry.diamonds}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
