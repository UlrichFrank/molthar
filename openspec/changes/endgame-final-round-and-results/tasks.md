## 1. Shared: endIf — Ranking mit Tiebreaker

- [ ] 1.1 In `shared/src/game/index.ts`: `endIf`-Rückgabeformat auf `{ ranking: Array<{ playerId: string; name: string; powerPoints: number; diamonds: number }> }` umstellen
- [ ] 1.2 Ranking-Sortierung implementieren: primär nach `powerPoints` absteigend, sekundär nach `diamonds` absteigend
- [ ] 1.3 Alle Spieler aus `G.playerOrder` in das Ranking aufnehmen (inkl. `G.players[pId].name`)
- [ ] 1.4 Bestehende `endIf`-Tests in `game-web/src/test/game.test.ts` prüfen: wenn `calculateWinner` auf dem alten Format basiert, auf neues Format anpassen oder Tests entfernen/ersetzen

## 2. Shared: endIf — Tests

- [ ] 2.1 Test: klarer Gewinner — `ranking[0]` hat die meisten Punkte
- [ ] 2.2 Test: Tiebreaker — gleiche Punkte, mehr Diamanten gewinnt
- [ ] 2.3 Test: echtes Unentschieden — gleiche Punkte und Diamanten → beide in `ranking` mit gleichen Werten
- [ ] 2.4 Test: Ranking enthält alle Spieler (z.B. 4-Spieler-Spiel)

## 3. Frontend: GameResultsDialog — Komponente

- [ ] 3.1 Neue Datei `game-web/src/components/GameResultsDialog.tsx` erstellen
- [ ] 3.2 Props: `ranking: Array<{ playerId: string; name: string; powerPoints: number; diamonds: number }>`, `myPlayerId: string`, `onLeaveGame: () => void`
- [ ] 3.3 Ranking-Tabelle rendern: Rang, Name (mit "(Du)" für eigenen Spieler), Punkte, Diamanten
- [ ] 3.4 Gewinner-Hervorhebung: `ranking[0]` mit Gewinner-Label; bei echtem Unentschieden (gleiche Punkte + Diamanten an Position 0 und 1) beide hervorheben
- [ ] 3.5 Countdown von 30 Sekunden implementieren (`useState` + `useEffect` mit `setInterval`): sichtbare Countdown-Anzeige
- [ ] 3.6 Nach Countdown-Ablauf: `onLeaveGame()` aufrufen
- [ ] 3.7 "Zurück zur Lobby"-Button: sofort `onLeaveGame()` aufrufen
- [ ] 3.8 Dialog-Styling: semitransparenter Overlay über Spielfeld, zentriertes Modal ohne X/Escape-Schließen

## 4. Frontend: CanvasGameBoard — gameover erkennen und Dialog rendern

- [ ] 4.1 `CanvasGameBoardProps` um `onLeaveGame?: () => void` erweitern
- [ ] 4.2 `ctx.gameover` casten und auslesen: `const gameover = (ctx as any).gameover as { ranking: ... } | undefined`
- [ ] 4.3 Wenn `gameover` gesetzt: `GameResultsDialog` rendern (über dem Canvas-Overlay-Bereich)
- [ ] 4.4 Import von `GameResultsDialog` in `CanvasGameBoard.tsx` hinzufügen

## 5. Frontend: LobbyScreen — onLeaveGame weiterleiten

- [ ] 5.1 In `LobbyScreen.tsx`: `onLeaveGame={handleLeaveGame}` als Prop an `PortaleClient` übergeben (boardgame.io leitet Custom-Props durch)

## 6. Verifikation

- [ ] 6.1 Manuell: Spiel bis Spielende durchspielen — Dialog erscheint mit korrektem Ranking
- [ ] 6.2 Manuell: Tiebreaker prüfen — bei Punktgleichstand gewinnt der Spieler mit mehr Diamanten
- [ ] 6.3 Manuell: eigener Spieler im Dialog mit "(Du)" markiert
- [ ] 6.4 Manuell: Countdown läuft ab — automatische Rückkehr zur Lobby
- [ ] 6.5 Manuell: "Zurück zur Lobby"-Button funktioniert sofort
- [ ] 6.6 `make test-shared` grün
