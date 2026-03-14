import { useState } from 'react';
import '../styles/Components.css';

interface GameStartScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

export function GameStartScreen({ onStartGame }: GameStartScreenProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>([...DEFAULT_NAMES]);
  const [errors, setErrors] = useState<string[]>([]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = [...playerNames];
    while (newNames.length < count) {
      newNames.push(`Player ${newNames.length + 1}`);
    }
    setPlayerNames(newNames.slice(0, count));
    setErrors([]);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const validateAndStart = () => {
    const newErrors: string[] = [];

    if (playerCount < 2 || playerCount > 4) {
      newErrors.push('You must have 2-4 players');
    }

    playerNames.forEach((name, idx) => {
      if (!name.trim()) {
        newErrors.push(`Player ${idx + 1} name is required`);
      }
      if (name.length > 20) {
        newErrors.push(`Player ${idx + 1} name must be ≤ 20 characters`);
      }
    });

    const uniqueNames = new Set(playerNames.map((n) => n.trim().toLowerCase()));
    if (uniqueNames.size !== playerNames.length) {
      newErrors.push('Player names must be unique');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onStartGame(playerNames.map((n) => n.trim()));
  };

  return (
    <div className="start-screen">
      <div className="start-container">
        <div className="start-header">
          <h1 className="start-title">🎭 Portale von Molthar</h1>
          <p className="start-subtitle">A Game of Strategy and Fortune</p>
        </div>

        <div className="start-form" role="form" aria-label="Game setup form">
          {/* Player Count Selection */}
          <div className="form-section">
            <label htmlFor="player-count" className="form-label">Number of Players:</label>
            <div className="player-count-selector" role="group" aria-label="Select number of players">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  id={`player-count-${count}`}
                  className={`count-btn ${playerCount === count ? 'active' : ''}`}
                  onClick={() => handlePlayerCountChange(count)}
                  aria-pressed={playerCount === count}
                  aria-label={`Select ${count} players`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Player Names */}
          <div className="form-section">
            <label className="form-label">Player Names:</label>
            <div className="player-names-grid">
              {playerNames.map((name, idx) => (
                <input
                  key={idx}
                  id={`player-name-${idx}`}
                  type="text"
                  className="player-name-input"
                  value={name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1}`}
                  maxLength={20}
                  aria-label={`Player ${idx + 1} name`}
                  aria-describedby={errors.some(e => e.includes(`Player ${idx + 1}`)) ? `error-player-${idx}` : undefined}
                />
              ))}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="error-section" role="alert" aria-live="polite">
              {errors.map((error, idx) => (
                <div key={idx} className="error-item" id={`error-${idx}`}>
                  ⚠️ {error}
                </div>
              ))}
            </div>
          )}

          {/* Start Button */}
          <button
            className="btn btn-large btn-success"
            onClick={validateAndStart}
            data-action="confirm"
            aria-label="Start the game"
          >
            🎲 Start Game
          </button>
        </div>

        {/* Game Info */}
        <div className="start-info">
          <h3 className="info-title">How to Play</h3>
          <ul className="info-list">
            <li>Take pearl cards or place character cards (3 actions per turn)</li>
            <li>Activate characters to earn power points using your pearls</li>
            <li>First to 12 power points triggers the final round</li>
            <li>Win by having the most power points at the end</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
