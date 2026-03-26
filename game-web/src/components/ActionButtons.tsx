import type { PlayerState } from '@portale-von-molthar/shared';
import '../styles/Components.css';

interface ActionButtonsProps {
  gamePhase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  actionsRemaining: number;
  selectedHandCount: number;
  onDiscardCards: () => void;
  currentPlayer: PlayerState;
}

export function ActionButtons({
  gamePhase,
  actionsRemaining,
  selectedHandCount,
  onDiscardCards,
  currentPlayer,
}: ActionButtonsProps) {
  const isActionPhase = gamePhase === 'takingActions';
  const isDiscardPhase = gamePhase === 'discardingExcessCards';
  const isGameFinished = gamePhase === 'gameFinished';

  return (
    <div className="action-buttons" role="toolbar" aria-label="Game actions">
      <div className="phase-indicator">
        <span className="phase-label">Phase:</span>
        <span className={`phase-badge phase-${gamePhase}`} aria-live="polite" aria-atomic="true">
          {gamePhase === 'takingActions' && `Actions (${actionsRemaining} left)`}
          {gamePhase === 'discardingExcessCards' && 'Discard Excess Cards'}
          {gamePhase === 'gameFinished' && 'Game Finished'}
        </span>
      </div>

      {isActionPhase && (
        <div className="action-phase-content">
          <p className="info-text">Take your actions or press 'g' to end turn.</p>
        </div>
      )}

      {isDiscardPhase && (
        <div className="discard-phase-content" role="region" aria-label="Discard phase">
          <div className="discard-info">
            <p className="info-text">Hand exceeds limit! Select cards to discard.</p>
          </div>
          <button
            className={`btn btn-warning ${selectedHandCount > 0 ? 'ready' : 'disabled'}`}
            onClick={onDiscardCards}
            disabled={selectedHandCount === 0}
            title={selectedHandCount === 0 ? 'Select cards to discard' : `Discard ${selectedHandCount} cards`}
            data-action="discard"
            aria-label={`Discard ${selectedHandCount} card${selectedHandCount !== 1 ? 's' : ''}`}
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
