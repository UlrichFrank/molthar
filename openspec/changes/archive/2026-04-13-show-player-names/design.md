## Context

Spielernamen werden in boardgame.io über `updatePlayer` beim Beitreten gesetzt und stehen im Frontend als `matchData[id].name` zur Verfügung. `CanvasGameBoard` hat bereits eine `resolvePlayerName`-Funktion, die `matchData` mit Fallback auf `G.players[id].name` auswertet. Diese Funktion wird bislang für die eigene `PlayerStatusBadge` und den Disconnect-Dialog verwendet, aber nicht für die Gegner-Zonen auf dem Canvas oder die Lobby-Anzeige.

## Goals / Non-Goals

**Goals:**
- Gegner-Zonen auf dem Canvas zeigen den Spielernamen des jeweiligen Gegners
- Lobby-Wiedereinstieg zeigt den Spielernamen statt „Spieler X"
- Konsistente Fallback-Kette: `matchData.name` → `G.players[id].name` → `Spieler ${id + 1}`

**Non-Goals:**
- Namensänderung während laufender Partie
- Namensanzeige im Backend / in der shared library
- Truncation langer Namen (bleibt dem Canvas-Rendering überlassen)

## Decisions

### 1. `OpponentZoneData.name` hinzufügen

`OpponentZoneData` (in `gameRender.ts`) erhält ein Pflichtfeld `name: string`. `buildOpponentsArray` in `CanvasGameBoard.tsx` befüllt es mit `resolvePlayerName(playerId, playerState.name)` — dieselbe Funktion wie für die eigene Badge. Damit ist die Namensauflösung zentral und nicht dupliziert.

### 2. Namen im Canvas rendern

`drawOpponentZone` rendert den Namen als kleines Label unterhalb des Handkarten-Stapels (oder in einem freien Bereich der Zone). Schrift: klein, weiß mit dunklem Hintergrund — analog zu bestehenden Canvas-Labels. Der Name wird im Koordinatensystem der bereits rotierten Zone gezeichnet, damit er immer lesbar (relativ zur Zone) steht.

### 3. Lobby-Wiedereinstieg

`LobbyScreen.tsx` zeigt im Wiedereinstieg-Banner `savedSession.playerName` (aus localStorage) statt `parseInt(savedSession.playerID) + 1`.

## Risks / Trade-offs

- **Lange Namen auf dem Canvas** → Werden einfach abgeschnitten (`ctx.fillText` mit maxWidth). Kein Wrapping.
- **`matchData` nicht immer verfügbar** (Offline-Modus) → Fallback auf `G.players[id].name` → `Spieler ${id + 1}` bleibt erhalten.
