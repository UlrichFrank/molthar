import { useState } from 'react';
import '../styles/lobby.css';

interface LobbyProps {
  gameServer?: string;
  lobbyServer?: string;
}

/**
 * Lobby component
 * Allows players to:
 * - Enter player name
 * - Create or join a game room
 * - Select number of players (2-5)
 * - Choose AI difficulty (if including AI)
 * - Start game when ready
 */
export function Lobby(props: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [includeAI, setIncludeAI] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Integrate with actual boardgame.io server
      // This is a placeholder for the actual implementation
      console.log('Creating room:', {
        playerName,
        numPlayers,
        includeAI,
        aiDifficulty
      });
      
      alert(`Room created! (Implementation pending)`);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="lobby">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>🎮 Portale von Molthar</h1>
          <p className="subtitle">Turn-based card game for 2-5 players</p>
        </div>
        
        <div className="lobby-content">
          {/* Player Setup Section */}
          <div className="setup-section">
            <h2>Create New Game</h2>
            
            {/* Player Name */}
            <div className="form-group">
              <label htmlFor="player-name">Your Name</label>
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                disabled={isLoading}
              />
            </div>
            
            {/* Number of Players */}
            <div className="form-group">
              <label htmlFor="num-players">Number of Players</label>
              <select
                id="num-players"
                value={numPlayers}
                onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                disabled={isLoading}
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={5}>5 Players</option>
              </select>
            </div>
            
            {/* Include AI */}
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={includeAI}
                  onChange={(e) => setIncludeAI(e.target.checked)}
                  disabled={isLoading}
                />
                Include AI Opponent
              </label>
            </div>
            
            {/* AI Difficulty */}
            {includeAI && (
              <div className="form-group">
                <label htmlFor="ai-difficulty">AI Difficulty</label>
                <div className="difficulty-selector">
                  {[
                    { level: 1, name: 'Easy (25%)', desc: 'Conservative' },
                    { level: 2, name: 'Moderate (40%)', desc: 'Aggressive' },
                    { level: 3, name: 'Medium (50%)', desc: 'Balanced' },
                    { level: 4, name: 'Hard (60%)', desc: 'Adaptive' },
                    { level: 5, name: 'Expert (75%)', desc: 'Monte Carlo' }
                  ].map(({ level, name, desc }) => (
                    <button
                      key={level}
                      className={`difficulty-btn ${aiDifficulty === level ? 'selected' : ''}`}
                      onClick={() => setAIDifficulty(level)}
                      disabled={isLoading}
                      title={desc}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="btn btn-primary"
              disabled={!playerName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Game Room'}
            </button>
          </div>
          
          {/* Available Rooms Section */}
          <div className="rooms-section">
            <h2>Available Rooms</h2>
            <p className="no-rooms">No rooms available. Create one above!</p>
          </div>
          
          {/* Game Info */}
          <div className="game-info">
            <h3>Game Rules</h3>
            <ul>
              <li>🎯 Goal: Reach 12+ power points and win the final round</li>
              <li>🎴 Take 3 actions per turn</li>
              <li>💎 Spend pearl cards to activate character cards</li>
              <li>⚡ Gain power points from activated characters</li>
              <li>♻ Swap symbol: Replace all face-up cards when triggered</li>
              <li>🏆 Winner: Most power points after final round</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
