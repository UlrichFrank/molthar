import { useCardManager } from './hooks/useCardManager';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CardList } from './components/CardList';
import { CardEditor } from './components/CardEditor';
import './App.css';

function App() {
  const {
    cards,
    filteredCards,
    selectedCard,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    loading,
    createNewCard,
    updateCard,
    deleteCard,
    exportCards,
    importCards,
    stats,
  } = useCardManager();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importCards(file);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header
        cardCount={cards.length}
        onExport={exportCards}
        onImport={handleImport}
        onAddNew={createNewCard}
      />

      <Dashboard
        total={stats.total}
        totalPowerPoints={stats.totalPowerPoints}
        totalDiamonds={stats.totalDiamonds}
        cardsWithAbilities={stats.withAbilities}
      />

      <div className="flex-1 flex gap-0 overflow-hidden">
        <CardList
          cards={filteredCards.length > 0 ? filteredCards : cards}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CardEditor
          card={selectedCard ?? null}
          onUpdate={updateCard}
          onDelete={deleteCard}
        />
      </div>
    </div>
  );
}

export default App;
