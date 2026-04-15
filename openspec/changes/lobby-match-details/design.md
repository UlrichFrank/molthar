## Context

boardgame.io's `LobbyAPI.Match` liefert bereits `createdAt` (Unix-Timestamp in Millisekunden), `updatedAt` und `players: { id, name?, isConnected? }[]`. Das lokale `Match`-Interface in `useLobbyClient.ts` ist bisher auf `matchID` und `players: { id, name? }[]` beschränkt — `createdAt` fehlt. Durch reines Interface-Erweiterung und UI-Anpassung ist die Anforderung vollständig erfüllt, ohne Backend-Änderungen.

## Goals / Non-Goals

**Goals:**
- `Match`-Interface um `createdAt: number` erweitern
- `MatchPlayer`-Interface um `isConnected?: boolean` erweitern (bereits vorhanden im API-Typ)
- Erstellungszeitpunkt formatiert anzeigen (Datum + Uhrzeit, Locale des Browsers)
- Ersteller-Name: `players[0].name` (Spieler-ID 0 ist immer der Ersteller)
- Teilnehmernamen: alle `players` mit gesetztem `name`, außer Spieler 0 (oder alle inkl. Ersteller als vollständige Liste)

**Non-Goals:**
- Echtzeit-Updates der Teilnehmerliste innerhalb der Spielliste (Polling bleibt wie bisher)
- Profilbilder oder Avatar-Anzeige
- Sortierung der Spielliste nach Zeitstempel

## Decisions

**Ersteller = players[0]**
Spieler 0 tritt immer zuerst bei (`joinMatch(..., '0', ...)`) — daher ist `players[0].name` der Erstellername. Kein gesondertes Metadaten-Feld nötig.

**Zeitformat: `Intl.DateTimeFormat`**
Browser-native Lokalisierung, kein Zusatz-Package. Kurzes Format: `HH:MM` wenn heute, sonst `DD.MM. HH:MM`.

**Teilnehmerliste: alle players mit name**
Alle eingetragenen Spielernamen (inkl. Ersteller) werden kommagetrennt angezeigt. Leere Slots werden weggelassen.

## Risks / Trade-offs

- [players[0].name fehlt] → Noch nicht beigetretener Ersteller hat `name === undefined`. In diesem Fall „–" oder nichts anzeigen. Sollte nicht vorkommen (Ersteller tritt sofort bei), aber defensiv abfangen.
- [createdAt fehlt in alten Matches] → Mit `?? null` absichern und Zeitstempel weglassen wenn nicht vorhanden.
