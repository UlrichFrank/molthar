import React from 'react';
import type { ActivatedCharacter } from '@portale-von-molthar/shared';

interface ActivatedCharacterDetailViewProps {
  character: ActivatedCharacter | null;
  onClose: () => void;
}

export const ActivatedCharacterDetailView: React.FC<ActivatedCharacterDetailViewProps> = ({
  character,
  onClose,
}) => {
  if (!character) return null;

  const imagePath = `/assets/${encodeURIComponent(character.card.id)}.jpg`;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000]" onClick={handleOverlayClick}>
      <div className="flex gap-8 max-w-[90vw] max-h-[90vh] bg-[rgba(20,30,50,0.95)] border-2 border-[#4A90E2] rounded-lg p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-md:flex-col max-md:max-w-[95vw] max-md:p-6 max-md:gap-6 max-sm:p-4 max-sm:rounded">
        <div className="shrink-0 flex items-center justify-center max-md:w-full max-md:justify-center" onClick={handleCardClick}>
          <img
            src={imagePath}
            alt={character.card.name}
            className="max-w-[300px] max-h-[400px] w-auto h-auto rounded cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform duration-200 max-md:max-w-[200px] max-md:max-h-[300px] max-sm:max-w-[150px] max-sm:max-h-[225px]"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22150%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22150%22/%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-4 max-md:max-h-[50vh]">
          <h2 className="m-0 text-[1.8rem] text-white font-bold max-md:text-2xl max-sm:text-xl">{character.card.name}</h2>

          <div className="grid grid-cols-2 gap-4 p-4 bg-[rgba(74,144,226,0.1)] rounded border-l-[3px] border-[#4A90E2] max-sm:grid-cols-1">
            <div className="flex flex-col gap-1">
              <span className="text-[0.85rem] text-[#9DB4D1] font-semibold uppercase tracking-[0.5px]">Power Points</span>
              <span className="text-[1.4rem] text-[#FFD700] font-bold max-sm:text-lg">{character.card.powerPoints}</span>
            </div>

            {character.card.costType && (
              <div className="flex flex-col gap-1">
                <span className="text-[0.85rem] text-[#9DB4D1] font-semibold uppercase tracking-[0.5px]">Cost</span>
                <span className="text-[1.4rem] text-[#FFD700] font-bold max-sm:text-lg">{formatCostType(character.card.costType)}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[0.85rem] text-[#9DB4D1] font-semibold uppercase tracking-[0.5px]">Diamonds</span>
              <span className="text-[1.4rem] text-[#FFD700] font-bold max-sm:text-lg">{character.card.diamonds || 0}</span>
            </div>
          </div>

          {(character.card.redAbility || character.card.blueAbility) && (
            <div className="flex flex-col gap-3">
              <h3 className="mt-2 mb-0 text-base text-[#4A90E2] font-semibold uppercase tracking-[0.5px]">Abilities</h3>
              {character.card.redAbility && (
                <div className="p-4 rounded border-l-4 bg-[rgba(220,100,100,0.1)] border-[#DC6464]">
                  <span className="block text-[0.85rem] font-semibold mb-2 uppercase tracking-[0.5px] text-[#DC6464]">Red (Instant)</span>
                  <p className="m-0 text-[0.9rem] text-[#D0D0D0] leading-snug">{character.card.redAbility.description}</p>
                </div>
              )}
              {character.card.blueAbility && (
                <div className="p-4 rounded border-l-4 bg-[rgba(100,150,220,0.1)] border-[#6496DC]">
                  <span className="block text-[0.85rem] font-semibold mb-2 uppercase tracking-[0.5px] text-[#6496DC]">Blue (Persistent)</span>
                  <p className="m-0 text-[0.9rem] text-[#D0D0D0] leading-snug">{character.card.blueAbility.description}</p>
                </div>
              )}
            </div>
          )}

          <p className="mt-auto text-[0.8rem] text-[#9DB4D1] italic text-center">Click overlay or press Escape to close</p>
        </div>
      </div>
    </div>
  );
};

function formatCostType(costType: unknown): string {
  if (typeof costType !== 'object' || costType === null) return 'Unknown';

  const cost = costType as Record<string, unknown>;

  if ('fixedSum' in cost) {
    return `Fixed Sum: ${cost.fixedSum}`;
  }
  if ('identicalValues' in cost) {
    return `${cost.identicalValues} Identical Cards`;
  }
  if ('run' in cost) {
    return `Run of ${cost.run}`;
  }
  if ('pairs' in cost) {
    return `${cost.pairs} Pairs`;
  }

  return 'Unknown';
}
