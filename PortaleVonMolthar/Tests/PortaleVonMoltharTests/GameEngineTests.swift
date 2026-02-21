import XCTest
@testable import PortaleVonMolthar

final class GameEngineTests: XCTestCase {
    
    func testGameSetup() throws {
        let players = [
            Player(name: "Alice"),
            Player(name: "Bob"),
            Player(name: "Charlie")
        ]
        
        let engine = GameEngine(players: players)
        
        XCTAssertEqual(engine.state.players.count, 3)
        // 56 total minus 4 face up = 52
        XCTAssertEqual(engine.state.pearlDeck.count, 52)
        XCTAssertEqual(engine.state.faceUpPearls.count, 4)
        
        // 54 total minus 2 face up = 52
        XCTAssertEqual(engine.state.characterDeck.count, 52)
        XCTAssertEqual(engine.state.faceUpCharacters.count, 2)
        
        let startPlayers = engine.state.players.filter { $0.board.isStartingPlayer }
        XCTAssertEqual(startPlayers.count, 1)
        
        XCTAssertEqual(engine.state.actionsRemaining, 3)
    }
    
    func testTakePearlCard() throws {
        let players = [Player(name: "Alice")]
        let engine = GameEngine(players: players)
        
        let targetId = engine.state.faceUpPearls.first!.id
        let playerId = engine.state.players[engine.state.currentPlayerIndex].id
        
        try engine.processAction(.takePearlCard(cardId: targetId), for: playerId)
        
        XCTAssertEqual(engine.state.players[0].handCards.count, 1)
        XCTAssertEqual(engine.state.players[0].handCards[0].id, targetId)
        
        // Replenished?
        XCTAssertEqual(engine.state.faceUpPearls.count, 4)
        XCTAssertEqual(engine.state.actionsRemaining, 2)
    }
    
    func testPlaceCharacterExceedsPortalLimit() throws {
        let players = [Player(name: "Alice")]
        let engine = GameEngine(players: players)
        
        let playerId = engine.state.players[0].id
        
        // Place 1st
        try engine.processAction(.placeCharacterOnPortal(cardId: nil), for: playerId)
        XCTAssertEqual(engine.state.players[0].board.activeCharacters.count, 1)
        
        // Place 2nd
        try engine.processAction(.placeCharacterOnPortal(cardId: nil), for: playerId)
        XCTAssertEqual(engine.state.players[0].board.activeCharacters.count, 2)
        
        // Place 3rd - Should throw error
        XCTAssertThrowsError(try engine.processAction(.placeCharacterOnPortal(cardId: nil), for: playerId)) { error in
            XCTAssertEqual(error as? GameError, GameError.portalFull)
        }
    }
}
