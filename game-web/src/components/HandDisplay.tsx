import { useState } from 'react';
import type { PearlCard } from '../lib/types';
import '../styles/Components.css';

interface HandDisplayProps {
  hand: PearlCard[];
  selectedIndices: number[];
  phase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  onSelect: (index: number) => void;
  onClearSelection: () => void;
  title?: string;
}

export function HandDisplay({
  hand,
  selectedIndices,
  phase,
  onSelect,
  onClearSelection,
  title = 'Your Hand',
}: HandDisplayProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isDiscardPhase = phase === 'discardingExcessCards';
  const isGameFinished = phase === 'gameFinished';

  // Calculate sum of selected cards
  const selectedSum = selectedIndices.reduce((sum, idx) => {
    return sum + (hand[idx]?.value || 0);
  }, 0);

  return (
    <div className="hand-display">
      <div className="hand-header">
        <h3 className="hand-title">{title}</h3>
        <span className="hand-count">{hand.length} cards</span>
      </div>

      {selectedIndices.length > 0 && (
        <div className="hand-stats">
          <span className="stat-item">
            Selected: <strong>{selectedIndices.length}</strong>
          </span>
          <span className="stat-item">
            Sum: <strong>{selectedSum}</strong>
          </span>
          <button className="clear-btn" onClick={onClearSelection}>
            Clear
          </button>
        </div>
      )}

      <div className="hand-grid">
        {hand.length === 0 ? (
          <div className="empty-hand">No cards in hand</div>
        ) : (
          hand.map((card, idx) => (
            <button
              key={idx}
              className={`hand-card ${selectedIndices.includes(idx) ? 'selected' : ''}`}
              onClick={() => !isGameFinished && onSelect(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              disabled={isGameFinished}
              title={`Pearl ${card.value}${card.hasSwapSymbol ? ' (Swap)' : ''}`}
            >
              <div className="card-value-large">{card.value}</div>
              {card.hasSwapSymbol && (
                <div className="swap-indicator">⇄</div>
              )}
              {hoveredIdx === idx && (
                <div className="card-tooltip">
                  Pearl {card.value}
                  {isDiscardPhase && ' (select to discard)'}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
