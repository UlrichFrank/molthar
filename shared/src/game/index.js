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
    setup: (ctx) => {
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
            finalRound: false,
            finalRoundStartingPlayer: null,
            startingPlayer: playerIds[0],
        };
    },
    /**
     * Moves: Player actions
     */
    moves: {
        takePearlCard(G, ctx, slotIndex) {
            const player = G.players[ctx.currentPlayer];
            if (!player) {
                return;
            }
            // Check if player has already taken 3 actions this turn
            if (G.actionCount >= 3) {
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
        activateCharacter(G, ctx, slotIndex, usedCards) {
            const player = G.players[ctx.currentPlayer];
            if (!player) {
                return;
            }
            if (G.actionCount >= 3) {
                return;
            }
            if (slotIndex < 0 || slotIndex >= G.characterSlots.length) {
                return;
            }
            if (player.portal.length >= 2) {
                return;
            }
            const character = G.characterSlots[slotIndex];
            if (!character) {
                return;
            }
            // TODO: Validate cost with used cards
            // For now, assume cost is paid
            // Move used cards from hand to discard
            if (usedCards) {
                usedCards.forEach(cardIndex => {
                    if (cardIndex >= 0 && cardIndex < player.hand.length) {
                        const card = player.hand.splice(cardIndex, 1)[0];
                        G.pearlDiscardPile.push(card);
                    }
                });
            }
            // Add character to player's portal
            player.portal.push({
                id: `${ctx.currentPlayer}-${Date.now()}`,
                characterId: character.id,
                activated: false,
            });
            // Add power points and diamonds
            player.powerPoints += character.powerPoints;
            player.diamonds += character.diamonds;
            G.actionCount++;
            // Check if final round should be triggered
            if (player.powerPoints >= 12 && !G.finalRound) {
                G.finalRound = true;
                G.finalRoundStartingPlayer = ctx.currentPlayer;
            }
            // Remove character from slots and refill
            G.characterSlots.splice(slotIndex, 1);
            const refillCard = G.characterDeck.pop();
            if (refillCard) {
                G.characterSlots.push(refillCard);
            }
        },
        replacePearlSlots(G, ctx) {
            const player = G.players[ctx.currentPlayer];
            if (!player) {
                return;
            }
            if (G.actionCount >= 3) {
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
        discardCards(G, ctx, cardIndices) {
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
        endTurn(G, ctx) {
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
     * End If Condition: Check for game end
     */
    endIf: (G, ctx) => {
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
export function createPearlDeck() {
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
export function createCharacterDeck() {
    // Placeholder: 54 character cards
    const deck = [];
    for (let i = 0; i < 54; i++) {
        deck.push({
            id: `character-${i}`,
            name: `Character ${i + 1}`,
            cost: [
                {
                    type: 'number',
                    value: 5 + Math.floor(i / 10),
                }
            ],
            powerPoints: 1 + (i % 5),
            diamonds: Math.floor(i / 20),
            abilities: [],
        });
    }
    return deck;
}
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
//# sourceMappingURL=index.js.map