## Context

**Bestehende Lage:**
- `activateSharedCharacter` im Backend ist vollständig implementiert: Nachbar-Check (Vorgänger/Nachfolger in `playerOrder`), Irrlicht-Validierung, komplette Zahlungsverarbeitung identisch zu `activatePortalCard`
- `drawOpponentPortals` in `gameRender.ts` rendert ausschließlich Hintergrundbilder (PNG-Portale) — keine echten Charakterkarten in den Slots
- Keine `opponent-portal-slot`-Canvas-Regionen in `canvasRegions.ts`
- `DialogContext` kennt nur `'none' | 'replacement' | 'activation' | 'discard'`
- `CharacterActivationDialog` ist für eigene Aktivierungen ausgelegt; bekommt `onActivate` als Callback — d.h. der Aktivierungs-Move kann ausgetauscht werden

**Rotationskonvention in Opponent-Zonen:**
| Position | Rotation |
|----------|----------|
| links    | 90°      |
| oben-links | 180°  |
| oben-rechts | 180° |
| rechts   | 270°     |

Der Hit-Test-Mechanismus (`hitTestRegion`) unterstützt bereits `centered: true` + `angle` via inverser Rotationstransformation — diese Infrastruktur ist direkt nutzbar.

## Goals / Non-Goals

**Goals:**
- Alle Spieler sehen alle gegnerischen Portale mit tatsächlich ausgelegten Charakterkarten in beiden Slots
- Aktiver Spieler kann Irrlicht-Karten der direkten Nachbarn anklicken (wenn Karte noch nicht aktiviert und Aktion verfügbar)
- Aktivierungsdialog öffnet sich identisch zum eigenen — selbe Zahlungsmechanik, selbe Fähigkeiten-Sektion — aber mit `activateSharedCharacter` als Move

**Non-Goals:**
- Kein neues UI für das Anzeigen weiterer Gegner-Informationen (Hand, Diamanten, aktivierte Charaktere)
- Kein Multi-Irrlicht-Support (mehrere aktivierbare Irrlicht-Karten gleichzeitig — max. 1 je Nachbar)
- Kein Ändern der Backend-Logik (bereits vollständig implementiert)

## Decisions

### 1. `drawOpponentPortals` bekommt tatsächliche Spielerdaten

**Entscheidung:** `drawOpponentPortals` erhält ein Array von Opponent-Daten `{ portalCards: (CharacterCard | null)[], isNeighbor: boolean }[]` in Spielereihenfolge (relativ zum lokalen Spieler: links, oben-links, oben-rechts, rechts). Für jeden belegten Slot wird die Charakterkarte als rotiertes Kartenbild in der jeweiligen Zone gerendert, analog zu `drawPlayerPortal`.

**Begründung:** Die Funktion ist der zentrale Ort für Opponent-Rendering. Die Daten werden von `CanvasGameBoard.tsx` berechnet und übergeben. Minimaler Refactor: nur Signatur und Rendering-Inhalt ändern.

### 2. Irrlicht-Karten-Slot-Position via Zonen-Transformation

**Entscheidung:** Die Slot-Positionen innerhalb einer Opponent-Zone werden berechnet, indem die relativen Slot-Offsets (identisch zu `getPortalSlotPosition`) im Zonenmittelpunkt gespiegelt und um den Zonenwinkel rotiert werden. Canvas-Regionen werden als `{ centered: true, angle, x: centerX, y: centerY, w: SLOT_W, h: SLOT_H }` registriert.

**Begründung:** Der bestehende `hitTestRegion`-Mechanismus unterstützt genau dieses Format. Kein eigener Hit-Test-Code nötig.

**Alternativen verworfen:**
- *Bounding-Box ohne Rotation*: Ungenau für 90°/270°-Zonen (linker/rechter Spieler) — die Karten wären als Hochformat in Querformat-Bounding-Box
- *Eigene Hit-Test-Logik*: Duplizierung, fehleranfällig

### 3. Neuer `opponent-activation`-Dialogtyp in DialogContext

**Entscheidung:** `DialogContext` erhält einen neuen State-Typ `{ type: 'opponent-activation'; character: CharacterCard; ownerPlayerId: string; portalSlotIndex: number }` und eine neue Methode `openOpponentActivationDialog(...)`.

**Begründung:** Der bestehende `activation`-Typ ist auf das eigene Portal zugeschnitten (kein `ownerPlayerId`). Ein separater Typ ermöglicht klare Unterscheidung im Render-Block und in der `CharacterActivationDialog`-Prop-Zusammensetzung.

**Alternativen verworfen:**
- *`ownerPlayerId` optional in `activation` hinzufügen*: `undefined` bedeutet "eigenes Portal" — implizite Logik, fehleranfällig

### 4. `CharacterActivationDialog` für Gegner-Aktivierung wiederverwenden

**Entscheidung:** Im Render-Block von `CanvasGameBoard` wird bei `dialog.dialog.type === 'opponent-activation'` derselbe `CharacterActivationDialog` gerendert wie bei `activation`, aber mit:
- `hand={me.hand}`, `diamonds={me.diamonds}`, `activeAbilities={me.activeAbilities}`, `activatedCharacters={me.activatedCharacters}` — eigene Ressourcen
- `onActivate={(slotIndex, selections) => moves.activateSharedCharacter(ownerPlayerId, slotIndex, selections)}`

**Begründung:** Zero neue UI-Komponenten. Die gesamte Zahlungs-UX ist identisch — der Spieler zahlt aus seiner eigenen Hand.

### 5. Enabled-Guard für `opponent-portal-slot`-Regionen

**Entscheidung:** Canvas-Regionen für Irrlicht-Slots werden mit `enabled: isActive && isNeighbor && isIrrlichtCard && !alreadyActivatedByOwner` registriert.
- `isActive`: `ctx.currentPlayer === myPlayerID`
- `isNeighbor`: lokaler Spieler ist Vorgänger oder Nachfolger des Kartenbesitzers in `G.playerOrder`
- `isIrrlichtCard`: `card.abilities.some(a => a.type === 'irrlicht')`
- `!alreadyActivatedByOwner`: `entry.activatedBy === undefined || entry.activatedBy === null` (oder äquivalentes Flag im `PortalEntry`)

**Begründung:** Backend validiert dies ebenfalls, aber die UI soll deaktivierte Regionen nicht anklickbar machen (kein visuelles Feedback bei INVALID_MOVE).

**Offene Frage:** Wie wird "bereits vom Besitzer aktiviert" im State repräsentiert? Prüfen: `PortalEntry.activated` oder ähnliches Feld.

## Risks / Trade-offs

- **Slot-Koordinatenberechnung für rotierte Zonen**: Die genaue Pixel-Position der Irrlicht-Karten in den Opponent-Zonen muss mit den gerenderten Positionen übereinstimmen. Wenn `drawOpponentPortals` und `canvasRegions` unterschiedliche Koordinatenlogiken nutzen, entsteht eine Diskrepanz zwischen gerenderten Karten und klickbaren Regionen. → Mitigation: geteilte Hilfsfunktion `getOpponentSlotPosition(zoneIndex, slotIndex)` in `cardLayoutConstants.ts`
- **Spielerzuordnung zu Zonen**: Die Reihenfolge der Zonen (links, oben-links, oben-rechts, rechts) muss konsistent aus `G.playerOrder` relativ zum lokalen Spieler berechnet werden, sowohl für Rendering als auch für Regionen. → Mitigation: eine gemeinsame Hilfsfunktion `getOpponentZoneOrder(myPlayerId, playerOrder)` → `string[]` (Zone-Reihenfolge: links, oben-links, oben-rechts, rechts)
- **PortalEntry.activated-Feld**: Falls kein Flag in `PortalEntry` existiert, kann "bereits aktiviert" nicht frontend-seitig geprüft werden. Der Backend-Guard reicht als Fallback, aber das UI wäre dann immer klickbar. → Mitigation: Feld vor Implementierung prüfen (Task 1.1)
