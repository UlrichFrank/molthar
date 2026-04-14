import { useState, useMemo } from 'react';
import type { CharacterCard, PearlCard, CharacterAbility, ActivatedCharacter, PaymentSelection } from '@portale-von-molthar/shared';
import { validateCostPayment } from '@portale-von-molthar/shared';
import { getCostSummary, describeCost } from '../lib/cost-helper';
import { GameDialog, GameDialogTitle, GameDialogActions, CardPicker } from './GameDialog';
import { useTranslation } from '../i18n/useTranslation';

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
  const { t } = useTranslation();
  const [handSelections, setHandSelections] = useState<Map<number, HandSelection>>(new Map());
  const [abilitySelections, setAbilitySelections] = useState<AbilitySelection[]>([]);
  const [virtualDiamonds, setVirtualDiamonds] = useState(0);
  const [tradeSelection, setTradeSelection] = useState<{ characterId: string; handCardIndex: number } | null>(null);
  const [diamondCostConfirmed, setDiamondCostConfirmed] = useState(false);

  const selectedCharacter = availableCharacters[0]?.card;
  const selectedCharacterSlot = availableCharacters[0]?.slotIndex ?? null;

  const totalDiamondCost = useMemo(
    () => selectedCharacter?.cost?.filter(c => c.type === 'diamond').reduce((sum, c) => sum + (c.value ?? 1), 0) ?? 0,
    [selectedCharacter]
  );

  const hasOnesCanBeEights = activeAbilities.some(a => a.type === 'onesCanBeEights');
  const hasThreesCanBeAny = activeAbilities.some(a => a.type === 'threesCanBeAny');
  const hasDecreaseWithPearl = activeAbilities.some(a => a.type === 'decreaseWithPearl');

  const PAYMENT_ABILITY_TYPES = new Set([
    'onesCanBeEights', 'threesCanBeAny', 'decreaseWithPearl',
    'numberAdditionalCardActions', 'anyAdditionalCardActions',
    'tradeTwoForDiamond',
  ]);

  // All activated characters that have any payment-relevant ability
  const paymentAbilityChars = activatedCharacters.filter(c =>
    c.card.abilities.some(a => PAYMENT_ABILITY_TYPES.has(a.type))
  );
  const hasPaymentAbilities = paymentAbilityChars.length > 0;

  const allSelections: PaymentSelection[] = useMemo(() => {
    const result: PaymentSelection[] = [];
    for (const sel of handSelections.values()) {
      // Skip any hand card reserved for trade
      if (tradeSelection && sel.handCardIndex === tradeSelection.handCardIndex) continue;
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
    if (tradeSelection) {
      result.push({ source: 'trade', characterId: tradeSelection.characterId, handCardIndex: tradeSelection.handCardIndex, value: 2 });
    }
    if (diamondCostConfirmed && totalDiamondCost > 0) {
      result.push({ source: 'diamond', value: totalDiamondCost });
    }
    return result;
  }, [handSelections, abilitySelections, tradeSelection, diamondCostConfirmed, totalDiamondCost]);

  const diamondsReserved = useMemo(
    () => allSelections.reduce((sum, s) => sum + (s.diamondsUsed ?? 0), 0),
    [allSelections]
  );

  const isValidPayment = useMemo(() => {
    if (!selectedCharacter) return false;
    if (totalDiamondCost > 0 && !diamondCostConfirmed) return false;
    // Only 'hand' and 'ability' selections count as virtual hand cards for cost validation
    const virtualHand: PearlCard[] = allSelections
      .filter(sel => sel.source !== 'trade' && sel.source !== 'diamond')
      .map((sel, i) => ({
        id: `virtual-${i}`,
        value: sel.value as PearlCard['value'],
        hasSwapSymbol: sel.source === 'hand' ? (hand[sel.handCardIndex ?? 0]?.hasSwapSymbol ?? false) : false,
      }));
    return validateCostPayment(selectedCharacter.cost, virtualHand, diamonds + virtualDiamonds - diamondsReserved);
  }, [allSelections, selectedCharacter, hand, diamonds, virtualDiamonds, diamondsReserved, totalDiamondCost, diamondCostConfirmed]);

  const toggleHandCard = (idx: number) => {
    // Prevent selecting a card reserved for trade
    if (tradeSelection && idx === tradeSelection.handCardIndex) return;
    const next = new Map(handSelections);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      const card = hand[idx]!;
      next.set(idx, { handCardIndex: idx, value: card.value });
    }
    setHandSelections(next);
  };

  const handleTradeToggle = (characterId: string) => {
    if (tradeSelection?.characterId === characterId) {
      // Toggle OFF
      setTradeSelection(null);
      setVirtualDiamonds(v => v - 1);
    } else {
      // Toggle ON: find first 2-pearl not already in handSelections
      const freeIdx = hand.findIndex((c, i) => c.value === 2 && !handSelections.has(i));
      if (freeIdx === -1) return;
      // Remove that index from hand selections if it was selected
      const next = new Map(handSelections);
      next.delete(freeIdx);
      setHandSelections(next);
      setTradeSelection({ characterId, handCardIndex: freeIdx });
      setVirtualDiamonds(v => v + 1);
    }
  };

  const setHandCardValue = (
    idx: number,
    newValue: PearlCard['value'],
    abilityType?: CharacterAbility['type'],
    diamondsUsed?: number
  ) => {
    const next = new Map(handSelections);
    const existing = next.get(idx);
    if (existing) {
      next.set(idx, { ...existing, value: newValue, abilityType, diamondsUsed });
    }
    setHandSelections(next);
  };

  const resetHandCard = (idx: number) => {
    const next = new Map(handSelections);
    next.set(idx, { handCardIndex: idx, value: hand[idx]!.value });
    setHandSelections(next);
  };

  const toggleAbilitySelection = (characterId: string, value: PearlCard['value']) => {
    const existing = abilitySelections.findIndex(s => s.characterId === characterId);
    if (existing >= 0) {
      setAbilitySelections(abilitySelections.filter((_, i) => i !== existing));
    } else {
      setAbilitySelections([...abilitySelections, { characterId, value }]);
    }
  };

  const handleActivate = () => {
    if (isValidPayment && selectedCharacterSlot !== null) {
      onActivate(selectedCharacterSlot, allSelections);
    }
  };

  const selectedSet = new Set(handSelections.keys());
  const reservedSet = tradeSelection ? new Set([tradeSelection.handCardIndex]) : new Set<number>();
  const effectiveDiamonds = diamonds + virtualDiamonds;

  return (
    <GameDialog>
      <GameDialogTitle>{t('activation.title')}</GameDialogTitle>

      {/* Character to activate */}
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

          {/* ── Section 1: Hand cards ── */}
          <div>
            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>
              {t('activation.handCards', { count: handSelections.size + abilitySelections.length })}
            </h3>
            <CardPicker
              cards={hand}
              selected={selectedSet}
              reserved={reservedSet}
              onToggle={toggleHandCard}
              getImageSrc={(card) => `/assets/Perlenkarte${card.value}${card.hasRefreshSymbol ? '-neu' : ''}.png`}
              getAlt={(card) => `Pearl ${card.value}`}
            />

            {/* Per-card ability badges, shown directly beneath each selected hand card */}
            {Array.from(handSelections.values()).map((sel) => {
              const card = hand[sel.handCardIndex]!;
              const canUseOnes = hasOnesCanBeEights && card.value === 1;
              const canUseThrees = hasThreesCanBeAny && card.value === 3;
              const canDecrease = hasDecreaseWithPearl && card.value > 1;
              if (!canUseOnes && !canUseThrees && !canDecrease) return null;
              const isModified = !!sel.abilityType;

              return (
                <div
                  key={sel.handCardIndex}
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.35rem 0.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '0.4rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: '#cbd5e0' }}>{t('activation.pearlLabel', { value: card.value })}</span>

                  {/* onesCanBeEights badge */}
                  {canUseOnes && (
                    <button
                      onClick={() =>
                        sel.abilityType === 'onesCanBeEights'
                          ? resetHandCard(sel.handCardIndex)
                          : setHandCardValue(sel.handCardIndex, 8, 'onesCanBeEights')
                      }
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '0.3rem',
                        background: sel.abilityType === 'onesCanBeEights' ? '#4a90d9' : 'rgba(74,144,217,0.3)',
                        color: '#fff',
                        border: '1px solid #4a90d9',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      {t('activation.abilityOnesAsEights')}
                    </button>
                  )}

                  {/* threesCanBeAny value picker */}
                  {canUseThrees && (
                    <>
                      <span style={{ color: '#a0aec0', fontSize: '0.75rem' }}>→</span>
                      {PEARL_VALUES.map(v => (
                        <button
                          key={v}
                          onClick={() =>
                            sel.abilityType === 'threesCanBeAny' && sel.value === v
                              ? resetHandCard(sel.handCardIndex)
                              : setHandCardValue(sel.handCardIndex, v, 'threesCanBeAny')
                          }
                          style={{
                            padding: '0.1rem 0.35rem',
                            borderRadius: '0.25rem',
                            background:
                              sel.abilityType === 'threesCanBeAny' && sel.value === v
                                ? '#68d391'
                                : 'rgba(104,211,145,0.2)',
                            color: '#fff',
                            border: '1px solid #68d391',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            minWidth: '1.4rem',
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </>
                  )}

                  {/* decreaseWithPearl badge */}
                  {canDecrease && (
                    <button
                      onClick={() => {
                        if (sel.abilityType === 'decreaseWithPearl') {
                          resetHandCard(sel.handCardIndex);
                        } else {
                          setHandCardValue(
                            sel.handCardIndex,
                            Math.max(1, card.value - 1) as PearlCard['value'],
                            'decreaseWithPearl',
                            1
                          );
                        }
                      }}
                      disabled={sel.abilityType !== 'decreaseWithPearl' && diamondsReserved >= effectiveDiamonds}
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '0.3rem',
                        background:
                          sel.abilityType === 'decreaseWithPearl'
                            ? '#f6ad55'
                            : diamondsReserved >= effectiveDiamonds
                              ? 'rgba(160,160,160,0.2)'
                              : 'rgba(246,173,85,0.3)',
                        color: sel.abilityType === 'decreaseWithPearl' ? '#1a202c' : '#fff',
                        border: `1px solid ${diamondsReserved >= effectiveDiamonds && sel.abilityType !== 'decreaseWithPearl' ? '#666' : '#f6ad55'}`,
                        cursor:
                          sel.abilityType !== 'decreaseWithPearl' && diamondsReserved >= effectiveDiamonds
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: '0.8rem',
                        opacity:
                          sel.abilityType !== 'decreaseWithPearl' && diamondsReserved >= effectiveDiamonds ? 0.5 : 1,
                      }}
                    >
                      −1 💎
                    </button>
                  )}

                  {isModified && (
                    <span style={{ color: '#90cdf4', fontSize: '0.75rem' }}>→ {sel.value}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Section 2: Payment abilities (from activated characters) ── */}
          {hasPaymentAbilities && (
            <div style={{ marginTop: '0.75rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>
                {t('activation.abilities')}
              </h3>

              {paymentAbilityChars.map(char => {
                const abilities = char.card.abilities;
                const isOnesCanBeEights = abilities.some(a => a.type === 'onesCanBeEights');
                const isThreesCanBeAny = abilities.some(a => a.type === 'threesCanBeAny');
                const isDecreaseWithPearl = abilities.some(a => a.type === 'decreaseWithPearl');
                const isNumberBonus = abilities.some(a => a.type === 'numberAdditionalCardActions');
                const isAnyBonus = abilities.some(a => a.type === 'anyAdditionalCardActions');
                const isTradeTwo = abilities.some(a => a.type === 'tradeTwoForDiamond');

                const isSelected = abilitySelections.some(s => s.characterId === char.id);
                const selectedEntry = abilitySelections.find(s => s.characterId === char.id);

                const isTradeActive = tradeSelection?.characterId === char.id;
                // Free 2-pearl: exists in hand and not already in handSelections (unless it's the trade one)
                const hasFreeTwoPearl = hand.some((c, i) => c.value === 2 && !handSelections.has(i));
                const tradeDisabled = !isTradeActive && !hasFreeTwoPearl;

                const printedPearl = char.card.printedPearls?.[0];
                const printedValue =
                  printedPearl && 'value' in printedPearl ? printedPearl.value : undefined;

                let description = '';
                if (isOnesCanBeEights) description = t('activation.abilityOnesAsEights');
                else if (isThreesCanBeAny) description = t('activation.abilityThreesAsAny');
                else if (isDecreaseWithPearl) description = t('activation.abilityDecreaseCard');

                return (
                  <div
                    key={char.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.4rem 0.5rem',
                      background: isSelected ? 'rgba(144,205,244,0.12)' : 'rgba(255,255,255,0.06)',
                      borderRadius: '0.4rem',
                      marginBottom: '0.4rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <img
                      src={`/assets/${encodeURIComponent(char.card.imageName)}`}
                      alt={char.card.name}
                      style={{ height: '56px', width: 'auto', borderRadius: '0.25rem', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.25rem' }}>
                        {char.card.name}
                      </div>

                      {/* Hand-card-badge abilities: show as description only (badge appears on selected hand cards) */}
                      {(isOnesCanBeEights || isThreesCanBeAny || isDecreaseWithPearl) && (
                        <div style={{ fontSize: '0.76rem', color: '#a0aec0' }}>{description}</div>
                      )}

                      {/* numberAdditionalCardActions: add-button */}
                      {isNumberBonus && printedValue !== undefined && (
                        isSelected ? (
                          <button
                            onClick={() => toggleAbilitySelection(char.id, printedValue)}
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '0.3rem',
                              background: 'rgba(252,129,129,0.3)',
                              color: '#fc8181',
                              border: '1px solid #fc8181',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            {t('activation.removeValue', { value: printedValue })}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleAbilitySelection(char.id, printedValue)}
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '0.3rem',
                              background: 'rgba(144,205,244,0.2)',
                              color: '#90cdf4',
                              border: '1px solid #90cdf4',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            {t('activation.addValue', { value: printedValue })}
                          </button>
                        )
                      )}

                      {/* anyAdditionalCardActions: value picker */}
                      {isAnyBonus && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {isSelected && selectedEntry ? (
                            <button
                              onClick={() => toggleAbilitySelection(char.id, selectedEntry.value)}
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '0.3rem',
                                background: 'rgba(252,129,129,0.3)',
                                color: '#fc8181',
                                border: '1px solid #fc8181',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                              }}
                            >
                              {t('activation.removeValue', { value: selectedEntry.value })}
                            </button>
                          ) : (
                            PEARL_VALUES.map(v => (
                              <button
                                key={v}
                                onClick={() => toggleAbilitySelection(char.id, v)}
                                style={{
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '0.25rem',
                                  background: 'rgba(144,205,244,0.2)',
                                  color: '#90cdf4',
                                  border: '1px solid #90cdf4',
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  minWidth: '1.4rem',
                                }}
                              >
                                +{v}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      {/* tradeTwoForDiamond: toggle button */}
                      {isTradeTwo && (
                        <button
                          onClick={() => handleTradeToggle(char.id)}
                          disabled={tradeDisabled}
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '0.3rem',
                            background: isTradeActive
                              ? '#f6ad55'
                              : tradeDisabled
                                ? 'rgba(160,160,160,0.15)'
                                : 'rgba(246,173,85,0.25)',
                            color: isTradeActive ? '#1a202c' : tradeDisabled ? '#718096' : '#f6ad55',
                            border: `1px solid ${tradeDisabled ? '#4a5568' : '#f6ad55'}`,
                            cursor: tradeDisabled ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            opacity: tradeDisabled ? 0.5 : 1,
                          }}
                        >
                          {isTradeActive ? t('activation.tradeTwoPearlActive') : t('activation.tradeTwoPearl')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Section 3: Diamond cost confirmation ── */}
      {totalDiamondCost > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)' }}>
            {t('activation.diamondCost')}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: diamondCostConfirmed ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.06)',
            borderRadius: '0.4rem',
          }}>
            <span style={{ color: '#67e8f9', fontSize: '1rem' }}>
              💎 {totalDiamondCost}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              / {t('activation.diamondAvailable', { count: diamonds })}
            </span>
            <button
              onClick={() => setDiamondCostConfirmed(v => !v)}
              disabled={diamonds < totalDiamondCost}
              style={{
                marginLeft: 'auto',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.3rem',
                background: diamondCostConfirmed
                  ? '#67e8f9'
                  : diamonds < totalDiamondCost
                    ? 'rgba(160,160,160,0.15)'
                    : 'rgba(103,232,249,0.25)',
                color: diamondCostConfirmed ? '#0f172a' : diamonds < totalDiamondCost ? '#718096' : '#67e8f9',
                border: `1px solid ${diamonds < totalDiamondCost ? '#4a5568' : '#67e8f9'}`,
                cursor: diamonds < totalDiamondCost ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                opacity: diamonds < totalDiamondCost ? 0.5 : 1,
              }}
            >
              {diamondCostConfirmed ? t('activation.diamondConfirmed') : t('activation.diamondConfirm')}
            </button>
          </div>
        </div>
      )}

      <GameDialogActions
        confirmLabel={isValidPayment ? t('activation.activate') : t('activation.invalidPayment')}
        confirmDisabled={!isValidPayment}
        onConfirm={handleActivate}
        onCancel={onCancel}
      />
    </GameDialog>
  );
}
