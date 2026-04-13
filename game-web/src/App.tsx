import { LobbyScreen } from './lobby/LobbyScreen';
import { LanguageProvider } from './i18n/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <LobbyScreen />
    </LanguageProvider>
  );
}

export default App;
