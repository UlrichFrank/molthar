## 1. Typen & Datenbasis

- [x] 1.1 `PearlCard`-Interface in `shared/src/game/types.ts` um `hasRefreshSymbol: boolean` erweitern
- [x] 1.2 `GameState`-Interface in `shared/src/game/types.ts` um `isPearlRefreshTriggered: boolean` erweitern
- [x] 1.3 In `createPearlDeck()` (`shared/src/game/index.ts`) die betroffenen Karten mit `hasRefreshSymbol: true` markieren (Spielregel prüfen: welche Karten tragen das Symbol)
- [x] 1.4 Initial state in `setup()` um `isPearlRefreshTriggered: false` ergänzen
- [x] 1.5 Alle bestehenden `PearlCard`-Literale in Tests um `hasRefreshSymbol: false` erweitern

## 2. Spiellogik (Backend/Shared)

- [x] 2.1 Hilfsfunktion `applyPearlRefreshIfNeeded(G, newlyAddedCards)` in `shared/src/game/index.ts` implementieren: prüft ob eine der neuen Karten `hasRefreshSymbol` hat, legt dann alle `characterSlots`-Karten auf den Discard und zieht 2 neue
- [x] 2.2 `takePearlCard`-Move: nach `refillSlots` die neu hinzugekommenen Karten ermitteln und `applyPearlRefreshIfNeeded` aufrufen
- [x] 2.3 `replacePearls`-Move: nach dem Neuauflegen ebenfalls `applyPearlRefreshIfNeeded` aufrufen
- [x] 2.4 `turn.onEnd` in der Spielkonfiguration: `isPearlRefreshTriggered` auf `false` zurücksetzen

## 3. Tests (Shared)

- [x] 3.1 Test: Refresh wird ausgelöst wenn markierte Perlenkarte in `pearlSlots` landet (via `takePearlCard`)
- [x] 3.2 Test: Refresh wird ausgelöst via `replacePearls`
- [x] 3.3 Test: Kein Refresh bei normaler Perlenkarte
- [x] 3.4 Test: Charakterdeck leer beim Refresh → Discard wird gemischt und als Deck verwendet
- [x] 3.5 Test: `isPearlRefreshTriggered` wird am Zugende zurückgesetzt

## 4. Frontend — Symbolanzeige

- [x] 4.1 In der Perlenkarten-Komponente (Canvas oder JSX) prüfen ob `hasRefreshSymbol` gesetzt ist und ein entsprechendes Icon/Badge rendern
- [x] 4.2 Symbol in der Pearl-Slot-Anzeige und in der Spielerhand konsistent darstellen

## 5. Frontend — Benachrichtigung

- [x] 5.1 `isPearlRefreshTriggered` aus dem GameState auslesen (z. B. via boardgame.io-Hook oder Zustand)
- [x] 5.2 Toast- oder Log-Eintrag anzeigen wenn `isPearlRefreshTriggered` auf `true` wechselt
