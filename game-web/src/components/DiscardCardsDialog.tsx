import React, { useState, useMemo } from 'react';
import type { PearlCard } from '@portale-von-molthar/shared';

interface DiscardCardsDialogProps {
  hand: PearlCard[];
  excessCardCount: number;
  currentHandLimit: number;
  onDiscard: (selectedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function DiscardCardsDialog({
  hand,
  excessCardCount,
  currentHandLimit,
  onDiscard,
  onCancel,
}: DiscardCardsDialogProps) {
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const isValidSelection = useMemo(() => {
    return selectedCardIndices.size === excessCardCount;
  }, [selectedCardIndices, excessCardCount]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCardIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCardIndices(newSelected);
  };

  const handleDiscard = () => {
    if (isValidSelection) {
      onDiscard(Array.from(selectedCardIndices).sort());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] border-[3px] border-[#333] rounded-xl p-6 max-w-[90vw] w-full max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col sm:max-w-[700px] sm:w-[90%] sm:p-8">
        <h2 className="mt-0 mb-3 text-center text-[#333] text-[clamp(1.3rem,5vw,1.8rem)] border-b-2 border-[#333] pb-2">Discard Pearl Cards</h2>

        <div className="bg-[#fff3cd] p-3 rounded-lg mb-4 border-l-4 border-[#ffc107] sm:p-4">
          <p className="mt-1 mb-0 text-[#856404] text-[clamp(0.8rem,2vw,0.95rem)]">
            Hand size: <strong className="text-[#333] font-semibold">{hand.length}</strong> cards
          </p>
          <p className="mt-1 mb-0 text-[#856404] text-[clamp(0.8rem,2vw,0.95rem)]">
            Hand limit: <strong className="text-[#333] font-semibold">{currentHandLimit}</strong> cards
          </p>
          <p className="mt-1 mb-0 text-[#d32f2f] font-medium text-[clamp(0.8rem,2vw,0.95rem)]">
            You must discard <strong>{excessCardCount}</strong> card{excessCardCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="mt-3 mb-2 text-[#333] text-[clamp(1rem,4vw,1.2rem)]">Select {excessCardCount} card{excessCardCount !== 1 ? 's' : ''} to discard</h3>
          <div className="grid gap-2 my-4 bg-white p-3 rounded-lg sm:gap-3 sm:p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}>
            {hand.map((card, idx) => (
              <button
                key={idx}
                className="appearance-none bg-transparent border-none outline-none p-0 cursor-pointer relative w-[59px] overflow-hidden rounded-[1px] hover:-translate-y-0.5 transition-transform"
                style={{ aspectRatio: '59 / 92' }}
                onClick={() => toggleCard(idx)}
              >
                <img
                  src={`/assets/Perlenkarte${card.value}.png`}
                  alt={`Pearl ${card.value}`}
                  className="w-full h-full object-fill block"
                />
                {selectedCardIndices.has(idx) && (
                  <div className="absolute inset-0 bg-green-500/50" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-6 max-sm:flex-col">
          <button
            className="flex-1 py-2.5 px-3 text-[clamp(0.85rem,3vw,1rem)] font-bold border-2 border-[#333] rounded-2xl cursor-pointer transition-all duration-200 bg-green-500 text-white enabled:hover:bg-green-600 enabled:hover:scale-[1.02] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:px-4 sm:text-base"
            onClick={handleDiscard}
            disabled={!isValidSelection}
          >
            {isValidSelection ? 'Confirm Discard' : 'Invalid Selection'}
          </button>
          <button
            className="flex-1 py-2.5 px-3 text-[clamp(0.85rem,3vw,1rem)] font-bold border-2 border-[#333] rounded-2xl cursor-pointer transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] sm:py-3 sm:px-4 sm:text-base"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
