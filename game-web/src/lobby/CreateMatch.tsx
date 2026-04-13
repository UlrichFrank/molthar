import { useTranslation } from '../i18n/useTranslation';

interface CreateMatchProps {
  numPlayers: number;
  playerNameSet: boolean;
  onNumPlayersChange: (n: number) => void;
  onCreate: () => void;
}

export function CreateMatch({ numPlayers, playerNameSet, onNumPlayersChange, onCreate }: CreateMatchProps) {
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
      <button onClick={onCreate} disabled={!playerNameSet}>{t('create.create')}</button>
    </div>
  );
}
