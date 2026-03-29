import React, { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard, CharacterAbility, ActivatedCharacter, PaymentSelection } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';
import { GameDialog, GameDialogTitle, GameDialogActions, CardPicker } from './GameDialog';

interface CharacterActivationDialogProps {
  availableCharacters: Array<{ card: CharacterCard; slotIndex: number }>;
  hand: PearlCard[];
  diamonds: number;
  activeAbilities?: CharacterAbility[];
  activatedCharacters?: ActivatedCharacter[];
  onActivate: (characterSlotIndex: number, selections: PaymentSelection[]) => void;
  onCancel: () => void;
}

type HandSelection = {
  handCardIndex: number;
  /** effective value after ability modifier */
  value: PearlCard['value'];
  abilityType?: CharacterAbility['type'];
  diamondsUsed?: number;
};

type AbilitySelection = {
  characterId: string;
  value: PearlCard['value'];
};

const PEARL_VALUES: PearlCard['value'][] = [1, 2, 3, 4, 5, 6, 7, 8];

export function CharacterActivationDialog({
  availableCharacters,
  hand,
  diamonds,
  activeAbilities = [],
  activatedCharacters = [],
  onActivate,
  onCancel,
}: CharacterActivationDialogProps) {
  const [handSelections, setHandSelections] = useState<Map<number, HandSelection>>(new Map());
  const [abilitySelections, setAbilitySelections] = useState<AbilitySelection[]>([]);

  const selectedCharacter = availableCharacters[0]?.card;
  const selectedCharacterSlot = availableCharacters[0]?.slotIndex ?? null;

  const hasOnesCanBeEights = activeAbilities.some(a => a.type === 'onesCanBeEights');
  const hasThreesCanBeAny = activeAbilities.some(a => a.type === 'threesCanBeAny');
  const hasDecreaseWithPearl = activeAbilities.some(a => a.type === 'decreaseWithPearl');

  // Characters with printed pearl values (for TIER 6)
  const printedPearlChars = activatedCharacters.filter(c =>
    c.card.abilities.some(a => a.type === 'numberAdditionalCardActions' || a.type === 'anyAdditionalCardActions')
  );

  const allSelections: PaymentSelection[] = useMemo(() => {
    const result: PaymentSelection[] = [];
    for (const sel of handSelections.values()) {
      result.push({
        source: 'hand',
        handCardIndex: sel.handCardIndex,
        value: sel.value,
        abilityType: sel.abilityType,
        diamondsUsed: sel.diamondsUsed,
      });
    }
    for (const sel of abilitySelections) {
      result.push({ source: 'ability', characterId: sel.characterId, value: sel.value });
    }
    return result;
  }, [handSelections, abilitySelections]);

  const isValidPayment = useMemo(() => {
    if (!selectedCharacter) return false;
    // Build virtual PearlCards from selections (mirrors backend logic)
    const virtualHand: PearlCard[] = allSelections.map((sel, i) => ({
      id: `virtual-${i}`,
      value: sel.value,
      hasSwapSymbol: sel.source === 'hand' ? (hand[sel.handCardIndex ?? 0]?.hasSwapSymbol ?? false) : false,
    }));
    const diamondsUsed = allSelections.reduce((sum, s) => sum + (s.diamondsUsed ?? 0), 0);
    return validateCostPayment(selectedCharacter.cost, virtualHand, diamonds - diamondsUsed);
  }, [allSelections, selectedCharacter, hand, diamonds]);

  const toggleHandCard = (idx: number) => {
    const next = new Map(handSelections);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      const card = hand[idx]!;
      next.set(idx, { handCardIndex: idx, value: card.value });
    }
    setHandSelections(next);
  };

  const setHandCardAbility = (idx: number, abilityType: CharacterAbility['type'], newValue: PearlCard['value'], diamondsUsed?: number) => {
    const next = new Map(handSelections);
    const existing = next.get(idx);
    if (existing) {
      next.set(idx, { ...existing, value: newValue, abilityType, diamondsUsed });
    }
    setHandSelections(next);
  };

  const clearHandCardAbility = (idx: number) => {
    const next = new Map(handSelections);
    const existing = next.get(idx);
    if (existing) {
      next.set(idx, { handCardIndex: idx, value: hand[idx]!.value });
    }
    setHandSelections(next);
  };

  const handleActivate = () => {
    if (isValidPayment && selectedCharacterSlot !== null) {
      onActivate(selectedCharacterSlot, allSelections);
    }
  };

  const selectedSet = new Set(handSelections.keys());

  return (
    <GameDialog>
      <GameDialogTitle>Activate Character</GameDialogTitle>

      <div className="flex flex-wrap justify-center gap-1.5 bg-white/10 p-1.5 rounded-lg sm:gap-2.5 sm:p-2">
        {availableCharacters.map(({ card, slotIndex }) => (
          <img
            key={slotIndex}
            src={`/assets/${encodeURIComponent(card.imageName)}`}
            alt={card.name}
            className="w-auto h-full max-h-[200px] object-contain block rounded-lg sm:max-h-[280px]"
          />
        ))}
      </div>

      {selectedCharacter && (
        <>
          {import.meta.env.VITE_DEBUG_COST === 'true' && (
            <div className="game-dialog-info">
              <p className="game-dialog-info-text">Cost: {getCostSummary(selectedCharacter.cost)}</p>
              <p className="game-dialog-info-text">{describeCost(selectedCharacter.cost)}</p>
              {diamonds > 0 && (
                <p className="game-dialog-info-text">💎 {diamonds} available (reduces cost)</p>
              )}
            </div>
          )}

          <div>
            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>
              Select Cards to Pay ({handSelections.size + abilitySelections.length} selected)
            </h3>
            <CardPicker
              cards={hand}
              selected={selectedSet}
              onToggle={toggleHandCard}
              getImageSrc={(card) => `/assets/Perlenkarte${card.value}.png`}
              getAlt={(card) => `Pearl ${card.value}`}
            />

            {/* Ability modifiers for selected hand cards */}
            {Array.from(handSelections.values()).map((sel) => {
              const card = hand[sel.handCardIndex]!;
              const canUseOnes = hasOnesCanBeEights && card.value === 1;
              const canUseThrees = hasThreesCanBeAny && card.value === 3;
              const canDecrease = hasDecreaseWithPearl && card.value > 1;
              if (!canUseOnes && !canUseThrees && !canDecrease) return null;

              return (
                <div key={sel.handCardIndex} style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Pearl {card.value}: </span>
                  {sel.abilityType ? (
                    <>
                      <span style={{ color: '#90cdf4' }}>→ {sel.value} (ability)</span>
                      <button onClick={() => clearHandCardAbility(sel.handCardIndex)} style={{ marginLeft: '0.5rem', color: '#fc8181' }}>✕ Remove</button>
                    </>
                  ) : (
                    <>
                      {canUseOnes && (
                        <button onClick={() => setHandCardAbility(sel.handCardIndex, 'onesCanBeEights', 8)} style={{ marginLeft: '0.5rem', color: '#90cdf4' }}>
                          Use as 8 (ability)
                        </button>
                      )}
                      {canUseThrees && PEARL_VALUES.map(v => (
                        <button key={v} onClick={() => setHandCardAbility(sel.handCardIndex, 'threesCanBeAny', v)} style={{ marginLeft: '0.25rem', color: '#90cdf4' }}>
                          →{v}
                        </button>
                      ))}
                      {canDecrease && (
                        <button onClick={() => setHandCardAbility(sel.handCardIndex, 'decreaseWithPearl', Math.max(1, card.value - 1) as PearlCard['value'], 1)} style={{ marginLeft: '0.5rem', color: '#90cdf4' }}>
                          −1 (1💎)
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Printed pearl values from activated characters (TIER 6) */}
            {printedPearlChars.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Printed Pearl Values (from activated characters):</h4>
                {printedPearlChars.map(char => {
                  const printedPearls = char.card.printedPearls ?? [];
                  const isAnyBonus = char.card.abilities.some(a => a.type === 'anyAdditionalCardActions');
                  const isSelected = abilitySelections.some(s => s.characterId === char.id);

                  if (isAnyBonus) {
                    return (
                      <div key={char.id} style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        {char.card.name}: Wildcard
                        {!isSelected ? (
                          PEARL_VALUES.map(v => (
                            <button key={v} onClick={() => setAbilitySelections([...abilitySelections, { characterId: char.id, value: v }])} style={{ marginLeft: '0.25rem', color: '#90cdf4' }}>
                              +{v}
                            </button>
                          ))
                        ) : (
                          <button onClick={() => setAbilitySelections(abilitySelections.filter(s => s.characterId !== char.id))} style={{ marginLeft: '0.5rem', color: '#fc8181' }}>✕</button>
                        )}
                      </div>
                    );
                  }

                  return printedPearls.map((pp, i) => {
                    if ('wildcard' in pp) return null;
                    const reactKey = `${char.id}-${i}`;
                    // Count how many times this character's pearl at index i is already selected
                    const selectedCountForChar = abilitySelections.filter(s => s.characterId === char.id).length;
                    const isThisPearlSelected = selectedCountForChar > i;
                    return (
                      <div key={reactKey} style={{ marginTop: '0.25rem', fontSize: '0.85rem', display: 'inline-block', marginRight: '0.5rem' }}>
                        {char.card.name}: {pp.value}
                        {!isThisPearlSelected ? (
                          <button onClick={() => setAbilitySelections([...abilitySelections, { characterId: char.id, value: pp.value }])} style={{ marginLeft: '0.5rem', color: '#90cdf4' }}>
                            +{pp.value}
                          </button>
                        ) : (
                          <button onClick={() => {
                            const idx = abilitySelections.findLastIndex(s => s.characterId === char.id);
                            if (idx >= 0) setAbilitySelections(abilitySelections.filter((_, j) => j !== idx));
                          }} style={{ marginLeft: '0.5rem', color: '#fc8181' }}>✕</button>
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </>
      )}

      <GameDialogActions
        confirmLabel={isValidPayment ? 'Activate' : 'Invalid Payment'}
        confirmDisabled={!isValidPayment}
        onConfirm={handleActivate}
        onCancel={onCancel}
      />
    </GameDialog>
  );
}
