import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import type { NpcSlotConfig } from '@portale-von-molthar/shared';
import { lobbyClient, PortaleClient, freeHumanSlots } from './useLobbyClient';
import './lobby.css';
import { SpielothekLink } from './SpielothekLink';
import type { Match } from './useLobbyClient';
import { WaitingRoom } from './WaitingRoom';
import { MatchList } from './MatchList';
import { CreateMatch } from './CreateMatch';
import { saveSession, loadSession, clearSession } from './session';
import { loadSpielname, saveSpielname } from './spielname';
import { useTranslation } from '../i18n/useTranslation';
import type { Locale } from '../i18n/translations';
import { useIsMobile } from '../hooks/useIsMobile';

type LobbyView = 'lobby' | 'waiting' | 'in-game';

const LOCALES: Locale[] = ['de', 'en-GB', 'fr'];
const LOCALE_LABELS: Record<Locale, string> = { de: 'DE', 'en-GB': 'EN', fr: 'FR' };

export function LobbyScreen() {
  const { t, language, setLanguage } = useTranslation();
  const isMobile = useIsMobile();
  const [view, setView] = useState<LobbyView>('lobby');
  const [playerName, setPlayerName] = useState(loadSpielname);
  const [matchID, setMatchID] = useState('');
  const [playerID, setPlayerID] = useState<string>('0');
  const [credentials, setCredentials] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [numPlayers, setNumPlayers] = useState(2);
  const [withSpecialCards, setWithSpecialCards] = useState(false);
  const [npcSlots, setNpcSlots] = useState<NpcSlotConfig[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesFailed, setMatchesFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [savedSession, setSavedSession] = useState(loadSession);
  const [invite, setInvite] = useState<Match | null>(null);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const { matches: list } = await lobbyClient.listMatches(PortaleVonMolthar.name);
      setMatches((list as Match[]).filter(m => freeHumanSlots(m).length > 0));
      setMatchesFailed(false);
    } catch {
      // A silently empty list is indistinguishable from "no games open", which
      // is how a broken lobby endpoint went unnoticed for weeks. Say so.
      setMatchesFailed(true);
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
  }, []);

  // Invitation link: ?match=<id>
  useEffect(() => {
    if (!sessionChecked) return;
    const id = new URLSearchParams(window.location.search).get('match');
    if (!id) return;
    const clear = () => window.history.replaceState(null, '', '/');
    if (loadSession()?.matchID === id) { clear(); return; }
    lobbyClient.getMatch(PortaleVonMolthar.name, id)
      .then(m => {
        if (freeHumanSlots(m as Match).length === 0) { setError(t('lobby.inviteFull')); clear(); }
        else setInvite(m as Match);
      })
      .catch(() => { setError(t('lobby.inviteGone')); clear(); });
  }, [sessionChecked]); // eslint-disable-line react-hooks/exhaustive-deps

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
      saveSpielname(playerName);
      setInvite(null);
      if (window.location.search) window.history.replaceState(null, '', '/');
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
    const freeSlot = freeHumanSlots(match)[0];
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

  const handleCancelWaiting = async () => {
    // Give the seat back too. Without this the match keeps the creator's name on
    // slot 0, stays in the open-games list forever and can never be joined to
    // completion. boardgame.io deletes a match once its last player has left.
    try {
      await lobbyClient.leaveMatch(PortaleVonMolthar.name, matchID, { playerID, credentials });
    } catch {
      // Best effort — a failed leave must not trap the user in the waiting room
    }
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
    return <div className="lb-root"><p className="lb-banner">{t('app.checkingConnection')}</p></div>;
  }

  if (view === 'waiting') {
    return (
      <WaitingRoom
        matchID={matchID}
        playerID={playerID}
        totalPlayers={totalPlayers}
        withSpecialCards={withSpecialCards}
        onAllJoined={() => setView('in-game')}
        onCancel={handleCancelWaiting}
      />
    );
  }

  if (view === 'in-game') {
    // Task 7.1: only the creator gets the extra "Spiel beenden" button. The mobile
    // status bar reserves horizontal space for these fixed buttons via this
    // custom property (mobile.css `.mobile-status-bar` padding-right).
    const inGameActionCount = playerID === '0' ? 2 : 1;
    return (
      <div
        className="game-container"
        style={{ '--pvm-ingame-action-count': inGameActionCount } as CSSProperties}
      >
        <PortaleClient
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}
        />
        <div className="in-game-actions">
          <button
            className="leave-game-btn"
            style={{ position: 'static' }}
            onClick={handleLeaveGame}
            aria-label={t('lobby.leaveGame')}
            title={isMobile ? t('lobby.leaveGame') : undefined}
          >
            {isMobile ? '🚪' : t('lobby.leaveGame')}
          </button>
          {/* Task 7.1: "Spiel beenden" button only for creator (playerID "0") */}
          {playerID === '0' && (
            <button
              className="leave-game-btn"
              style={{ position: 'static', background: 'rgba(140,42,30,0.92)', borderColor: '#d96a5b' }}
              onClick={handleTerminateGame}
              aria-label={t('lobby.endGame')}
              title={isMobile ? t('lobby.endGame') : undefined}
            >
              {isMobile ? '⏹' : t('lobby.endGame')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const nameSet = !!playerName.trim();
  return (
    <div className="lb-root">
      <main className="lb-page">
        <header className="lb-header">
          <div>
            <SpielothekLink game="molthar" />
            <h1 className="lb-title">{t('app.title')}</h1>
            <p className="lb-tagline">{t('lobby.tagline')}</p>
          </div>
          <div className="lb-locales">
            {LOCALES.map(locale => (
              <button
                key={locale}
                className="lb-locale"
                aria-pressed={language === locale}
                onClick={() => setLanguage(locale)}
              >
                {LOCALE_LABELS[locale]}
              </button>
            ))}
          </div>
        </header>

        {invite && (
          <div className="lb-banner">
            <span>{t('lobby.invited', { name: invite.players[0]?.name ?? '?' })}</span>
            <button className="lb-btn lb-btn--small" disabled={!nameSet} onClick={() => handleJoinMatch(invite)}>
              {nameSet ? t('lobby.takeSeat') : t('lobby.nameFirst')}
            </button>
          </div>
        )}

        {savedSession && (
          <div className="lb-banner">
            <span>{t('lobby.youSit')} ({t('lobby.sessionInfo', { matchID: savedSession.matchID, playerName: savedSession.playerName })})</span>
            <button className="lb-btn lb-btn--small" onClick={handleRejoin}>{t('lobby.rejoin')}</button>
            <button className="lb-btn lb-btn--small lb-btn--ghost" onClick={() => { clearSession(); setSavedSession(null); }}>
              {t('lobby.discard')}
            </button>
          </div>
        )}

        {error && <p className="lb-error">{error}</p>}

        <section className="lb-panel">
          <label className="lb-field">
            <span>{t('lobby.yourName')}</span>
            <input
              className="lb-input"
              type="text"
              placeholder={t('lobby.namePlaceholder')}
              value={playerName}
              maxLength={20}
              autoComplete="nickname"
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </label>
        </section>

        <div className="lb-grid">
          <CreateMatch
            numPlayers={numPlayers}
            playerNameSet={nameSet}
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
            loadFailed={matchesFailed}
            playerNameSet={nameSet}
            onRefresh={loadMatches}
            onJoin={handleJoinMatch}
          />
        </div>
      </main>
    </div>
  );
}
