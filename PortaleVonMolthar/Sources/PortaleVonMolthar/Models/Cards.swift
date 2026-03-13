import Foundation

/// Defines a Pearl Card with values from 1 to 8.
public struct PearlCard: Identifiable, Equatable, Codable {
    public let id: UUID
    public let value: Int
    public let hasSwapSymbol: Bool
    
    public init(id: UUID = UUID(), value: Int, hasSwapSymbol: Bool = false) {
        self.id = id
        // Value bounded between 1 and 8 as per rules
        self.value = max(1, min(8, value))
        self.hasSwapSymbol = hasSwapSymbol
    }
}

/// Defines the special abilities a character can have.
public enum CharacterAbilityType: Equatable, Codable {
    // Red abilities (Instant)
    case threeExtraActions
    case nextPlayerOneExtraAction
    case discardOpponentCharacter
    case stealOpponentHandCard
    case takeBackPlayedPearl
    
    // Blue abilities (Permanent/Triggered)
    case onesCanBeEights
    case threesCanBeAny
    case tradeTwoForDiamond
    case handLimitPlusOne
    case oneExtraActionPerTurn
    case swapPortalCharacterBeforeFirstAction
    case redrawHandAfterLastAction
    case peekNextCharacterBeforeFirstAction
    case diamondDecreasesValue
    // Example for pre-printed pearl cards (e.g. "?" or specific value)
    case providesVirtualPearl(value: Int?) // nil means "?" (any)
    
    // Special
    case irrlicht
}

public enum CharacterCost: Equatable, Codable {
    case identicalValues(count: Int, specificValue: Int? = nil) // e.g. Pair (count:2), Drilling of 4s (count:3, specificValue:4)
    case multipleIdenticalValues(counts: [Int], specificValues: [Int?]) // e.g. Two pairs: counts:[2,2], specificValues:[nil, nil]. Or any pair + pair of 6s: counts:[2,2], specificValues:[nil, 6]
    case exactValues([Int]) // e.g. [5,6,7]
    case sum(target: Int, cardCount: Int?) // e.g. Sum of 10 (cardCount: nil), Sum of 7 with 3 cards (cardCount: 3)
    case run(length: Int) // e.g. Run of 3 consecutive numbers
    case allEven(count: Int)
    case allOdd(count: Int)
    case or(Cost1: IndirectCost, Cost2: IndirectCost)
    
    // Helper wrapper for recursive enum
    public indirect enum IndirectCost: Equatable, Codable {
        case cost(CharacterCost)
    }
}

/// Defines a Character Card.
public struct CharacterCard: Identifiable, Equatable, Codable {
    public let id: UUID
    public let name: String // Derived from asset name
    
    // Requirements to activate this character
    public let cost: CharacterCost
    public let powerPoints: Int
    public let diamondsReward: Int
    
    public let ability: CharacterAbilityType?
    
    public let imageName: String
    
    public init(id: UUID = UUID(), name: String, cost: CharacterCost, powerPoints: Int, diamondsReward: Int, ability: CharacterAbilityType? = nil, imageName: String) {
        self.id = id
        self.name = name
        self.cost = cost
        self.powerPoints = powerPoints
        self.diamondsReward = diamondsReward
        self.ability = ability
        self.imageName = imageName
    }
}
