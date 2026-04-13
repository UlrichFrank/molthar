## Why

An mehreren Stellen zeigt die UI generische Bezeichnungen wie „Player 1", „Player 2" oder „Spieler 3" statt der in der Lobby eingegebenen Spielernamen. Das erschwert die Unterscheidung der Spieler während der Partie.

## What Changes

- In der Lobby-Wiedereinstieg-Anzeige wird „als Spieler X" durch den gespeicherten Spielernamen ersetzt
- Der Fallback-Name `Player ${playerId + 1}` in `LobbyScreen.tsx` wird auf `Spieler ${playerId + 1}` vereinheitlicht (Deutsch, konsistent mit dem Rest)
- Die Gegner-Zonen auf dem Canvas zeigen den Namen des jeweiligen Gegners — `OpponentZoneData` erhält ein `name`-Feld, `drawOpponentZone` rendert den Namen
- Der Offline-Fallback im Disconnect-Dialog (`Spieler ${offlineEntry.id + 1}`) bleibt als letzter Fallback, nutzt aber zuerst den Namen aus `matchData`

## Capabilities

### New Capabilities

- `show-player-names`: Spielernamen aus der Lobby werden konsistent überall in der UI angezeigt — in der Lobby selbst, auf den Gegner-Zonen des Canvas und in allen Dialogen

### Modified Capabilities

_(keine)_

## Impact

- `game-web/src/lobby/LobbyScreen.tsx`: Wiedereinstieg-Anzeige zeigt Spielername statt Spielernummer
- `game-web/src/lib/gameRender.ts`: `OpponentZoneData` erhält `name: string`; `drawOpponentZone` rendert den Namen
- `game-web/src/components/CanvasGameBoard.tsx`: `buildOpponentsArray` übergibt `name` (via `resolvePlayerName`)
