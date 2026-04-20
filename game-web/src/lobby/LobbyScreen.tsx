import { useState, useEffect, useCallback } from 'react';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import type { NpcSlotConfig } from '@portale-von-molthar/shared';
import { lobbyClient, PortaleClient } from './useLobbyClient';
import type { Match } from './useLobbyClient';
import { WaitingRoom } from './WaitingRoom';
import { MatchList } from './MatchList';
import { CreateMatch } from './CreateMatch';
import { saveSession, loadSession, clearSession } from './session';
import { useTranslation } from '../i18n/useTranslation';
import type { Locale } from '../i18n/translations';

type LobbyView = 'lobby' | 'waiting' | 'in-game';

const LOCALES: Locale[] = ['de', 'en-GB', 'fr'];
const LOCALE_LABELS: Record<Locale, string> = { de: 'DE', 'en-GB': 'EN', fr: 'FR' };

export function LobbyScreen() {
  const { t, language, setLanguage } = useTranslation();
  const [view, setView] = useState<LobbyView>('lobby');
  const [playerName, setPlayerName] = useState('');
  const [matchID, setMatchID] = useState('');
  const [playerID, setPlayerID] = useState<string>('0');
  const [credentials, setCredentials] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [numPlayers, setNumPlayers] = useState(2);
  const [withSpecialCards, setWithSpecialCards] = useState(false);
  const [npcSlots, setNpcSlots] = useState<NpcSlotConfig[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [savedSession, setSavedSession] = useState(loadSession);

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

  // Task 5.1-5.3: Check for saved session on mount and auto-reconnect if match still active
  useEffect(() => {
    const session = loadSession();
    if (!session) {
      setSessionChecked(true);
      return;
    }

    lobbyClient.getMatch(PortaleVonMolthar.name, session.matchID)
      .then(match => {
        if (match) {
          setMatchID(session.matchID);
          setPlayerID(session.playerID);
          setCredentials(session.credentials);
          setPlayerName(session.playerName);
          setTotalPlayers(match.players.length);
          setView('in-game');
        } else {
          clearSession();
        }
      })
      .catch(() => {
        // On network error: keep session so user can manually rejoin when server comes back
      })
      .finally(() => {
        setSessionChecked(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sessionChecked) return;
    loadMatches();
    const interval = setInterval(loadMatches, 3000);
    return () => clearInterval(interval);
  }, [loadMatches, sessionChecked]);

  const joinMatch = async (id: string, playerId: string, expectedTotal: number = 2) => {
    if (!playerName.trim()) { setError(t('lobby.errorNameRequired')); return; }
    setError(null);
    try {
      const { playerCredentials } = await lobbyClient.joinMatch(
        PortaleVonMolthar.name,
        id,
        {
          playerID: playerId,
          playerName: playerName || t('lobby.fallbackPlayerName', { n: parseInt(playerId) + 1 }),
        }
      );
      setCredentials(playerCredentials);
      setPlayerID(playerId);
      setMatchID(id);
      setTotalPlayers(expectedTotal);
      // Task 4.2: Save session after successful join
      saveSession({ matchID: id, playerID: playerId, credentials: playerCredentials, playerName });
      setView('waiting');
    } catch {
      setError(t('lobby.errorJoinFailed'));
    }
  };

  const createMatch = async () => {
    if (!playerName.trim()) { setError(t('lobby.errorNameRequired')); return; }
    setError(null);
    try {
      const { matchID: newMatchID } = await lobbyClient.createMatch(
        PortaleVonMolthar.name,
        { numPlayers, setupData: { withSpecialCards, npcSlots } }
      );
      // NPC slots are joined by the BotRunner (server-side) — frontend only passes npcSlots in setupData.
      await joinMatch(newMatchID, '0', numPlayers);
    } catch {
      setError(t('lobby.errorCreateFailed'));
    }
  };

  const handleJoinMatch = (match: Match) => {
    const freeSlot = match.players.find(p => p.name === undefined);
    if (!freeSlot) { setError(t('lobby.errorNoSlot')); return; }
    setWithSpecialCards(match.setupData?.withSpecialCards ?? false);
    joinMatch(match.matchID, String(freeSlot.id), match.players.length);
  };

  const handleLeaveGame = () => {
    // Task 4.3: Clear session when leaving
    clearSession();
    setSavedSession(null);
    setView('lobby');
    setMatchID('');
    setCredentials('');
    loadMatches();
  };

  const handleCancelWaiting = () => {
    // Task 4.3: Clear session when cancelling
    clearSession();
    setSavedSession(null);
    setView('lobby');
    setMatchID('');
    setCredentials('');
    loadMatches();
  };

  const handleGameOver = () => {
    // Task 4.3: Clear session after game ends
    clearSession();
    setSavedSession(null);
    setView('lobby');
    setMatchID('');
    setCredentials('');
    loadMatches();
  };

  // Task 6.2: Rejoin without re-calling join API (credentials already saved)
  const handleRejoin = () => {
    const session = loadSession();
    if (!session) return;
    setMatchID(session.matchID);
    setPlayerID(session.playerID);
    setCredentials(session.credentials);
    setPlayerName(session.playerName);
    setView('in-game');
  };

  // Task 7.3-7.4: Terminate game (creator only)
  const handleTerminateGame = () => {
    if (!window.confirm(t('lobby.endGameConfirm'))) return;
    window.dispatchEvent(new CustomEvent('pvm:terminateGame'));
  };

  // Listen for pvm:gameOver event dispatched by CanvasGameBoard
  useEffect(() => {
    const handler = () => handleGameOver();
    window.addEventListener('pvm:gameOver', handler);
    return () => window.removeEventListener('pvm:gameOver', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sessionChecked) {
    return <div className="lobby-container"><p style={{ color: '#94a3b8' }}>{t('app.checkingConnection')}</p></div>;
  }

  if (view === 'waiting') {
    const humanPlayerCount = totalPlayers - npcSlots.length;
    return (
      <WaitingRoom
        matchID={matchID}
        totalPlayers={totalPlayers}
        humanPlayerCount={humanPlayerCount}
        withSpecialCards={withSpecialCards}
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
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 1000 }}>
          <button className="leave-game-btn" style={{ position: 'static' }} onClick={handleLeaveGame}>
            {t('lobby.leaveGame')}
          </button>
          {/* Task 7.1: "Spiel beenden" button only for creator (playerID "0") */}
          {playerID === '0' && (
            <button
              className="leave-game-btn"
              style={{ position: 'static', background: 'rgba(127,29,29,0.85)', borderColor: '#dc2626' }}
              onClick={handleTerminateGame}
            >
              {t('lobby.endGame')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>{t('app.title')}</h1>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {LOCALES.map(locale => (
            <button
              key={locale}
              onClick={() => setLanguage(locale)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: language === locale ? 'rgba(99,102,241,0.9)' : 'rgba(30,41,59,0.7)',
                border: `1px solid ${language === locale ? '#6366f1' : '#475569'}`,
                borderRadius: 6,
                color: language === locale ? '#fff' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {LOCALE_LABELS[locale]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="lobby-error">⚠️ {error}</div>}

      <div className="lobby-section">
        <h2>{t('lobby.yourName')}</h2>
        <input
          type="text"
          placeholder={t('lobby.namePlaceholder')}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      {/* Task 6.1: Rejoin section when a session is saved */}
      {savedSession && (
        <div className="lobby-section">
          <h2>{t('lobby.runningGames')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {t('lobby.sessionInfo', { matchID: savedSession.matchID, playerName: savedSession.playerName })}
            </span>
            <button onClick={handleRejoin}>{t('lobby.rejoin')}</button>
            <button
              style={{ background: 'rgba(71,85,105,0.5)', borderColor: '#475569' }}
              onClick={() => { clearSession(); setSavedSession(null); }}
            >
              {t('lobby.discard')}
            </button>
          </div>
        </div>
      )}

      <CreateMatch
        numPlayers={numPlayers}
        playerNameSet={!!playerName.trim()}
        withSpecialCards={withSpecialCards}
        npcSlots={npcSlots}
        onNumPlayersChange={setNumPlayers}
        onWithSpecialCardsChange={setWithSpecialCards}
        onNpcSlotsChange={setNpcSlots}
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
