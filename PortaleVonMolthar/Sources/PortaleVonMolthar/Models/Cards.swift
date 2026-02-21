import Foundation

/// Defines a Pearl Card with values from 1 to 8.
public struct PearlCard: Identifiable, Equatable {
    public let id: UUID
    public let value: Int
    
    public init(id: UUID = UUID(), value: Int) {
        self.id = id
        // Value bounded between 1 and 8 as per rules
        self.value = max(1, min(8, value))
    }
}

/// Defines the special abilities a character can have.
public enum CharacterAbilityType: String, Equatable {
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
    case providesVirtualPearl
    
    // Special
    case irrlicht
}

/// Defines a Character Card.
public struct CharacterCard: Identifiable, Equatable {
    public let id: UUID
    public let name: String // Derived from asset name
    
    // Requirements to activate this character
    public let powerPoints: Int
    public let diamondsReward: Int
    
    public let ability: CharacterAbilityType?
    
    public let imageName: String
    
    public init(id: UUID = UUID(), name: String, powerPoints: Int, diamondsReward: Int, ability: CharacterAbilityType? = nil, imageName: String) {
        self.id = id
        self.name = name
        self.powerPoints = powerPoints
        self.diamondsReward = diamondsReward
        self.ability = ability
        self.imageName = imageName
    }
}
