interface CreateMatchProps {
  numPlayers: number;
  playerNameSet: boolean;
  onNumPlayersChange: (n: number) => void;
  onCreate: () => void;
}

export function CreateMatch({ numPlayers, playerNameSet, onNumPlayersChange, onCreate }: CreateMatchProps) {
  return (
    <div className="lobby-section">
      <h2>Neues Spiel erstellen</h2>
      <div className="form-group">
        <label>Spieleranzahl:</label>
        <select value={numPlayers} onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}>
          <option value={2}>2 Spieler</option>
          <option value={3}>3 Spieler</option>
          <option value={4}>4 Spieler</option>
          <option value={5}>5 Spieler</option>
        </select>
      </div>
      <button onClick={onCreate} disabled={!playerNameSet}>Spiel erstellen</button>
    </div>
  );
}
