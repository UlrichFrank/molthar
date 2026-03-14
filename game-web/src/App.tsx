import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <h1 className="text-4xl font-bold text-white mb-8">
          🎮 Portale von Molthar
        </h1>

        <div className="bg-slate-700 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl text-white mb-4">
            Welcome to Web Edition
          </h2>

          <p className="text-slate-300 mb-6">
            Game setup and development environment ready!
          </p>

          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Count is {count}
          </button>
        </div>

        <p className="text-slate-400 mt-8 text-sm">
          Vite + React + TypeScript + boardgame.io
        </p>
      </div>
    </>
  );
}

export default App;
