## 1. Shared: gameover-Payload erweitern

- [x] 1.1 `endIf` in `shared/src/game/index.ts`: `players`-Array mit `{ id, name, powerPoints, activatedCount }` (sortiert nach `powerPoints` desc) zum Rückgabewert hinzufügen
- [x] 1.2 `terminateGame`-Move: auch dort `endGame`-Payload um `players`-Array erweitern (Spielstand zum Zeitpunkt des Abbruchs)
- [x] 1.3 TypeScript-Typen prüfen — kein separater Interface-Typ nötig, da `endIf`-Rückgabe `any` ist; sicherstellen dass Build sauber ist

## 2. Frontend: Threshold- und Final-Round-Indikator

- [x] 2.1 `CanvasGameBoardContent` in `CanvasGameBoard.tsx`: Threshold-Indikator-Overlay rendern wenn `G.finalRound === true` (positioniertes `<div>` über Canvas, z. B. oben mittig)
- [x] 2.2 Final-Round-Banner rendern wenn `G.finalRound === true && gameover === undefined` — optisch abgrenzbar vom Threshold-Indikator (z. B. anderer Farbton/Icon)

## 3. Frontend: EndgameResultsDialog-Komponente

- [x] 3.1 Neue Komponente `game-web/src/components/EndgameResultsDialog.tsx` erstellen
- [x] 3.2 Rang-Tabelle implementieren: Spieler sortiert nach `powerPoints` desc, Felder Rang / Name / Punkte / Aktivierte Charaktere; Gewinner hervorheben
- [x] 3.3 "Zurück zur Lobby"-Button implementieren: feuert `pvm:gameOver`-Event
- [x] 3.4 Hinweistext für `reason === 'terminated'` einbauen ("Spiel wurde vom Ersteller beendet")

## 4. Frontend: Dialog einbinden und bestehendes Overlay ersetzen

- [x] 4.1 In `CanvasGameBoard.tsx`: bestehendes einfaches `gameover`-Overlay entfernen
- [x] 4.2 `EndgameResultsDialog` importieren und anzeigen wenn `gameover !== undefined`; `gameover`-Payload (`players`, `winner`) als Props übergeben
- [x] 4.3 Sicherstellen dass `pvm:gameOver`-Event in `LobbyScreen.tsx` korrekt aufgegriffen wird (Session-Cleanup + Lobby-Navigation) — bereits implementiert, nur verifizieren
