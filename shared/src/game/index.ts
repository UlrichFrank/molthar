import { INVALID_MOVE } from 'boardgame.io/core';
import type { GameState, PearlCard, CharacterCard, PlayerState, ActivatedCharacter } from './types';
import { consumeCosts, calculateHandLimit, getExcessCardCount, type AbilityModifiers } from './costCalculation';
import { getAllCards as getAllCardDataFromDatabase } from './cardDatabase';
import { applyRedAbility, applyBlueAbility } from './abilityHandlers';
// @ts-ignore - cardDatabaseLoader.js is a side-effect module (Node.js backend only)
import './cardDatabaseLoader.js';
// Load cards in browser environments
import './browserCardDatabaseLoader';

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
        handLimitModifier: 0,
        activeAbilities: [],
        peekedCard: null,
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
      nextPlayerExtraAction: false,
      lastPlayedPearlId: null,
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

      // Fähigkeits-Modifikatoren aus aktiven blauen Fähigkeiten des Spielers zusammenstellen
      const abilityModifiers: AbilityModifiers = {
        onesCanBeEights: player.activeAbilities.some(a => a.type === 'onesCanBeEights'),
        threesCanBeAny: player.activeAbilities.some(a => a.type === 'threesCanBeAny'),
        diamondReductions: player.activeAbilities.some(a => a.type === 'decreaseWithPearl')
          ? player.diamonds
          : undefined,
      };

      // Kosten validieren und konsumieren (atomar: entweder alles oder nichts)
      const consumeResult = consumeCosts(entry.card.cost, selectedCardIndices, player.hand, player.diamonds, abilityModifiers);
      
      if (!consumeResult) {
        return INVALID_MOVE;
      }

      // Update player state: remove consumed cards and update diamond count
      player.hand = consumeResult.hand;
      player.diamonds = consumeResult.diamonds;

      // Add consumed cards to discard pile
      const consumedCards = selectedCards.filter(card => !consumeResult.hand.includes(card));
      consumedCards.forEach(card => G.pearlDiscardPile.push(card));

      // Belohnungen der Karte gutschreiben
      player.powerPoints += entry.card.powerPoints;
      player.diamonds += entry.card.diamonds;
      G.actionCount++;

      // WICHTIG: Karte vom Portal-Array zu activatedCharacters verschieben
      const activatedCard = player.portal.splice(portalSlotIndex, 1)[0];
      if (activatedCard) {
        activatedCard.activated = true;
        player.activatedCharacters.push(activatedCard);

        // Fähigkeiten anwenden
        if (activatedCard.card.abilities && activatedCard.card.abilities.length > 0) {
          for (const ability of activatedCard.card.abilities) {
            if (ability.persistent) {
              applyBlueAbility(player, ability);
            } else {
              applyRedAbility(G, ctx, ability);
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

    swapPortalCharacter({ G, ctx }: { G: GameState; ctx: any }, portalSlotIndex: number, tableSlotIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      // Guard: must be used BEFORE the first action
      if (G.actionCount > 0) return INVALID_MOVE;
      
      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'changeCharacterActions');
      if (!hasAbility) return INVALID_MOVE;

      // Validate bounds
      if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) return INVALID_MOVE;
      if (tableSlotIndex < 0 || tableSlotIndex >= G.characterSlots.length) return INVALID_MOVE;

      const portalChar = player.portal[portalSlotIndex]!;
      const tableChar = G.characterSlots[tableSlotIndex]!;

      // Swap the character cards (IDs and entries stay the same, just the actual card payload shifts)
      G.characterSlots[tableSlotIndex] = portalChar.card;
      portalChar.card = tableChar;

      // Swap takes no actions per rules / design
      return;
    },

    rehandCards({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;

      // Guard: must be used AFTER the last action (actionCount >= maxActions)
      if (G.actionCount < G.maxActions) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'changeHandActions');
      if (!hasAbility) return INVALID_MOVE;

      const currentHandSize = player.hand.length;
      if (currentHandSize === 0) return; // Nothing to discard/rehand

      // Discard current hand
      const discarded = player.hand.splice(0, currentHandSize);
      G.pearlDiscardPile.push(...discarded);

      // Draw exactly the same amount of cards
      for (let i = 0; i < currentHandSize; i++) {
        let card = G.pearlDeck.pop();
        if (!card && G.pearlDiscardPile.length > 0) {
          G.pearlDeck.push(...G.pearlDiscardPile.splice(0));
          shuffleArray(G.pearlDeck);
          card = G.pearlDeck.pop();
        }
        if (card) {
          player.hand.push(card);
        } else {
          // Deck and discard pile empty
          break;
        }
      }
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
    
    peekCharacterDeck({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      
      // Guard: must be used BEFORE the first action
      if (G.actionCount > 0) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'previewCharacter');
      if (!hasAbility) return INVALID_MOVE;

      if (G.characterDeck.length > 0) {
        // Deck ist ein Array, pop() entfernt das letzte Element -> also ist characterDeck[length - 1] die oberste Karte
        player.peekedCard = G.characterDeck[G.characterDeck.length - 1];
      }
      return;
    },

    tradeForDiamond({ G, ctx }: { G: GameState; ctx: any }, handCardIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'tradeTwoForDiamond');
      if (!hasAbility) return INVALID_MOVE;

      if (handCardIndex < 0 || handCardIndex >= player.hand.length) return INVALID_MOVE;
      
      const card = player.hand[handCardIndex];
      // It must be a 2-pearl card
      if (card.value !== 2) return INVALID_MOVE;

      const discardedCard = player.hand.splice(handCardIndex, 1)[0];
      if (discardedCard) {
        G.pearlDiscardPile.push(discardedCard);
      }
      player.diamonds += 1;
      
      // Does not consume an action (free effect)
      return;
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
      if (G.requiresHandDiscard) return INVALID_MOVE;
      G.actionCount = 0;
      events.endTurn();
      return;
    },

  },

  /**
   * Turn Configuration: Reset action count at start of each turn
   */
  turn: {
    onBegin: ({ G, ctx }: { G: GameState; ctx: any }) => {
      G.actionCount = 0;
      // Basisaktionen: 3 + dauerhafte oneExtraActionPerTurn-Fähigkeiten des aktuellen Spielers
      const player = G.players[ctx.currentPlayer];
      const permanentBonus = player
        ? player.activeAbilities.filter(a => a.type === 'oneExtraActionPerTurn').length
        : 0;
      G.maxActions = 3 + permanentBonus;
      // Flag für zusätzliche Aktion des nächsten Spielers auswerten
      if (G.nextPlayerExtraAction) {
        G.maxActions += 1;
        G.nextPlayerExtraAction = false;
      }
    },
    onEnd: ({ G, ctx }: { G: GameState; ctx: any }) => {
      // lastPlayedPearlId am Zugende zurücksetzen
      G.lastPlayedPearlId = null;
      // peekedCard vom Spieler zurücksetzen, falls verwendet (da der Stapel sich ändern kann)
      const player = G.players[ctx.currentPlayer];
      if (player) {
        player.peekedCard = null;
      }
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

// Export cost validation for human players and AI assignment for computer players
export { validateCostPayment, findCostAssignment } from './costCalculation';

// Export card database function (public API)
export { getAllCards } from './cardDatabase';

// Export card loader function (public API)
export { waitForCardsLoaded } from './browserCardDatabaseLoader';

// Export ability handlers (public API for testing and AI)
export { applyRedAbility, applyBlueAbility } from './abilityHandlers';

