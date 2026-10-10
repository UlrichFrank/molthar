import type { GameState } from '@portale-von-molthar/shared';
import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { characterImageSrc } from '../../lib/cardImageSrc';
import { getAbilityDisplay } from '../../lib/abilityDisplayMap';
import { AVATAR_COLORS } from './avatarColors';

/** Distinct symbols of the persistent (blue) abilities among the activated characters — readable without opening anything. */
function persistentSymbols(activated: { card: { abilities: { persistent: boolean; type: Parameters<typeof getAbilityDisplay>[0] }[] } }[]): string[] {
  const seen = new Set<string>();
  for (const e of activated) {
    for (const ab of e.card.abilities ?? []) {
      if (ab.persistent) seen.add(getAbilityDisplay(ab.type).symbol);
    }
  }
  return [...seen];
}

interface OpponentStripProps {
  G: GameState;
  core: GameBoardCore;
  activePlayerID: string;
  onOpenOpponentDetail: (playerId: string) => void;
}

/**
 * All opponents at once: name, points, diamonds, hand size, both portal slots and
 * the activated characters as a count plus their permanent abilities. A portal card taps straight to
 * its zoom view; the fan opens the full list. No expand step in between.
 */
export function OpponentStrip({ G, core, activePlayerID, onOpenOpponentDetail }: OpponentStripProps) {
  const order = G.playerOrder || Object.keys(G.players || {});
  const myIdx = order.indexOf(core.myPlayerID);
  const others = (myIdx >= 0 ? [...order.slice(myIdx + 1), ...order.slice(0, myIdx)] : order)
    .filter(pid => pid !== core.myPlayerID && G.players?.[pid]);
  if (others.length === 0) return null;

  return (
    <div className="mobile-opponents" style={{ '--opp': others.length } as React.CSSProperties}>
      {others.map(pid => {
        const p = G.players![pid]!;
        const name = core.resolvePlayerName(pid, p.name);
        const color = AVATAR_COLORS[((p.colorIndex ?? 1) - 1) % AVATAR_COLORS.length];
        const activated = p.activatedCharacters ?? [];
        const portal = p.portal ?? [];
        return (
          <div key={pid} className={'mobile-opp' + (pid === activePlayerID ? ' mobile-opp--turn' : '')} data-testid="mobile-opponent">
            <button type="button" className="mobile-opp-head" onClick={() => onOpenOpponentDetail(pid)}>
              <span className="mobile-opp-dot" style={{ background: color }} />
              <span className="mobile-opp-name">{name}</span>
              <span className="mobile-status-detail-points">★{p.powerPoints}</span>
              <span className="mobile-status-detail-diamonds">💎{p.diamondCards?.length ?? 0}</span>
              <span className="mobile-opp-hand">✋{p.hand?.length ?? 0}</span>
            </button>
            <div className="mobile-opp-cards">
              <div className="mobile-opp-portal">
                {[0, 1].map(i => portal[i] ? (
                  <button key={i} type="button" className="mobile-card-btn mobile-card-btn--mini" onClick={() => core.openOpponentPortalSlot(pid, i)}>
                    <img src={characterImageSrc(portal[i]!.card)} alt={portal[i]!.card.name} />
                  </button>
                ) : (
                  <div key={i} className="mobile-card-btn mobile-card-btn--mini mobile-card-btn--portal-empty" aria-hidden="true" />
                ))}
              </div>
              <button type="button" className="mobile-opp-activated" onClick={() => onOpenOpponentDetail(pid)}>
                <span className="mobile-opp-activated-line">
                  <span className="mobile-opp-activated-count">✓{activated.length}</span>
                  {persistentSymbols(activated).map(sym => <span key={sym} className="mobile-opp-chip">{sym}</span>)}
                </span>
                {/* Wide tiles (tablet, phone landscape) have room for the cards themselves. */}
                <span className="mobile-opp-thumbs" style={{ '--n': Math.max(activated.length, 2) } as React.CSSProperties}>
                  {activated.map(e => (
                    <span key={e.id} className="mobile-card-btn mobile-card-btn--mini">
                      <img src={characterImageSrc(e.card)} alt={e.card.name} />
                    </span>
                  ))}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
