import type { PearlCard } from '../lib/types';
import '../styles/Components.css';

interface PlayerHandProps {
  hand: PearlCard[];
  selectedIndices: number[];
  onSelectCard: (index: number) => void;
  onClearSelection: () => void;
  gamePhase: string;
}

export function PlayerHand({
  hand,
  selectedIndices,
  onSelectCard,
  onClearSelection,
  gamePhase,
}: PlayerHandProps) {
  const isDiscardPhase = gamePhase === 'discardingExcessCards';

  return (
    <div className="player-hand">
      <div className="hand-header">
        <h3 className="section-title">Your Hand ({hand.length})</h3>
        {isDiscardPhase && selectedIndices.length > 0 && (
          <button
            className="btn-small"
            onClick={onClearSelection}
          >
            Clear ({selectedIndices.length})
          </button>
        )}
      </div>

      <div className="hand-grid">
        {hand.map((card, idx) => (
          <button
            key={idx}
            className={`hand-card ${
              selectedIndices.includes(idx) ? 'selected' : ''
            } ${isDiscardPhase ? 'selectable' : ''}`}
            onClick={() => {
              if (isDiscardPhase) {
                onSelectCard(idx);
              }
            }}
            disabled={!isDiscardPhase}
          >
            <span className="card-value">{card.value}</span>
            {card.hasSwapSymbol && (
              <span className="swap-symbol-small">⇄</span>
            )}
          </button>
        ))}
      </div>

      {hand.length === 0 && (
        <div className="empty-message">No cards in hand</div>
      )}
    </div>
  );
}
