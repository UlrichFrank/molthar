import SwiftUI

public enum AppScreen: Equatable {
    case start
    case lobby
    case game
}

public struct StartView: View {
    @Binding var currentScreen: AppScreen
    @Binding var players: [Player]
    @Binding var localPlayerId: UUID
    
    @State private var playerName: String = "Spieler"
    @State private var aiCount: Int = 1
    @State private var totalPlayerCount: Int = 2
    
    public init(currentScreen: Binding<AppScreen>, players: Binding<[Player]>, localPlayerId: Binding<UUID>) {
        self._currentScreen = currentScreen
        self._players = players
        self._localPlayerId = localPlayerId
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 10) {
                Text("Die Portale von")
                    .font(.system(size: 24, weight: .light, design: .serif))
                Text("MOLTHAR")
                    .font(.system(size: 64, weight: .black, design: .serif))
                    .tracking(5)
            }
            .padding(.top, 60)
            
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Dein Name").font(.headline).foregroundColor(.secondary)
                    TextField("Name eingeben", text: $playerName)
                        .textFieldStyle(.plain)
                        .padding()
                        .background(Color.secondary.opacity(0.1))
                        .cornerRadius(12)
                }
                .frame(maxWidth: 400)
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Spieleranzahl").font(.headline).foregroundColor(.secondary)
                    
                    HStack {
                        Stepper("\(totalPlayerCount) Spieler gesamt", value: $totalPlayerCount, in: 2...5)
                    }
                    
                    Stepper("\(aiCount) KI Gegner", value: $aiCount, in: 0...(totalPlayerCount - 1))
                }
                .padding()
                .background(Color.secondary.opacity(0.05))
                .cornerRadius(12)
                .frame(maxWidth: 400)
            }
            
            VStack(spacing: 16) {
                Button(action: startLocalGame) {
                    Text("Lokales Spiel starten")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: 400)
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                .buttonStyle(.plain)
                
                Button(action: { currentScreen = .lobby }) {
                    Text("Netzwerk Mehrspieler")
                        .font(.headline)
                        .foregroundColor(.blue)
                        .padding()
                        .frame(maxWidth: 400)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                }
                .buttonStyle(.plain)
            }
            
            Spacer()
        }
        .padding()
        .background(
            ZStack {
                Color.white.ignoresSafeArea()
                Circle()
                    .fill(Color.blue.opacity(0.05))
                    .blur(radius: 60)
                    .offset(x: -200, y: -200)
                Circle()
                    .fill(Color.purple.opacity(0.05))
                    .blur(radius: 60)
                    .offset(x: 200, y: 200)
            }
        )
    }
    
    private func startLocalGame() {
        let meId = UUID()
        var newPlayers: [Player] = [Player(id: meId, name: playerName, isAI: false)]
        
        // Add other human players (placeholders for now if local means pass-and-play, 
        // but typically "Lokales Spiel" implies you + AIs if not network)
        let humanNeighbors = totalPlayerCount - aiCount - 1
        for i in 0..<humanNeighbors {
            newPlayers.append(Player(name: "Spieler \(i + 2)", isAI: false))
        }
        
        // Add AIs
        for i in 0..<aiCount {
            newPlayers.append(Player(name: "KI \(i + 1)", isAI: true))
        }
        
        self.players = newPlayers
        self.localPlayerId = meId
        self.currentScreen = .game
    }
}
