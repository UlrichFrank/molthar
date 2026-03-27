import { useEffect } from 'react';
import { lobbyClient } from './useLobbyClient';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';

interface WaitingRoomProps {
  matchID: string;
  totalPlayers: number;
  onAllJoined: () => void;
  onCancel: () => void;
}

export function WaitingRoom({ matchID, totalPlayers, onAllJoined, onCancel }: WaitingRoomProps) {
  useEffect(() => {
    const checkPlayers = async () => {
      try {
        const { matches: list } = await lobbyClient.listMatches(PortaleVonMolthar.name);
        const currentMatch = list.find(m => m.matchID === matchID);
        if (currentMatch) {
          const joinedCount = currentMatch.players.filter(p => p.name !== undefined).length;
          if (joinedCount === totalPlayers) {
            onAllJoined();
          }
        }
      } catch {
        // Network errors during polling are non-fatal
      }
    };

    const interval = setInterval(checkPlayers, 1000);
    return () => clearInterval(interval);
  }, [matchID, totalPlayers, onAllJoined]);

  return (
    <div className="lobby-container">
      <h1>Warte auf alle Spieler...</h1>
      <p>Das Spiel startet automatisch, wenn alle {totalPlayers} Spieler beigetreten sind.</p>
      <div className="waiting-spinner">⏳</div>
      <button onClick={onCancel}>Abbrechen</button>
    </div>
  );
}
