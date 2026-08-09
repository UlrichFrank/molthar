import { useState } from 'react';
import { DialogProvider } from '../../contexts/DialogContext';
import { useGameBoardCore } from '../../hooks/useGameBoardCore';
import type { GameBoardProps } from '../../hooks/useGameBoardCore';
import { SharedGameDialogs } from '../SharedGameDialogs';
import { MobileStatusBar } from './MobileStatusBar';
import { MarketZone } from './MarketZone';
import { PortalZone } from './PortalZone';
import { HandDock } from './HandDock';
import { ActionBar } from './ActionBar';
import { ActivatedGridSheet } from './ActivatedGridSheet';
import { OpponentDetailSheet } from './OpponentDetailSheet';
import { DeckReshuffleAnimation } from '../DeckReshuffleAnimation';
import '../../styles/dialogs.css';
import '../../styles/mobile.css';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * Task 1.3/D3: mobile portrait board — fixed status bar, scrollable market+portal,
 * fixed hand dock, fixed action bar. Shares all game logic/state with `CanvasGameBoard`
 * via `useGameBoardCore` and `SharedGameDialogs` (design.md D1).
 */
export function MobileGameBoard(props: GameBoardProps) {
  return (
    <DialogProvider>
      <MobileGameBoardContent {...props} />
    </DialogProvider>
  );
}

function MobileGameBoardContent(props: GameBoardProps) {
  const { G, moves, isActive } = props;
  const { t } = useTranslation();
  const core = useGameBoardCore(props);
  const [activatedGridOpen, setActivatedGridOpen] = useState(false);
  const [opponentDetailId, setOpponentDetailId] = useState<string | null>(null);

  return (
    <div className="mobile-board">
      <MobileStatusBar
        G={G}
        myPlayerID={core.myPlayerID}
        activePlayerID={core.activePlayerID}
        actionCount={core.actionCount}
        maxActions={core.maxActions}
        resolvePlayerName={core.resolvePlayerName}
        onOpenOpponentDetail={setOpponentDetailId}
      />

      {G.finalRound && core.gameover === undefined && (() => {
        const leaders = Object.values(G.players ?? {})
          .filter(p => p && p.powerPoints >= 12)
          .map(p => p!.name);
        return (
          <div className="mobile-banner-row">
            <div className="mobile-banner">
              {leaders.length === 1
                ? t('game.leaderHasPoints', { leaders: leaders[0] ?? '' })
                : t('game.leadersHavePoints', { leaders: leaders.join(', ') })}
            </div>
            <div className="mobile-banner mobile-banner--final-round">{t('game.finalRound')}</div>
          </div>
        );
      })()}
      {G.isPearlRefreshTriggered && (
        <div className="mobile-banner-row">
          <div className="mobile-banner mobile-banner--pearl-refresh">{t('game.pearlRefresh')}</div>
        </div>
      )}
      {G.isReshufflingPearlDeck && (
        <DeckReshuffleAnimation
          deckType="pearl"
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          onDone={isActive ? () => moves.acknowledgeReshuffle?.('pearl') : () => {}}
        />
      )}
      {G.isReshufflingCharacterDeck && (
        <DeckReshuffleAnimation
          deckType="character"
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          onDone={isActive ? () => moves.acknowledgeReshuffle?.('character') : () => {}}
        />
      )}

      <div className="mobile-scroll">
        <MarketZone G={G} core={core} />
        <PortalZone core={core} onOpenActivatedGrid={() => setActivatedGridOpen(true)} />
      </div>

      <HandDock core={core} />
      <ActionBar core={core} isActive={isActive} actionCount={core.actionCount} maxActions={core.maxActions} />

      {activatedGridOpen && (
        <ActivatedGridSheet core={core} onClose={() => setActivatedGridOpen(false)} />
      )}
      {opponentDetailId && (
        <OpponentDetailSheet G={G} core={core} playerId={opponentDetailId} onClose={() => setOpponentDetailId(null)} />
      )}

      <SharedGameDialogs G={G} moves={moves} core={core} />
    </div>
  );
}

export default MobileGameBoard;
