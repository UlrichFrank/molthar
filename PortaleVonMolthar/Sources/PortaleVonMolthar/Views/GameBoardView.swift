import SwiftUI

public struct GameBoardView: View {
    @ObservedObject var viewModel: GameViewModel
    
    // UI State for activating a character
    @State private var selectedHandCards: Set<UUID> = []
    
    public init(viewModel: GameViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.secondary.opacity(0.05).ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Turn Indicator Bar
                    TurnHeaderView(viewModel: viewModel)
                    
                    ScrollView {
                        VStack(spacing: 20) {
                            // Top: Opponents Area
                            OpponentsListView(viewModel: viewModel)
                            
                            Divider()
                            
                            // Middle: Center Table
                            CenterTableView(
                                pearlCards: viewModel.gameState.faceUpPearls,
                                characterCards: viewModel.gameState.faceUpCharacters,
                                onPearlTap: { card in if isLocalPlayerTurn { viewModel.takePearlCard(cardId: card.id) } },
                                onCharacterTap: { card in if isLocalPlayerTurn { viewModel.placeCharacterOnPortal(cardId: card.id) } },
                                onPearlDeckTap: { if isLocalPlayerTurn { viewModel.takePearlCard(cardId: nil) } },
                                onCharacterDeckTap: { if isLocalPlayerTurn { viewModel.placeCharacterOnPortal(cardId: nil) } }
                            )
                            .frame(minHeight: geometry.size.height * 0.3)
                            
                            Divider()
                            
                            // Bottom: Local Player Area
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
                        }
                        .padding(.bottom, 100)
                    }
                }
                
                // Floating Action Bar for Current Turn
                VStack {
                    Spacer()
                    if isLocalPlayerTurn {
                        TurnActionBar(viewModel: viewModel)
                    }
                }
            }
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

struct TurnHeaderView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        let currentPlayer = viewModel.gameState.players[viewModel.gameState.currentPlayerIndex]
        let isLocal = currentPlayer.id == viewModel.localPlayerId
        
        HStack {
            Image(systemName: "person.circle.fill")
                .foregroundColor(isLocal ? .green : .blue)
            Text(isLocal ? "DEIN ZUG" : "\(currentPlayer.name) ist am Zug")
                .font(.headline)
                .foregroundColor(isLocal ? .green : .primary)
            
            Spacer()
            
            if isLocal {
                HStack(spacing: 4) {
                    ForEach(0..<viewModel.gameState.actionsRemaining, id: \.self) { _ in
                        Circle().fill(Color.green).frame(width: 10, height: 10)
                    }
                    ForEach(0..<(viewModel.gameState.players[viewModel.gameState.currentPlayerIndex].actionsPerTurn - viewModel.gameState.actionsRemaining), id: \.self) { _ in
                        Circle().stroke(Color.green).frame(width: 10, height: 10)
                    }
                }
            }
        }
        .padding()
        .background(isLocal ? Color.green.opacity(0.1) : Color.clear)
        .overlay(Divider(), alignment: .bottom)
    }
}

struct OpponentsListView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(viewModel.gameState.players.filter { $0.id != viewModel.localPlayerId }) { opponent in
                    OpponentView(player: opponent, isCurrentTurn: viewModel.gameState.players[viewModel.gameState.currentPlayerIndex].id == opponent.id)
                }
            }
            .padding(.horizontal)
        }
    }
}

struct OpponentView: View {
    let player: Player
    let isCurrentTurn: Bool
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(player.name)
                    .fontWeight(isCurrentTurn ? .black : .bold)
                if isCurrentTurn {
                    Image(systemName: "arrowtriangle.down.fill")
                        .foregroundColor(.blue)
                        .font(.caption)
                }
            }
            
            HStack(spacing: 12) {
                VStack(alignment: .leading) {
                    Label("\(player.powerPoints)", systemImage: "crown.fill").foregroundColor(.orange)
                    Label("\(player.diamonds)", systemImage: "suit.diamond.fill").foregroundColor(.blue)
                }
                .font(.caption)
                
                // Hidden Hand Cards
                HStack(spacing: -10) {
                    ForEach(0..<player.handCards.count, id: \.self) { _ in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 25, height: 35)
                            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.white, lineWidth: 1))
                            .shadow(radius: 1)
                    }
                }
            }
            
            // Portal Area
            ZStack {
                Image.bundleImage(named: player.board.isStartingPlayer ? "Portal-Startspieler\(player.board.portalId).jpeg" : "Portal\(player.board.portalId).jpeg")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 60)
                
                HStack(spacing: 4) {
                    ForEach(player.board.activeCharacters) { char in
                        CharacterCardView(card: char, width: 30, height: 45)
                    }
                }
            }
            
            // Activated Cards (mini)
            if !player.activatedCharacters.isEmpty {
                HStack(spacing: 2) {
                    ForEach(player.activatedCharacters.prefix(4)) { _ in
                        Circle().fill(Color.orange).frame(width: 6, height: 6)
                    }
                    if player.activatedCharacters.count > 4 {
                        Text("+\(player.activatedCharacters.count - 4)").font(.system(size: 8))
                    }
                }
            }
        }
        .padding(12)
        .background(isCurrentTurn ? Color.blue.opacity(0.1) : Color.white)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isCurrentTurn ? Color.blue : Color.gray.opacity(0.2), lineWidth: 2)
        )
        .shadow(color: isCurrentTurn ? Color.blue.opacity(0.2) : Color.black.opacity(0.1), radius: 4)
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

struct TurnActionBar: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("\(viewModel.gameState.actionsRemaining) Aktionen")
                    .font(.caption)
                    .fontWeight(.bold)
                Text(viewModel.gameState.currentPhase == .discardingExcessCards ? "Überschüssige Karten abwerfen" : "Du bist dran")
                    .font(.footnote)
            }
            
            Spacer()
            
            if viewModel.gameState.currentPhase == .takingActions {
                Button(action: { viewModel.flushPearlCards() }) {
                    Label("Spülen", systemImage: "arrows.clockwise")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .overlay(Divider(), alignment: .top)
    }
}

struct CardPlaceholder: View {
    let text: String
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.2), Color.blue.opacity(0.05)]), startPoint: .top, endPoint: .bottom))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.blue, lineWidth: 1))
            
            VStack {
                Image(systemName: "square.stack.fill")
                Text(text)
                    .multilineTextAlignment(.center)
                    .font(.caption2)
                    .fontWeight(.bold)
            }
            .foregroundColor(.blue)
            .padding(4)
        }
        .frame(width: 80, height: 120)
        .shadow(color: .blue.opacity(0.1), radius: 4)
    }
}
