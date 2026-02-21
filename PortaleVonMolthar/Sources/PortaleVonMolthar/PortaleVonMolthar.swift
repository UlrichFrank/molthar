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
    
    @StateObject private var gameViewModel: GameViewModel
    
    init() {
        // Setup a dummy game for now
        let p1Id = UUID()
        let players = [
            Player(id: p1Id, name: "You", isAI: false),
            Player(name: "AI 1", isAI: true),
            Player(name: "AI 2", isAI: true)
        ]
        
        _gameViewModel = StateObject(wrappedValue: GameViewModel(players: players, localPlayerId: p1Id))
    }
    
    var body: some Scene {
        WindowGroup {
            GameBoardView(viewModel: gameViewModel)
                .frame(minWidth: 1000, minHeight: 700)
        }
    }
}
