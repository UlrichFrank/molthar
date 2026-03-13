import Foundation

/// Defines all possible game actions a player can take.
public enum GameAction: Equatable, Codable {
    /// Take one of the 4 face-up pearl cards or draw from the deck.
    case takePearlCard(cardId: UUID?) 
    
    /// Discard all 4 face-up pearl cards and replace them with new ones.
    case flushPearlCards
    
    /// Place a character card from the center or deck onto the player's portal.
    case placeCharacterOnPortal(cardId: UUID?)
    
    /// Pay the cost to activate a character currently on the player's portal.
    case activateCharacter(cardId: UUID, cost: [PearlCard], diamondsUsed: Int)
    
    /// Discard excess hand cards when the hand limit is exceeded at the end of the turn.
    case discardCards(cardIds: [UUID])
    
    /// Use an ability (red instant or blue active).
    case useAbility(ability: CharacterAbilityType, targetPlayerId: UUID? = nil, targetCardId: UUID? = nil, costCardIds: [UUID]? = nil)
    
    /// Special non-action moves granted by abilities.
    case useBlueAbilityAction(ability: CharacterAbilityType, cardId: UUID? = nil)
}

/// The phase of the current player's turn.
public enum TurnPhase: String, Equatable, Codable {
    case takingActions
    case discardingExcessCards
    case gameFinished
}

public struct PendingAbility: Equatable, Codable {
    public let playerId: UUID
    public let ability: CharacterAbilityType
}

/// Holds the complete state of the game at a given moment.
public struct GameState: Equatable, Codable {
    public var players: [Player]
    
    // Turn tracking
    public var currentPlayerIndex: Int
    public var actionsRemaining: Int // Max 3 per turn
    public var currentPhase: TurnPhase
    public var finalRoundTriggeredByPlayerId: UUID?
    public var playersWhoTookFinalTurn: Set<UUID>
    
    // Character effects
    public var nextPlayerExtraActions: [UUID: Int] = [:] // Map for playerId -> extra actions
    public var pendingAbilityToResolve: PendingAbility?
    public var lastPlayedPearlCardIds: [UUID] = []
    
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
        self.currentPhase = .takingActions
        self.playersWhoTookFinalTurn = []
    }
}
