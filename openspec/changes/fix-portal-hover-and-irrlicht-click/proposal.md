## Why

Zwei Interaktions-Bugs im Canvas-Board beeinträchtigen die Spielbarkeit: Leere Portal-Slots leuchten beim Hovern auf (obwohl keine Karte vorhanden), und das Irrlicht-Feature ist komplett nicht bedienbar, weil Charakterkarten in benachbarten Mitspieler-Portalen keine klickbaren Regions haben.

## What Changes

- **Portal-Slot-Regions nur bei belegtem Slot erstellen**: `buildCanvasRegions` fügt `portal-slot`-Regions nur hinzu, wenn `me.portal[i]` eine Karte enthält — leere Slots bekommen keine Region und leuchten nicht auf.
- **Irrlicht-Regions für Nachbar-Portale**: Neuer Region-Typ `opponent-portal-card` (ID: `{playerId, slotIndex}`) wird in `buildCanvasRegions` für direkte Nachbarn (±1 in `playerOrder`) hinzugefügt, deren Portal-Karte die `irrlicht`-Ability hat — aber nur wenn der aktive Spieler am Zug ist.
- **Hit-Testing mit Rotation**: Die neuen Regions müssen Treffer im rotierten Koordinatensystem der Gegner-Zonen erkennen (90°/180°/270°). Die Regions werden mit `centered: true` und `angle` gespeichert, analog zu Hand-Karten.
- **Click-Handler für `activateSharedCharacter`**: Klick auf eine `opponent-portal-card`-Region öffnet den bestehenden `CharacterActivationDialog` mit `moves.activateSharedCharacter` als Move-Callback.

## Capabilities

### New Capabilities

- `opponent-portal-interaction`: Klickbare und hover-fähige Regions für Irrlicht-Karten in Nachbar-Portalen, inkl. Aktivierungsdialog via `activateSharedCharacter`.

### Modified Capabilities

- `canvas-card-interaction`: Portal-Slot-Regions werden nur noch bei belegten Slots erzeugt (Requirement: CanvasRegions werden aus Game-State gebaut).

## Impact

- `game-web/src/lib/canvasRegions.ts` — Bugfix Portal-Slots + neue Irrlicht-Regions
- `game-web/src/components/CanvasGameBoard.tsx` — Neuer Click-Handler-Zweig für `opponent-portal-card`, Übergabe von `playerOrder` / Opponent-Mapping an `buildCanvasRegions`
- `game-web/src/lib/gameRender.ts` — Export der Zonen-Koordinaten/Rotationen für Hit-Testing (oder Konstanten in `cardLayoutConstants.ts`)
- Keine Backend- oder Shared-Änderungen nötig
