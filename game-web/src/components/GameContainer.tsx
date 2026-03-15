import { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine/gameEngine';
import type { IGameState, CharacterCard } from '../lib/types';
import { GameActionType } from '../lib/types';
import { loadCharacterCards } from '../lib/cardLoader';
import { setupKeyboardShortcuts } from '../lib/keyboard';
import { createSkipLink } from '../lib/accessibility';
import { useToast } from '../hooks/useToast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ToastContainer } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { toasts, removeToast, success, info } = useToast();
  const [savedGameState, setSavedGameState] = useLocalStorage<IGameState | null>('gameState', null);

  /**
   * Retry loading character cards
   */
  const retryLoadCards = async () => {
    try {
      const loadedCards = await loadCharacterCards();
      
      if (loadedCards.length === 0) {
        console.warn('No cards loaded from cards.json, using defaults');
        setCharacters(generateDefaultCharacters());
      } else {
        setCharacters(loadedCards);
      }
      setError(undefined);
      success('Cards loaded successfully!', 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    }
  };

  // Load character cards and setup keyboard/accessibility on mount
  useEffect(() => {
    const loadCards = async () => {
      const loadedCards = await loadCharacterCards();
      
      if (loadedCards.length === 0) {
        console.warn('No cards loaded from cards.json, using defaults');
        setCharacters(generateDefaultCharacters());
      } else {
        setCharacters(loadedCards);
      }
    };
    
    loadCards();

    // Setup keyboard shortcuts
    const unsubscribeKeyboard = setupKeyboardShortcuts({
      onConfirm: () => {
        // Enter key - confirm action
        const confirmBtn = document.querySelector('[data-action="confirm"]') as HTMLButtonElement;
        confirmBtn?.click();
      },
      onCancel: () => {
        // Escape key - cancel/reset
        const cancelBtn = document.querySelector('[data-action="cancel"]') as HTMLButtonElement;
        cancelBtn?.click();
      },
    });

    // Inject skip link for keyboard navigation
    const skipLink = createSkipLink('[role="main"]');
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      unsubscribeKeyboard();
      skipLink.remove();
    };
  }, []);

  /**
   * Initialize new game with selected players
   */
  const initializeGame = (playerNames: string[]) => {
    try {
      if (characters.length === 0) {
        setError('No characters loaded, using defaults');
      }

      const newState = GameEngine.initializeGame(playerNames, characters);
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
  const executeAction = (actionType: GameActionType, payload?: Record<string, unknown>) => {
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
          success('Pearl card taken!', 2000);
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
          success('Character placed!', 2000);
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
          success('Character activated!', 2000);
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
          info('Cards discarded', 2000);
          setSelectedHandIndices([]);
          break;

        case GameActionType.EndTurn:
          newState = GameEngine.processAction(gameState, {
            type: GameActionType.EndTurn,
            playerId: gameState.players[gameState.currentPlayer].id,
            payload: {},
            timestamp: Date.now(),
          });
          info(`Turn ended for ${gameState.players[gameState.currentPlayer].name}`, 2000);
          setSavedGameState(newState);
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

  /**
   * Handle action with optional confirmation dialog
   */
  const handleAction = (actionType: GameActionType, payload?: Record<string, unknown>) => {
    if (actionType === GameActionType.EndTurn) {
      // Show confirmation dialog for end turn
      setDialogMessage('End your turn?');
      setPendingAction(() => () => executeAction(actionType, payload));
      setDialogOpen(true);
    } else {
      executeAction(actionType, payload);
    }
  };

  /**
   * Retry the last failed action
   */
  const retryLastAction = () => {
    if (pendingAction) {
      pendingAction();
    }
  };

  /**
   * Handle dialog confirmation
   */
  const handleDialogConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setDialogOpen(false);
    setPendingAction(null);
  };

  /**
   * Handle dialog cancellation
   */
  const handleDialogCancel = () => {
    setDialogOpen(false);
    setPendingAction(null);
  };

  /**
   * Resume a previously saved game
   */
  const resumeGame = () => {
    if (savedGameState) {
      setGameState(savedGameState);
      setError(undefined);
    }
  };

  // Show start screen if no game initialized
  if (!gameState) {
    return (
      <>
        <GameStartScreen 
          onStartGame={initializeGame}
          onResumeGame={resumeGame}
          canResume={savedGameState !== null && savedGameState.gamePhase !== 'gameFinished'}
        />
        <ErrorDisplay 
          error={error} 
          onDismiss={() => setError(undefined)}
          onRetry={retryLoadCards}
        />
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
      <ErrorDisplay 
        error={error} 
        onDismiss={() => setError(undefined)}
        onRetry={retryLastAction}
      />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmDialog
        isOpen={dialogOpen}
        title="Confirm Action"
        message={dialogMessage}
        confirmText="Yes"
        cancelText="Cancel"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  );
}

/**
 * Generate default characters as fallback
 */
function generateDefaultCharacters(): CharacterCard[] {
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
