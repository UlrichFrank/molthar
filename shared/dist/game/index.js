"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeCosts = exports.findCostAssignment = exports.validateCostPayment = exports.PortaleVonMolthar = void 0;
exports.createPearlDeck = createPearlDeck;
exports.createCharacterDeck = createCharacterDeck;
exports.shuffleArray = shuffleArray;
const costCalculation_1 = require("./costCalculation");
const cardDatabase_1 = require("./cardDatabase");
// @ts-ignore - cardDatabaseLoader.js is a side-effect module
require("./cardDatabaseLoader.js");
/**
 * Helper function for invalid moves
 */
/**
 * PortaleVonMolthar - Complete boardgame.io implementation
 * Turn-based card game with 2-5 players
 */
exports.PortaleVonMolthar = {
    name: 'portale-von-molthar',
    minPlayers: 2,
    maxPlayers: 5,
    /**
     * Setup: Initialize game state
     */
    setup: ({ ctx }) => {
        const playerIds = ctx.playOrder;
        const pearlDeck = createPearlDeck();
        const characterDeck = createCharacterDeck();
        // Shuffle decks
        shuffleArray(pearlDeck);
        shuffleArray(characterDeck);
        // Initialize players
        const players = {};
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
                if (card)
                    players[playerId].hand.push(card);
            }
        }
        // Refill character slots
        const characterSlots = [];
        for (let i = 0; i < 2; i++) {
            const card = characterDeck.pop();
            if (card)
                characterSlots.push(card);
        }
        // Refill pearl slots
        const pearlSlots = [];
        for (let i = 0; i < 4; i++) {
            const card = pearlDeck.pop();
            if (card)
                pearlSlots.push(card);
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
        takePearlCard({ G, ctx }, slotIndex) {
            const player = G.players[ctx.currentPlayer];
            if (!player) {
                return;
            }
            // Check if player has already taken max actions this turn
            if (G.actionCount >= G.maxActions) {
                return;
            }
            // Get card from slot or deck
            let card;
            if (slotIndex >= 0 && slotIndex < 4) {
                card = G.pearlSlots[slotIndex];
                G.pearlSlots.splice(slotIndex, 1);
            }
            else if (slotIndex === -1) {
                card = G.pearlDeck.pop();
            }
            else {
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
                }
                else {
                    break;
                }
            }
        },
        takeCharacterCard({ G, ctx }, slotIndex, replacedSlotIndex) {
            const player = G.players[ctx.currentPlayer];
            if (!player)
                return;
            if (G.actionCount >= G.maxActions)
                return;
            // Get card from face-up slot or deck
            let card;
            if (slotIndex >= 0 && slotIndex < G.characterSlots.length) {
                card = G.characterSlots[slotIndex];
                G.characterSlots.splice(slotIndex, 1);
            }
            else if (slotIndex === -1) {
                card = G.characterDeck.pop();
            }
            else {
                return;
            }
            if (!card)
                return;
            const portalEntry = {
                id: `${player.id}-${Date.now()}-${Math.random()}`,
                card,
                activated: false,
            };
            if (player.portal.length < 2) {
                player.portal.push(portalEntry);
            }
            else if (replacedSlotIndex !== undefined && replacedSlotIndex >= 0 && replacedSlotIndex < 2) {
                const replaced = player.portal[replacedSlotIndex];
                if (replaced) {
                    G.characterDiscardPile.push(replaced.card);
                }
                player.portal[replacedSlotIndex] = portalEntry;
            }
            else {
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
                if (refillCard)
                    G.characterSlots.push(refillCard);
                else
                    break;
            }
        },
        activatePortalCard({ G, ctx }, portalSlotIndex, selectedCardIndices) {
            const player = G.players[ctx.currentPlayer];
            if (!player)
                return;
            if (G.actionCount >= G.maxActions)
                return;
            // Validate portal slot index bounds
            if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) {
                return;
            }
            const entry = player.portal[portalSlotIndex];
            if (!entry)
                return;
            // Get selected cards from hand based on provided indices
            const selectedCards = selectedCardIndices
                .filter(idx => idx >= 0 && idx < player.hand.length)
                .map(idx => player.hand[idx]);
            // Validate and consume costs (atomic: either all succeeds or nothing changes)
            const consumeResult = (0, costCalculation_1.consumeCosts)(entry.card.cost, selectedCards, player.diamonds);
            if (!consumeResult) {
                // Consumption failed - activation rejected
                console.log('[activatePortalCard] Cost consumption failed, rejecting activation');
                return;
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
            }
            // Check if player reached 12+ power points to trigger final round
            if (player.powerPoints >= 12 && !G.finalRound) {
                G.finalRound = true;
                G.finalRoundStartingPlayer = ctx.currentPlayer;
            }
        },
        replacePearlSlots({ G, ctx }) {
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
        discardCards({ G, ctx }, cardIndices) {
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
        endTurn({ G, ctx }) {
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
        onBegin: ({ G }) => {
            G.actionCount = 0;
            G.maxActions = 3;
        },
    },
    /**
     * End If Condition: Check for game end
     */
    endIf: ({ G, ctx }) => {
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
            const winners = {};
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
function createPearlDeck() {
    const deck = [];
    // Create 7 copies of each value 1-8
    for (let value = 1; value <= 8; value++) {
        for (let i = 0; i < 7; i++) {
            deck.push({
                id: `pearl-${value}-${i}`,
                value: value,
                hasSwapSymbol: i === 0, // First copy has swap symbol
            });
        }
    }
    return deck;
}
function createCharacterDeck() {
    return (0, cardDatabase_1.getAllCards)();
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// Export cost calculation functions (public API)
var costCalculation_2 = require("./costCalculation");
Object.defineProperty(exports, "validateCostPayment", { enumerable: true, get: function () { return costCalculation_2.validateCostPayment; } });
Object.defineProperty(exports, "findCostAssignment", { enumerable: true, get: function () { return costCalculation_2.findCostAssignment; } });
Object.defineProperty(exports, "consumeCosts", { enumerable: true, get: function () { return costCalculation_2.consumeCosts; } });
//# sourceMappingURL=index.js.map