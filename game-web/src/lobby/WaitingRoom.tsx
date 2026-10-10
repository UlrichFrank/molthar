import { useEffect, useRef, useState } from 'react';
import { lobbyClient, inviteLink } from './useLobbyClient';
import type { Match } from './useLobbyClient';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';

interface WaitingRoomProps {
  matchID: string;
  playerID: string;
  totalPlayers: number;
  withSpecialCards?: boolean;
  onAllJoined: () => void;
  onCancel: () => void;
}

export function WaitingRoom({ matchID, playerID, totalPlayers, withSpecialCards, onAllJoined, onCancel }: WaitingRoomProps) {
  const { t } = useTranslation();
  const [match, setMatch] = useState<Match | null>(null);
  const [copied, setCopied] = useState(false);

  // `onAllJoined` is an inline arrow in LobbyScreen, so it gets a new identity on
  // every render. Holding it in a ref keeps the polling interval from being torn
  // down and rebuilt each time this component re-renders.
  const onAllJoinedRef = useRef(onAllJoined);
  useEffect(() => {
    onAllJoinedRef.current = onAllJoined;
  });

  useEffect(() => {
    const check = async () => {
      try {
        const m = (await lobbyClient.getMatch(PortaleVonMolthar.name, matchID)) as unknown as Match;
        if (!m) return;
        setMatch(m);
        // Every seat counts, NPC seats included — the BotRunner fills those
        // server-side within a few seconds. Counting only the human seats made a
        // match with an NPC start while human seats were still empty, because the
        // NPC both lowered the threshold and satisfied it.
        if (m.players.every(p => p.name !== undefined)) onAllJoinedRef.current();
      } catch {
        // Network errors during polling are non-fatal
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [matchID]);

  const link = inviteLink(matchID);
  const npcNames = new Map((match?.setupData?.npcSlots ?? []).map(s => [s.playerIndex, s.name]));
  const seats = match?.players ?? Array.from({ length: totalPlayers }, (_, id) => ({ id } as Match['players'][number]));
  const hasSpecial = match?.setupData?.withSpecialCards ?? withSpecialCards;

  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: t('app.title'), text: t('waiting.shareText'), url: link });
        return;
      } catch {
        /* cancelled — fall back to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('waiting.inviteHint'), link);
    }
  };

  return (
    <div className="lb-root">
      <div className="lb-page lb-page--narrow">
        <section className="lb-panel">
          <h2><span className="lb-pulse" aria-hidden />{t('waiting.title')}</h2>
          <p className="lb-hint">
            {t('waiting.description', { count: totalPlayers })}{' '}
            {hasSpecial ? t('waiting.mode.special') : t('waiting.mode.base')}
          </p>
          <ol className="lb-seats">
            {seats.map(p => {
              const npc = npcNames.get(p.id);
              const state = npc ? t('waiting.computer') : p.name ? t('waiting.present') : '';
              return (
                <li key={p.id} className={`lb-seatrow${p.name || npc ? '' : ' lb-seatrow--free'}`}>
                  <span className="lb-seatrow-no">{t('waiting.seat', { n: p.id + 1 })}</span>
                  <span className="lb-seatrow-name">
                    {p.name ?? npc ?? t('waiting.free')}
                    {String(p.id) === playerID && <span> ({t('waiting.you')})</span>}
                  </span>
                  <span className="lb-seatrow-state">{state}</span>
                </li>
              );
            })}
          </ol>
          <div className="lb-invite">
            <span>{t('waiting.inviteHint')}</span>
            <code>{link}</code>
            <button className="lb-btn lb-btn--small" onClick={share}>
              {copied ? t('waiting.copied') : t('waiting.share')}
            </button>
          </div>
          <button className="lb-link lb-hint" onClick={onCancel} style={{ marginTop: '1rem' }}>
            {t('waiting.cancel')}
          </button>
        </section>
      </div>
    </div>
  );
}
