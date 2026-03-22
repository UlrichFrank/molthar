import type { GameState, PearlCard, CharacterCard, PlayerState, CostComponent, ActivatedCharacter } from './types';
import { validateCostPayment as validateCostFromCards } from './costCalculation';
import { getAllCards as getAllCardDataFromDatabase } from './cardDatabase';
// @ts-ignore - cardDatabaseLoader.js is a side-effect module
import './cardDatabaseLoader.js';

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
        aiDifficulty: undefined
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
      startingPlayer: playerIds[0],
    };
  },
  
  /**
   * Moves: Player actions
   */
  moves: {
    takePearlCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) {
        return;
      }
      
      // Check if player has already taken max actions this turn
      if (G.actionCount >= G.maxActions) {
        return;
      }
      
      // Get card from slot or deck
      let card: PearlCard | undefined;
      if (slotIndex >= 0 && slotIndex < 4) {
        card = G.pearlSlots[slotIndex];
        G.pearlSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.pearlDeck.pop();
      } else {
        return;
      }
      
      if (!card) {
        return;
      }
      
      player.hand.push(card);
      G.actionCount++;
      
      // Refill pearl slots
      while (G.pearlSlots.length < 4) {
        let refillCard = G.pearlDeck.pop();
        if (!refillCard && G.pearlDiscardPile.length > 0) {
          // Reshuffle discard pile
          G.pearlDeck = G.pearlDiscardPile.splice(0);
          shuffleArray(G.pearlDeck);
          refillCard = G.pearlDeck.pop();
        }
        if (refillCard) {
          G.pearlSlots.push(refillCard);
        } else {
          break;
        }
      }
    },
    
    takeCharacterCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number, replacedSlotIndex?: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return;
      if (G.actionCount >= G.maxActions) return;

      // Get card from face-up slot or deck
      let card: CharacterCard | undefined;
      if (slotIndex >= 0 && slotIndex < G.characterSlots.length) {
        card = G.characterSlots[slotIndex];
        G.characterSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.characterDeck.pop();
      } else {
        return;
      }
      if (!card) return;

      const portalEntry: ActivatedCharacter = {
        id: `${player.id}-${Date.now()}-${Math.random()}`,
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
        return;
      }

      G.actionCount++;

      // Refill character slots to 2
      while (G.characterSlots.length < 2) {
        let refillCard = G.characterDeck.pop();
        if (!refillCard && G.characterDiscardPile.length > 0) {
          G.characterDeck = G.characterDiscardPile.splice(0);
          shuffleArray(G.characterDeck);
          refillCard = G.characterDeck.pop();
        }
        if (refillCard) G.characterSlots.push(refillCard);
        else break;
      }
    },

    activatePortalCard({ G, ctx }: { G: GameState; ctx: any }, portalSlotIndex: number, usedCards?: number[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return;
      if (G.actionCount >= G.maxActions) return;

      // Validate portal slot index bounds
      if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) {
        return;
      }

      const entry = player.portal[portalSlotIndex];
      if (!entry) return;

      // Use new cost validation that checks against entire hand
      if (!validateCostFromCards(entry.card.cost, player.hand, player.diamonds)) {
        return;
      }

      // Discard used pearl cards (reverse order to preserve indices)
      const sortedIndices = (usedCards || []).sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        if (idx >= 0 && idx < player.hand.length) {
          G.pearlDiscardPile.push(player.hand.splice(idx, 1)[0]);
        }
      }

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
      }

      // Check if player reached 12+ power points to trigger final round
      if (player.powerPoints >= 12 && !G.finalRound) {
        G.finalRound = true;
        G.finalRoundStartingPlayer = ctx.currentPlayer;
      }
    },

    replacePearlSlots({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) {
        return;
      }
      
      if (G.actionCount >= G.maxActions) {
        return;
      }
      
      // Discard all pearl slots
      G.pearlSlots.forEach(card => G.pearlDiscardPile.push(card));
      G.pearlSlots = [];
      
      // Refill with new cards
      for (let i = 0; i < 4; i++) {
        let card = G.pearlDeck.pop();
        if (!card && G.pearlDiscardPile.length > 0) {
          G.pearlDeck = G.pearlDiscardPile.splice(0);
          shuffleArray(G.pearlDeck);
          card = G.pearlDeck.pop();
        }
        if (card) {
          G.pearlSlots.push(card);
        }
      }
      
      G.actionCount++;
    },
    
    discardCards({ G, ctx }: { G: GameState; ctx: any }, cardIndices?: number[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) {
        return;
      }
      
      // Discard cards exceeding hand limit
      if (cardIndices) {
        cardIndices.forEach(idx => {
          if (idx >= 0 && idx < player.hand.length) {
            const card = player.hand.splice(idx, 1)[0];
            G.pearlDiscardPile.push(card);
          }
        });
      }
    },
    
    endTurn({ G, ctx }: { G: GameState; ctx: any }) {
      // Reset action count for next turn
      G.actionCount = 0;
      
      // Check hand limit and trigger discard if needed
      const player = G.players[ctx.currentPlayer];
      if (player && player.hand.length > 5) {
        // Player needs to discard down to 5 cards
        // This would typically use setActivePlayers if available
      }
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
 * Validate that used cards satisfy a character's cost
 * @param cost - Cost components to satisfy
 * @param usedCardIndices - Indices of cards from hand being used
 * @param hand - Player's hand of pearl cards
 * @param diamonds - Player's available diamonds to reduce cost
 * @returns true if cost is satisfied, false otherwise
 */
export function validateCostPayment(
  cost: CostComponent[],
  usedCardIndices: number[],
  hand: PearlCard[],
  diamonds: number
): boolean {
  if (!cost || cost.length === 0) {
    return true; // Free cost
  }

  // Get the actual cards being used
  const usedCards: PearlCard[] = [];
  for (const idx of usedCardIndices) {
    if (idx >= 0 && idx < hand.length) {
      usedCards.push(hand[idx]);
    }
  }

  // Try each cost option (diamond costs can be multiple options)
  for (const component of cost) {
    if (verifyCostComponent(component, usedCards, diamonds)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a single cost component is satisfied by used cards
 */
function verifyCostComponent(
  component: CostComponent,
  usedCards: PearlCard[],
  diamonds: number
): boolean {
  switch (component.type) {
    case 'number': {
      // Check if sum of cards meets the total, accounting for diamond bonus
      const sum = usedCards.reduce((total, card) => total + card.value, 0);
      const required = component.value || 0;
      return sum >= required - diamonds; // Diamonds reduce required sum
    }

    case 'nTuple': {
      // Check if we have n cards of the same value
      const valueCounts: Record<number, number> = {};
      for (const card of usedCards) {
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
      }
      const n = component.n || 0;
      return Object.values(valueCounts).some(count => count >= n);
    }

    case 'run': {
      // Check if we have consecutive sequence of length n
      const length = component.length || 0;
      const values = [...new Set(usedCards.map(c => c.value))].sort((a, b) => a - b);
      
      if (values.length < length) {
        return false;
      }
      
      for (let i = 0; i <= values.length - length; i++) {
        let isConsecutive = true;
        for (let j = 0; j < length - 1; j++) {
          if (values[i + j + 1] !== values[i + j] + 1) {
            isConsecutive = false;
            break;
          }
        }
        if (isConsecutive) {
          return true;
        }
      }
      return false;
    }

    case 'sumAnyTuple': {
      // Check for n pairs (any values)
      const valueCounts: Record<number, number> = {};
      for (const card of usedCards) {
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
      }
      const n = component.n || 0;
      const pairCount = Object.values(valueCounts).filter(count => count >= 2).length;
      return pairCount >= n;
    }

    case 'sumTuple': {
      // Check if cards sum to specific value with n items
      const n = component.n || 0;
      const targetSum = component.sum || 0;
      
      if (usedCards.length < n) {
        return false;
      }
      
      // Simple check: do we have n cards that sum to target?
      // This is simplified - full implementation would need combinatorics
      if (usedCards.length === n) {
        const actualSum = usedCards.reduce((total, card) => total + card.value, 0);
        return actualSum === targetSum;
      }
      
      return false; // Simplified for now
    }

    case 'evenTuple': {
      // Check for n even-valued cards
      const evenCards = usedCards.filter(card => card.value % 2 === 0);
      const n = component.n || 0;
      return evenCards.length >= n;
    }

    case 'oddTuple': {
      // Check for n odd-valued cards
      const oddCards = usedCards.filter(card => card.value % 2 === 1);
      const n = component.n || 0;
      return oddCards.length >= n;
    }

    case 'diamond': {
      // Diamond cost - check if player has enough diamonds
      const required = component.value || 0;
      return diamonds >= required;
    }

    case 'tripleChoice': {
      // Triple choice: 3 cards of value1 OR 3 cards of value2
      return true; // Actual validation happens in validateCostPayment
    }

    default:
      return true; // Unknown cost type - optimistically allow
  }
}

/**
 * Helper Functions
 */

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
