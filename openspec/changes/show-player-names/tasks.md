## 1. gameRender.ts — OpponentZoneData erweitern

- [ ] 1.1 `name: string` zu `OpponentZoneData` hinzufügen
- [ ] 1.2 In `drawOpponentZone`: Spielername als Label im Canvas rendern (kleiner Text, weißer Text auf dunklem Hintergrund, innerhalb der Zonenfläche, mit `maxWidth` zur Begrenzung)

## 2. CanvasGameBoard.tsx — Namen an OpponentZoneData übergeben

- [ ] 2.1 In `buildOpponentsArray`: `name: resolvePlayerName(playerId, playerState.name)` zum zurückgegebenen Objekt hinzufügen (`resolvePlayerName` ist bereits in der Komponente vorhanden)

## 3. LobbyScreen.tsx — Wiedereinstieg-Anzeige korrigieren

- [ ] 3.1 „als Spieler {parseInt(savedSession.playerID) + 1}" durch „als {savedSession.playerName}" ersetzen
