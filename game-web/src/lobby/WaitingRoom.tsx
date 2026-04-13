import { useEffect } from 'react';
import { lobbyClient } from './useLobbyClient';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';

interface WaitingRoomProps {
  matchID: string;
  totalPlayers: number;
  onAllJoined: () => void;
  onCancel: () => void;
}

export function WaitingRoom({ matchID, totalPlayers, onAllJoined, onCancel }: WaitingRoomProps) {
  const { t } = useTranslation();
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
      <h1>{t('waiting.title')}</h1>
      <p>{t('waiting.description', { count: totalPlayers })}</p>
      <div className="waiting-spinner">⏳</div>
      <button onClick={onCancel}>{t('waiting.cancel')}</button>
    </div>
  );
}
