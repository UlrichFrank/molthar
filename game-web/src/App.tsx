import { useState } from 'react';
import { Lobby } from './components/Lobby';
import { Board } from './components/Board';
import './App.css';

export function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [playerID, setPlayerID] = useState<string | null>(null);

  if (!gameState) {
    return <Lobby />;
  }

  return (
    <Board
      G={gameState}
      ctx={{}}
      moves={{}}
      playerID={playerID}
      isActive={true}
    />
  );
}

export default App;
