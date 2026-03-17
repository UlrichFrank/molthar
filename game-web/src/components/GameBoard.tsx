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

      <div className="game-board-background">
        {/* Top Section: Opponent Portals */}
        <div className="game-section top-section">
          <OpponentPortals
            players={otherPlayers}
            characters={characters}
          />
        </div>

        {/* Middle Section: Face-up cards (Auslage) */}
        <div className="game-section middle-section">
          <FaceUpCards
            pearlCards={gameState.faceUpPearls}
            characterCards={gameState.faceUpCharacters}
            selectedPearl={selectedPearl}
            selectedCharacter={selectedCharacter}
            onSelectPearl={onSelectPearl}
            onSelectCharacter={onSelectCharacter}
          />
        </div>

        {/* Bottom Section: Current player portal & hand */}
        <div className="game-section bottom-section">
          <div className="bottom-content">
            <PlayerPortal
              player={currentPlayer}
              isCurrentPlayer={true}
            />

            {/* Error display */}
            {error && <div className="error-message">{error}</div>}

            {/* Player hand */}
            <PlayerHand
              hand={currentPlayer.hand}
              selectedIndices={selectedHandIndices}
              phase={gameState.gamePhase}
              onSelect={onSelectHandCard}
              onClearSelection={onClearHandSelection}
            />

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
          </div>
        </div>
      </div>

      {/* Game Log */}
      <div className="game-log-section">
        <GameLog
          gameLog={gameState.gameLog}
          playerNames={new Map(gameState.players.map((p) => [p.id, p.name]))}
        />
      </div>
    </div>
  );
}
