import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { FaceUpCards } from './FaceUpCards';
import { PlayerPortal } from './PlayerPortal';
import { OpponentPortals } from './OpponentPortals';
import { PlayerHand } from './PlayerHand';
import { ActionButtons } from './ActionButtons';
import { GameLog } from './GameLog';
import '../styles/GameBoard.css';

interface GameBoardProps {
  gameState: IGameState;
  characters: CharacterCard[];
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
  error: string | undefined;
  onSelectPearl: (index: number) => void;
  onSelectCharacter: (index: number) => void;
  onSelectHandCard: (index: number) => void;
  onClearHandSelection: () => void;
  onTakePearl: () => void;
  onPlaceCharacter: () => void;
  onActivateCharacter: (characterIndex: number) => void;
  onDiscardCards: () => void;
  onEndTurn: () => void;
}

/**
 * Main game board component displaying current game state and player actions
 */
export function GameBoard({
  gameState,
  characters,
  selectedPearl,
  selectedCharacter,
  selectedHandIndices,
  error,
  onSelectPearl,
  onSelectCharacter,
  onSelectHandCard,
  onClearHandSelection,
  onTakePearl,
  onPlaceCharacter,
  onActivateCharacter,
  onDiscardCards,
  onEndTurn,
}: GameBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const otherPlayers = gameState.players.filter(
    (_, idx) => idx !== gameState.currentPlayer
  );

  // Check action count remaining - count actions since last EndTurn
  const lastEndTurnIndex = gameState.gameLog
    .map((log, idx) => (log.type === GameActionType.EndTurn ? idx : -1))
    .filter(idx => idx >= 0)
    .pop() ?? -1;

  const actionsThisTurn = gameState.gameLog
    .slice(lastEndTurnIndex + 1)
    .filter((log) => {
      const isCurrentPlayerTurn = log.playerId === currentPlayer.id;
      const isAction =
        log.type === GameActionType.TakePearlCard ||
        log.type === GameActionType.PlaceCharacter ||
        log.type === GameActionType.ActivateCharacter;
      return isCurrentPlayerTurn && isAction;
    }).length;

  const actionsRemaining = gameState.gamePhase === 'takingActions' ? Math.max(0, 3 - actionsThisTurn) : 0;

  return (
    <div className="game-board-container" role="main" aria-label="Game board">
      {/* Header with game info */}
      <div className="game-header">
        <h1 className="game-title">Portale von Molthar</h1>
        <div className="game-info">
          <div className="info-item">
            <span className="label">Current Player:</span>
            <span className="value" aria-label={`Current player: ${currentPlayer.name}`}>{currentPlayer.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Phase:</span>
            <span className="value phase" aria-label={`Game phase: ${gameState.gamePhase}`}>{gameState.gamePhase}</span>
          </div>
          <div className="info-item">
            <span className="label">Actions Left:</span>
            <span className="value" aria-label={`Actions remaining: ${gameState.gamePhase === 'takingActions' ? actionsRemaining : 'N/A'}`}>{gameState.gamePhase === 'takingActions' ? actionsRemaining : '—'}</span>
          </div>
        </div>
      </div>

      <div className="game-table-wrapper">
        {/* Main game table with Spielfläche background */}
        <div className="game-table">
          
          {/* Top Row: Opponent Portals (Gegner 3 & 4 - 180° rotation) */}
          <div className="table-position top-opponents">
            {otherPlayers.length > 1 && (
              <div className="opponent-slot" style={{ transform: 'rotate(180deg)' }}>
                <div className="opponent-card-wrapper">
                  <img src={`/assets/Gegner Portal${Math.min(otherPlayers.length + 1, 5)}.png`} alt="Opponent 1" />
                </div>
                {otherPlayers[1] && <div className="opponent-name">{otherPlayers[1].name}</div>}
              </div>
            )}
            {otherPlayers.length > 2 && (
              <div className="opponent-slot" style={{ transform: 'rotate(180deg)' }}>
                <div className="opponent-card-wrapper">
                  <img src="/assets/Gegner Portal4.png" alt="Opponent 2" />
                </div>
                {otherPlayers[2] && <div className="opponent-name">{otherPlayers[2].name}</div>}
              </div>
            )}
          </div>

          {/* Left: Opponent 2 (90° rotation) */}
          {otherPlayers.length > 0 && (
            <div className="table-position left-opponent" style={{ transform: 'rotate(90deg)' }}>
              <div className="opponent-card-wrapper">
                <img src="/assets/Gegner Portal2.png" alt="Opponent" />
              </div>
              <div className="opponent-name">{otherPlayers[0].name}</div>
            </div>
          )}

          {/* Center: Auslage */}
          <div className="table-position center">
            <FaceUpCards
              pearlCards={gameState.faceUpPearls}
              characterCards={gameState.faceUpCharacters}
              selectedPearl={selectedPearl}
              selectedCharacter={selectedCharacter}
              onSelectPearl={onSelectPearl}
              onSelectCharacter={onSelectCharacter}
            />
          </div>

          {/* Right: Opponent 5 (270° rotation) */}
          {otherPlayers.length > 3 && (
            <div className="table-position right-opponent" style={{ transform: 'rotate(270deg)' }}>
              <div className="opponent-card-wrapper">
                <img src="/assets/Gegner Portal5.png" alt="Opponent" />
              </div>
              <div className="opponent-name">{otherPlayers[3].name}</div>
            </div>
          )}

          {/* Bottom: Current Player Portal */}
          <div className="table-position bottom-player">
            <PlayerPortal
              player={currentPlayer}
              isCurrentPlayer={true}
            />
          </div>

        </div>
      </div>

      {/* Bottom Panel: Hand, Actions, Log */}
      <div className="bottom-panel">
        {/* Error display */}
        {error && <div className="error-message">{error}</div>}

        {/* Player hand */}
        <div className="hand-section">
          <PlayerHand
            hand={currentPlayer.hand}
            selectedIndices={selectedHandIndices}
            phase={gameState.gamePhase}
            onSelect={onSelectHandCard}
            onClearSelection={onClearHandSelection}
          />
        </div>

        {/* Action buttons */}
        <ActionButtons
          gamePhase={gameState.gamePhase}
          actionsRemaining={actionsRemaining}
          selectedPearl={selectedPearl}
          selectedCharacter={selectedCharacter}
          selectedHandCount={selectedHandIndices.length}
          onTakePearl={onTakePearl}
          onPlaceCharacter={onPlaceCharacter}
          onActivateCharacter={onActivateCharacter}
          onDiscardCards={onDiscardCards}
          onEndTurn={onEndTurn}
          currentPlayer={currentPlayer}
        />

        {/* Game Log */}
        <GameLog
          gameLog={gameState.gameLog}
          playerNames={new Map(gameState.players.map((p) => [p.id, p.name]))}
        />
      </div>
    </div>
  );
}
