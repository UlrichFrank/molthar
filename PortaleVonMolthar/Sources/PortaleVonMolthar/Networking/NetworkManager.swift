import Foundation
@preconcurrency import MultipeerConnectivity
import Combine

/// Handles local network discovery and communication between devices.
@MainActor
public class NetworkManager: NSObject, ObservableObject {
    private static let serviceType = "molthar-game"
    
    private let myPeerId: MCPeerID
    private let serviceAdvertiser: MCNearbyServiceAdvertiser
    private let serviceBrowser: MCNearbyServiceBrowser
    private let session: MCSession
    
    @Published public var connectedPeers: [MCPeerID] = []
    @Published public var availableSessions: [MCPeerID] = []
    
    // Subject for incoming game actions/state updates
    public let receivedState = PassthroughSubject<GameState, Never>()
    public let receivedAction = PassthroughSubject<GameAction, Never>()
    
    public init(playerName: String) {
        let peerId = MCPeerID(displayName: playerName)
        self.myPeerId = peerId
        
        self.session = MCSession(peer: peerId, securityIdentity: nil, encryptionPreference: .required)
        self.serviceAdvertiser = MCNearbyServiceAdvertiser(peer: peerId, discoveryInfo: nil, serviceType: Self.serviceType)
        self.serviceBrowser = MCNearbyServiceBrowser(peer: peerId, serviceType: Self.serviceType)
        
        super.init()
        
        self.session.delegate = self
        self.serviceAdvertiser.delegate = self
        self.serviceBrowser.delegate = self
    }
    
    public func startHosting() {
        serviceAdvertiser.startAdvertisingPeer()
    }
    
    public func startBrowsing() {
        serviceBrowser.startBrowsingForPeers()
    }
    
    public func stopDiscovery() {
        serviceAdvertiser.stopAdvertisingPeer()
        serviceBrowser.stopBrowsingForPeers()
    }
    
    public func invitePeer(_ peerId: MCPeerID) {
        serviceBrowser.invitePeer(peerId, to: session, withContext: nil, timeout: 30)
    }
    
    public func sendAction(_ action: GameAction) {
        // Encode and send action
        // For simplicity, we'll need a way to serialize these. 
        // Codable is preferred.
    }
}

extension NetworkManager: MCSessionDelegate {
    public nonisolated func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        Task { @MainActor in
            self.connectedPeers = session.connectedPeers
        }
    }
    
    public nonisolated func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        // Handle incoming game data
    }
    
    public nonisolated func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
    public nonisolated func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
    public nonisolated func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

extension NetworkManager: MCNearbyServiceAdvertiserDelegate {
    public nonisolated func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        struct UnsafeSendable<T>: @unchecked Sendable { let value: T }
        let wrapped = UnsafeSendable(value: invitationHandler)
        Task { @MainActor in
            wrapped.value(true, self.session)
        }
    }
}

extension NetworkManager: MCNearbyServiceBrowserDelegate {
    public nonisolated func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String : String]?) {
        Task { @MainActor in
            if !self.availableSessions.contains(peerID) {
                self.availableSessions.append(peerID)
            }
        }
    }
    
    public nonisolated func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        Task { @MainActor in
            self.availableSessions.removeAll(where: { $0 == peerID })
        }
    }
}
