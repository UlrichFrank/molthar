## 1. Typen & Shared

- [ ] 1.1 `shared/src/game/types.ts`: Neuen Typ `ActionLogEntry` definieren (Felder: `playerId`, `type`, `cardName?`, `cardValue?`, `ppGained?`)
- [ ] 1.2 `shared/src/game/types.ts`: `GameState` um `actionLog: ActionLogEntry[]` ergänzen
- [ ] 1.3 `shared/src/game/index.ts`: `actionLog: []` in `setup()` initialisieren

## 2. Backend — Log-Einträge schreiben

- [ ] 2.1 Hilfsfunktion `pushLog(G, entry)` anlegen — hängt Eintrag an und schneidet auf 30 Einträge (FIFO)
- [ ] 2.2 `takePearlCard`: Log-Eintrag `{ type: 'takePearl', cardValue }` schreiben
- [ ] 2.3 `takeCharacterCard`: Log-Eintrag `{ type: 'takeCharacter', cardName }` schreiben
- [ ] 2.4 `activatePortalCard`: Log-Eintrag `{ type: 'activateCharacter', cardName, ppGained }` schreiben
- [ ] 2.5 `activateSharedCharacter`: Log-Eintrag `{ type: 'activateShared', cardName, ppGained }` schreiben
- [ ] 2.6 `replacePearlSlots`: Log-Eintrag `{ type: 'replacePearls' }` schreiben
- [ ] 2.7 `rehandCards`: Log-Eintrag `{ type: 'rehand' }` schreiben
- [ ] 2.8 `tradeForDiamond`: Log-Eintrag `{ type: 'tradeDiamond' }` schreiben
- [ ] 2.9 `endTurn`: Log-Eintrag `{ type: 'endTurn' }` schreiben

## 3. i18n — Übersetzungsschlüssel

- [ ] 3.1 `game-web/src/i18n/translations.ts`: TranslationKeys für alle Log-Typen hinzufügen (DE/EN/FR), z.B. `log.takePearl`, `log.takeCharacter`, `log.activateCharacter`, etc.
- [ ] 3.2 TranslationKey-Werte mit Interpolation für `{value}`, `{name}`, `{pp}` für alle drei Locales ausfüllen
- [ ] 3.3 `log.turnSeparator`-Key hinzufügen: `"{name}'s Zug"` / `"{name}'s turn"` / `"Tour de {name}"`

## 4. Frontend — Log-Leiste

- [ ] 4.1 Neue Komponente `TurnActionLog.tsx` in `game-web/src/components/`: rendert `G.actionLog`-Einträge als horizontale Leiste mit Toggle-Button
- [ ] 4.2 `TurnActionLog`: Einträge nach Zug gruppieren und Zugwechsel-Trenner einfügen
- [ ] 4.3 `TurnActionLog`: Toggle-State `isExpanded` (default: true); bei collapsed nur schmale Linie sichtbar
- [ ] 4.4 `TurnActionLog`: Neueste Einträge links, ältere nach rechts, horizontaler Overflow-Scroll
- [ ] 4.5 `CanvasGameBoard.tsx`: `<TurnActionLog>` unterhalb des Canvas einbinden, `G.actionLog` und aktuellen `playerID`-Mapping übergeben

## 5. Frontend — Highlight-on-Diff

- [ ] 5.1 `CanvasGameBoard.tsx`: `prevGRef` neben `gRef` hinzufügen, bei jedem `G`-Update befüllen
- [ ] 5.2 `CanvasGameBoard.tsx`: `highlightsRef: HighlightEntry[]` (kein React-State) anlegen
- [ ] 5.3 `CanvasGameBoard.tsx`: Diff-Logik in `useEffect([G])` — neue Handkarten-IDs, neue Portal-IDs, geänderte aktivierte Charaktere → `HighlightEntry` mit `regionId` + `startTime` erstellen
- [ ] 5.4 `game-web/src/lib/gameRender.ts`: `drawHighlights(ctx, regions, highlights, nowMs)` Funktion — zeichnet `rgba(103,232,249,0.35)`-Overlay, linear fade über 800ms
- [ ] 5.5 `CanvasGameBoard.tsx`: `drawHighlights` im rAF-Loop nach dem normalen Render-Aufruf einbinden
- [ ] 5.6 Abgelaufene Highlights (`nowMs - startTime > duration`) aus dem Array entfernen (im rAF-Loop)

## 6. Verifikation

- [ ] 6.1 `make test-shared` — alle Tests grün
- [ ] 6.2 Eigene Perlkarte nehmen → Eintrag erscheint in Log-Leiste
- [ ] 6.3 Charakterkarte aktivieren → Eintrag mit Name + PP-Gewinn erscheint, neue Portal-Karte glüht kurz
- [ ] 6.4 Gegnerzug abwarten → alle Aktionen des Gegners in Log sichtbar, geänderte Elemente leuchten auf
- [ ] 6.5 Toggle-Button → Leiste kollabiert/expandiert
- [ ] 6.6 Sprache auf EN/FR wechseln → Log-Texte übersetzt
