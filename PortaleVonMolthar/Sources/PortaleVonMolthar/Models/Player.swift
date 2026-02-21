import Foundation

/// Represents a player's personal portal board (the area where cards are placed before activation).
public struct PlayerBoard: Equatable {
    /// 0 to 2 cards placed on the board waiting to be activated.
    public var activeCharacters: [CharacterCard]
    public let isStartingPlayer: Bool
    public let portalId: Int
    
    public init(activeCharacters: [CharacterCard] = [], isStartingPlayer: Bool = false, portalId: Int = 1) {
        self.activeCharacters = activeCharacters
        self.isStartingPlayer = isStartingPlayer
        self.portalId = portalId
    }
}

/// Represents an individual player (Human or AI).
public struct Player: Identifiable, Equatable {
    public let id: UUID
    public let name: String
    public let isAI: Bool
    
    // Player's assets
    public var handCards: [PearlCard]
    public var board: PlayerBoard
    
    // Activated characters that yield power points/abilities
    public var activatedCharacters: [CharacterCard]
    
    // Diamonds accumulated
    public var diamonds: Int
    
    // Total power points from activated characters
    public var powerPoints: Int {
        activatedCharacters.reduce(0) { $0 + $1.powerPoints }
    }
    
    public init(id: UUID = UUID(), name: String, isAI: Bool = false) {
        self.id = id
        self.name = name
        self.isAI = isAI
        
        self.handCards = []
        self.board = PlayerBoard(activeCharacters: [], isStartingPlayer: false, portalId: 1)
        self.activatedCharacters = []
        self.diamonds = 0
    }
}
