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
            for i in 0..<7 {
                // Let's say one card per value has a swap symbol (8 cards total in 56)
                deck.append(PearlCard(value: value, hasSwapSymbol: (i == 0)))
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
            deck.append(CharacterCard(name: "Charakter \(i)", cost: .identicalValues(count: 2), powerPoints: points, diamondsReward: diamonds, imageName: "Charakterkarte\(i)"))
        }
        return deck
    }
    
    // MARK: - Actions
    
    public func processAction(_ action: GameAction, for playerId: UUID) throws {
        let playerIndex = state.players.firstIndex(where: { $0.id == playerId })!
        
        guard playerIndex == state.currentPlayerIndex else {
            throw GameError.notYourTurn
        }
        
        if state.currentPhase == .gameFinished {
            throw GameError.invalidAction // Game is over
        }
        
        switch action {
        case .discardCards(let cardIds):
            guard state.currentPhase == .discardingExcessCards else {
                throw GameError.invalidAction
            }
            try handleDiscardCards(cardIds: cardIds, playerIndex: playerIndex)
            // No action cost for this phase, discarding might end the turn
            return
            
        default:
            guard state.currentPhase == .takingActions else {
                throw GameError.invalidAction
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
            case .useAbility(let ability, let targetPlayerId, let targetCardId, let costCardIds):
                try handleUseAbility(ability: ability, targetPlayerId: targetPlayerId, targetCardId: targetCardId, costCardIds: costCardIds, playerIndex: playerIndex)
                return // Abilities don't cost actions usually, or are handled inside
            case .useBlueAbilityAction(let ability, let cardId):
                try handleBlueAbilityAction(ability: ability, cardId: cardId, playerIndex: playerIndex)
                return // Non-action
            default:
                break
            }
            
            state.actionsRemaining -= 1
        }
        
        // Check Points
        if state.finalRoundTriggeredByPlayerId == nil {
            let pts = state.players[playerIndex].activatedCharacters.map { $0.powerPoints }.reduce(0, +)
            if pts >= 12 {
                state.finalRoundTriggeredByPlayerId = state.players[playerIndex].id
            }
        }
        
        if state.actionsRemaining == 0 {
            endTurn()
        }
    }
    
    private func handleTakePearlCard(cardId: UUID?, playerIndex: Int) throws {
        // Implement logic to draw from face-up cards or deck.
        // Hand limit is checked at the end of the turn in Molthar.
        
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
                if newCard.hasSwapSymbol {
                    refreshFaceUpCharacters()
                }
            }
        } else {
            // Draw from deck
            guard let card = drawPearlCard() else {
                throw GameError.deckEmpty
            }
            state.players[playerIndex].handCards.append(card)
            // Note: drawing directly to hand doesn't trigger swap symbol in Molthar?
            // "Wird dabei eine Karte mit dem Tauschsymbol AUFGEDECKT..."
            // Usually means when it hits the center.
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
                if card.hasSwapSymbol {
                    refreshFaceUpCharacters()
                }
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
        var targetCard: CharacterCard?
        var foundPlayerIdx = playerIndex
        
        if let charIndex = state.players[playerIndex].board.activeCharacters.firstIndex(where: { $0.id == cardId }) {
            targetCard = state.players[playerIndex].board.activeCharacters[charIndex]
        } else {
            // Check neighbors for Irrlicht
            let neighborIndices = [
                (playerIndex + state.players.count - 1) % state.players.count,
                (playerIndex + 1) % state.players.count
            ]
            for nIdx in neighborIndices {
                if let charIndex = state.players[nIdx].board.activeCharacters.firstIndex(where: { $0.id == cardId }) {
                    let card = state.players[nIdx].board.activeCharacters[charIndex]
                    if card.ability == .irrlicht {
                        targetCard = card
                        foundPlayerIdx = nIdx
                        break
                    }
                }
            }
        }
        
        guard let character = targetCard else {
            throw GameError.invalidAction
        }
        
        // Find local charIndex in foundPlayerIdx's board
        guard let charIndex = state.players[foundPlayerIdx].board.activeCharacters.firstIndex(where: { $0.id == cardId }) else {
            throw GameError.invalidAction
        }
        
        // Check Cost Validation
        try unlessCostSatisfied(character: character, cards: cost, diamondsUsed: diamondsUsed) {
            throw GameError.insufficientCost
        }
        // Remove cost cards from hand
        state.lastPlayedPearlCardIds = cost.map { $0.id }
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
        
        // Reward Player (foundPlayerIdx might be neighbor if Irrlicht)
        state.players[foundPlayerIdx].board.activeCharacters.remove(at: charIndex)
        state.players[playerIndex].activatedCharacters.append(character)
        state.players[playerIndex].diamonds += character.diamondsReward
        
        // Trigger Red ability
        if let ability = character.ability {
            triggerRedAbility(ability, playerIndex: playerIndex)
        }
    }
    
    private func triggerRedAbility(_ ability: CharacterAbilityType, playerIndex: Int) {
        switch ability {
        case .threeExtraActions:
            state.actionsRemaining += 3
        case .nextPlayerOneExtraAction:
            let nextIdx = (state.currentPlayerIndex + 1) % state.players.count
            let nextId = state.players[nextIdx].id
            state.nextPlayerExtraActions[nextId, default: 0] += 1
        case .discardOpponentCharacter, .stealOpponentHandCard, .takeBackPlayedPearl:
            // Needs choice
            state.pendingAbilityToResolve = PendingAbility(playerId: state.players[playerIndex].id, ability: ability)
        default:
            // Blue abilities are handled via computed properties or cost validation
            break
        }
    }
    
    private func handleUseAbility(ability: CharacterAbilityType, targetPlayerId: UUID?, targetCardId: UUID?, costCardIds: [UUID]?, playerIndex: Int) throws {
        // Validation: is this the ability pending resolution?
        if let pending = state.pendingAbilityToResolve {
            guard pending.ability == ability && pending.playerId == state.players[playerIndex].id else {
                throw GameError.invalidAction
            }
        }
        
        switch ability {
        case .discardOpponentCharacter:
            guard let tPlayerId = targetPlayerId, let tCardId = targetCardId else { throw GameError.invalidAction }
            guard let tPlayerIdx = state.players.firstIndex(where: { $0.id == tPlayerId }) else { throw GameError.invalidAction }
            guard tPlayerIdx != playerIndex else { throw GameError.invalidAction }
            
            if let cardIdx = state.players[tPlayerIdx].board.activeCharacters.firstIndex(where: { $0.id == tCardId }) {
                let card = state.players[tPlayerIdx].board.activeCharacters.remove(at: cardIdx)
                state.characterDiscardPile.append(card)
            } else {
                throw GameError.invalidAction
            }
            state.pendingAbilityToResolve = nil
            
        case .stealOpponentHandCard:
            guard let tPlayerId = targetPlayerId, let tCardId = targetCardId else { throw GameError.invalidAction }
            guard let tPlayerIdx = state.players.firstIndex(where: { $0.id == tPlayerId }) else { throw GameError.invalidAction }
            guard tPlayerIdx != playerIndex else { throw GameError.invalidAction }
            
            if let cardIdx = state.players[tPlayerIdx].handCards.firstIndex(where: { $0.id == tCardId }) {
                let card = state.players[tPlayerIdx].handCards.remove(at: cardIdx)
                state.players[playerIndex].handCards.append(card)
            } else {
                throw GameError.invalidAction
            }
            state.pendingAbilityToResolve = nil
            
        case .takeBackPlayedPearl:
            guard let tCardId = targetCardId else { throw GameError.invalidAction }
            guard state.lastPlayedPearlCardIds.contains(tCardId) else { throw GameError.invalidAction }
            
            if let discardIdx = state.pearlDiscardPile.firstIndex(where: { $0.id == tCardId }) {
                let card = state.pearlDiscardPile.remove(at: discardIdx)
                state.players[playerIndex].handCards.append(card)
            } else {
                // Might happen if it was a diamond? No, pearls only.
                throw GameError.invalidAction
            }
            state.pendingAbilityToResolve = nil
            
        case .tradeTwoForDiamond:
            // This is a blue ability that is triggered manually
            guard let costIds = costCardIds, costIds.count == 1 else { throw GameError.invalidAction }
            let player = state.players[playerIndex]
            guard player.activatedCharacters.contains(where: { $0.ability == .tradeTwoForDiamond }) else {
                throw GameError.invalidAction
            }
            
            if let cardIdx = state.players[playerIndex].handCards.firstIndex(where: { $0.id == costIds[0] }) {
                let card = state.players[playerIndex].handCards[cardIdx]
                guard card.value == 2 else { throw GameError.invalidAction }
                
                state.players[playerIndex].handCards.remove(at: cardIdx)
                state.pearlDiscardPile.append(card)
                state.players[playerIndex].diamonds += 1
            } else {
                throw GameError.invalidAction
            }
            
        default:
            throw GameError.invalidAction
        }
    }
    
    private func handleBlueAbilityAction(ability: CharacterAbilityType, cardId: UUID?, playerIndex: Int) throws {
        let player = state.players[playerIndex]
        guard player.activatedCharacters.contains(where: { $0.ability == ability }) else {
            throw GameError.invalidAction
        }
        
        switch ability {
        case .swapPortalCharacterBeforeFirstAction:
            // "vor seiner ersten Aktion"
            guard state.actionsRemaining == player.actionsPerTurn else { throw GameError.invalidAction }
            guard let portalCardId = cardId else { throw GameError.invalidAction }
            
            // Logic: swap portal card with face up
            // This needs TWO card IDs? No, usually you pick one from portal and it's swapped with one from center?
            // "gegen eine offene in der Tischmitte austauschen"
            // UI needs to provide which one from center too. I'll assume it's passed in targetCardId if I update the enum.
            // For now, I'll use a simplified version: swap first center card.
            break // WIP
            
        case .redrawHandAfterLastAction:
            // "nach seiner letzten Aktion"
            guard state.actionsRemaining == 0 else { throw GameError.invalidAction }
            let count = player.handCards.count
            state.pearlDiscardPile.append(contentsOf: player.handCards)
            state.players[playerIndex].handCards = (0..<count).compactMap { _ in drawPearlCard() }
            
        default:
            throw GameError.invalidAction
        }
    }
    
    private func handleDiscardCards(cardIds: [UUID], playerIndex: Int) throws {
        let handLimit = 5
        let player = state.players[playerIndex]
        let currentHandCount = player.handCards.count
        
        // We only allow discarding exactly down to the hand limit.
        guard cardIds.count == currentHandCount - handLimit else {
            throw GameError.invalidAction
        }
        
        // Remove from hand, add to discard
        for id in cardIds {
            if let idx = state.players[playerIndex].handCards.firstIndex(where: { $0.id == id }) {
                let card = state.players[playerIndex].handCards.remove(at: idx)
                state.pearlDiscardPile.append(card)
            } else {
                throw GameError.invalidAction
            }
        }
        
        endTurnPhaseTwo()
    }
    
    // MARK: - Turn Logic
    
    public func endTurn() {
        let player = state.players[state.currentPlayerIndex]
        if player.handCards.count > player.handLimit {
            state.currentPhase = .discardingExcessCards
            return
        }
        endTurnPhaseTwo()
    }
    
    private func endTurnPhaseTwo() {
        let currentPlayerId = state.players[state.currentPlayerIndex].id
        
        if let triggerId = state.finalRoundTriggeredByPlayerId {
            // "wird die aktuelle Spielrunde noch bis zum rechten Nachbarn des Startspielers gespielt. 
            // Anschließend ist noch jeder Spieler einmal am Zug." 
            // In a simpler version: everyone gets one last turn.
            if triggerId != currentPlayerId {
                state.playersWhoTookFinalTurn.insert(currentPlayerId)
            } else if state.playersWhoTookFinalTurn.count == state.players.count - 1 {
                state.currentPhase = .gameFinished
                return
            }
        }
        
        // Next player
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.count
        
        // Reset phase
        state.currentPhase = .takingActions
        
        // Calculate actions for new player
        let nextPlayer = state.players[state.currentPlayerIndex]
        var actions = nextPlayer.actionsPerTurn
        
        // Add pending extra actions (red ability)
        if let extras = state.nextPlayerExtraActions[nextPlayer.id] {
            actions += extras
            state.nextPlayerExtraActions[nextPlayer.id] = nil
        }
        
        state.actionsRemaining = actions
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
    
    private func refreshFaceUpCharacters() {
        state.characterDiscardPile.append(contentsOf: state.faceUpCharacters)
        state.faceUpCharacters = (0..<2).compactMap { _ in drawCharacterCard() }
    }
    
    // MARK: - Hand Validation
    
    private func unlessCostSatisfied(character: CharacterCard, cards: [PearlCard], diamondsUsed: Int, onFail: () throws -> Void) rethrows {
        guard verifyCost(cost: character.cost, cards: cards, diamonds: diamondsUsed, playerIndex: state.currentPlayerIndex) else {
            try onFail()
            return
        }
    }
    
    private func verifyCost(cost: CharacterCost, cards: [PearlCard], diamonds: Int, playerIndex: Int) -> Bool {
        let player = state.players[playerIndex]
        let activeAbilities = player.activatedCharacters.compactMap { $0.ability }
        
        // Handle virtual pearls
        var virtualPearlValues: [[Int]] = [[]]
        for ability in activeAbilities {
            if case .providesVirtualPearl(let value) = ability {
                var nextOptions: [[Int]] = []
                for existing in virtualPearlValues {
                    if let v = value {
                        var opt = existing
                        opt.append(v)
                        nextOptions.append(opt)
                    } else {
                        // All 1-8
                        for v in 1...8 {
                            var opt = existing
                            opt.append(v)
                            nextOptions.append(opt)
                        }
                    }
                }
                virtualPearlValues = nextOptions
            }
        }
        
        let onesCanBeEights = activeAbilities.contains(.onesCanBeEights)
        let threesCanBeAny = activeAbilities.contains(.threesCanBeAny)
        let canDecreaseValue = activeAbilities.contains(.diamondDecreasesValue)
        
        func generateOptions(index: Int, currentValues: [Int], diamondsLeft: Int) -> [[Int]] {
            if index == cards.count {
                if diamondsLeft == 0 {
                    return [currentValues]
                }
                return []
            }
            
            var options: [[Int]] = []
            let cardValue = cards[index].value
            
            // Base values for this card
            var baseValues = [cardValue]
            if onesCanBeEights && cardValue == 1 {
                baseValues.append(8)
            }
            if threesCanBeAny && cardValue == 3 {
                baseValues = [1, 2, 3, 4, 5, 6, 7, 8]
            }
            
            for bv in baseValues {
                // Option 1: No diamond
                options.append(contentsOf: generateOptions(index: index + 1, currentValues: currentValues + [bv], diamondsLeft: diamondsLeft))
                
                // Option 2: Diamond increases (+1)
                if diamondsLeft > 0 && bv < 8 {
                    options.append(contentsOf: generateOptions(index: index + 1, currentValues: currentValues + [bv + 1], diamondsLeft: diamondsLeft - 1))
                }
                
                // Option 3: Diamond decreases (-1) - Blue ability
                if diamondsLeft > 0 && bv > 1 && canDecreaseValue {
                    options.append(contentsOf: generateOptions(index: index + 1, currentValues: currentValues + [bv - 1], diamondsLeft: diamondsLeft - 1))
                }
            }
            return options
        }
        
        let allCardOptions = generateOptions(index: 0, currentValues: [], diamondsLeft: diamonds)
        
        for cardOpt in allCardOptions {
            for vOpt in virtualPearlValues {
                if costIsSatisfied(values: cardOpt + vOpt, cost: cost) {
                    return true
                }
            }
        }
        
        return false
    }

    private func costIsSatisfied(values: [Int], cost: CharacterCost) -> Bool {
        switch cost {
        case .identicalValues(let count, let specificValue):
            guard values.count == count else { return false }
            guard values.allSatisfy({ $0 == values[0] }) else { return false }
            if let spec = specificValue {
                return values[0] == spec
            }
            return true
            
        case .multipleIdenticalValues(let counts, let specificValues):
            guard values.count == counts.reduce(0, +) else { return false }
            var countsDict: [Int: Int] = [:]
            for v in values { countsDict[v, default: 0] += 1 }
            
            var availableCounts = countsDict
            for (i, requiredCount) in counts.enumerated() {
                if let rv = specificValues[i] {
                    if availableCounts[rv, default: 0] >= requiredCount {
                        availableCounts[rv]! -= requiredCount
                    } else {
                        return false
                    }
                } else {
                    if let foundKey = availableCounts.first(where: { $1 >= requiredCount })?.key {
                        availableCounts[foundKey]! -= requiredCount
                    } else {
                        return false
                    }
                }
            }
            return true
            
        case .exactValues(let expected):
            return values.sorted() == expected.sorted()
            
        case .sum(let target, let cardCount):
            if let c = cardCount, values.count != c { return false }
            return values.reduce(0, +) == target
            
        case .run(let length):
            guard values.count == length else { return false }
            let sorted = values.sorted()
            for i in 1..<sorted.count {
                if sorted[i] != sorted[i-1] + 1 { return false }
            }
            return true
            
        case .allEven(let count):
            return values.count == count && values.allSatisfy { $0 % 2 == 0 }
            
        case .allOdd(let count):
            return values.count == count && values.allSatisfy { $0 % 2 != 0 }
            
        case .or(let c1, let c2):
            var ok1 = false
            var ok2 = false
            if case .cost(let cc1) = c1 { ok1 = costIsSatisfied(values: values, cost: cc1) }
            if case .cost(let cc2) = c2 { ok2 = costIsSatisfied(values: values, cost: cc2) }
            return ok1 || ok2
        }
    }
}
