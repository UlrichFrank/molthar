import Foundation

public enum GameError: Error {
    case notYourTurn
    case outOfActions
    case handLimitExceeded
    case portalFull
    case invalidAction
    case notEnoughCards
    case insufficientCost
    case deckEmpty
}

/// The core engine responsible for handling game rules and state mutations.
public class GameEngine {
    public private(set) var state: GameState
    
    public init(players: [Player]) {
        self.state = GameState(players: players)
        setupGame()
    }
    
    /// Initializes the decks, deals the initial face-up cards, and determines the starting player.
    private func setupGame() {
        // 1. Create decks
        state.pearlDeck = Self.createInitialPearlDeck()
        state.characterDeck = Self.createInitialCharacterDeck()
        
        // 2. Shuffle decks
        state.pearlDeck.shuffle()
        state.characterDeck.shuffle()
        
        // 3. Deal face-up cards
        state.faceUpPearls = (0..<4).compactMap { _ in state.pearlDeck.popLast() }
        state.faceUpCharacters = (0..<2).compactMap { _ in state.characterDeck.popLast() }
        
        // 4. Distribute Portals and determine Start Player
        // 4. Distribute Portals and determine Start Player
        let startPlayerIndex = Int.random(in: 0..<state.players.count)
        var availablePortals = [1, 2, 3, 4, 5].shuffled()
        
        for i in 0..<state.players.count {
            let pId = availablePortals.removeLast()
            state.players[i].board = PlayerBoard(activeCharacters: [], isStartingPlayer: (i == startPlayerIndex), portalId: pId)
        }
        
        state.currentPlayerIndex = startPlayerIndex
    }
    
    /// Generates the standard 56 Pearl Cards.
    public static func createInitialPearlDeck() -> [PearlCard] {
        var deck: [PearlCard] = []
        // Simple 1-8 distribution mapping based on typical games.
        // Assuming equal distribution for now (56 / 8 = 7 per value)
        for value in 1...8 {
            for _ in 0..<7 {
                deck.append(PearlCard(value: value))
            }
        }
        return deck
    }
    
    /// Generates the standard 54 Character Cards with diamond backs.
    public static func createInitialCharacterDeck() -> [CharacterCard] {
        var deck: [CharacterCard] = []
        // For testing purposes, generic characters. We will need the specific breakdown from the assets.
        for i in 1...54 {
            let points = Int.random(in: 1...5)
            let diamonds = Int.random(in: 0...2)
            deck.append(CharacterCard(name: "Charakter \(i)", powerPoints: points, diamondsReward: diamonds, imageName: "Charakterkarte\(i)"))
        }
        return deck
    }
    
    // MARK: - Actions
    
    public func processAction(_ action: GameAction, for playerId: UUID) throws {
        let playerIndex = state.players.firstIndex(where: { $0.id == playerId })!
        
        guard playerIndex == state.currentPlayerIndex else {
            throw GameError.notYourTurn
        }
        
        guard state.actionsRemaining > 0 else {
            throw GameError.outOfActions
        }
        
        switch action {
        case .takePearlCard(let cardId):
            try handleTakePearlCard(cardId: cardId, playerIndex: playerIndex)
        case .flushPearlCards:
            try handleFlushPearlCards(playerIndex: playerIndex)
        case .placeCharacterOnPortal(let cardId):
            try handlePlaceCharacter(cardId: cardId, playerIndex: playerIndex)
        case .activateCharacter(let cardId, let cost, let diamondsUsed):
            try handleActivateCharacter(cardId: cardId, cost: cost, diamondsUsed: diamondsUsed, playerIndex: playerIndex)
        }
        
        state.actionsRemaining -= 1
        
        if state.actionsRemaining == 0 {
            endTurn()
        }
    }
    
    private func handleTakePearlCard(cardId: UUID?, playerIndex: Int) throws {
        // Implement logic to draw from face-up cards or deck.
        guard state.players[playerIndex].handCards.count < 5 else {
            throw GameError.handLimitExceeded
        }
        
        if let targetId = cardId {
            // Take from face-up
            guard let index = state.faceUpPearls.firstIndex(where: { $0.id == targetId }) else {
                throw GameError.invalidAction
            }
            let card = state.faceUpPearls.remove(at: index)
            state.players[playerIndex].handCards.append(card)
            
            // Replenish
            if let newCard = drawPearlCard() {
                state.faceUpPearls.insert(newCard, at: index)
            }
        } else {
            // Draw from deck
            guard let card = drawPearlCard() else {
                throw GameError.deckEmpty
            }
            state.players[playerIndex].handCards.append(card)
        }
    }
    
    private func handleFlushPearlCards(playerIndex: Int) throws {
        // Discard 4 face up
        state.pearlDiscardPile.append(contentsOf: state.faceUpPearls)
        state.faceUpPearls.removeAll()
        
        // Deal 4 new
        for _ in 0..<4 {
            if let card = drawPearlCard() {
                state.faceUpPearls.append(card)
            }
        }
    }
    
    private func handlePlaceCharacter(cardId: UUID?, playerIndex: Int) throws {
        guard state.players[playerIndex].board.activeCharacters.count < 2 else {
            throw GameError.portalFull
        }
        
        if let targetId = cardId {
            // Take from face up
            guard let index = state.faceUpCharacters.firstIndex(where: { $0.id == targetId }) else {
                throw GameError.invalidAction
            }
            let card = state.faceUpCharacters.remove(at: index)
            state.players[playerIndex].board.activeCharacters.append(card)
            
            // Replenish
            if let newCard = drawCharacterCard() {
                state.faceUpCharacters.insert(newCard, at: index)
            }
        } else {
            // Draw from deck
            guard let card = drawCharacterCard() else {
                throw GameError.deckEmpty
            }
            state.players[playerIndex].board.activeCharacters.append(card)
        }
    }
    
    private func handleActivateCharacter(cardId: UUID, cost: [PearlCard], diamondsUsed: Int, playerIndex: Int) throws {
        // Find character
        guard let charIndex = state.players[playerIndex].board.activeCharacters.firstIndex(where: { $0.id == cardId }) else {
            throw GameError.invalidAction
        }
        
        let character = state.players[playerIndex].board.activeCharacters[charIndex]
        
        // TODO: Verify cost array matches the target character's requirements.
        // For now, assume it's valid if provided.
        
        // Remove cost cards from hand
        for c in cost {
            if let handIndex = state.players[playerIndex].handCards.firstIndex(where: { $0.id == c.id }) {
                let discarded = state.players[playerIndex].handCards.remove(at: handIndex)
                state.pearlDiscardPile.append(discarded)
            }
        }
        
        // Remove diamonds
        guard state.players[playerIndex].diamonds >= diamondsUsed else {
            throw GameError.invalidAction // Not enough diamonds
        }
        state.players[playerIndex].diamonds -= diamondsUsed
        
        // Reward Player
        state.players[playerIndex].board.activeCharacters.remove(at: charIndex)
        state.players[playerIndex].activatedCharacters.append(character)
        state.players[playerIndex].diamonds += character.diamondsReward
    }
    
    // MARK: - Turn Logic
    
    public func endTurn() {
        // Next player
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.count
        state.actionsRemaining = 3
    }
    
    // MARK: - Helper Methods
    
    private func drawPearlCard() -> PearlCard? {
        if state.pearlDeck.isEmpty {
            state.pearlDeck = state.pearlDiscardPile.shuffled()
            state.pearlDiscardPile.removeAll()
        }
        return state.pearlDeck.popLast()
    }
    
    private func drawCharacterCard() -> CharacterCard? {
        if state.characterDeck.isEmpty {
            state.characterDeck = state.characterDiscardPile.shuffled()
            state.characterDiscardPile.removeAll()
        }
        return state.characterDeck.popLast()
    }
}
