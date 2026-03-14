import { describe, it, expect } from 'vitest';
import { GameEngine } from '../game/engine/gameEngine';
import type { GameAction } from '../lib/types';
import { GameActionType } from '../lib/types';

describe('Game Flow - Error Handling & UX', () => {
  describe('Initial game state', () => {
    it('initializes with correct player count', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      expect(state.players.length).toBe(2);
      expect(state.players[0].name).toBe('Alice');
      expect(state.players[1].name).toBe('Bob');
    });

    it('starts with taking actions phase', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      expect(state.gamePhase).toBe('takingActions');
    });

    it('initializes with proper deck structure', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      expect(state.pearlDeck.length).toBeGreaterThan(0);
      expect(state.characterDeck.length).toBeGreaterThan(0);
      expect(state.faceUpPearls.length).toBe(4);
      expect(state.faceUpCharacters.length).toBe(4);
    });
  });

  describe('Invalid action detection', () => {
    it('throws when player is not current player', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const nonCurrentPlayerId = state.players[1 - state.currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: nonCurrentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      expect(() => GameEngine.processAction(state, action)).toThrow();
    });

    it('throws on game finished', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      state.gamePhase = 'gameFinished';
      const currentPlayerId = state.players[state.currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      expect(() => GameEngine.processAction(state, action)).toThrow();
    });
  });

  describe('Pearl taking action', () => {
    it('allows current player to take pearl card', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      const handBefore = state.players[state.currentPlayer].hand.length;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      expect(newState.players[newState.currentPlayer].hand.length).toBeGreaterThan(handBefore);
    });

    it('refills face-up cards after taking one', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      const faceUpBefore = state.faceUpPearls.length;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      expect(newState.faceUpPearls.length).toBe(faceUpBefore);
    });
  });

  describe('Turn management', () => {
    it('advances to next player on endTurn', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob', 'Charlie'], []);
      const currentPlayer = state.currentPlayer;
      const currentPlayerId = state.players[currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.EndTurn,
        playerId: currentPlayerId,
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      expect(newState.currentPlayer).not.toBe(currentPlayer);
    });

    it('resets action count on new turn', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.EndTurn,
        playerId: currentPlayerId,
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      expect(newState.players[newState.currentPlayer].actionCount).toBe(0);
    });
  });

  describe('Game state consistency', () => {
    it('maintains card conservation', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      
      const totalBefore =
        state.pearlDeck.length +
        state.faceUpPearls.length +
        state.pearlDiscardPile.length +
        state.players.reduce((sum, p) => sum + p.hand.length, 0);
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      
      const totalAfter =
        newState.pearlDeck.length +
        newState.faceUpPearls.length +
        newState.pearlDiscardPile.length +
        newState.players.reduce((sum, p) => sum + p.hand.length, 0);

      expect(totalAfter).toBe(totalBefore);
    });

    it('preserves state immutability', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const originalState = JSON.stringify(state);
      const currentPlayerId = state.players[state.currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      GameEngine.processAction(state, action);
      const stateAfter = JSON.stringify(state);
      
      expect(stateAfter).toBe(originalState);
    });
  });

  describe('Game log tracking', () => {
    it('logs all actions', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      const logBefore = state.gameLog.length;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      expect(newState.gameLog.length).toBeGreaterThan(logBefore);
      expect(newState.gameLog[newState.gameLog.length - 1].playerId).toBe(currentPlayerId);
    });

    it('includes action details in log', () => {
      const state = GameEngine.initializeGame(['Alice', 'Bob'], []);
      const currentPlayerId = state.players[state.currentPlayer].id;
      
      const action: GameAction = {
        type: GameActionType.TakePearlCard,
        playerId: currentPlayerId,
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      };

      const newState = GameEngine.processAction(state, action);
      const lastAction = newState.gameLog[newState.gameLog.length - 1];
      
      expect(lastAction.type).toBe(GameActionType.TakePearlCard);
      expect(lastAction.playerId).toBe(currentPlayerId);
    });
  });
});
