import type { PlayerState } from '@portale-von-molthar/shared';
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

  // Get cards from portal slots that are NOT activated yet (or maybe show all?)
  // Actually we activate cards in the portal.
  const portalSlots = currentPlayer.portal;

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
          <div className="actions-row">
            <button
              className={`btn btn-primary ${selectedPearl !== null ? 'ready' : 'disabled'}`}
              onClick={onTakePearl}
              disabled={selectedPearl === null || actionsRemaining === 0}
              title={selectedPearl === null ? 'Select a pearl card first' : 'Take the selected pearl card'}
              data-action="take-pearl"
              aria-label={`Take pearl card ${selectedPearl !== null ? `(card ${selectedPearl + 1})` : ''}`}
            >
              💎 Take Pearl
              {selectedPearl !== null && <span className="btn-badge">{selectedPearl + 1}</span>}
            </button>

            <button
              className={`btn btn-primary ${selectedCharacter !== null ? 'ready' : 'disabled'}`}
              onClick={onPlaceCharacter}
              disabled={selectedCharacter === null || actionsRemaining === 0}
              title={selectedCharacter === null ? 'Select a character card first' : 'Place the selected character card'}
              data-action="place-character"
              aria-label={`Place character card ${selectedCharacter !== null ? `(card ${selectedCharacter + 1})` : ''}`}
            >
              🎭 Place Character
              {selectedCharacter !== null && <span className="btn-badge">{selectedCharacter + 1}</span>}
            </button>
          </div>

          {portalSlots.length > 0 && (
            <div className="actions-row">
              <div className="action-group">
                <label htmlFor="character-select" className="group-label">Activate Character:</label>
                <select
                  id="character-select"
                  className="character-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      onActivateCharacter(parseInt(e.target.value));
                      // Reset select
                      e.target.value = '';
                    }
                  }}
                  disabled={actionsRemaining === 0}
                  defaultValue=""
                  data-action="activate-character"
                  aria-label="Select a character from your portal to activate"
                >
                  <option value="">Choose from portal...</option>
                  {portalSlots.map((slot, idx) => (
                    !slot.activated && (
                      <option key={idx} value={idx}>
                        {slot.card.name} (⚡{slot.card.powerPoints})
                      </option>
                    )
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
              data-action="end-turn"
              aria-label="End turn"
            >
              ➡️ End Turn
            </button>
          </div>
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
