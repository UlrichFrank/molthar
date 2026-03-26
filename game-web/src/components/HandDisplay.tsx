import { useState } from 'react';
import type { PearlCard } from '@portale-von-molthar/shared';
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

  // Helper function to get pearl card image path
  function getPearlCardImage(value: number): string {
    return `/assets/Perlenkarte${value}.png`;
  }

  // Calculate sum of selected cards
  // Check if hand[idx] exists (it should)
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
              className={`hand-card card-with-image ${selectedIndices.includes(idx) ? 'selected' : ''}`}
              onClick={() => !isGameFinished && onSelect(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              disabled={isGameFinished}
              title={`Pearl ${card.value}${card.hasSwapSymbol ? ' (Swap)' : ''}`}
              style={{
                backgroundImage: `url(${getPearlCardImage(card.value)})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                color: 'transparent' // Hide text if image loads
              }}
            >
              <div className="card-value-large visually-hidden">{card.value}</div>
              {card.hasSwapSymbol && (
                <div className="swap-indicator visually-hidden">⇄</div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
