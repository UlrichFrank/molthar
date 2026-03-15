import React, { useContext, useState } from 'react';
import type { GameState, CharacterCard } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost, canPotentiallySatisfyCost } from '../lib/cost-helper';
import { CostPaymentDialog } from './CostPaymentDialog';
import { CharacterActivationDialog } from './CharacterActivationDialog';
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

// Helper function to get portal background image
function getPortalImage(playerIndex: number, isStartingPlayer: boolean): string {
  const portalNum = playerIndex + 1;
  if (isStartingPlayer) {
    return `/assets/Portal-Startspieler${portalNum}.jpeg`;
  }
  return `/assets/Portal${portalNum}.jpeg`;
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
  const [selectedCharacterSlot, setSelectedCharacterSlot] = useState<number | null>(null);
  const [selectedPortalSlotIndex, setSelectedPortalSlotIndex] = useState<number | null>(null);
  const [selectedCharacterCard, setSelectedCharacterCard] = useState<any>(null);
  const [showCostDialog, setShowCostDialog] = useState(false);
  
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
                  title={`${card.name} - ⚡${card.powerPoints} 💎${card.diamonds} - ${describeCost(card.cost)}`}
                >
                  {/* Overlay with stats */}
                  <div className="card-stats-overlay">
                    <div className="card-power">⚡ {card.powerPoints}</div>
                    <div className="card-diamond">💎 {card.diamonds}</div>
                  </div>
                  {/* Cost overlay */}
                  <div className="card-cost-overlay">
                    {getCostSummary(card.cost)}
                  </div>
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
              
              {/* Portal Background with Character Placement */}
              <div 
                className="portal-display"
                style={{
                  backgroundImage: `url(${getPortalImage(parseInt(playerID || '0'), G.playerOrder[0] === playerID)})`,
                }}
              >
                <div className="portal-characters">
                  {/* Character Card Slots */}
                  {[0, 1].map((slotIdx) => (
                    <div key={slotIdx} className="portal-slot">
                      {player.portal[slotIdx] ? (
                        <button
                          className={`character-placement card-with-image ${player.portal[slotIdx].activated ? 'rotated' : ''}`}
                          style={{
                            backgroundImage: `url(${getCharacterCardImage(player.portal[slotIdx].characterId)})`,
                          }}
                          onClick={() => {
                            if (isActive && G.actionCount < 3) {
                              setSelectedPortalSlotIndex(slotIdx);
                              setShowCostDialog(true);
                            }
                          }}
                          disabled={!isActive || G.actionCount >= 3}
                          title={`Character ${player.portal[slotIdx].characterId} - Click to activate${isActive && G.actionCount < 3 ? ' (1 action)' : ''}`}
                        >
                          <span className={`activated-badge active`}>✓</span>
                        </button>
                      ) : (
                        <div
                          className="empty-portal-slot"
                          title="Empty portal slot"
                        >
                          <span className="slot-label">Slot {slotIdx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                    
                    {/* Other Player's Portal */}
                    <div className="other-portal">
                      <span className="portal-label">Portal:</span>
                      {p.portal.length > 0 ? (
                        <div className="portal-cards">
                          {p.portal.map((char, idx) => (
                            <div
                              key={idx}
                              className={`opponent-char-card card-with-image ${char.activated ? 'rotated' : ''}`}
                              style={{
                                backgroundImage: `url(${getCharacterCardImage(char.characterId)})`,
                              }}
                              title={`Character ${char.characterId}`}
                            >
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-portal">-</span>
                      )}
                    </div>
                    
                    {/* Other Player's Hand (hidden) */}
                    <div className="other-hand">
                      <span className="hand-label">Hand: {p.hand.length} card{p.hand.length !== 1 ? 's' : ''}</span>
                      <div className="hidden-cards">
                        {p.hand.map((_, idx) => (
                          <div key={idx} className="hidden-card card-with-image" style={{ backgroundImage: `url(${getCardBackImage('pearl')})` }}>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      
      {/* Game Status */}
      {G.finalRound ? (
        <div className="game-status-footer">
          <div className="final-round-banner">
            <div className="banner-content">
              <span className="banner-icon">🎯</span>
              <div className="banner-text">
                <h2>FINAL ROUND!</h2>
                <p>{G.players[G.finalRoundStartingPlayer || '']?.name || 'Player'} triggered the final round</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="game-status-footer">
          <div className="turn-indicator">
            <span className="turn-label">Current Turn:</span>
            <span className="turn-value">{G.players[G.playerOrder[0]]?.name || 'Unknown'}</span>
          </div>
        </div>
      )}

      {/* Character Activation Dialog (for empty portal slots) */}
      {showCostDialog && selectedPortalSlotIndex !== null && player && (
        <CharacterActivationDialog
          availableCharacters={G.characterSlots.map((card, idx) => ({
            card,
            slotIndex: idx,
          }))}
          hand={player.hand}
          diamonds={player.diamonds}
          portalSlotIndex={selectedPortalSlotIndex}
          onActivate={(characterSlotIndex, usedCardIndices) => {
            moves.activateCharacter(characterSlotIndex, usedCardIndices);
            setShowCostDialog(false);
            setSelectedPortalSlotIndex(null);
            setSelectedCharacterSlot(null);
          }}
          onCancel={() => {
            setShowCostDialog(false);
            setSelectedPortalSlotIndex(null);
            setSelectedCharacterSlot(null);
          }}
        />
      )}
    </div>
  );
}

export default Board;
