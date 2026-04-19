import { useEffect } from 'react';
import { lobbyClient } from './useLobbyClient';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';

interface WaitingRoomProps {
  matchID: string;
  totalPlayers: number;
  /** Number of human players — bots are excluded. Default: totalPlayers */
  humanPlayerCount?: number;
  withSpecialCards?: boolean;
  onAllJoined: () => void;
  onCancel: () => void;
}

export function WaitingRoom({ matchID, totalPlayers, humanPlayerCount, withSpecialCards, onAllJoined, onCancel }: WaitingRoomProps) {
  const { t } = useTranslation();
  const requiredCount = humanPlayerCount ?? totalPlayers;
  useEffect(() => {
    const checkPlayers = async () => {
      try {
        const { matches: list } = await lobbyClient.listMatches(PortaleVonMolthar.name);
        const currentMatch = list.find(m => m.matchID === matchID);
        if (currentMatch) {
          const joinedCount = currentMatch.players.filter(p => p.name !== undefined).length;
          if (joinedCount >= requiredCount) {
            onAllJoined();
          }
        }
      } catch {
        // Network errors during polling are non-fatal
      }
    };

    const interval = setInterval(checkPlayers, 1000);
    return () => clearInterval(interval);
  }, [matchID, requiredCount, onAllJoined]);

  return (
    <div className="lobby-container">
      <h1>{t('waiting.title')}</h1>
      <p>{t('waiting.description', { count: totalPlayers })}</p>
      <p className="waiting-mode">
        {withSpecialCards ? t('waiting.mode.special') : t('waiting.mode.base')}
      </p>
      <div className="waiting-spinner">⏳</div>
      <button onClick={onCancel}>{t('waiting.cancel')}</button>
    </div>
  );
}
