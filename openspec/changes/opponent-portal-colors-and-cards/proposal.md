## Why

Derzeit werden gegnerische Portale als generische Hintergrundbilder gerendert (`Gegner Portal2.png` etc.) ohne individuelle Farben, ohne Karten und ohne Bezug zum Startspieler. Der eigene Portal zeigt `Kleiderschrank Portal.png`. Die Spieler haben keine visuelle Identität am Tisch und können gegnerische Portale, Handkarten und aktivierte Charaktere nicht sehen.

## What Changes

- Jeder Spieler erhält einen `colorIndex` (1–5): `Portal1.jpeg`–`Portal5.jpeg` als Portal-Hintergrund; der Startspieler erhält stattdessen `Portal-Startspieler{colorIndex}.jpeg`
- Farbwahl: am Spielstart (neue `colorSelection`-Phase) kann jeder Spieler eine noch nicht belegte Farbe wählen; bei keiner Wahl wird automatisch die nächste freie Farbe zugewiesen
- Startspieler wird beim Setup zufällig gewählt (statt immer `playerIds[0]`)
- Gegnerische Zonen rendern: Portal-Hintergrund in der richtigen Farbe, Portal-Slots (offen), aktivierte Charaktere (offen), Handkarten (verdeckt) — alle um 90°/180°/270° rotiert und auf die Zonengröße skaliert
- Leere Zonen (weniger Spieler als Positionen) zeigen weiterhin `Schriftrolle.png`

## Capabilities

### New Capabilities

- `player-portal-colors`: Farbwahl-Phase + `colorIndex` pro Spieler + Startspieler-Logik
- `opponent-zone-full-render`: Vollständiges Rendering der Gegner-Zonen mit Portal-Bild, Portal-Slots, aktivierten Charakteren und verdeckten Handkarten

### Modified Capabilities

*(keine bestehenden Spec-Capabilities betroffen)*

## Impact

- `shared/src/game/types.ts` — `PlayerState` bekommt `colorIndex: number`; `GameState` braucht kein neues Feld (colorIndex ist pro Player)
- `shared/src/game/index.ts` — neue `colorSelection`-Phase mit `selectColor`-Move; `startingPlayer` wird zufällig in setup gewählt; `colorIndex` wird in setup als Default zugewiesen
- `game-web/src/lib/gameRender.ts` — `drawPlayerPortal` nutzt `colorIndex`; `drawOpponentPortals` erhält Spielerdaten und rendert Karten
- `game-web/src/lib/cardLayoutConstants.ts` — neue Konstanten und Hilfsfunktionen für Opponent-Karten-Positionen
- `game-web/src/components/CanvasGameBoard.tsx` — Color-Selection-UI während `colorSelection`-Phase
