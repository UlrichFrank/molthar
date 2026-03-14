import type { PlayerState } from '../lib/types';
import '../styles/Components.css';

interface ActionButtonsProps {
  gamePhase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  actionsRemaining: number;
  selectedPearl: number | null;
  selectedCharacter: number | null;
  selectedHandCount: number;
  onTakePearl: () => void;
  onPlaceCharacter: () => void;
  onActivateCharacter: (characterIndex: number) => void;
  onDiscardCards: () => void;
  onEndTurn: () => void;
  currentPlayer: PlayerState;
}

export function ActionButtons({
  gamePhase,
  actionsRemaining,
  selectedPearl,
  selectedCharacter,
  selectedHandCount,
  onTakePearl,
  onPlaceCharacter,
  onActivateCharacter,
  onDiscardCards,
  onEndTurn,
  currentPlayer,
}: ActionButtonsProps) {
  const isActionPhase = gamePhase === 'takingActions';
  const isDiscardPhase = gamePhase === 'discardingExcessCards';
  const isGameFinished = gamePhase === 'gameFinished';

  const portalCharacters = currentPlayer.portal.characters;

  return (
    <div className="action-buttons">
      <div className="phase-indicator">
        <span className="phase-label">Phase:</span>
        <span className={`phase-badge phase-${gamePhase}`}>
          {gamePhase === 'takingActions' && `Actions (${actionsRemaining} left)`}
          {gamePhase === 'discardingExcessCards' && 'Discard Excess Cards'}
          {gamePhase === 'gameFinished' && 'Game Finished'}
        </span>
      </div>

      {isActionPhase && (
        <div className="action-phase-content">
          <div className="actions-row">
            <button
              className={`btn btn-primary ${selectedPearl !== null ? 'ready' : 'disabled'}`}
              onClick={onTakePearl}
              disabled={selectedPearl === null || actionsRemaining === 0}
              title={selectedPearl === null ? 'Select a pearl card first' : 'Take the selected pearl card'}
            >
              💎 Take Pearl
              {selectedPearl !== null && <span className="btn-badge">{selectedPearl + 1}</span>}
            </button>

            <button
              className={`btn btn-primary ${selectedCharacter !== null ? 'ready' : 'disabled'}`}
              onClick={onPlaceCharacter}
              disabled={selectedCharacter === null || actionsRemaining === 0}
              title={selectedCharacter === null ? 'Select a character card first' : 'Place the selected character card'}
            >
              🎭 Place Character
              {selectedCharacter !== null && <span className="btn-badge">{selectedCharacter + 1}</span>}
            </button>
          </div>

          {portalCharacters.length > 0 && (
            <div className="actions-row">
              <div className="action-group">
                <label className="group-label">Activate Character:</label>
                <select
                  className="character-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      onActivateCharacter(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  disabled={actionsRemaining === 0}
                  defaultValue=""
                >
                  <option value="">Choose from portal...</option>
                  {portalCharacters.map((char, idx) => (
                    <option key={idx} value={idx}>
                      {char.name} (⚡{char.powerPoints})
                    </option>
                  ))}
                </select>
                <span className="help-text">Select pearls from hand first</span>
              </div>
            </div>
          )}

          <div className="actions-row">
            <button
              className="btn btn-secondary"
              onClick={onEndTurn}
              title="End your turn and pass to the next player"
            >
              ➡️ End Turn
            </button>
          </div>
        </div>
      )}

      {isDiscardPhase && (
        <div className="discard-phase-content">
          <div className="discard-info">
            <p className="info-text">Hand exceeds limit! Select cards to discard.</p>
          </div>
          <button
            className={`btn btn-warning ${selectedHandCount > 0 ? 'ready' : 'disabled'}`}
            onClick={onDiscardCards}
            disabled={selectedHandCount === 0}
            title={selectedHandCount === 0 ? 'Select cards to discard' : `Discard ${selectedHandCount} cards`}
          >
            🗑️ Discard {selectedHandCount} Card{selectedHandCount !== 1 ? 's' : ''}
            {selectedHandCount > 0 && <span className="btn-badge">{selectedHandCount}</span>}
          </button>
        </div>
      )}

      {isGameFinished && (
        <div className="finished-phase-content">
          <p className="finished-message">Game is finished. View results on the left.</p>
        </div>
      )}
    </div>
  );
}
