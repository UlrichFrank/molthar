import type { PearlCard } from '../lib/types';
import { HandDisplay } from './HandDisplay';

interface PlayerHandProps {
  hand: PearlCard[];
  selectedIndices: number[];
  phase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  onSelect: (index: number) => void;
  onClearSelection: () => void;
}

export function PlayerHand({
  hand,
  selectedIndices,
  phase,
  onSelect,
  onClearSelection,
}: PlayerHandProps) {
  return (
    <HandDisplay
      hand={hand}
      selectedIndices={selectedIndices}
      phase={phase}
      onSelect={onSelect}
      onClearSelection={onClearSelection}
      title="Your Hand"
    />
  );
}
