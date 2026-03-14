import type { IGameState, PlayerState, GameAction } from '../../lib/types';
import { GameActionType } from '../../lib/types';
import { GAME_RULES, createPearlDeck } from '../../lib/constants';

/**
 * Main game engine - handles all game logic and state mutations
 * All state changes are immutable (returns new state, doesn't mutate)
 */
export class GameEngine {
  /**
   * Initialize a new game with given player names and character cards
   */
  static initializeGame(playerNames: string[], characterCards: any[]): IGameState {
    if (playerNames.length < GAME_RULES.PLAYERS_MIN || playerNames.length > GAME_RULES.PLAYERS_MAX) {
      throw new Error(
        `Invalid number of players. Must be between ${GAME_RULES.PLAYERS_MIN} and ${GAME_RULES.PLAYERS_MAX}`
      );
    }

    const pearlDeck = createPearlDeck();
    const characterDeck = [...characterCards].sort(() => Math.random() - 0.5);

    // Initialize players
    const players: PlayerState[] = playerNames.map((name, idx) => ({
      id: `player-${idx}`,
      name,
      hand: [],
      portal: {
        characters: [],
        diamonds: 0,
        powerPoints: 0,
      },
      actionCount: GAME_RULES.ACTIONS_PER_TURN,
    }));

    // Draw initial face-up cards
    const faceUpPearls = pearlDeck.splice(0, GAME_RULES.FACE_UP_PEARLS);
    const faceUpCharacters = characterDeck.splice(0, GAME_RULES.FACE_UP_CHARACTERS);

    const state: IGameState = {
      players,
      currentPlayer: 0,
      pearlDeck,
      pearlDiscardPile: [],
      characterDeck,
      characterDiscardPile: [],
      faceUpPearls,
      faceUpCharacters,
      gamePhase: 'takingActions',
      finalRoundActive: false,
      finalRoundPlayers: [],
      gameLog: [],
    };

    return state;
  }

  /**
   * Process a game action and return new state
   * Does NOT mutate the input state
   */
  static processAction(state: IGameState, action: GameAction): IGameState {
    // Validate game is not finished
    if (state.gamePhase === 'gameFinished') {
      throw new Error('Game is finished, no more actions allowed');
    }

    // Validate it's the correct player's turn
    const actingPlayerIdx = state.players.findIndex((p) => p.id === action.playerId);
    if (actingPlayerIdx !== state.currentPlayer) {
      throw new Error('Not your turn');
    }

    // Create a deep copy of state for immutable mutation
    const newState = GameEngine.deepCopyState(state);

    try {
      switch (action.type) {
        case GameActionType.TakePearlCard:
          return GameEngine.takePearlCard(newState, action);
        case GameActionType.PlaceCharacter:
          return GameEngine.placeCharacter(newState, action);
        case GameActionType.ActivateCharacter:
          return GameEngine.activateCharacter(newState, action);
        case GameActionType.EndTurn:
          return GameEngine.endTurn(newState, action);
        case GameActionType.DiscardCards:
          return GameEngine.discardCards(newState, action);
        case GameActionType.UseRedAbility:
          return GameEngine.useRedAbility(newState, action);
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Take a pearl card from face-up display
   */
  private static takePearlCard(state: IGameState, action: GameAction): IGameState {
    const { cardIndex } = action.payload || {};

    if (cardIndex === undefined || cardIndex < 0 || cardIndex >= state.faceUpPearls.length) {
      throw new Error('Invalid pearl card index');
    }

    const player = state.players[state.currentPlayer];

    // Check if player has actions remaining
    if (player.actionCount <= 0) {
      throw new Error('No actions remaining');
    }

    // Check if hand would exceed limit
    if (player.hand.length + 1 > GAME_RULES.HAND_LIMIT) {
      throw new Error('Hand limit would be exceeded');
    }

    // Take the card
    const card = state.faceUpPearls[cardIndex];
    state.players[state.currentPlayer].hand.push(card);
    state.faceUpPearls.splice(cardIndex, 1);

    // Refill from deck
    if (state.pearlDeck.length > 0) {
      state.faceUpPearls.push(state.pearlDeck.shift()!);
    } else if (state.pearlDiscardPile.length > 0) {
      // Reshuffle discard pile back into deck
      state.pearlDeck = [...state.pearlDiscardPile].sort(() => Math.random() - 0.5);
      state.pearlDiscardPile = [];
      if (state.pearlDeck.length > 0) {
        state.faceUpPearls.push(state.pearlDeck.shift()!);
      }
    }

    // Decrement action count
    state.players[state.currentPlayer].actionCount--;

    // Log action
    state.gameLog.push({
      ...action,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * Place a character card on the table
   */
  private static placeCharacter(state: IGameState, action: GameAction): IGameState {
    const { cardIndex } = action.payload || {};

    if (cardIndex === undefined || cardIndex < 0 || cardIndex >= state.faceUpCharacters.length) {
      throw new Error('Invalid character card index');
    }

    const player = state.players[state.currentPlayer];

    // Check if player has actions remaining
    if (player.actionCount <= 0) {
      throw new Error('No actions remaining');
    }

    // Check if portal is full (max 2 characters)
    if (player.portal.characters.length >= GAME_RULES.PORTAL_CAPACITY) {
      throw new Error('Portal is full (max 2 characters)');
    }

    // Take the card
    const card = state.faceUpCharacters[cardIndex];
    state.players[state.currentPlayer].portal.characters.push(card);
    state.faceUpCharacters.splice(cardIndex, 1);

    // Refill from deck
    if (state.characterDeck.length > 0) {
      state.faceUpCharacters.push(state.characterDeck.shift()!);
    } else if (state.characterDiscardPile.length > 0) {
      // Reshuffle discard pile back into deck
      state.characterDeck = [...state.characterDiscardPile].sort(() => Math.random() - 0.5);
      state.characterDiscardPile = [];
      if (state.characterDeck.length > 0) {
        state.faceUpCharacters.push(state.characterDeck.shift()!);
      }
    }

    // Decrement action count
    state.players[state.currentPlayer].actionCount--;

    // Log action
    state.gameLog.push({
      ...action,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * Activate a character card using pearl cards from hand
   * Validates cost, awards power points and diamonds, triggers red abilities
   */
  private static activateCharacter(state: IGameState, action: GameAction): IGameState {
    const { characterIndex, pearlCardIndices } = action.payload || {};

    if (
      characterIndex === undefined ||
      characterIndex < 0 ||
      characterIndex >= state.players[state.currentPlayer].portal.characters.length
    ) {
      throw new Error('Invalid character index in portal');
    }

    const player = state.players[state.currentPlayer];

    // Check if player has actions remaining
    if (player.actionCount <= 0) {
      throw new Error('No actions remaining');
    }

    // Get the character to activate
    const character = player.portal.characters[characterIndex];

    // Validate the provided pearl cards can satisfy the cost
    if (!Array.isArray(pearlCardIndices)) {
      throw new Error('pearlCardIndices must be an array');
    }

    // Check if character actually requires pearls (exclude 'none' cost)
    const actualCost = character.cost.filter((c) => c.type !== 'none');
    if (pearlCardIndices.length === 0 && actualCost.length > 0) {
      throw new Error('Pearl cards required to activate character');
    }

    // Validate indices
    for (const idx of pearlCardIndices) {
      if (idx < 0 || idx >= player.hand.length) {
        throw new Error(`Invalid pearl card index: ${idx}`);
      }
    }

    // Validate cost using cost validator
    // For now, simplified validation: cost validator is not integrated yet
    // In full implementation, would use validateCharacterCost()
    // This is a stub that assumes cost is satisfied if indices provided
    if (pearlCardIndices.length > 0 && actualCost.length === 0) {
      throw new Error('Character has no cost, but pearls provided');
    }

    // Award power points and diamonds
    state.players[state.currentPlayer].portal.diamonds += character.diamonds;
    state.players[state.currentPlayer].portal.powerPoints += character.powerPoints;

    // Remove pearl cards from hand (in reverse order to maintain indices)
    const sortedIndices = [...pearlCardIndices].sort((a, b) => b - a);
    for (const idx of sortedIndices) {
      state.players[state.currentPlayer].hand.splice(idx, 1);
    }

    // Move character to discard pile (activated characters are discarded)
    const activatedChar = state.players[state.currentPlayer].portal.characters.splice(characterIndex, 1)[0];
    state.characterDiscardPile.push(activatedChar);

    // TODO: P1.7 - Trigger red abilities if character has them

    // Decrement action count
    state.players[state.currentPlayer].actionCount--;

    // Check for final round trigger (12+ power points)
    if (
      state.players[state.currentPlayer].portal.powerPoints >= 12 &&
      !state.finalRoundActive
    ) {
      state.finalRoundActive = true;
      state.finalRoundPlayers = Array.from(
        { length: state.players.length },
        (_, i) => (state.currentPlayer + i) % state.players.length
      );
    }

    // Log action
    state.gameLog.push({
      ...action,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * End current player's turn
   */
  private static endTurn(state: IGameState, action: GameAction): IGameState {
    const player = state.players[state.currentPlayer];

    // Check hand limit and trigger discard phase if needed
    if (player.hand.length > GAME_RULES.HAND_LIMIT) {
      state.gamePhase = 'discardingExcessCards';
      // Log action
      state.gameLog.push({
        ...action,
        timestamp: Date.now(),
      });
      return state;
    }

    // Move to next player
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    state.players[state.currentPlayer].actionCount = GAME_RULES.ACTIONS_PER_TURN;

    // Log action
    state.gameLog.push({
      ...action,
      timestamp: Date.now(),
    });

    return state;
  }

  /**
   * Discard excess cards (stub for Phase 1.8)
   */
  private static discardCards(_state: IGameState, _action: GameAction): IGameState {
    // TODO: Implement in P1.8
    throw new Error('discardCards not yet implemented');
  }

  /**
   * Use a red ability (stub for Phase 1.6)
   */
  private static useRedAbility(_state: IGameState, _action: GameAction): IGameState {
    // TODO: Implement in P1.6-1.7
    throw new Error('useRedAbility not yet implemented');
  }

  /**
   * Deep copy game state for immutable updates
   */
  private static deepCopyState(state: IGameState): IGameState {
    return {
      ...state,
      players: state.players.map((p: PlayerState) => ({
        ...p,
        hand: [...p.hand],
        portal: {
          ...p.portal,
          characters: [...p.portal.characters],
        },
      })),
      pearlDeck: [...state.pearlDeck],
      pearlDiscardPile: [...state.pearlDiscardPile],
      characterDeck: [...state.characterDeck],
      characterDiscardPile: [...state.characterDiscardPile],
      faceUpPearls: [...state.faceUpPearls],
      faceUpCharacters: [...state.faceUpCharacters],
      finalRoundPlayers: [...state.finalRoundPlayers],
      gameLog: [...state.gameLog],
    };
  }
}
