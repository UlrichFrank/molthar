import type { PlayerState } from '../lib/types';
import '../styles/Components.css';

interface ActionButtonsProps {
  gamePhase: string;
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

  return (
    <div className="action-buttons">
      {isActionPhase && (
        <>
          <div className="actions-row">
            <button
              className="btn btn-primary"
              onClick={onTakePearl}
              disabled={selectedPearl === null || actionsRemaining === 0}
            >
              Take Pearl
            </button>

            <button
              className="btn btn-primary"
              onClick={onPlaceCharacter}
              disabled={selectedCharacter === null || actionsRemaining === 0}
            >
              Place Character
            </button>
          </div>

          <div className="actions-row">
            <div className="action-group">
              <label>Activate Character:</label>
              <select
                className="character-select"
                onChange={(e) => {
                  if (e.target.value) {
                    onActivateCharacter(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                disabled={actionsRemaining === 0 || currentPlayer.portal.characters.length === 0}
                defaultValue=""
              >
                <option value="">Select from portal...</option>
                {currentPlayer.portal.characters.map((char, idx) => (
                  <option key={idx} value={idx}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={onEndTurn}
            >
              End Turn
            </button>
          </div>
        </>
      )}

      {isDiscardPhase && (
        <div className="actions-row">
          <button
            className="btn btn-warning"
            onClick={onDiscardCards}
            disabled={selectedHandCount === 0}
          >
            Discard {selectedHandCount} Cards
          </button>
        </div>
      )}

      <div className="action-info">
        {isActionPhase && (
          <span className="info-text">
            Actions remaining: <strong>{actionsRemaining}</strong>/3
          </span>
        )}
        {isDiscardPhase && (
          <span className="info-text">
            Discard cards to get below hand limit
          </span>
        )}
      </div>
    </div>
  );
}
