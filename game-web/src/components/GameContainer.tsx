import { useState } from 'react';
import { GameEngine } from '../game/engine/gameEngine';
import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { GameBoard } from './GameBoard';
import { GameStartScreen } from './GameStartScreen';
import { GameFinishedScreen } from './GameFinishedScreen';
import { ErrorDisplay } from './ErrorDisplay';

/**
 * Main game container managing game state and coordinating UI components
 */
export function GameContainer() {
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [selectedPearl, setSelectedPearl] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedHandIndices, setSelectedHandIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | undefined>();

  /**
   * Initialize new game with selected players
   */
  const initializeGame = (playerNames: string[]) => {
    try {
      const mockCharacters = generateMockCharacters();
      setCharacters(mockCharacters);

      const newState = GameEngine.initializeGame(playerNames, mockCharacters);
      setGameState(newState);
      setError(undefined);
      setSelectedPearl(null);
      setSelectedCharacter(null);
      setSelectedHandIndices([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
    }
  };

  /**
   * Execute a game action
   */
  const handleAction = (actionType: GameActionType, payload?: Record<string, unknown>) => {
    if (!gameState) return;

    try {
      let newState = gameState;

      switch (actionType) {
        case GameActionType.TakePearlCard:
          if (selectedPearl === null) {
            setError('Select a pearl card');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.TakePearlCard,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: { cardIndex: selectedPearl },
            timestamp: Date.now(),
          });
          setSelectedPearl(null);
          break;

        case GameActionType.PlaceCharacter:
          if (selectedCharacter === null) {
            setError('Select a character card');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.PlaceCharacter,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: { cardIndex: selectedCharacter },
            timestamp: Date.now(),
          });
          setSelectedCharacter(null);
          break;

        case GameActionType.ActivateCharacter:
          if (payload?.characterIndex === undefined) {
            setError('Select a character to activate');
            return;
          }
          if (selectedHandIndices.length === 0) {
            setError('Select pearl cards for payment');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.ActivateCharacter,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: {
              characterIndex: payload.characterIndex,
              pearlCardIndices: selectedHandIndices,
            },
            timestamp: Date.now(),
          });
          setSelectedHandIndices([]);
          break;

        case GameActionType.DiscardCards:
          if (selectedHandIndices.length === 0) {
            setError('Select cards to discard');
            return;
          }
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.DiscardCards,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: { indices: selectedHandIndices },
            timestamp: Date.now(),
          });
          setSelectedHandIndices([]);
          break;

        case GameActionType.EndTurn:
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.EndTurn,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: {},
            timestamp: Date.now(),
          });
          break;

        default:
          setError('Unknown action');
          return;
      }

      setGameState(newState);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  // Show start screen if no game initialized
  if (!gameState) {
    return (
      <>
        <GameStartScreen onStartGame={initializeGame} />
        <ErrorDisplay error={error} onDismiss={() => setError(undefined)} />
      </>
    );
  }

  // Show finish screen if game is over
  if (gameState.gamePhase === 'gameFinished') {
    return (
      <>
        <GameFinishedScreen
          gameState={gameState}
          onPlayAgain={() => setGameState(null)}
        />
        <ErrorDisplay error={error} onDismiss={() => setError(undefined)} />
      </>
    );
  }

  // Show game board
  return (
    <>
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
      <ErrorDisplay error={error} onDismiss={() => setError(undefined)} />
    </>
  );
}

/**
 * Generate mock characters for testing
 */
function generateMockCharacters(): CharacterCard[] {
  return [
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
    {
      id: 'char-3',
      name: 'Knight',
      cost: [{ type: 'nTuple', n: 3 }],
      powerPoints: 4,
      diamonds: 0,
      ability: 'none',
    },
    {
      id: 'char-4',
      name: 'Sorcerer',
      cost: [{ type: 'run', length: 3 }],
      powerPoints: 2,
      diamonds: 3,
      ability: 'none',
    },
  ];
}
