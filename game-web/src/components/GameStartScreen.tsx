import { useState } from 'react';
import '../styles/Components.css';

interface GameStartScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

export function GameStartScreen({ onStartGame }: GameStartScreenProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const updated = Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
    setPlayerNames(updated);
  };

  const handleStartGame = () => {
    if (playerNames.some((name) => !name.trim())) {
      alert('All player names must be filled in');
      return;
    }
    onStartGame(playerNames);
  };

  return (
    <div className="game-start-screen">
      <div className="start-container">
        <h1 className="game-title">🎮 Portale von Molthar</h1>
        <p className="subtitle">Web Edition</p>

        <div className="form-section">
          <label className="form-label">Number of Players:</label>
          <div className="player-count-buttons">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                className={`btn-count ${playerCount === count ? 'active' : ''}`}
                onClick={() => handlePlayerCountChange(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Player Names:</label>
          {playerNames.map((name, idx) => (
            <input
              key={idx}
              type="text"
              className="player-name-input"
              placeholder={`Player ${idx + 1}`}
              value={name}
              onChange={(e) => handleNameChange(idx, e.target.value)}
            />
          ))}
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
