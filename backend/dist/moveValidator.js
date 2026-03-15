/**
 * Move Validator
 *
 * Validates game moves server-side to prevent cheating
 */
export class MoveValidator {
    /**
     * Validate a move submission
     */
    static validateMove(moveName, playerID, payload, gameState) {
        // Check if game state exists
        if (!gameState || !gameState.players) {
            return { valid: false, error: 'Invalid game state' };
        }
        // Check if player exists
        const player = gameState.players[playerID];
        if (!player) {
            return { valid: false, error: 'Player not in game' };
        }
        // Validate move-specific rules
        switch (moveName) {
            case 'takePearlCard':
                return this.validateTakePearlCard(playerID, payload, gameState);
            case 'activateCharacter':
                return this.validateActivateCharacter(playerID, payload, gameState);
            case 'deactivateCharacter':
                return this.validateDeactivateCharacter(playerID, payload, gameState);
            case 'replacePearlSlots':
                return this.validateReplacePearlSlots(playerID, payload, gameState);
            case 'endTurn':
                return this.validateEndTurn(playerID, payload, gameState);
            default:
                return { valid: false, error: `Unknown move: ${moveName}` };
        }
    }
    /**
     * Validate takePearlCard move
     */
    static validateTakePearlCard(_playerID, payload, gameState) {
        if (!payload || typeof payload.slotIndex !== 'number') {
            return { valid: false, error: 'Invalid payload for takePearlCard' };
        }
        const { slotIndex } = payload;
        // Check slot index bounds
        if (slotIndex < -1 || slotIndex >= 4) {
            return { valid: false, error: 'Invalid slot index' };
        }
        // Check if action count allows this move
        if (gameState.actionCount >= 3) {
            return { valid: false, error: 'No more actions available this turn' };
        }
        // Check if cards are available
        if (slotIndex >= 0) {
            if (!gameState.pearlSlots || gameState.pearlSlots.length <= slotIndex) {
                return { valid: false, error: 'Card slot is empty' };
            }
        }
        else if (slotIndex === -1) {
            // Taking from deck
            if (!gameState.pearlDeck || gameState.pearlDeck.length === 0) {
                return { valid: false, error: 'Pearl deck is empty' };
            }
        }
        return { valid: true };
    }
    /**
     * Validate activateCharacter move
     */
    static validateActivateCharacter(playerID, payload, gameState) {
        if (!payload || typeof payload.characterSlotIndex !== 'number') {
            return { valid: false, error: 'Invalid payload for activateCharacter' };
        }
        const { characterSlotIndex } = payload;
        const player = gameState.players[playerID];
        // Check if player's portal is full
        if (player.portal.length >= 2) {
            return { valid: false, error: 'Portal is full (max 2 characters)' };
        }
        // Check if action count allows this move
        if (gameState.actionCount >= 3) {
            return { valid: false, error: 'No more actions available this turn' };
        }
        // Check if character slot exists
        if (!gameState.characterSlots ||
            characterSlotIndex < 0 ||
            characterSlotIndex >= gameState.characterSlots.length) {
            return { valid: false, error: 'Invalid character slot' };
        }
        // Check if player has enough pearl cards (basic check)
        if (!player.hand || player.hand.length === 0) {
            return { valid: false, error: 'No pearl cards in hand to spend' };
        }
        return { valid: true };
    }
    /**
     * Validate replacePearlSlots move
     */
    static validateReplacePearlSlots(_playerID, _payload, gameState) {
        // Check if action count allows this move
        if (gameState.actionCount >= 3) {
            return { valid: false, error: 'No more actions available this turn' };
        }
        // Check if there are enough cards to replace
        if (!gameState.pearlSlots || gameState.pearlSlots.length === 0) {
            return { valid: false, error: 'No pearl slots to replace' };
        }
        return { valid: true };
    }
    /**
     * Validate deactivateCharacter move
     */
    static validateDeactivateCharacter(playerID, payload, gameState) {
        const player = gameState.players[playerID];
        if (!payload || typeof payload.portalIndex !== 'number') {
            return { valid: false, error: 'Invalid payload for deactivateCharacter' };
        }
        const { portalIndex } = payload;
        // Check if action count allows this move
        if (gameState.actionCount >= 3) {
            return { valid: false, error: 'No more actions available this turn' };
        }
        // Check if portal index is valid
        if (portalIndex < 0 || !player.portal || portalIndex >= player.portal.length) {
            return { valid: false, error: 'Invalid portal index' };
        }
        return { valid: true };
    }
    /**
     * Validate endTurn move
     */
    static validateEndTurn(playerID, _payload, gameState) {
        const player = gameState.players[playerID];
        // Check if player needs to discard (hand > 5)
        if (player.hand && player.hand.length > 5) {
            return {
                valid: false,
                error: `Must discard ${player.hand.length - 5} card(s) before ending turn`
            };
        }
        return { valid: true };
    }
    /**
     * Validate that player is taking their turn
     */
    static validateCurrentPlayer(playerID, currentPlayerID) {
        if (playerID !== currentPlayerID) {
            return {
                valid: false,
                error: 'Not your turn'
            };
        }
        return { valid: true };
    }
}
export default MoveValidator;
//# sourceMappingURL=moveValidator.js.map