import Foundation

/// Analyzes the game state and decides on moves for AI players.
public class AIManager {
    public static let shared = AIManager()
    
    private init() {}
    
    /// Returns the best action for the current AI player.
    public func decideAction(state: GameState, playerIndex: Int) -> GameAction? {
        let player = state.players[playerIndex]
        
        // Phase-specific logic
        if state.currentPhase == .discardingExcessCards {
            // Discard extra cards (just discard the first ones)
            let excess = player.handCards.count - player.handLimit
            if excess > 0 {
                let ids = player.handCards.prefix(excess).map { $0.id }
                return .discardCards(cardIds: ids)
            }
            return nil
        }
        
        // Primary Logic:
        // 1. Can I activate a character?
        for character in player.board.activeCharacters {
            if let cost = findCostSatisfyingCards(character: character, player: player, state: state) {
                return .activateCharacter(cardId: character.id, cost: cost, diamondsUsed: 0) // Simplified: no diamonds for now
            }
        }
        
        // 2. Do I have space on my portal?
        if player.board.activeCharacters.count < 2 {
            // Take the card with the highest points or best ability
            if let bestCenterChar = state.faceUpCharacters.max(by: { $0.powerPoints < $1.powerPoints }) {
                return .placeCharacterOnPortal(cardId: bestCenterChar.id)
            }
            // Or draw from deck
            return .placeCharacterOnPortal(cardId: nil)
        }
        
        // 3. Need more pearls?
        // Look at what we need for the characters on portal
        let neededValues = getNeededValues(player: player)
        for pearl in state.faceUpPearls {
            if neededValues.contains(pearl.value) {
                return .takePearlCard(cardId: pearl.id)
            }
        }
        
        // 4. Just draw a pearl
        return .takePearlCard(cardId: nil)
    }
    
    private func getNeededValues(player: Player) -> Set<Int> {
        // High-level heuristic: what values are required by portal cards?
        // For now, return a broad set.
        return Set([1, 2, 3, 4, 5, 6, 7, 8])
    }
    
    private func findCostSatisfyingCards(character: CharacterCard, player: Player, state: GameState) -> [PearlCard]? {
        // This is a simplified version of the engine's cost verification.
        // It tries to find a subset of hand cards that satisfy the cost.
        // Brute force check for pairs/triplets etc.
        
        let hand = player.handCards
        // Try all combinations? No, just simple check for now.
        // Actually, we can reuse some logic or just do basic check.
        
        // For identicalValues(count: 2)
        if case .identicalValues(let count, let spec) = character.cost {
            let grouped = Dictionary(grouping: hand, by: { $0.value })
            for (val, cards) in grouped {
                if let s = spec, val != s { continue }
                if cards.count >= count {
                    return Array(cards.prefix(count))
                }
            }
        }
        
        return nil
    }
}
