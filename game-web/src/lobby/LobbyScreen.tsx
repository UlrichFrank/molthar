import { useState, useEffect, useCallback } from 'react';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { lobbyClient, PortaleClient } from './useLobbyClient';
import type { Match } from './useLobbyClient';
import { WaitingRoom } from './WaitingRoom';
import { MatchList } from './MatchList';
import { CreateMatch } from './CreateMatch';

type LobbyView = 'lobby' | 'waiting' | 'in-game';

export function LobbyScreen() {
  const [view, setView] = useState<LobbyView>('lobby');
  const [playerName, setPlayerName] = useState('');
  const [matchID, setMatchID] = useState('');
  const [playerID, setPlayerID] = useState<string>('0');
  const [credentials, setCredentials] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(2);
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
    } catch {
      // Polling errors are non-fatal
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 3000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const joinMatch = async (id: string, playerId: string, expectedTotal: number = 2) => {
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
      setTotalPlayers(expectedTotal);
      setView('waiting');
    } catch {
      setError('Beitreten fehlgeschlagen. Ist der Platz noch frei?');
    }
  };

  const createMatch = async () => {
    if (!playerName.trim()) { setError('Bitte Namen eingeben'); return; }
    setError(null);
    try {
      const { matchID: newMatchID } = await lobbyClient.createMatch(
        PortaleVonMolthar.name,
        { numPlayers }
      );
      await joinMatch(newMatchID, '0', numPlayers);
    } catch {
      setError('Spiel konnte nicht erstellt werden. Läuft der Server auf Port 3001?');
    }
  };

  const handleJoinMatch = (match: Match) => {
    const freeSlot = match.players.find(p => p.name === undefined);
    if (!freeSlot) { setError('Kein freier Platz in diesem Spiel'); return; }
    joinMatch(match.matchID, String(freeSlot.id), match.players.length);
  };

  const handleLeaveGame = () => {
    setView('lobby');
    setMatchID('');
    setCredentials('');
    loadMatches();
  };

  const handleCancelWaiting = () => {
    setView('lobby');
    setMatchID('');
    setCredentials('');
    loadMatches();
  };

  if (view === 'waiting') {
    return (
      <WaitingRoom
        matchID={matchID}
        totalPlayers={totalPlayers}
        onAllJoined={() => setView('in-game')}
        onCancel={handleCancelWaiting}
      />
    );
  }

  if (view === 'in-game') {
    return (
      <div className="game-container">
        <PortaleClient
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}
        />
        <button className="leave-game-btn" onClick={handleLeaveGame}>
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

      <CreateMatch
        numPlayers={numPlayers}
        playerNameSet={!!playerName.trim()}
        onNumPlayersChange={setNumPlayers}
        onCreate={createMatch}
      />

      <MatchList
        matches={matches}
        loadingMatches={loadingMatches}
        playerNameSet={!!playerName.trim()}
        onRefresh={loadMatches}
        onJoin={handleJoinMatch}
      />
    </div>
  );
}
