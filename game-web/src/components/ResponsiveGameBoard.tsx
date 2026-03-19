/**
 * Responsive Game Board Wrapper Component
 * Wraps the canvas board with responsive layout areas for hands, deck, etc.
 * Provides responsive layout without breaking existing canvas-based rendering.
 */

import React from 'react';
import '../styles/responsiveLayout.css';

interface ResponsiveGameBoardProps {
  children: React.ReactNode;
}

/**
 * Responsive wrapper that provides CSS Grid layout for game board areas.
 * The canvas board can render inside the faceUpCards area,
 * while hands, deck, and opponents use responsive layout.
 */
export function ResponsiveGameBoard({ children }: ResponsiveGameBoardProps) {
  return (
    <div className="responsive-board-layout">
      <header className="game-header">
        <h1 className="game-title">Portale von Molthar</h1>
      </header>

      <section className="board-area opponents">
        <div className="opponents-container">
          {/* Opponent indicators will be rendered here */}
          <div className="opponent-placeholder">Opponents</div>
        </div>
      </section>

      <section className="board-area faceUpCards">
        <div className="face-up-cards-container">
          {/* Main canvas board goes here via children */}
          {children}
        </div>
      </section>

      <section className="board-area deck">
        <div className="deck-container">
          <div className="area-label">Deck</div>
          <div className="card-container">
            {/* Deck display */}
          </div>
        </div>
      </section>

      <section className="board-area playerHand">
        <div className="player-hand-container">
          {/* Player hand cards */}
        </div>
      </section>

      <section className="board-area actions">
        <div className="actions-container">
          {/* Action buttons */}
        </div>
      </section>
    </div>
  );
}

/**
 * Placeholder component for opponent indicators.
 * Responsive to viewport size.
 */
function OpponentPlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--gap-base)',
        width: '100%',
        height: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ fontSize: 'var(--font-size-sm)', color: '#93c5fd' }}>
        Opponent 1
      </div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: '#93c5fd' }}>
        Opponent 2
      </div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: '#93c5fd' }}>
        Opponent 3
      </div>
    </div>
  );
}
