import { useEffect, useRef, useState } from 'react';
import { lobbyClient } from './useLobbyClient';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';

interface WaitingRoomProps {
  matchID: string;
  totalPlayers: number;
  withSpecialCards?: boolean;
  onAllJoined: () => void;
  onCancel: () => void;
}

export function WaitingRoom({ matchID, totalPlayers, withSpecialCards, onAllJoined, onCancel }: WaitingRoomProps) {
  const { t } = useTranslation();
  const [joinedCount, setJoinedCount] = useState(0);

  // `onAllJoined` is an inline arrow in LobbyScreen, so it gets a new identity on
  // every render. Holding it in a ref keeps the polling interval from being torn
  // down and rebuilt each time this component re-renders.
  const onAllJoinedRef = useRef(onAllJoined);
  onAllJoinedRef.current = onAllJoined;

  useEffect(() => {
    const checkPlayers = async () => {
      try {
        const match = await lobbyClient.getMatch(PortaleVonMolthar.name, matchID);
        if (!match) return;
        // Every seat counts, NPC seats included — the BotRunner fills those
        // server-side within a few seconds. Counting only the human seats made a
        // match with an NPC start while human seats were still empty, because the
        // NPC both lowered the threshold and satisfied it.
        const joined = match.players.filter(p => p.name !== undefined).length;
        setJoinedCount(joined);
        if (joined >= match.players.length) {
          onAllJoinedRef.current();
        }
      } catch {
        // Network errors during polling are non-fatal
      }
    };

    checkPlayers();
    const interval = setInterval(checkPlayers, 1000);
    return () => clearInterval(interval);
  }, [matchID]);

  return (
    <div className="lobby-container">
      <h1>{t('waiting.title')}</h1>
      <p>{t('waiting.description', { count: totalPlayers })}</p>
      <p className="waiting-joined">
        {t('waiting.joined', { joined: joinedCount, total: totalPlayers })}
      </p>
      <p className="waiting-mode">
        {withSpecialCards ? t('waiting.mode.special') : t('waiting.mode.base')}
      </p>
      <div className="waiting-spinner">⏳</div>
      <button onClick={onCancel}>{t('waiting.cancel')}</button>
    </div>
  );
}
