/**
 * Move Validator
 *
 * Validates game moves server-side to prevent cheating
 */
import type { GameState } from '@portale-von-molthar/shared';
export interface MoveValidationResult {
    valid: boolean;
    error?: string;
}
export declare class MoveValidator {
    /**
     * Validate a move submission
     */
    static validateMove(moveName: string, playerID: string, payload: any, gameState: GameState): MoveValidationResult;
    /**
     * Validate takePearlCard move
     */
    private static validateTakePearlCard;
    /**
     * Validate activateCharacter move
     */
    private static validateActivateCharacter;
    /**
     * Validate replacePearlSlots move
     */
    private static validateReplacePearlSlots;
    /**
     * Validate endTurn move
     */
    private static validateEndTurn;
    /**
     * Validate that player is taking their turn
     */
    static validateCurrentPlayer(playerID: string, currentPlayerID: string): MoveValidationResult;
}
export default MoveValidator;
//# sourceMappingURL=moveValidator.d.ts.map