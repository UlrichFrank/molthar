import SwiftUI

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}

@main
struct PortaleVonMoltharApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    @State private var currentScreen: AppScreen = .start
    @State private var players: [Player] = []
    @State private var localPlayerId: UUID = UUID()
    @State private var gameViewModel: GameViewModel?
    
    var body: some Scene {
        WindowGroup {
            Group {
                switch currentScreen {
                case .start:
                    StartView(currentScreen: $currentScreen, players: $players, localPlayerId: $localPlayerId)
                case .lobby:
                    LobbyView(currentScreen: $currentScreen)
                case .game:
                    if let viewModel = gameViewModel {
                        GameBoardView(viewModel: viewModel)
                    } else {
                        Color.clear.onAppear {
                            gameViewModel = GameViewModel(players: players, localPlayerId: localPlayerId)
                        }
                    }
                }
            }
            .frame(minWidth: 1000, minHeight: 700)
            .onChange(of: currentScreen) { newScreen in
                if newScreen == .start {
                    gameViewModel = nil
                }
            }
        }
    }
}
