import SwiftUI

public struct GameBoardView: View {
    @ObservedObject var viewModel: GameViewModel
    
    // UI State for activating a character
    @State private var selectedHandCards: Set<UUID> = []
    
    public init(viewModel: GameViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        VStack {
            // Top: Opponents Area
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(viewModel.gameState.players.filter { $0.id != viewModel.localPlayerId }) { opponent in
                        OpponentView(player: opponent)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            
            Divider()
            
            // Middle: Center Table (Face up cards, Draw Piles)
            CenterTableView(
                pearlCards: viewModel.gameState.faceUpPearls,
                characterCards: viewModel.gameState.faceUpCharacters,
                onPearlTap: { card in if isLocalPlayerTurn { viewModel.takePearlCard(cardId: card.id) } },
                onCharacterTap: { card in if isLocalPlayerTurn { viewModel.placeCharacterOnPortal(cardId: card.id) } },
                onPearlDeckTap: { if isLocalPlayerTurn { viewModel.takePearlCard(cardId: nil) } },
                onCharacterDeckTap: { if isLocalPlayerTurn { viewModel.placeCharacterOnPortal(cardId: nil) } }
            )
            .frame(maxHeight: .infinity)
            
            Divider()
            
            // Bottom: Local Player Area (Portal + Hand)
            if let localPlayer = viewModel.gameState.players.first(where: { $0.id == viewModel.localPlayerId }) {
                LocalPlayerView(
                    player: localPlayer,
                    selectedHandCards: $selectedHandCards,
                    onActivateTap: { characterId in
                        if isLocalPlayerTurn {
                            activateSelectedCharacter(characterId: characterId, player: localPlayer)
                        }
                    }
                )
            }
            
            // End Turn Context
            HStack {
                Text("Actions left: \(viewModel.gameState.actionsRemaining)")
                Spacer()
                if isLocalPlayerTurn {
                    Button("Flush Pearls") {
                        viewModel.flushPearlCards()
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
            .background(isLocalPlayerTurn ? Color.green.opacity(0.2) : Color.red.opacity(0.1))
        }
    }
    
    private var isLocalPlayerTurn: Bool {
        let currentPlayer = viewModel.gameState.players[viewModel.gameState.currentPlayerIndex]
        return currentPlayer.id == viewModel.localPlayerId
    }
    
    private func activateSelectedCharacter(characterId: UUID, player: Player) {
        // Find corresponding PearlCards from IDs
        let costCards = player.handCards.filter { selectedHandCards.contains($0.id) }
        viewModel.activateCharacter(cardId: characterId, cost: costCards, diamondsUsed: 0)
        
        // Clear selection after attempt
        selectedHandCards.removeAll()
    }
}

// MARK: - Subviews

struct OpponentView: View {
    let player: Player
    
    var body: some View {
        VStack {
            Text(player.name).fontWeight(.bold)
            Text("Points: \(player.powerPoints) 💎: \(player.diamonds)")
            Text("Hand: \(player.handCards.count)")
            HStack {
                ZStack {
                    Image.bundleImage(named: player.board.isStartingPlayer ? "Portal-Startspieler\(player.board.portalId).jpeg" : "Portal\(player.board.portalId).jpeg")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 80)
                        
                    HStack {
                        ForEach(player.board.activeCharacters) { char in
                            CharacterCardView(card: char, width: 40, height: 60)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 2)
    }
}

// Reusable View for a Character Card
struct CharacterCardView: View {
    let card: CharacterCard
    let width: CGFloat
    let height: CGFloat
    
    var body: some View {
        Image.bundleImage(named: card.imageName)
            .resizable()
            .scaledToFit()
            .frame(width: width, height: height)
            .cornerRadius(8)
            .shadow(radius: 2)
    }
}

// Reusable View for a Pearl Card
struct PearlCardView: View {
    let card: PearlCard
    let width: CGFloat
    let height: CGFloat
    
    var body: some View {
        // We assume the pearl cards are named Perlenkarte1.jpeg etc as seen in assets directory.
        // For now, map values to these names. We need the actual mapping logic from the game rules for values -> images.
        // Assuming there are 8 types of pearl cards numbered 1-8.
        Image.bundleImage(named: "Perlenkarte\(card.value).jpeg")
            .resizable()
            .scaledToFit()
            .frame(width: width, height: height)
            .cornerRadius(8)
            .shadow(radius: 2)
    }
}

struct CenterTableView: View {
    let pearlCards: [PearlCard]
    let characterCards: [CharacterCard]
    
    let onPearlTap: (PearlCard) -> Void
    let onCharacterTap: (CharacterCard) -> Void
    let onPearlDeckTap: () -> Void
    let onCharacterDeckTap: () -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            // Characters
            HStack(spacing: 15) {
                Button(action: onCharacterDeckTap) {
                    CardPlaceholder(text: "Char Deck")
                }
                
                ForEach(characterCards) { card in
                    Button(action: { onCharacterTap(card) }) {
                        CharacterCardView(card: card, width: 80, height: 120)
                    }
                }
            }
            
            // Pearls
            HStack(spacing: 15) {
                Button(action: onPearlDeckTap) {
                    CardPlaceholder(text: "Pearl Deck")
                }
                
                ForEach(pearlCards) { card in
                    Button(action: { onPearlTap(card) }) {
                        PearlCardView(card: card, width: 80, height: 120)
                    }
                }
            }
        }
        .padding()
    }
}

struct LocalPlayerView: View {
    let player: Player
    @Binding var selectedHandCards: Set<UUID>
    let onActivateTap: (UUID) -> Void
    
    var body: some View {
        VStack {
            Text("Your Portal (Tap to Activate)").fontWeight(.bold)
            
            ZStack {
                Image.bundleImage(named: player.board.isStartingPlayer ? "Portal-Startspieler\(player.board.portalId).jpeg" : "Portal\(player.board.portalId).jpeg")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 180)
                
                HStack(spacing: 20) {
                    ForEach(player.board.activeCharacters) { char in
                        Button(action: {
                            onActivateTap(char.id)
                        }) {
                            CharacterCardView(card: char, width: 100, height: 150)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .frame(height: 180)
            
            Text("Your Hand (Tap to Select Cost)").fontWeight(.bold)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(player.handCards) { card in
                        Button(action: {
                            toggleSelection(for: card.id)
                        }) {
                            PearlCardView(card: card, width: 60, height: 90)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(selectedHandCards.contains(card.id) ? Color.yellow : Color.clear, lineWidth: 4)
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding(.vertical)
    }
    
    private func toggleSelection(for id: UUID) {
        if selectedHandCards.contains(id) {
            selectedHandCards.remove(id)
        } else {
            selectedHandCards.insert(id)
        }
    }
}

struct CardPlaceholder: View {
    let text: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.blue.opacity(0.1))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.blue, lineWidth: 2))
            Text(text)
                .multilineTextAlignment(.center)
                .font(.caption)
                .padding(4)
        }
        .frame(width: 80, height: 120)
    }
}
