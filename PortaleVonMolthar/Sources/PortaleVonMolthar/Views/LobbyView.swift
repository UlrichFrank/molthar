import SwiftUI

public struct LobbyView: View {
    @Binding var currentScreen: AppScreen
    
    public var body: some View {
        VStack(spacing: 30) {
            HStack {
                Button("Zurück") {
                    currentScreen = .start
                }
                .buttonStyle(.bordered)
                Spacer()
                Text("Lobby")
                    .font(.title).fontWeight(.bold)
                Spacer()
                ProgressView()
            }
            .padding()
            
            Text("Suche nach Spielern im Netzwerk...")
                .foregroundColor(.secondary)
            
            List {
                Section("Gefundene Spiele") {
                    Text("Keine Spiele gefunden")
                        .italic()
                        .foregroundColor(.secondary)
                }
                
                Section("Eigene Lobby") {
                    Button("Neues Spiel hosten") {
                        // Work in progress
                    }
                }
            }
            
            Spacer()
        }
    }
}
