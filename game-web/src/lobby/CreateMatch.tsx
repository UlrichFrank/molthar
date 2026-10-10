import type { NpcStrategy, NpcSlotConfig } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';
import type { TranslationKey } from '../i18n/translations';

const NPC_STRATEGIES: NpcStrategy[] = ['efficient', 'aggressive', 'diamond'];
const STRATEGY_NAMES: Record<NpcStrategy, TranslationKey> = {
  random: 'create.npcStrategy.random',
  greedy: 'create.npcStrategy.greedy',
  diamond: 'create.npcStrategy.diamond',
  efficient: 'create.npcStrategy.efficient',
  aggressive: 'create.npcStrategy.aggressive',
};

const NPC_NAMES: Record<NpcStrategy, string> = {
  random: 'Irrnis der Zufallsgeist',
  greedy: 'Weiser Wendelin',
  diamond: 'Edelsteinsammlerin Erda',
  efficient: 'Weiser Wendelin',
  aggressive: 'Raubritter Ralf',
};

/** Slot config used in CreateMatch — 'human' or the NPC's strategy */
type SlotType = 'human' | NpcStrategy;

interface CreateMatchProps {
  numPlayers: number;
  playerNameSet: boolean;
  withSpecialCards: boolean;
  npcSlots: NpcSlotConfig[];
  onNumPlayersChange: (n: number) => void;
  onWithSpecialCardsChange: (v: boolean) => void;
  onNpcSlotsChange: (slots: NpcSlotConfig[]) => void;
  onCreate: () => void;
}

export function CreateMatch({
  numPlayers,
  playerNameSet,
  withSpecialCards,
  npcSlots,
  onNumPlayersChange,
  onWithSpecialCardsChange,
  onNpcSlotsChange,
  onCreate,
}: CreateMatchProps) {
  const { t } = useTranslation();

  // Slot 0 is always the creator (human)
  const slotTypes: SlotType[] = Array.from({ length: numPlayers }, (_, i) => {
    if (i === 0) return 'human';
    return npcSlots.find(s => s.playerIndex === i)?.strategy ?? 'human';
  });

  function handleTotalChange(n: number) {
    onNumPlayersChange(n);
    onNpcSlotsChange(npcSlots.filter(s => s.playerIndex < n));
  }

  function handleSlotChange(slotIndex: number, type: SlotType) {
    const without = npcSlots.filter(s => s.playerIndex !== slotIndex);
    onNpcSlotsChange(
      type === 'human'
        ? without
        : [...without, { playerIndex: slotIndex, strategy: type, name: NPC_NAMES[type] }],
    );
  }

  return (
    <section className="lb-panel">
      <h2>{t('create.title')}</h2>
      <p className="lb-hint">{t('create.hint')}</p>

      <div className="lb-seat">
        <span className="lb-seat-label">{t('create.totalPlayers')}</span>
        <div className="lb-chips" role="radiogroup" aria-label={t('create.totalPlayers')}>
          {[2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={numPlayers === n}
              className="lb-chip"
              onClick={() => handleTotalChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {slotTypes.map((slotType, i) => (
        <div key={i} className="lb-seat">
          <span className="lb-seat-label">{t('waiting.seat', { n: i + 1 })}</span>
          {i === 0 ? (
            <span>{t('create.seatYou')}</span>
          ) : (
            <div className="lb-chips" role="radiogroup" aria-label={t('waiting.seat', { n: i + 1 })}>
              <button
                type="button"
                role="radio"
                aria-checked={slotType === 'human'}
                className="lb-chip"
                onClick={() => handleSlotChange(i, 'human')}
              >
                {t('create.humanSlot')}
              </button>
              {NPC_STRATEGIES.map(s => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={slotType === s}
                  className="lb-chip"
                  title={t(STRATEGY_NAMES[s])}
                  onClick={() => handleSlotChange(i, s)}
                >
                  {NPC_NAMES[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <label className="lb-check">
        <input
          type="checkbox"
          checked={withSpecialCards}
          onChange={(e) => onWithSpecialCardsChange(e.target.checked)}
        />
        <span>{t('create.withSpecialCards')}</span>
      </label>

      <button className="lb-btn lb-btn--wide" onClick={onCreate} disabled={!playerNameSet}>
        {t('create.create')}
      </button>
      {!playerNameSet && <p className="lb-hint">{t('lobby.nameFirst')}</p>}
    </section>
  );
}
