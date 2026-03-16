import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { Board } from './components/Board';
import './App.css';

/**
 * boardgame.io React Client for Portale von Molthar
 * 
 * This replaces the custom client with proper boardgame.io integration:
 * - Automatic state synchronization
 * - Built-in move handling
 * - Socket.IO multiplayer
 * - Lobby integration
 */

// Create the boardgame.io client
const PortaleClient = Client({
  game: PortaleVonMolthar,
  board: Board,
  numPlayers: 2,
  multiplayer: SocketIO({ server: 'http://localhost:3001' }),
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Lobby Component for creating/joining games
 */
function LobbyScreen() {
  const [playerName, setPlayerName] = useState('');
  const [matchID, setMatchID] = useState('');
  const [playerID, setPlayerID] = useState<string>('0');
  const [credentials, setCredentials] = useState('');
  const [isInGame, setIsInGame] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);

  const createMatch = async () => {
    try {
      const response = await fetch('http://localhost:3001/games/portale-von-molthar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numPlayers }),
      });
      
      const data = await response.json();
      setMatchID(data.matchID);
      
      // Join as player 0
      await joinMatch(data.matchID, '0');
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('Failed to create game. Make sure the server is running on port 3001.');
    }
  };

  const joinMatch = async (matchId: string, playerId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/games/portale-von-molthar/${matchId}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerID: playerId,
            playerName: playerName || `Player ${parseInt(playerId) + 1}`,
          }),
        }
      );

      const data = await response.json();
      setCredentials(data.playerCredentials);
      setPlayerID(playerId);
      setMatchID(matchId);
      setIsInGame(true);
    } catch (error) {
      console.error('Failed to join match:', error);
      alert('Failed to join game. Check the match ID.');
    }
  };

  const handleJoinExisting = () => {
    if (!matchID || playerID === undefined) {
      alert('Please enter match ID and player ID');
      return;
    }
    joinMatch(matchID, playerID);
  };

  if (isInGame) {
    return (
      <div className="game-container">
        <PortaleClient
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}
        />
        <button
          className="leave-game-btn"
          onClick={() => {
            setIsInGame(false);
            setMatchID('');
            setCredentials('');
          }}
        >
          Leave Game
        </button>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <h1>Portale von Molthar</h1>
      
      <div className="lobby-section">
        <h2>Player Name</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className="lobby-section">
        <h2>Create New Game</h2>
        <div className="form-group">
          <label>Number of Players:</label>
          <select value={numPlayers} onChange={(e) => setNumPlayers(parseInt(e.target.value))}>
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
            <option value={5}>5 Players</option>
          </select>
        </div>
        <button onClick={createMatch}>Create Game</button>
      </div>

      <div className="lobby-section">
        <h2>Join Existing Game</h2>
        <div className="form-group">
          <label>Match ID:</label>
          <input
            type="text"
            placeholder="Enter match ID"
            value={matchID}
            onChange={(e) => setMatchID(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Player Slot:</label>
          <select value={playerID} onChange={(e) => setPlayerID(e.target.value)}>
            <option value="0">Player 1</option>
            <option value="1">Player 2</option>
            <option value="2">Player 3</option>
            <option value="3">Player 4</option>
            <option value="4">Player 5</option>
          </select>
        </div>
        <button onClick={handleJoinExisting}>Join Game</button>
      </div>
    </div>
  );
}

function App() {
  return <LobbyScreen />;
}

export default App;
