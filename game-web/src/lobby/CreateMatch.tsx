import { useTranslation } from '../i18n/useTranslation';

interface CreateMatchProps {
  numPlayers: number;
  playerNameSet: boolean;
  withSpecialCards: boolean;
  onNumPlayersChange: (n: number) => void;
  onWithSpecialCardsChange: (v: boolean) => void;
  onCreate: () => void;
}

export function CreateMatch({ numPlayers, playerNameSet, withSpecialCards, onNumPlayersChange, onWithSpecialCardsChange, onCreate }: CreateMatchProps) {
  const { t } = useTranslation();
  return (
    <div className="lobby-section">
      <h2>{t('create.title')}</h2>
      <div className="form-group">
        <label>{t('create.playerCount')}</label>
        <select value={numPlayers} onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}>
          {[2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{t('create.nPlayers', { n })}</option>
          ))}
        </select>
      </div>
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
        <button className="match-join-btn" onClick={onCreate} disabled={!playerNameSet}>{t('create.create')}</button>
      </div>
    </div>
  );
}
