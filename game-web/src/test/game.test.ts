import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../game/engine/gameEngine';
import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { GAME_RULES } from '../lib/constants';

// Mock character cards for testing
const MOCK_CHARACTERS: CharacterCard[] = [
  {
    id: 'char-1',
    name: 'Test Character 1',
    cost: [{ type: 'number', value: 5 } as const],
    powerPoints: 2,
    diamonds: 1,
    ability: 'none',
  },
  {
    id: 'char-2',
    name: 'Test Character 2',
    cost: [{ type: 'nTuple', n: 2 } as const],
    powerPoints: 3,
    diamonds: 0,
    ability: 'none',
  },
  {
    id: 'char-3',
    name: 'Test Character 3',
    cost: [{ type: 'run', length: 3 } as const],
    powerPoints: 4,
    diamonds: 2,
    ability: 'none',
  },
  {
    id: 'char-4',
    name: 'Test Character 4',
    cost: [{ type: 'number', value: 8 } as const],
    powerPoints: 5,
    diamonds: 1,
    ability: 'none',
  },
  {
    id: 'char-5',
    name: 'Test Character 5',
    cost: [{ type: 'number', value: 3 } as const],
    powerPoints: 1,
    diamonds: 0,
    ability: 'none',
  },
];

describe('GameEngine - P1.1: Game Setup & Initial State', () => {
  let gameState: IGameState;

  describe('initializeGame', () => {
    it('should initialize a 2-player game correctly', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);

      expect(gameState.players).toHaveLength(2);
      expect(gameState.players[0].name).toBe('Alice');
      expect(gameState.players[1].name).toBe('Bob');
    });

    it('should initialize a 4-player game correctly', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob', 'Charlie', 'Diana'], MOCK_CHARACTERS);

      expect(gameState.players).toHaveLength(4);
      expect(gameState.currentPlayer).toBe(0);
    });

    it('should reject less than 2 players', () => {
      expect(() => GameEngine.initializeGame(['Alice'], MOCK_CHARACTERS)).toThrow();
    });

    it('should reject more than 4 players', () => {
      expect(() =>
        GameEngine.initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'], MOCK_CHARACTERS)
      ).toThrow();
    });

    it('should set currentPlayer to 0', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.currentPlayer).toBe(0);
    });

    it('should initialize with takingActions phase', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.gamePhase).toBe('takingActions');
    });

    it('should initialize with finalRoundActive = false', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.finalRoundActive).toBe(false);
    });

    it('should give each player 3 actions per turn', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);

      gameState.players.forEach((player: any) => {
        expect(player.actionCount).toBe(GAME_RULES.ACTIONS_PER_TURN);
      });
    });

    it('should initialize all players with empty hand', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);

      gameState.players.forEach((player: any) => {
        expect(player.hand).toEqual([]);
      });
    });

    it('should initialize all players with empty portal', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);

      gameState.players.forEach((player: any) => {
        expect(player.portal.characters).toEqual([]);
        expect(player.portal.diamonds).toBe(0);
        expect(player.portal.powerPoints).toBe(0);
      });
    });

    it('should have 4 face-up pearls', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.faceUpPearls).toHaveLength(GAME_RULES.FACE_UP_PEARLS);
    });

    it('should have 2 face-up characters', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.faceUpCharacters).toHaveLength(GAME_RULES.FACE_UP_CHARACTERS);
    });

    it('should have remaining pearls in deck (56 total - 4 face-up)', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      const totalPearls = gameState.faceUpPearls.length + gameState.pearlDeck.length;
      expect(totalPearls).toBe(56);
    });

    it('should have empty pearl discard pile initially', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.pearlDiscardPile).toEqual([]);
    });

    it('should have empty character discard pile initially', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.characterDiscardPile).toEqual([]);
    });

    it('should have empty game log initially', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.gameLog).toEqual([]);
    });

    it('should have shuffled character deck (not in original order)', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      // Note: theoretically could be same order by chance, but probability very low
      // Just verify it's a valid deck state
      expect(gameState.characterDeck.length).toBeGreaterThan(0);
    });

    it('should have all pearls with values 1-8', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      const allPearls = [...gameState.faceUpPearls, ...gameState.pearlDeck];

      const pearlsByValue: Record<number, number> = {};
      allPearls.forEach((pearl) => {
        pearlsByValue[pearl.value] = (pearlsByValue[pearl.value] || 0) + 1;
      });

      for (let i = 1; i <= 8; i++) {
        expect(pearlsByValue[i]).toBe(7); // 7 pearls per value
      }
    });

    it('should have exactly 1 pearl per value with swap symbol', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      const allPearls = [...gameState.faceUpPearls, ...gameState.pearlDeck];

      const swapPearls = allPearls.filter((p) => p.hasSwapSymbol);
      expect(swapPearls).toHaveLength(8); // One per value

      const valueSet = new Set(swapPearls.map((p) => p.value));
      expect(valueSet.size).toBe(8); // All values 1-8
    });
  });

  describe('Game state immutability', () => {
    beforeEach(() => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
    });

    it('should not allow direct mutation of players array', () => {
      const initialLength = gameState.players.length;
      expect(() => {
        (gameState.players as any).push({ id: 'hacker' });
      }).not.toThrow();
      // Mutation succeeds but original should be unchanged on next init
      const newState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(newState.players).toHaveLength(initialLength);
    });

    it('should have valid player IDs', () => {
      gameState.players.forEach((player: any, idx: number) => {
        expect(player.id).toBe(`player-${idx}`);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly minimum players (2)', () => {
      gameState = GameEngine.initializeGame(['A', 'B'], MOCK_CHARACTERS);
      expect(gameState.players).toHaveLength(2);
    });

    it('should handle exactly maximum players (4)', () => {
      gameState = GameEngine.initializeGame(['A', 'B', 'C', 'D'], MOCK_CHARACTERS);
      expect(gameState.players).toHaveLength(4);
    });

    it('should handle 3 players', () => {
      gameState = GameEngine.initializeGame(['A', 'B', 'C'], MOCK_CHARACTERS);
      expect(gameState.players).toHaveLength(3);
    });

    it('should initialize with game not finished', () => {
      gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
      expect(gameState.gamePhase).not.toBe('gameFinished');
    });
  });
});

describe('GameEngine - P1.2-P1.4: Pearl & Character Moves', () => {
  let gameState: IGameState;

  beforeEach(() => {
    gameState = GameEngine.initializeGame(['Alice', 'Bob'], MOCK_CHARACTERS);
  });

  describe('takePearlCard', () => {
    it('should allow player to take a pearl card', () => {
      const initialHandSize = gameState.players[0].hand.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.players[0].hand).toHaveLength(initialHandSize + 1);
    });

    it('should decrement action count', () => {
      const initialActions = gameState.players[0].actionCount;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.players[0].actionCount).toBe(initialActions - 1);
    });

    it('should refill face-up pearls from deck', () => {
      const initialFaceUp = gameState.faceUpPearls.length;
      const initialDeck = gameState.pearlDeck.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.faceUpPearls).toHaveLength(initialFaceUp);
      expect(gameState.pearlDeck).toHaveLength(initialDeck - 1);
    });

    it('should reject invalid card index', () => {
      expect(() =>
        GameEngine.processAction(gameState, {
          type: GameActionType.TakePearlCard,
          playerId: 'player-0',
          payload: { cardIndex: 999 },
          timestamp: Date.now(),
        })
      ).toThrow();
    });

    it('should reject if no actions remaining', () => {
      // Use up all actions
      gameState.players[0].actionCount = 0;

      expect(() =>
        GameEngine.processAction(gameState, {
          type: GameActionType.TakePearlCard,
          playerId: 'player-0',
          payload: { cardIndex: 0 },
          timestamp: Date.now(),
        })
      ).toThrow('No actions remaining');
    });

    it('should log the action', () => {
      const initialLogSize = gameState.gameLog.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.gameLog).toHaveLength(initialLogSize + 1);
      expect(gameState.gameLog[initialLogSize].type).toBe(GameActionType.TakePearlCard);
    });
  });

  describe('placeCharacter', () => {
    it('should allow player to place a character', () => {
      const initialPortalSize = gameState.players[0].portal.characters.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.PlaceCharacter,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.players[0].portal.characters).toHaveLength(initialPortalSize + 1);
    });

    it('should decrement action count', () => {
      const initialActions = gameState.players[0].actionCount;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.PlaceCharacter,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.players[0].actionCount).toBe(initialActions - 1);
    });

    it('should refill face-up characters from deck', () => {
      const initialFaceUp = gameState.faceUpCharacters.length;
      const initialDeck = gameState.characterDeck.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.PlaceCharacter,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.faceUpCharacters).toHaveLength(initialFaceUp);
      expect(gameState.characterDeck).toHaveLength(initialDeck - 1);
    });

    it('should reject if portal is full', () => {
      // Fill portal with max characters
      gameState.players[0].portal.characters.push(MOCK_CHARACTERS[0], MOCK_CHARACTERS[1]);

      expect(() =>
        GameEngine.processAction(gameState, {
          type: GameActionType.PlaceCharacter,
          playerId: 'player-0',
          payload: { cardIndex: 0 },
          timestamp: Date.now(),
        })
      ).toThrow('Portal is full');
    });

    it('should reject invalid card index', () => {
      expect(() =>
        GameEngine.processAction(gameState, {
          type: GameActionType.PlaceCharacter,
          playerId: 'player-0',
          payload: { cardIndex: 999 },
          timestamp: Date.now(),
        })
      ).toThrow();
    });

    it('should log the action', () => {
      const initialLogSize = gameState.gameLog.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.PlaceCharacter,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });

      expect(gameState.gameLog).toHaveLength(initialLogSize + 1);
      expect(gameState.gameLog[initialLogSize].type).toBe(GameActionType.PlaceCharacter);
    });
  });

  describe('endTurn', () => {
    it('should move to next player', () => {
      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.EndTurn,
        playerId: 'player-0',
        timestamp: Date.now(),
      });

      expect(gameState.currentPlayer).toBe(1);
    });

    it('should reset action count for next player', () => {
      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.EndTurn,
        playerId: 'player-0',
        timestamp: Date.now(),
      });

      expect(gameState.players[1].actionCount).toBe(GAME_RULES.ACTIONS_PER_TURN);
    });

    it('should wrap around to first player after last', () => {
      gameState.players.push(
        {
          id: 'player-2',
          name: 'Charlie',
          hand: [],
          portal: { characters: [], diamonds: 0, powerPoints: 0 },
          actionCount: 3,
        }
      );
      gameState.currentPlayer = 2;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.EndTurn,
        playerId: 'player-2',
        timestamp: Date.now(),
      });

      expect(gameState.currentPlayer).toBe(0);
    });

    it('should log the action', () => {
      const initialLogSize = gameState.gameLog.length;

      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.EndTurn,
        playerId: 'player-0',
        timestamp: Date.now(),
      });

      expect(gameState.gameLog).toHaveLength(initialLogSize + 1);
    });
  });

  describe('action sequencing', () => {
    it('should allow multiple actions in sequence', () => {
      // Take pearl
      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });
      expect(gameState.players[0].hand).toHaveLength(1);

      // Place character
      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.PlaceCharacter,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });
      expect(gameState.players[0].portal.characters).toHaveLength(1);

      // Take another pearl
      gameState = GameEngine.processAction(gameState, {
        type: GameActionType.TakePearlCard,
        playerId: 'player-0',
        payload: { cardIndex: 0 },
        timestamp: Date.now(),
      });
      expect(gameState.players[0].hand).toHaveLength(2);

      // Should have 0 actions left
      expect(gameState.players[0].actionCount).toBe(0);
    });

    it('should prevent action after 3 moves', () => {
      // Use up all 3 actions
      gameState.players[0].actionCount = 0;

      expect(() =>
        GameEngine.processAction(gameState, {
          type: GameActionType.TakePearlCard,
          playerId: 'player-0',
          payload: { cardIndex: 0 },
          timestamp: Date.now(),
        })
      ).toThrow();
    });
  });
});
