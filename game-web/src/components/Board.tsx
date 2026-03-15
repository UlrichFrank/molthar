import React, { useContext } from 'react';
import type { GameState } from '@portale-von-molthar/shared';
import '../styles/board.css';

interface BoardProps {
  G: GameState;
  ctx: any; // boardgame.io context
  moves: any;
  playerID: string | null;
  isActive: boolean;
}

// Helper function to get pearl card image path
function getPearlCardImage(value: number): string {
  return `/assets/Perlenkarte${value}.jpeg`;
}

// Helper function to get character card image path
function getCharacterCardImage(cardName: string): string {
  // Card names are like "Character 1", "Character 2", etc.
  // Assets are named "Charakterkarte1.jpeg", "Charakterkarte2.jpeg", etc.
  const match = cardName.match(/(\d+)/);
  if (match) {
    const num = match[1];
    return `/assets/Charakterkarte${num}.jpeg`;
  }
  // Fallback to generic back image
  return '/assets/Charakterkarte Hinten.jpeg';
}

// Helper function to get card back image
function getCardBackImage(type: 'pearl' | 'character'): string {
  if (type === 'pearl') {
    return '/assets/Perlenkarte Hinten.jpeg';
  } else {
    return '/assets/Charakterkarte Hinten.jpeg';
  }
}

/**
 * Main game board component
 * Displays:
 * - Face-up pearl cards (4 slots)
 * - Face-up character cards (2 slots)
 * - Player hands (current player & others)
 * - Activated characters (portals)
 * - Power points & diamonds
 * - Action buttons
 */
export function Board(props: BoardProps) {
  const { G, ctx, moves, playerID, isActive } = props;
  const currentPlayer = G.players[ctx.currentPlayer];
  const player = playerID ? G.players[playerID] : null;
  
  return (
    <div className="board">
      <div className="board-header">
        <h1>Portale von Molthar</h1>
        <div className="game-info">
          <span className="current-player">
            {currentPlayer ? `${currentPlayer.name}'s Turn` : 'Game Over'}
          </span>
          <span className="action-count">
            Actions: {G.actionCount} / 3
          </span>
        </div>
      </div>
      
      <div className="board-content">
        {/* Face-up Cards Area */}
        <div className="face-up-area">
          <div className="pearl-slots">
            <h3>Pearl Cards</h3>
            <div className="slots">
              {G.pearlSlots.map((card, idx) => (
                <button
                  key={idx}
                  className="card pearl-card card-with-image"
                  onClick={() => isActive && moves.takePearlCard(idx)}
                  disabled={!isActive || G.actionCount >= 3}
                  style={{
                    backgroundImage: `url(${getPearlCardImage(card.value)})`,
                  }}
                  title={`Pearl Card ${card.value}${card.hasSwapSymbol ? ' (with swap symbol)' : ''}`}
                >
                  {/* Keep text as fallback */}
                  <span className="card-fallback">
                    <span className="value">{card.value}</span>
                    {card.hasSwapSymbol && <span className="swap">♻</span>}
                  </span>
                </button>
              ))}
              <button
                className="card deck-button card-with-image"
                onClick={() => isActive && moves.takePearlCard(-1)}
                disabled={!isActive || G.actionCount >= 3}
                style={{
                  backgroundImage: `url(${getCardBackImage('pearl')})`,
                }}
                title="Pearl Card Deck"
              >
                🎴<br/>Deck
              </button>
            </div>
          </div>
          
          <div className="character-slots">
            <h3>Character Cards</h3>
            <div className="slots">
              {G.characterSlots.map((card, idx) => (
                <div
                  key={idx}
                  className="card character-card card-with-image"
                  style={{
                    backgroundImage: `url(${getCharacterCardImage(card.name)})`,
                  }}
                  title={`${card.name} - ⚡${card.powerPoints} 💎${card.diamonds}`}
                >
                  {/* Overlay with stats */}
                  <div className="card-stats-overlay">
                    <div className="card-power">⚡ {card.powerPoints}</div>
                    <div className="card-diamond">💎 {card.diamonds}</div>
                  </div>
                  {isActive && G.actionCount < 3 && player && player.portal.length < 2 && (
                    <button
                      className="activate-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement cost validation UI
                        moves.activateCharacter(idx, []);
                      }}
                    >
                      Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Player Areas */}
        <div className="players-area">
          {/* Current Player's Area */}
          {player && (
            <div className={`player-area ${playerID === ctx.currentPlayer ? 'active' : ''}`}>
              <h3>My Portal</h3>
              <div className="portal">
                {player.portal.map(char => (
                  <div 
                    key={char.id} 
                    className="activated-character card-with-image"
                    style={{
                      backgroundImage: `url(${getCharacterCardImage(char.name || `Character ${char.characterId}`)})`,
                    }}
                    title={`${char.name} - Activated`}
                  >
                    <span className={`activated-badge active`}>✓</span>
                  </div>
                ))}
                {player.portal.length < 2 && (
                  <div className="empty-slot">+</div>
                )}
              </div>
              
              <div className="player-stats">
                <div className="stat">
                  <span className="label">Power:</span>
                  <span className="value">{player.powerPoints}</span>
                </div>
                <div className="stat">
                  <span className="label">Diamonds:</span>
                  <span className="value">{player.diamonds}</span>
                </div>
              </div>
              
              <div className="hand">
                <h4>Hand ({player.hand.length}/5)</h4>
                <div className="cards">
                  {player.hand.map((card, idx) => (
                    <div 
                      key={idx} 
                      className="hand-card card-with-image"
                      style={{
                        backgroundImage: `url(${getPearlCardImage(card.value)})`,
                      }}
                      title={`Pearl Card ${card.value}${card.hasSwapSymbol ? ' (Swap)' : ''}`}
                    >
                      {card.hasSwapSymbol && <span className="swap-indicator">♻</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              {playerID === ctx.currentPlayer && isActive && (
                <div className="actions">
                  {G.actionCount < 3 && (
                    <>
                      <button
                        onClick={() => moves.replacePearlSlots()}
                        className="action-btn secondary"
                      >
                        Replace Pearl Cards
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => moves.endTurn()}
                    className="action-btn primary"
                  >
                    End Turn
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Other Players */}
          <div className="other-players">
            {(G.playerOrder || Object.keys(G.players))
              .filter(pId => pId !== playerID)
              .map(pId => {
                const p = G.players[pId];
                return (
                  <div
                    key={pId}
                    className={`player-info ${pId === ctx.currentPlayer ? 'active' : ''}`}
                  >
                    <div className="name">
                      {p.name}
                      {p.isAI && <span className="ai-badge">🤖</span>}
                    </div>
                    <div className="stats-row">
                      <span className="stat">⚡ {p.powerPoints}</span>
                      <span className="stat">💎 {p.diamonds}</span>
                      <span className="stat">🃏 {p.hand.length}</span>
                    </div>
                    <div className="portal-preview">
                      {p.portal.map((char, idx) => (
                        <span key={idx} className="char-indicator">●</span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      
      {/* Game Status */}
      {G.finalRound && (
        <div className="final-round-banner">
          🎯 FINAL ROUND - {G.players[G.finalRoundStartingPlayer || ''].name} triggered it!
        </div>
      )}
    </div>
  );
}

export default Board;
