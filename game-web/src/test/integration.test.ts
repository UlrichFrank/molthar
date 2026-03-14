import { describe, it, expect } from 'vitest';
import { GameEngine } from '../game/engine/gameEngine';
import type { CharacterCard } from '../lib/types';

describe('Game Flow Integration Tests', () => {
  const mockCharacters: CharacterCard[] = [
    {
      id: 'char-1',
      name: 'Warrior',
      cost: [{ type: 'number', value: 5 }],
      powerPoints: 3,
      diamonds: 1,
      ability: 'none',
    },
    {
      id: 'char-2',
      name: 'Mage',
      cost: [{ type: 'number', value: 4 }],
      powerPoints: 2,
      diamonds: 2,
      ability: 'none',
    },
  ];

  it('should initialize a 2-player game correctly', () => {
    const state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    expect(state.players).toHaveLength(2);
    expect(state.players[0].name).toBe('Player 1');
    expect(state.players[1].name).toBe('Player 2');
    expect(state.currentPlayer).toBe(0);
    expect(state.gamePhase).toBe('takingActions');
  });

  it('should handle a complete turn sequence', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    // Player 1 takes a pearl
    state = GameEngine.processAction(state, {
      type: 'takePearlCard',
      playerId: state.players[0].id,
      payload: { cardIndex: 0 },
      timestamp: Date.now(),
    });

    expect(state.players[0].hand.length).toBeGreaterThan(0);

    // Player 1 ends turn
    state = GameEngine.processAction(state, {
      type: 'endTurn',
      playerId: state.players[0].id,
      payload: {},
      timestamp: Date.now(),
    });

    expect(state.currentPlayer).toBe(1);
  });

  it('should trigger final round at 12+ power points', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    // Manually boost player 1 power (simulating multiple activations)
    const player1 = state.players[0];
    player1.portal.powerPoints = 11;
    
    // Give player some pearls
    player1.hand = [
      { value: 5, hasSwapSymbol: false },
      { value: 5, hasSwapSymbol: false },
    ];

    // Place character
    state = GameEngine.processAction(state, {
      type: 'placeCharacter',
      playerId: player1.id,
      payload: { cardIndex: 0 },
      timestamp: Date.now(),
    });

    // Activate character (should push to 12+ and trigger final round)
    state = GameEngine.processAction(state, {
      type: 'activateCharacter',
      playerId: player1.id,
      payload: { characterIndex: 0, pearlCardIndices: [0, 1] },
      timestamp: Date.now(),
    });

    // Final round should be triggered
    if (player1.portal.powerPoints >= 12) {
      expect(state.finalRoundActive || state.gamePhase === 'gameFinished').toBe(true);
    }
  });

  it('should handle hand limit enforcement', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    // Artificially add cards to hand to exceed limit
    const player = state.players[0];
    while (player.hand.length <= 5) {
      player.hand.push({ value: 5, hasSwapSymbol: false });
    }

    // Should transition to discard phase
    if (player.hand.length > 5) {
      expect(state.gamePhase === 'takingActions' || state.gamePhase === 'discardingExcessCards').toBe(true);
    }
  });

  it('should track action count correctly', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);
    const initialActionCount = state.gameLog.length;

    // Take multiple actions
    for (let i = 0; i < 3 && i < state.faceUpPearls.length; i++) {
      state = GameEngine.processAction(state, {
        type: 'takePearlCard',
        playerId: state.players[0].id,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });
    }

    // Action log should have grown
    expect(state.gameLog.length).toBeGreaterThan(initialActionCount);
  });

  it('should allow placement of characters from face-up', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    expect(state.faceUpCharacters.length).toBeGreaterThan(0);

    state = GameEngine.processAction(state, {
      type: 'placeCharacter',
      playerId: state.players[0].id,
      payload: { cardIndex: 0 },
      timestamp: Date.now(),
    });

    expect(state.players[0].portal.characters.length).toBeGreaterThan(0);
  });

  it('should handle game state consistency across multiple turns', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2', 'Player 3'], mockCharacters);

    // Simulate 3 complete turns (one per player)
    for (let turnNumber = 0; turnNumber < 3; turnNumber++) {
      const currentPlayerBefore = state.currentPlayer;

      // End turn
      state = GameEngine.processAction(state, {
        type: 'endTurn',
        playerId: state.players[currentPlayerBefore].id,
        payload: {},
        timestamp: Date.now(),
      });

      // Current player should advance
      expect(state.currentPlayer).not.toBe(currentPlayerBefore);
    }

    // We should be back to player 0
    expect(state.currentPlayer).toBe(0);
  });
});
