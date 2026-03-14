import { GameContainer } from './components/GameContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';
import './styles/Animations.css';
import './styles/Accessibility.css';

function App() {
  return (
    <ErrorBoundary>
      <GameContainer />
    </ErrorBoundary>
  );
}

export default App;
