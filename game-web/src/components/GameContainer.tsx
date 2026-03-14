import { useState } from 'react';
import { GameEngine } from '../game/engine/gameEngine';
import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { GameBoard } from './GameBoard';
import { GameStartScreen } from './GameStartScreen';
import { GameFinishedScreen } from './GameFinishedScreen';

/**
 * Main game container managing game state and coordinating UI components
 */
export function GameContainer() {
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [selectedPearl, setSelectedPearl] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedHandIndices, setSelectedHandIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize new game with selected players
   */
  const initializeGame = (playerNames: string[]) => {
    try {
      // Load characters from JSON (in production, would come from card-manager)
      const mockCharacters = generateMockCharacters();
      setCharacters(mockCharacters);

      // Initialize game engine
      const newState = GameEngine.initializeGame(playerNames, mockCharacters);
      setGameState(newState);
      setError(null);
      setSelectedPearl(null);
      setSelectedCharacter(null);
      setSelectedHandIndices([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
    }
  };

  /**
   * Process game action
   */
  const handleAction = (
    actionType: GameActionType,
    payload?: Record<string, unknown>
  ) => {
    if (!gameState) return;

    try {
      const playerId = gameState.currentPlayer.toString();

      // Build action based on type
      let newState: IGameState;

      switch (actionType) {
        case GameActionType.TakePearlCard:
          if (selectedPearl === null) {
            setError('Please select a pearl card');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: actionType,
            playerId,
            payload: { pearlIndex: selectedPearl },
            timestamp: Date.now(),
          });
          setSelectedPearl(null);
          break;

        case GameActionType.PlaceCharacter:
          if (selectedCharacter === null) {
            setError('Please select a character card');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: actionType,
            playerId,
            payload: { characterIndex: selectedCharacter },
            timestamp: Date.now(),
          });
          setSelectedCharacter(null);
          break;

        case GameActionType.ActivateCharacter:
          if (payload?.characterIndex === undefined) {
            setError('Please select a character to activate');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: actionType,
            playerId,
            payload: { characterIndex: payload?.characterIndex as number },
            timestamp: Date.now(),
          });
          break;

        case GameActionType.DiscardCards:
          if (selectedHandIndices.length === 0) {
            setError('Please select cards to discard');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: actionType,
            playerId,
            payload: { indices: selectedHandIndices },
            timestamp: Date.now(),
          });
          setSelectedHandIndices([]);
          break;

        case GameActionType.EndTurn:
          newState = GameEngine.processAction(gameState, {
            type: actionType,
            playerId,
            timestamp: Date.now(),
          });
          break;

        default:
          setError(`Unknown action type: ${actionType}`);
          return;
      }

      setGameState(newState);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  /**
   * Reset game for play again
   */
  const resetGame = () => {
    setGameState(null);
    setError(null);
    setSelectedPearl(null);
    setSelectedCharacter(null);
    setSelectedHandIndices([]);
  };

  // Render game start screen if no game active
  if (!gameState) {
    return <GameStartScreen onStartGame={initializeGame} />;
  }

  // Render game finished screen if game is complete
  if (gameState.gamePhase === 'gameFinished') {
    return (
      <GameFinishedScreen
        gameState={gameState}
        onPlayAgain={resetGame}
      />
    );
  }

  // Render main game board
  return (
    <GameBoard
      gameState={gameState}
      characters={characters}
      selectedPearl={selectedPearl}
      selectedCharacter={selectedCharacter}
      selectedHandIndices={selectedHandIndices}
      error={error}
      onSelectPearl={setSelectedPearl}
      onSelectCharacter={setSelectedCharacter}
      onSelectHandCard={(index) => {
        setSelectedHandIndices((prev) =>
          prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]
        );
      }}
      onClearHandSelection={() => setSelectedHandIndices([])}
      onTakePearl={() => handleAction(GameActionType.TakePearlCard)}
      onPlaceCharacter={() => handleAction(GameActionType.PlaceCharacter)}
      onActivateCharacter={(charIdx) =>
        handleAction(GameActionType.ActivateCharacter, { characterIndex: charIdx })
      }
      onDiscardCards={() => handleAction(GameActionType.DiscardCards)}
      onEndTurn={() => handleAction(GameActionType.EndTurn)}
    />
  );
}

/**
 * Generate mock characters for testing
 * In production, load from card-manager export
 */
function generateMockCharacters(): CharacterCard[] {
  return [
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
      cost: [{ type: 'number', value: 8 } as const],
      powerPoints: 3,
      diamonds: 2,
      ability: 'handLimitPlusOne',
    },
    {
      id: 'char-3',
      name: 'Test Character 3',
      cost: [{ type: 'nTuple', n: 2 } as const],
      powerPoints: 4,
      diamonds: 1,
      ability: 'oneExtraActionPerTurn',
    },
    {
      id: 'char-4',
      name: 'Test Character 4',
      cost: [{ type: 'run', length: 3 } as const],
      powerPoints: 5,
      diamonds: 3,
      ability: 'threeExtraActions',
    },
  ];
}
