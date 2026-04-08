## 1. Hit-Regions für gegnerische aktivierte Karten

- [x] 1.1 Neuen Typ `opponent-activated-character` zum Union-Typ in `canvasRegions.ts` hinzufügen
- [x] 1.2 In `buildCanvasRegions` für jeden Gegner seine aktivierten Karten iterieren und `opponent-activated-character`-Regions mit Weltkoordinaten (aus den OPP_ACT_*-Konstanten und der Zonen-Transformation) hinzufügen
- [x] 1.3 Sicherstellen dass `animState` für `opponent-activated-character`-Regions korrekt aufgerufen wird (Animations-Zustand erhalten)

## 2. Click-Handler in CanvasGameBoard

- [x] 2.1 State `activeOpponentCharacter: { playerId: string; index: number } | null` in `CanvasGameBoardContent` hinzufügen
- [x] 2.2 In `onPointerDown` den neuen Region-Typ `opponent-activated-character` außerhalb des `isActive`-Guards behandeln (analog zu `activated-character`)
- [x] 2.3 Escape-Key-Handler erweitern: auch `activeOpponentCharacter` zurücksetzen wenn gesetzt

## 3. Detailansicht für gegnerische Karte anzeigen

- [x] 3.1 `ActivatedCharacterDetailView` ein zweites Mal rendern (oder State kombinieren) mit dem aufgelösten `CharacterActivationState` der gegnerischen Karte
- [x] 3.2 Sicherstellen dass die Detailansicht read-only funktioniert (keine eigenen Aktionen der Karte auslösbar)

## 4. Manuelle Verifikation

- [ ] 4.1 Im laufenden Spiel prüfen: Klick auf gegnerische aktivierte Karte öffnet Detailansicht
- [ ] 4.2 Prüfen: Hover-Glow und Click-Flash erscheinen auf gegnerischen aktivierten Karten
- [ ] 4.3 Prüfen: Detailansicht öffnet sich auch wenn nicht am Zug oder keine Aktionen mehr
- [ ] 4.4 Prüfen: Escape und Close-Button schließen die Ansicht korrekt
