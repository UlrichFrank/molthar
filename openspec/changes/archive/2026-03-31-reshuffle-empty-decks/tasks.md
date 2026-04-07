## 1. Shared: Types erweitern

- [x] 1.1 `GameState` in `shared/src/game/types.ts` um `isReshufflingPearlDeck: boolean` und `isReshufflingCharacterDeck: boolean` erweitern

## 2. Shared: Game-Logik — Reshuffle-Hilfsfunktion

- [x] 2.1 Neue interne Funktion `drawCard<T>(deck, discardPile, onReshuffle)` in `shared/src/game/index.ts` erstellen, die Reshuffle + Callback kapselt
- [x] 2.2 `refillSlots` auf `drawCard` umstellen (Inline-Reshuffle entfernen)
- [x] 2.3 Inline-Reshuffle in `rehandCards` auf `drawCard` umstellen
- [x] 2.4 Alle übrigen Stellen geprüft und auf `drawCard` migriert
- [x] 2.5 `setup` in `index.ts`: Initialwerte für die neuen Flags gesetzt (`false`)

## 3. Shared: `acknowledgeReshuffle` Move

- [x] 3.1 Move `acknowledgeReshuffle({ deckType: 'pearl' | 'character' })` implementiert (idempotent)
- [x] 3.2 Move in die `moves`-Liste des boardgame.io Game-Specs eingetragen

## 4. Shared: Tests

- [x] 4.1 Tests für Perlen-Reshuffle: Flag wird gesetzt wenn `pearlDeck` leer und `pearlDiscardPile` nicht leer
- [x] 4.2 Tests für Charakter-Reshuffle: Flag wird gesetzt wenn `characterDeck` leer und `characterDiscardPile` nicht leer
- [x] 4.3 Tests für `acknowledgeReshuffle`: Flag wird korrekt zurückgesetzt, idempotent
- [x] 4.4 Bestehende Tests auf neue Felder im `GameState` angepasst (alle 226 Tests grün)

## 5. Frontend: DeckReshuffleAnimation-Komponente

- [x] 5.1 Neue Komponente `DeckReshuffleAnimation` in `game-web/src/components/` erstellt mit Props `deckType: 'pearl' | 'character'`
- [x] 5.2 Animation implementiert (~1.5 Sek., pulsierendes Shuffle-Icon mit CSS-Animation)
- [x] 5.3 Nach Animation-Ende `acknowledgeReshuffle` Move aufgerufen

## 6. Frontend: Board-Integration

- [x] 6.1 Board-Komponente liest `G.isReshufflingPearlDeck` und `G.isReshufflingCharacterDeck`
- [x] 6.2 `DeckReshuffleAnimation` für Perlen-Deck gerendert wenn `isReshufflingPearlDeck === true`
- [x] 6.3 `DeckReshuffleAnimation` für Charakter-Deck gerendert wenn `isReshufflingCharacterDeck === true`
- [x] 6.4 Positionierung: Perlen-Deck rechts (~6% vom Rand), Charakter-Deck links (~28%)

## 7. Abschluss & Verifikation

- [ ] 7.1 Manuelle Tests im lokalen Dev-Setup (`make dev`): Perlen-Deck leeren und Reshuffle beobachten
- [ ] 7.2 Manuelle Tests: Charakter-Deck leeren und Reshuffle beobachten
- [ ] 7.3 Multiplayer-Test: Zwei Clients öffnen und prüfen, dass beide die Animation sehen
- [x] 7.4 `make test-shared` grün (226 Tests)
