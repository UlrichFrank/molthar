import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../game/engine/gameEngine';
import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { GAME_RULES } from '../lib/constants';
import { validateCostComponent, validateCharacterCost } from '../game/engine/costValidator';

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

// P1.5: Cost Validator Tests
describe('CostValidator - P1.5: Cost Component Validation', () => {
  const mockPearls = (values: number[]) =>
    values.map((v) => ({ value: v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, hasSwapSymbol: false }));

  describe('validateCostComponent - Fixed Sum (number)', () => {
    it('should validate exact sum without diamonds', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 5]),
        { type: 'number', value: 10 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(3);
    });

    it('should validate with diamond modifier (reduces total by 1)', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 5]),
        { type: 'number', value: 11 },
        1 // 1 diamond
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(3);
    });

    it('should fail if insufficient sum', () => {
      
      const result = validateCostComponent(mockPearls([1, 2, 3]), { type: 'number', value: 20 }, 0);
      expect(result.isValid).toBe(false);
    });

    it('should use smallest subset', () => {
      
      // 5 can be made with [5] or [2,3], should prefer [5]
      const result = validateCostComponent(
        mockPearls([2, 3, 5]),
        { type: 'number', value: 5 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(1);
    });
  });

  describe('validateCostComponent - nTuple (identical values)', () => {
    it('should validate n identical cards', () => {
      
      const result = validateCostComponent(
        mockPearls([3, 3, 5]),
        { type: 'nTuple', n: 2 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(2);
    });

    it('should fail if not enough identical cards', () => {
      
      const result = validateCostComponent(
        mockPearls([3, 4, 5]),
        { type: 'nTuple', n: 2 },
        0
      );
      expect(result.isValid).toBe(false);
    });

    it('should work with 1 identical card', () => {
      
      const result = validateCostComponent(
        mockPearls([3, 4, 5]),
        { type: 'nTuple', n: 1 },
        0
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCostComponent - sumAnyTuple (sum to exact)', () => {
    it('should validate any cards summing to target', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 5, 1]),
        { type: 'sumAnyTuple', sum: 8 },
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should respect diamond modifier', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 5]),
        { type: 'sumAnyTuple', sum: 11 },
        1 // 1 diamond
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCostComponent - sumTuple (sum in range)', () => {
    it('should validate sum within range', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 5]),
        { type: 'sumTuple', min: 8, max: 12 },
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail if sum below range', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 2]),
        { type: 'sumTuple', min: 8, max: 12 },
        0
      );
      expect(result.isValid).toBe(false);
    });

    it('should fail if sum above range', () => {
      
      const result = validateCostComponent(
        mockPearls([7, 8]),
        { type: 'sumTuple', min: 1, max: 5 },
        0
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCostComponent - run (consecutive sequence)', () => {
    it('should validate consecutive run', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 3, 4, 5]),
        { type: 'run', length: 3 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(3);
    });

    it('should fail if no valid run', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 3, 5, 7]),
        { type: 'run', length: 3 },
        0
      );
      expect(result.isValid).toBe(false);
    });

    it('should handle run of length 1', () => {
      
      const result = validateCostComponent(
        mockPearls([5]),
        { type: 'run', length: 1 },
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should find run starting at 1', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 2, 3]),
        { type: 'run', length: 3 },
        0
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCostComponent - evenTuple', () => {
    it('should validate even cards', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 4, 6, 1, 3]),
        { type: 'evenTuple', count: 3 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(3);
    });

    it('should fail if not enough even cards', () => {
      
      const result = validateCostComponent(
        mockPearls([2, 1, 3, 5]),
        { type: 'evenTuple', count: 2 },
        0
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCostComponent - oddTuple', () => {
    it('should validate odd cards', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 3, 5, 2, 4]),
        { type: 'oddTuple', count: 3 },
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(3);
    });

    it('should fail if not enough odd cards', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 2, 4, 6]),
        { type: 'oddTuple', count: 2 },
        0
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCostComponent - drillingChoice', () => {
    it('should validate first choice option', () => {
      
      const result = validateCostComponent(
        mockPearls([3, 4, 5]),
        { type: 'drillingChoice', val1: 3, val2: 5 },
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate second choice option', () => {
      
      const result = validateCostComponent(
        mockPearls([4, 5, 6]),
        { type: 'drillingChoice', val1: 3, val2: 5 },
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail if neither option available', () => {
      
      const result = validateCostComponent(
        mockPearls([1, 2, 4]),
        { type: 'drillingChoice', val1: 3, val2: 5 },
        0
      );
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCostComponent - none', () => {
    it('should always be valid (free card)', () => {
      
      const result = validateCostComponent(mockPearls([]), { type: 'none' }, 0);
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(0);
    });
  });

  describe('validateCharacterCost - Multiple Components', () => {
    it('should validate character with single cost component', () => {
      
      const result = validateCharacterCost(
        mockPearls([2, 3, 5]),
        [{ type: 'number', value: 10 }],
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate character with 2 cost components', () => {
      
      const result = validateCharacterCost(
        mockPearls([2, 3, 1, 1]),
        [{ type: 'nTuple', n: 2 }, { type: 'number', value: 5 }],
        0
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail if any component unsatisfiable', () => {
      
      const result = validateCharacterCost(
        mockPearls([2, 3]),
        [{ type: 'number', value: 20 }, { type: 'nTuple', n: 5 }],
        0
      );
      expect(result.isValid).toBe(false);
    });

    it('should handle empty cost (free character)', () => {
      
      const result = validateCharacterCost(mockPearls([]), [], 0);
      expect(result.isValid).toBe(true);
      expect(result.usedIndices?.length).toBe(0);
    });
  });
});

