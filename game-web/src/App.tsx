import type { ComponentType } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { CanvasGameBoard } from './components/CanvasGameBoard';
import './App.css';

const SERVER_URL = 'http://127.0.0.1:3001';

const lobbyClient = new LobbyClient({ server: SERVER_URL });

// Create the boardgame.io client
const PortaleClient = Client({
  game: PortaleVonMolthar,
  board: CanvasGameBoard as unknown as ComponentType<any>,
  numPlayers: 2,
  multiplayer: SocketIO({ server: SERVER_URL }),
  debug: process.env.NODE_ENV === 'development',
});

interface MatchPlayer {
  id: number;
  name?: string;
}

interface Match {
  matchID: string;
  players: MatchPlayer[];
  setupData?: { numPlayers?: number };
}

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
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const { matches: list } = await lobbyClient.listMatches(PortaleVonMolthar.name);
      setMatches((list as Match[]).filter(m =>
        m.players.some(p => p.name === undefined)
      ));
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 3000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const createMatch = async () => {
    if (!playerName.trim()) { setError('Bitte Namen eingeben'); return; }
    setError(null);
    try {
      const { matchID: newMatchID } = await lobbyClient.createMatch(
        PortaleVonMolthar.name,
        { numPlayers }
      );
      await joinMatch(newMatchID, '0');
    } catch (err) {
      console.error('Failed to create match:', err);
      setError('Spiel konnte nicht erstellt werden. Läuft der Server auf Port 3001?');
    }
  };

  const joinMatch = async (id: string, playerId: string) => {
    if (!playerName.trim()) { setError('Bitte Namen eingeben'); return; }
    setError(null);
    try {
      const { playerCredentials } = await lobbyClient.joinMatch(
        PortaleVonMolthar.name,
        id,
        {
          playerID: playerId,
          playerName: playerName || `Player ${parseInt(playerId) + 1}`,
        }
      );
      setCredentials(playerCredentials);
      setPlayerID(playerId);
      setMatchID(id);
      setIsInGame(true);
    } catch (err) {
      console.error('Failed to join match:', err);
      setError('Beitreten fehlgeschlagen. Ist der Platz noch frei?');
    }
  };

  const handleJoinMatch = (match: Match) => {
    const freeSlot = match.players.find(p => p.name === undefined);
    if (!freeSlot) { setError('Kein freier Platz in diesem Spiel'); return; }
    joinMatch(match.matchID, String(freeSlot.id));
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
            loadMatches();
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

      {error && <div className="lobby-error">⚠️ {error}</div>}

      <div className="lobby-section">
        <h2>Dein Name</h2>
        <input
          type="text"
          placeholder="Name eingeben"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className="lobby-section">
        <h2>Neues Spiel erstellen</h2>
        <div className="form-group">
          <label>Spieleranzahl:</label>
          <select value={numPlayers} onChange={(e) => setNumPlayers(parseInt(e.target.value))}>
            <option value={2}>2 Spieler</option>
            <option value={3}>3 Spieler</option>
            <option value={4}>4 Spieler</option>
            <option value={5}>5 Spieler</option>
          </select>
        </div>
        <button onClick={createMatch} disabled={!playerName.trim()}>Spiel erstellen</button>
      </div>

      <div className="lobby-section">
        <h2>
          Offene Spiele
          <button
            className="refresh-btn"
            onClick={loadMatches}
            disabled={loadingMatches}
            title="Aktualisieren"
          >
            {loadingMatches ? '⏳' : '🔄'}
          </button>
        </h2>
        {matches.length === 0 ? (
          <p className="no-matches">Keine offenen Spiele vorhanden.</p>
        ) : (
          <ul className="match-list">
            {matches.map((match) => {
              const joined = match.players.filter(p => p.name !== undefined).length;
              const total = match.players.length;
              return (
                <li key={match.matchID} className="match-item">
                  <span className="match-id">{match.matchID.slice(0, 8)}…</span>
                  <span className="match-players">👥 {joined}/{total}</span>
                  <button
                    onClick={() => handleJoinMatch(match)}
                    disabled={!playerName.trim()}
                  >
                    Beitreten
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  return <LobbyScreen />;
}

export default App;
