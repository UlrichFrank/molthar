import { useState, useEffect, useCallback } from 'react';
import type { CharacterCard } from '../lib/types';
import { getCardStore } from '../lib/cardStore';
import { findUnreferencedCharacterImages } from '../lib/imageLoader';

export function useCardManager() {
  const [cards, setCards] = useState<CharacterCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const store = getCardStore();

  // Load cards on mount
  useEffect(() => {
    const allCards = store.getAll();
    setCards(allCards);
    setLoading(false);
  }, []);

  const selectedCard = selectedId ? cards.find(c => c.id === selectedId) : null;

  const filteredCards = searchQuery
    ? store.search(searchQuery)
    : cards;

  const createNewCard = useCallback(() => {
    const newCard = store.create('Neuer Charakter');
    setCards(store.getAll());
    setSelectedId(newCard.id);
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<CharacterCard>) => {
    store.update(id, updates);
    setCards(store.getAll());
  }, []);

  const deleteCard = useCallback((id: string) => {
    store.delete(id);
    setCards(store.getAll());
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const deleteAllCards = useCallback(() => {
    const confirmDelete = confirm(
      `Wirklich ALLE ${cards.length} Charakterkarten löschen? Dies kann nicht rückgängig gemacht werden.`
    );
    if (confirmDelete) {
      store.deleteAll();
      setCards([]);
      setSelectedId(null);
    }
  }, [cards.length]);

  const exportCards = useCallback(() => {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importCards = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (store.importJSON(content)) {
        setCards(store.getAll());
        setSelectedId(null);
      } else {
        alert('Fehler beim Importieren der Datei');
      }
    };
    reader.readAsText(file);
  }, []);

  const createCardsFromImages = useCallback(async () => {
    const existingImageNames = cards.map(c => c.imageName).filter(Boolean);
    const unreferencedImages = await findUnreferencedCharacterImages(existingImageNames);
    
    if (unreferencedImages.length === 0) {
      alert('Keine neuen Charakterkarte*.png Bilder gefunden');
      return;
    }

    const confirmCreate = confirm(
      `${unreferencedImages.length} neue Charakterkarten erstellen?\n\n${unreferencedImages.join('\n')}`
    );
    
    if (confirmCreate) {
      const cardNames = unreferencedImages.map(image => {
        // Extract name from "Charakterkarte1.png" → "Charakter 1"
        const match = image.match(/Charakterkarte(\d+)/i);
        return match ? `Charakter ${match[1]}` : image;
      });
      
      store.createBatch(cardNames, unreferencedImages);
      setCards(store.getAll());
    }
  }, [cards]);

  return {
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
    deleteAllCards,
    exportCards,
    importCards,
    createCardsFromImages,
    stats: store.getStats(),
  };
}
