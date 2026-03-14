import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { FaceUpCards } from './FaceUpCards';
import { PlayerPortal } from './PlayerPortal';
import { OpponentPortals } from './OpponentPortals';
import { PlayerHand } from './PlayerHand';
import { ActionButtons } from './ActionButtons';
import '../styles/GameBoard.css';

interface GameBoardProps {
  gameState: IGameState;
  characters: CharacterCard[];
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandIndices: number[];
  error: string | null;
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
    <div className="game-board-container">
      {/* Header with game info */}
      <div className="game-header">
        <h1 className="game-title">Portale von Molthar</h1>
        <div className="game-info">
          <div className="info-item">
            <span className="label">Current Player:</span>
            <span className="value">{currentPlayer.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Phase:</span>
            <span className="value phase">{gameState.gamePhase}</span>
          </div>
          <div className="info-item">
            <span className="label">Actions Left:</span>
            <span className="value">{gameState.gamePhase === 'takingActions' ? actionsRemaining : '—'}</span>
          </div>
        </div>
      </div>

      <div className="game-content">
        {/* Left side: Face-up cards and current player portal */}
        <div className="left-panel">
          <FaceUpCards
            pearlCards={gameState.faceUpPearls}
            characterCards={gameState.faceUpCharacters}
            selectedPearl={selectedPearl}
            selectedCharacter={selectedCharacter}
            onSelectPearl={onSelectPearl}
            onSelectCharacter={onSelectCharacter}
          />

          <PlayerPortal
            player={currentPlayer}
            isCurrentPlayer={true}
          />
        </div>

        {/* Center: Action buttons and hand */}
        <div className="center-panel">
          {/* Error display */}
          {error && <div className="error-message">{error}</div>}

          {/* Deck counts */}
          <div className="deck-info">
            <div className="deck-count">
              <span className="label">Pearl Deck:</span>
              <span className="value">{gameState.pearlDeck.length} cards</span>
            </div>
            <div className="deck-count">
              <span className="label">Char Deck:</span>
              <span className="value">{gameState.characterDeck.length} cards</span>
            </div>
          </div>

          {/* Player hand */}
          <PlayerHand
            hand={currentPlayer.hand}
            selectedIndices={selectedHandIndices}
            onSelectCard={onSelectHandCard}
            onClearSelection={onClearHandSelection}
            gamePhase={gameState.gamePhase}
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

        {/* Right side: Opponent portals */}
        <div className="right-panel">
          <div className="opponents-title">Opponents</div>
          <OpponentPortals
            players={otherPlayers}
            characters={characters}
          />
        </div>
      </div>

      {/* Game log footer */}
      <div className="game-footer">
        <div className="log-info">
          <span className="label">Actions this turn:</span>
          <span className="value">{gameState.gameLog.filter((log) => log.playerId === currentPlayer.id).length}</span>
        </div>
      </div>
    </div>
  );
}
