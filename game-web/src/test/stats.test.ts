import { describe, it, expect } from 'vitest';
import { GameEngine } from '../game/engine/gameEngine';
import type { CharacterCard } from '../lib/types';

describe('Game Statistics Tests', () => {
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

  it('should track game statistics correctly', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);

    // Perform some actions
    state = GameEngine.processAction(state, {
      type: 'takePearlCard',
      playerId: state.players[0].id,
      payload: { cardIndex: 0 },
      timestamp: Date.now(),
    });

    // Game log should track the action
    expect(state.gameLog.length).toBeGreaterThan(0);
    expect(state.gameLog[0].type).toBe('takePearlCard');
  });

  it('should track player actions separately', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2', 'Player 3'], mockCharacters);
    const player1Id = state.players[0].id;

    // Player 1 takes action
    state = GameEngine.processAction(state, {
      type: 'takePearlCard',
      playerId: player1Id,
      payload: { cardIndex: 0 },
      timestamp: Date.now(),
    });

    // Filter logs by player
    const player1Logs = state.gameLog.filter((log) => log.playerId === player1Id);
    expect(player1Logs.length).toBeGreaterThan(0);
  });

  it('should calculate correct action counts', () => {
    let state = GameEngine.initializeGame(['Player 1', 'Player 2'], mockCharacters);
    const initialLogLength = state.gameLog.length;

    // End turn
    state = GameEngine.processAction(state, {
      type: 'endTurn',
      playerId: state.players[0].id,
      payload: {},
      timestamp: Date.now(),
    });

    // Log should have grown
    expect(state.gameLog.length).toBeGreaterThan(initialLogLength);
  });
});
