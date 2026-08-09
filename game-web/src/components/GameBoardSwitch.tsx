import { useIsMobile } from '../hooks/useIsMobile';
import type { GameBoardProps } from '../hooks/useGameBoardCore';
import { CanvasGameBoard } from './CanvasGameBoard';
import { MobileGameBoard } from './mobile/MobileGameBoard';

/**
 * Task 1.2/D2: picks the mobile DOM board below 768px and the unchanged
 * desktop canvas board otherwise. Both boards receive identical boardgame.io
 * props so the underlying game state and moves never diverge (mobile-viewport-switch spec).
 */
export function GameBoardSwitch(props: GameBoardProps) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileGameBoard {...props} /> : <CanvasGameBoard {...props} />;
}

export default GameBoardSwitch;
