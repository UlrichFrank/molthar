import Foundation
import Combine

/// Connects the GameEngine logic to the SwiftUI Views.
public class GameViewModel: ObservableObject {
    @Published public private(set) var gameState: GameState
    private let engine: GameEngine
    
    // Player ID representing the human using this device
    public let localPlayerId: UUID
    
    public init(players: [Player], localPlayerId: UUID) {
        self.engine = GameEngine(players: players)
        self.gameState = self.engine.state
        self.localPlayerId = localPlayerId
        
        // Ensure if the start player is an AI, their turn is handled immediately
        checkAITurn()
    }
    
    // MARK: - Intents from View
    
    public func takePearlCard(cardId: UUID?) {
        do {
            try engine.processAction(.takePearlCard(cardId: cardId), for: localPlayerId)
            updateState()
        } catch {
            print("Action failed: \(error)")
        }
    }
    
    public func flushPearlCards() {
        do {
            try engine.processAction(.flushPearlCards, for: localPlayerId)
            updateState()
        } catch {
            print("Action failed: \(error)")
        }
    }
    
    public func placeCharacterOnPortal(cardId: UUID?) {
        do {
            try engine.processAction(.placeCharacterOnPortal(cardId: cardId), for: localPlayerId)
            updateState()
        } catch {
            print("Action failed: \(error)")
        }
    }
    
    public func activateCharacter(cardId: UUID, cost: [PearlCard], diamondsUsed: Int) {
        do {
            try engine.processAction(.activateCharacter(cardId: cardId, cost: cost, diamondsUsed: diamondsUsed), for: localPlayerId)
            updateState()
        } catch {
            print("Action failed: \(error)")
        }
    }
    
    // MARK: - State syncing
    
    private func updateState() {
        // Trigger a UI re-render with the new state
        self.gameState = engine.state
        
        // Check if next player is AI
        checkAITurn()
    }
    
    private func checkAITurn() {
        let currentPlayer = engine.state.players[engine.state.currentPlayerIndex]
        if currentPlayer.isAI {
            // TODO: Trigger AIManager logic here later
            print("AI turn for \(currentPlayer.name) - skip for now")
            // Temporarily auto-end AI turn to prevent halting
            engine.endTurn()
            updateState()
        }
    }
}
