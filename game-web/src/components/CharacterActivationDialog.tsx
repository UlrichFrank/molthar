import React, { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';

interface CharacterActivationDialogProps {
  availableCharacters: Array<{ card: CharacterCard; slotIndex: number }>;
  hand: PearlCard[];
  diamonds: number;
  portalSlotIndex: number;
  onActivate: (characterSlotIndex: number, usedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function CharacterActivationDialog({
  availableCharacters,
  hand,
  diamonds,
  portalSlotIndex,
  onActivate,
  onCancel,
}: CharacterActivationDialogProps) {
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const selectedCharacter = availableCharacters[0]?.card;
  const selectedCharacterSlot = availableCharacters[0]?.slotIndex ?? null;

  const isValidPayment = useMemo(() => {
    if (!selectedCharacter) return false;
    const selectedCards = Array.from(selectedCardIndices).map(idx => hand[idx]);
    return validateCostPayment(selectedCharacter.cost, selectedCards, diamonds);
  }, [selectedCardIndices, selectedCharacter, hand, diamonds]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCardIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCardIndices(newSelected);
  };

  const handleActivate = () => {
    if (isValidPayment && selectedCharacterSlot !== null) {
      onActivate(selectedCharacterSlot, Array.from(selectedCardIndices));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] border-[3px] border-[#333] rounded-xl p-1.5 max-w-[95vw] w-full max-h-[calc(100vh-1rem)] overflow-y-auto overflow-x-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col sm:max-w-[600px] sm:w-[85%] sm:p-3">
        <h2 className="mt-0 mb-3 text-center text-[#333] text-[clamp(1.2rem,5vw,1.8rem)] border-b-2 border-[#333] pb-2">Activate Character</h2>

        <div className="flex flex-wrap justify-center gap-1.5 bg-white p-1.5 rounded-lg border-2 border-[#ddd] sm:gap-2.5 sm:p-2">
          {availableCharacters.map(({ card, slotIndex }) => (
            <img
              key={slotIndex}
              src={`/assets/${encodeURIComponent(card.imageName)}`}
              alt={card.name}
              className="w-auto h-full max-h-[240px] object-contain block rounded-lg sm:max-h-[280px]"
            />
          ))}
        </div>

        {selectedCharacter && (
          <>
            {import.meta.env.VITE_DEBUG_COST === 'true' && (
              <div className="bg-[#fff3cd] p-1.5 rounded-lg mb-1.5 border-l-4 border-[#ffc107] sm:p-2.5 sm:mb-2.5">
                <h3 className="mt-0 mb-1 text-[#856404] text-[clamp(0.9rem,4vw,1.1rem)]">Cost: {getCostSummary(selectedCharacter.cost)}</h3>
                <p className="m-0 mb-1 text-[#856404] text-[clamp(0.75rem,2vw,0.9rem)]">{describeCost(selectedCharacter.cost)}</p>
                {diamonds > 0 && (
                  <p className="mt-0.5 mb-0 text-[#4299e1] font-bold text-[clamp(0.75rem,2vw,0.9rem)]">💎 {diamonds} available (reduces cost)</p>
                )}
              </div>
            )}

            <div className="mb-3">
              <h3 className="mt-3 mb-1 text-[#333] text-[clamp(0.9rem,4vw,1.1rem)]">Select Cards to Pay ({selectedCardIndices.size} selected)</h3>
              <div className="grid gap-1 my-1.5 bg-white p-1.5 rounded-lg sm:gap-1.5 sm:p-2 sm:my-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))' }}>
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
          </>
        )}

        <div className="flex gap-1.5 mt-1.5 sm:gap-2.5">
          <button
            className="flex-1 py-1.5 px-2 text-[clamp(0.65rem,2.5vw,0.85rem)] font-bold border-2 border-[#333] rounded-xl cursor-pointer transition-all duration-200 bg-green-500 text-white enabled:hover:bg-green-600 enabled:hover:scale-[1.02] disabled:bg-[#ccc] disabled:text-[#666] disabled:cursor-not-allowed disabled:opacity-60 sm:py-2 sm:px-2.5 sm:text-[0.9rem]"
            onClick={handleActivate}
            disabled={!isValidPayment}
          >
            {isValidPayment ? 'Activate' : 'Invalid Payment'}
          </button>
          <button
            className="flex-1 py-1.5 px-2 text-[clamp(0.65rem,2.5vw,0.85rem)] font-bold border-2 border-[#333] rounded-xl cursor-pointer transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] sm:py-2 sm:px-2.5 sm:text-[0.9rem]"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
