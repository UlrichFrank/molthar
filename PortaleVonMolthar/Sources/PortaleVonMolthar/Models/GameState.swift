import Foundation

/// Defines all possible game actions a player can take.
public enum GameAction: Equatable {
    /// Take one of the 4 face-up pearl cards or draw from the deck.
    case takePearlCard(cardId: UUID?) 
    
    /// Discard all 4 face-up pearl cards and replace them with new ones.
    case flushPearlCards
    
    /// Place a character card from the center or deck onto the player's portal.
    case placeCharacterOnPortal(cardId: UUID?)
    
    /// Pay the cost to activate a character currently on the player's portal.
    case activateCharacter(cardId: UUID, cost: [PearlCard], diamondsUsed: Int)
}

/// Holds the complete state of the game at a given moment.
public struct GameState: Equatable {
    public var players: [Player]
    
    // Turn tracking
    public var currentPlayerIndex: Int
    public var actionsRemaining: Int // Max 3 per turn
    
    // Pearl Cards
    public var pearlDeck: [PearlCard]
    public var pearlDiscardPile: [PearlCard]
    public var faceUpPearls: [PearlCard] // Exactly 4
    
    // Character Cards
    public var characterDeck: [CharacterCard]
    public var characterDiscardPile: [CharacterCard]
    public var faceUpCharacters: [CharacterCard] // Exactly 2
    
    public init(players: [Player]) {
        self.players = players
        self.currentPlayerIndex = 0
        self.actionsRemaining = 3
        
        self.pearlDeck = []
        self.pearlDiscardPile = []
        self.faceUpPearls = []
        
        self.characterDeck = []
        self.characterDiscardPile = []
        self.faceUpCharacters = []
    }
}
