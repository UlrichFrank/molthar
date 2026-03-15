import { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import { PortaleVonMolthar, type GameState } from '@portale-von-molthar/shared';
import { startRoomPolling } from './lib/game-client';
import './App.css';

interface GameConnection {
  roomID: string;
  playerID: string;
  credential: string;
  serverURL: string;
}

interface GameSession {
  connection: GameConnection;
  gameState: GameState | null;
  allPlayers: { id: string; name: string }[];
  roomStatus: 'waiting' | 'playing' | 'finished';
}

export function App() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoomCreated = async (roomID: string, playerID: string, credential: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const serverURL = 'http://localhost:3001';

      // Initialize game state
      const ctx = {
        playOrder: [playerID, ...Array.from({ length: 1 }, (_, i) => String(i + 1))],
        numPlayers: 2,
      };
      
      const initialState = PortaleVonMolthar.setup?.(ctx) as GameState;
      
      // Set player names (will be updated as others join)
      initialState.players[playerID].name = 'You';
      
      const newSession: GameSession = {
        connection: { roomID, playerID, credential, serverURL },
        gameState: initialState,
        allPlayers: [{ id: playerID, name: 'You' }],
        roomStatus: 'waiting',
      };
      
      setSession(newSession);
      
      // Start polling for room updates
      const stopPolling = startRoomPolling(
        serverURL,
        roomID,
        1000,
        (room) => {
          // Update players list
          setSession((prevSession) => {
            if (!prevSession) return null;
            return {
              ...prevSession,
              allPlayers: room.players,
              roomStatus: room.status as 'waiting' | 'playing' | 'finished',
            };
          });
        }
      );
      
      // Store cleanup function (optional, for manual cleanup)
      (window as any).stopRoomPolling = stopPolling;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize game';
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveGame = () => {
    // Stop polling
    if ((window as any).stopRoomPolling) {
      (window as any).stopRoomPolling();
    }
    setSession(null);
    setError(null);
  };

  // Show lobby if not in a game session
  if (!session) {
    return <Lobby onRoomCreated={handleRoomCreated} />;
  }

  // Show board if in a game session
  return (
    <div className="app-container">
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {isConnecting && (
        <div className="loading-overlay">
          <div className="spinner">⏳</div>
          <p>Connecting to game...</p>
        </div>
      )}
      
      {session.gameState && session.roomStatus === 'playing' ? (
        <Board
          G={session.gameState}
          ctx={{
            currentPlayer: session.connection.playerID,
            numPlayers: session.allPlayers.length,
            playOrder: session.allPlayers.map((p) => p.id),
            turn: 0,
          }}
          moves={{}}
          playerID={session.connection.playerID}
          isActive={true}
        />
      ) : (
        <div className="game-loading">
          <h2>Waiting for players...</h2>
          <div className="player-list">
            <h3>Players in room ({session.allPlayers.length})</h3>
            <ul>
              {session.allPlayers.map((p) => (
                <li key={p.id}>{p.name} (ID: {p.id})</li>
              ))}
            </ul>
          </div>
          <p>Room: {session.connection.roomID}</p>
          <button onClick={handleLeaveGame} className="btn btn-secondary">
            Leave Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
