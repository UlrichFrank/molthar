import type { NpcStrategy, NpcSlotConfig } from '@portale-von-molthar/shared';
import { useTranslation } from '../i18n/useTranslation';

const NPC_STRATEGIES: NpcStrategy[] = ['random', 'greedy', 'diamond', 'efficient', 'aggressive'];
const STRATEGY_NAMES: Record<NpcStrategy, string> = {
  random: 'create.npcStrategy.random',
  greedy: 'create.npcStrategy.greedy',
  diamond: 'create.npcStrategy.diamond',
  efficient: 'create.npcStrategy.efficient',
  aggressive: 'create.npcStrategy.aggressive',
};

const NPC_NAMES: Record<NpcStrategy, string> = {
  random: 'Irrnis der Zufallsgeist',
  greedy: 'Gier von Goldbach',
  diamond: 'Edelstein-Erda',
  efficient: 'Weiser Wendelin',
  aggressive: 'Raubritter Ralf',
};

export function npcNameForStrategy(strategy: NpcStrategy): string {
  return NPC_NAMES[strategy];
}

/** Slot config used in CreateMatch — true = human, NpcStrategy = NPC */
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

  // Derive slot types from npcSlots (slot 0 is always human = creator)
  const slotTypes: SlotType[] = Array.from({ length: numPlayers }, (_, i) => {
    if (i === 0) return 'human'; // creator always human
    const npc = npcSlots.find(s => s.playerIndex === i);
    return npc ? npc.strategy : 'human';
  });

  const humanCount = slotTypes.filter(s => s === 'human').length;
  const canCreate = playerNameSet && humanCount >= 1;

  function handleTotalChange(n: number) {
    onNumPlayersChange(n);
    // Remove npcSlots for indices that no longer exist
    const remaining = npcSlots.filter(s => s.playerIndex < n);
    onNpcSlotsChange(remaining);
  }

  function handleSlotToggle(slotIndex: number, type: SlotType) {
    if (slotIndex === 0) return; // creator slot always human
    const without = npcSlots.filter(s => s.playerIndex !== slotIndex);
    if (type === 'human') {
      onNpcSlotsChange(without);
    } else {
      onNpcSlotsChange([
        ...without,
        { playerIndex: slotIndex, strategy: type as NpcStrategy, name: NPC_NAMES[type as NpcStrategy] },
      ]);
    }
  }

  function handleStrategyChange(slotIndex: number, strategy: NpcStrategy) {
    const without = npcSlots.filter(s => s.playerIndex !== slotIndex);
    onNpcSlotsChange([
      ...without,
      { playerIndex: slotIndex, strategy, name: NPC_NAMES[strategy] },
    ]);
  }

  return (
    <div className="lobby-section">
      <h2>{t('create.title')}</h2>

      {/* Total player count */}
      <div className="form-group">
        <label>{t('create.totalPlayers')}</label>
        <select value={numPlayers} onChange={(e) => handleTotalChange(parseInt(e.target.value))}>
          {[2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{t('create.nPlayers', { n })}</option>
          ))}
        </select>
      </div>

      {/* Per-slot configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {slotTypes.map((slotType, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', minWidth: '1.2rem' }}>
              {i + 1}.
            </span>

            {i === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{t('create.humanSlot')}</span>
            ) : (
              <>
                <select
                  value={slotType}
                  onChange={(e) => handleSlotToggle(i, e.target.value as SlotType)}
                  style={{ fontSize: '0.82rem', padding: '0.15rem 0.3rem' }}
                >
                  <option value="human">{t('create.humanSlot')}</option>
                  {NPC_STRATEGIES.map(s => (
                    <option key={s} value={s}>{t('create.npcSlot')}: {t(STRATEGY_NAMES[s] as any)}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
      </div>

      {humanCount < 1 && (
        <p style={{ color: '#f87171', fontSize: '0.82rem', margin: '0 0 0.5rem' }}>
          {t('create.npcMinHuman')}
        </p>
      )}

      {/* Special cards toggle */}
      <div className="form-group form-group--toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={withSpecialCards}
            onChange={(e) => onWithSpecialCardsChange(e.target.checked)}
          />
          <span>{t('create.withSpecialCards')}</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="match-join-btn" onClick={onCreate} disabled={!canCreate}>
          {t('create.create')}
        </button>
      </div>
    </div>
  );
}
