## 1. Komponente: PlayerDisconnectDialog

- [x] 1.1 Neue Datei `game-web/src/components/PlayerDisconnectDialog.tsx` erstellen
- [x] 1.2 Props: `playerName: string` (Name des getrennten Spielers)
- [x] 1.3 Sanduhr-Animation implementieren: rotierende CSS-Animation (`animate-spin` via Tailwind oder inline `@keyframes`)
- [x] 1.4 Dialog-Text: „Warte auf {playerName}..." mit Untertitel „Verbindung unterbrochen"
- [x] 1.5 Styling: semitransparenter Overlay (`zIndex: 300`), zentriertes Modal, nicht schließbar (kein X, kein Escape)

## 2. Disconnect-Erkennung in CanvasGameBoard

- [x] 2.1 In `CanvasGameBoardContent`: `matchData` auswerten — ersten Eintrag mit `isConnected === false` finden (der nicht der lokale Spieler ist)
- [x] 2.2 Debounce implementieren: `useState<string | null>` für `disconnectedPlayerName` + `useEffect` mit 2-Sekunden-Timeout — Dialog erst anzeigen wenn Disconnect 2s anhält
- [x] 2.3 Bei Reconnect (kein Eintrag mehr mit `isConnected === false`): Timeout canceln und `disconnectedPlayerName` auf `null` setzen

## 3. Dialog in CanvasGameBoard rendern

- [x] 3.1 Import von `PlayerDisconnectDialog` in `CanvasGameBoard.tsx` hinzufügen
- [x] 3.2 `PlayerDisconnectDialog` rendern wenn `disconnectedPlayerName !== null` (über allen anderen Dialogen)

## 4. Manuelle Verifikation

- [ ] 4.1 Im laufenden Spiel: Browser-Tab eines Spielers schließen → Dialog erscheint bei anderen Spielern nach ~2s
- [ ] 4.2 Spielername im Dialog ist korrekt (Lobby-Name, nicht „Player 1")
- [ ] 4.3 Tab wieder öffnen / Spieler reconnectet → Dialog verschwindet automatisch
- [ ] 4.4 Kurzes Neuladen (< 2s) zeigt keinen Dialog (Debounce funktioniert)
- [ ] 4.5 Lokaler Spieler sieht keinen Dialog für sich selbst
