import { INVALID_MOVE } from 'boardgame.io/core';
import type { GameState, PearlCard, CharacterCard, PlayerState, ActivatedCharacter } from './types';
import { consumeCosts, calculateHandLimit, getExcessCardCount } from './costCalculation';
import { getAllCards as getAllCardDataFromDatabase } from './cardDatabase';
// @ts-ignore - cardDatabaseLoader.js is a side-effect module (Node.js backend only)
import './cardDatabaseLoader.js';
// Load cards in browser environments
import './browserCardDatabaseLoader';

/**
 * Helper function for invalid moves
 */

/**
 * PortaleVonMolthar - Complete boardgame.io implementation
 * Turn-based card game with 2-5 players
 */
export const PortaleVonMolthar = {
  name: 'portale-von-molthar',
  minPlayers: 2,
  maxPlayers: 5,
  
  /**
   * Setup: Initialize game state
   */
  setup: ({ ctx }: any): GameState => {
    const playerIds = ctx.playOrder;
    const pearlDeck = createPearlDeck();
    const characterDeck = createCharacterDeck();
    
    // Shuffle decks
    shuffleArray(pearlDeck);
    shuffleArray(characterDeck);
    
    // Initialize players
    const players: { [playerId: string]: PlayerState } = {};
    for (const playerId of playerIds) {
      players[playerId] = {
        id: playerId,
        name: `Player ${parseInt(playerId) + 1}`,
        hand: [],
        portal: [],
        activatedCharacters: [],
        powerPoints: 0,
        diamonds: 0,
        readyUp: false,
        isAI: false,
        aiDifficulty: undefined,
        handLimitModifier: 0
      };
    }
    
    // Deal initial pearl cards to players (3 cards each)
    for (const playerId of playerIds) {
      for (let i = 0; i < 3; i++) {
        const card = pearlDeck.pop();
        if (card) players[playerId].hand.push(card);
      }
    }
    
    // Refill character slots
    const characterSlots: CharacterCard[] = [];
    for (let i = 0; i < 2; i++) {
      const card = characterDeck.pop();
      if (card) characterSlots.push(card);
    }
    
    // Refill pearl slots
    const pearlSlots: PearlCard[] = [];
    for (let i = 0; i < 4; i++) {
      const card = pearlDeck.pop();
      if (card) pearlSlots.push(card);
    }
    
    return {
      players,
      pearlDeck,
      characterDeck,
      pearlDiscardPile: [],
      characterDiscardPile: [],
      pearlSlots,
      characterSlots,
      playerOrder: playerIds,
      actionCount: 0,
      maxActions: 3,
      finalRound: false,
      finalRoundStartingPlayer: null,
      requiresHandDiscard: false,
      excessCardCount: 0,
      currentHandLimit: 5,
      startingPlayer: playerIds[0],
      portalEntryCounter: 0,
    };
  },
  
  /**
   * Moves: Player actions
   */
  moves: {
    takePearlCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Get card from slot or deck
      let card: PearlCard | undefined;
      if (slotIndex >= 0 && slotIndex < 4) {
        card = G.pearlSlots[slotIndex];
        G.pearlSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.pearlDeck.pop();
      } else {
        return INVALID_MOVE;
      }

      if (!card) return INVALID_MOVE;
      
      player.hand.push(card);
      G.actionCount++;
      refillSlots(G.pearlSlots, G.pearlDeck, G.pearlDiscardPile, 4);
      return;
    },
    
    takeCharacterCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number, replacedSlotIndex?: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Get card from face-up slot or deck
      let card: CharacterCard | undefined;
      if (slotIndex >= 0 && slotIndex < G.characterSlots.length) {
        card = G.characterSlots[slotIndex];
        G.characterSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.characterDeck.pop();
      } else {
        return INVALID_MOVE;
      }
      if (!card) return INVALID_MOVE;

      G.portalEntryCounter += 1;
      const portalEntry: ActivatedCharacter = {
        id: `${player.id}-${G.portalEntryCounter}`,
        card,
        activated: false,
      };

      if (player.portal.length < 2) {
        player.portal.push(portalEntry);
      } else if (replacedSlotIndex !== undefined && replacedSlotIndex >= 0 && replacedSlotIndex < 2) {
        const replaced = player.portal[replacedSlotIndex];
        if (replaced) {
          G.characterDiscardPile.push(replaced.card);
        }
        player.portal[replacedSlotIndex] = portalEntry;
      } else {
        return INVALID_MOVE;
      }

      G.actionCount++;
      refillSlots(G.characterSlots, G.characterDeck, G.characterDiscardPile, 2);
      return;
    },

    activatePortalCard({ G, ctx }: { G: GameState; ctx: any }, portalSlotIndex: number, selectedCardIndices: number[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Validate portal slot index bounds
      if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) {
        return INVALID_MOVE;
      }

      const entry = player.portal[portalSlotIndex];
      if (!entry) return INVALID_MOVE;

      // Get selected cards from hand based on provided indices
      const selectedCards = selectedCardIndices
        .filter(idx => idx >= 0 && idx < player.hand.length)
        .map(idx => player.hand[idx]);

      // Validate and consume costs (atomic: either all succeeds or nothing changes)
      const consumeResult = consumeCosts(entry.card.cost, selectedCardIndices, player.hand, player.diamonds);
      
      if (!consumeResult) {
        return INVALID_MOVE;
      }

      // Update player state: remove consumed cards and update diamond count
      player.hand = consumeResult.hand;
      player.diamonds = consumeResult.diamonds;

      // Add consumed cards to discard pile
      const consumedCards = selectedCards.filter(card => !consumeResult.hand.includes(card));
      consumedCards.forEach(card => G.pearlDiscardPile.push(card));

      // Grant rewards from the card
      player.powerPoints += entry.card.powerPoints;
      player.diamonds += entry.card.diamonds;
      G.actionCount++;

      // CRITICAL: Move card from portal array to activatedCharacters array
      // This is the definitive state of activation - cards in activatedCharacters
      // are activated, cards in portal are not.
      const activatedCard = player.portal.splice(portalSlotIndex, 1)[0];
      if (activatedCard) {
        // Ensure activatedCharacters array exists
        if (!player.activatedCharacters) {
          player.activatedCharacters = [];
        }
        // Mark as activated (180° rotation indicator)
        activatedCard.activated = true;
        // Add to activated characters collection
        player.activatedCharacters.push(activatedCard);

        // Check if card has handLimitPlusOne ability and increment hand limit modifier
        if (activatedCard.card.abilities && activatedCard.card.abilities.length > 0) {
          for (const ability of activatedCard.card.abilities) {
            if (ability.type === 'handLimitPlusOne') {
              player.handLimitModifier += 1;
              break; // Only count once per character even if multiple abilities
            }
          }
        }
      }

      // Check if player reached 12+ power points to trigger final round
      if (player.powerPoints >= 12 && !G.finalRound) {
        G.finalRound = true;
        G.finalRoundStartingPlayer = ctx.currentPlayer;
      }
      return;
    },

    replacePearlSlots({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;
      
      // Discard all pearl slots, then refill
      G.pearlDiscardPile.push(...G.pearlSlots.splice(0));
      refillSlots(G.pearlSlots, G.pearlDeck, G.pearlDiscardPile, 4);
      G.actionCount++;
      return;
    },
    
    discardCards({ G, ctx }: { G: GameState; ctx: any }, cardIndices?: number[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      
      // Discard cards exceeding hand limit
      if (cardIndices) {
        cardIndices.forEach(idx => {
          if (idx >= 0 && idx < player.hand.length) {
            const card = player.hand.splice(idx, 1)[0];
            G.pearlDiscardPile.push(card);
          }
        });
      }
      return;
    },
    
    discardCardsButton({ G, events }: { G: GameState; events: any }) {
      // Activate discard stage to allow player to select cards
      if (G.requiresHandDiscard && G.excessCardCount > 0) {
        events.setActivePlayers({ currentPlayer: 'discard' });
      }
    },

    discardCardsForHandLimit({ G, ctx, events }: { G: GameState; ctx: any; events: any }, selectedCardIndices: number[]) {
      const player = G.players[ctx.currentPlayer];

      if (!player || !G.requiresHandDiscard) return INVALID_MOVE;
      if (selectedCardIndices.length !== G.excessCardCount) return INVALID_MOVE;

      const validIndices = selectedCardIndices.filter(idx => idx >= 0 && idx < player.hand.length);
      if (validIndices.length !== selectedCardIndices.length) return INVALID_MOVE;

      const sortedIndices = [...validIndices].sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        const discardedCard = player.hand.splice(idx, 1)[0];
        if (discardedCard) {
          G.pearlDiscardPile.push(discardedCard);
        }
      }

      G.requiresHandDiscard = false;
      G.excessCardCount = 0;
      G.actionCount = 0;
      events.endTurn();
      return;
    },

    endTurn({ G, events }: { G: GameState; events: any }) {
      // If discard is required, reject - player must discard first
      if (G.requiresHandDiscard) return;

      // Hand is within limit - proceed with turn end
      G.actionCount = 0;
      events.endTurn();
    },

  },

  /**
   * Turn Configuration: Reset action count at start of each turn
   */
  turn: {
    onBegin: ({ G }: { G: GameState; ctx: any }) => {
      G.actionCount = 0;
      G.maxActions = 3;
    },
    onMove: ({ G, ctx }: { G: GameState; ctx: any }) => {
      // After every move, check if hand exceeds limit
      const player = G.players[ctx.currentPlayer];
      if (!player) return;

      const handLimit = calculateHandLimit(player.handLimitModifier);
      G.currentHandLimit = handLimit;

      const excess = getExcessCardCount(player.hand, handLimit);
      G.requiresHandDiscard = excess > 0;
      G.excessCardCount = excess;
    },
    stages: {
      discard: {
        moves: {},
      },
    },
  },

  /**
   * End If Condition: Check for game end
   */
  endIf: ({ G, ctx }: { G: GameState; ctx: any }) => {
    if (!G.finalRound) {
      return undefined;
    }
    
    // Count how many players have taken a turn since final round started
    const startingPlayerIdx = G.playerOrder.indexOf(G.finalRoundStartingPlayer || '');
    if (startingPlayerIdx === -1) {
      return undefined;
    }
    
    // Simple check: if current player is back to starting player after full round, game is over
    if (ctx.currentPlayer === G.finalRoundStartingPlayer && ctx.turn > G.playerOrder.length) {
      const winners: { [playerID: string]: boolean } = {};
      let maxPoints = Math.max(...G.playerOrder.map(pId => G.players[pId].powerPoints));
      G.playerOrder.forEach(pId => {
        if (G.players[pId].powerPoints === maxPoints) {
          winners[pId] = true;
        }
      });
      return { winner: winners };
    }
    
    return undefined;
  },
};



/**
 * Helper Functions
 */

/**
 * Refill a slot array from a deck, reshuffling the discard pile if the deck runs out.
 * Mutates all three arrays in place (compatible with boardgame.io/Immer).
 */
function refillSlots<T>(slots: T[], deck: T[], discardPile: T[], maxSlots: number): void {
  while (slots.length < maxSlots) {
    let card = deck.pop();
    if (!card && discardPile.length > 0) {
      deck.push(...discardPile.splice(0));
      shuffleArray(deck);
      card = deck.pop();
    }
    if (card) slots.push(card);
    else break;
  }
}

export function createPearlDeck(): PearlCard[] {
  const deck: PearlCard[] = [];
  
  // Create 7 copies of each value 1-8
  for (let value = 1; value <= 8; value++) {
    for (let i = 0; i < 7; i++) {
      deck.push({
        id: `pearl-${value}-${i}`,
        value: value as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8),
        hasSwapSymbol: i === 0, // First copy has swap symbol
      });
    }
  }
  
  return deck;
}

export function createCharacterDeck(): CharacterCard[] {
  return getAllCardDataFromDatabase();
}

export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Export cost calculation functions (public API)
export { validateCostPayment, findCostAssignment, consumeCosts } from './costCalculation';

// Export card database function (public API)
export { getAllCards } from './cardDatabase';

// Export card loader function (public API)
export { waitForCardsLoaded } from './browserCardDatabaseLoader';
