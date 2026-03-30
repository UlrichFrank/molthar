## 1. Shared: Types erweitern

- [ ] 1.1 `GameState` in `shared/src/game/types.ts` um `isReshufflingPearlDeck: boolean` und `isReshufflingCharacterDeck: boolean` erweitern

## 2. Shared: Game-Logik — Reshuffle-Hilfsfunktion

- [ ] 2.1 Neue interne Funktion `drawFromDeck<T>(deck, discardPile, onReshuffle)` in `shared/src/game/index.ts` erstellen, die Reshuffle + Callback kapselt
- [ ] 2.2 `refillSlots` auf `drawFromDeck` umstellen (Inline-Reshuffle entfernen)
- [ ] 2.3 Inline-Reshuffle in `rehandCards` (Zeilen ~372–375) auf `drawFromDeck` umstellen
- [ ] 2.4 Alle übrigen Stellen prüfen und ggf. auf `drawFromDeck` migrieren
- [ ] 2.5 `setup` in `index.ts`: Initialwerte für die neuen Flags setzen (`false`)

## 3. Shared: `acknowledgeReshuffle` Move

- [ ] 3.1 Move `acknowledgeReshuffle({ deckType: 'pearl' | 'character' })` in `shared/src/game/index.ts` implementieren (setzt Flag zurück, idempotent)
- [ ] 3.2 Move in die `moves`-Liste des boardgame.io Game-Specs eintragen

## 4. Shared: Tests

- [ ] 4.1 Tests für Perlen-Reshuffle: Flag wird gesetzt wenn `pearlDeck` leer und `pearlDiscardPile` nicht leer
- [ ] 4.2 Tests für Charakter-Reshuffle: Flag wird gesetzt wenn `characterDeck` leer und `characterDiscardPile` nicht leer
- [ ] 4.3 Tests für `acknowledgeReshuffle`: Flag wird korrekt zurückgesetzt, idempotent
- [ ] 4.4 Bestehende Tests auf neue Felder im `GameState` anpassen (falls nötig)

## 5. Frontend: DeckReshuffleAnimation-Komponente

- [ ] 5.1 Neue Komponente `DeckReshuffleAnimation` in `game-web/src/components/` erstellen mit Props `deckType: 'pearl' | 'character'`
- [ ] 5.2 Animation implementieren (~1.5 Sek., z.B. Karten-Shuffle-Icon mit CSS-Animation oder Canvas-Overlay)
- [ ] 5.3 Nach Animation-Ende `acknowledgeReshuffle` Move über boardgame.io aufrufen

## 6. Frontend: Board-Integration

- [ ] 6.1 Board-Komponente (oder zugehöriger Hook) liest `G.isReshufflingPearlDeck` und `G.isReshufflingCharacterDeck`
- [ ] 6.2 `DeckReshuffleAnimation` für Perlen-Deck rendern wenn `isReshufflingPearlDeck === true`
- [ ] 6.3 `DeckReshuffleAnimation` für Charakter-Deck rendern wenn `isReshufflingCharacterDeck === true`
- [ ] 6.4 Positionierung der Animation: Nähe des jeweiligen Deck-Bereichs auf dem Canvas

## 7. Abschluss & Verifikation

- [ ] 7.1 Manuelle Tests im lokalen Dev-Setup (`make dev`): Perlen-Deck leeren und Reshuffle beobachten
- [ ] 7.2 Manuelle Tests: Charakter-Deck leeren und Reshuffle beobachten
- [ ] 7.3 Multiplayer-Test: Zwei Clients öffnen und prüfen, dass beide die Animation sehen
- [ ] 7.4 `make test-shared` grün
