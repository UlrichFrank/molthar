## Context

Das Canvas-Board verwendet `CanvasRegion`-Objekte als Single Source of Truth für Hover, Click-Flash und Hit-Testing. `buildCanvasRegions` erzeugt diese aus dem Game-State; der rAF-Loop animiert sie, `hitTestRegions` löst Klick-Aktionen aus.

**Bug 1 – Leere Slots:** `buildCanvasRegions` fügt `portal-slot`-Regions immer für Slot 0 und 1 hinzu, unabhängig davon, ob eine Karte vorhanden ist. Dadurch leuchten leere Slots auf.

**Bug 2 – Irrlicht:** Gegner-Portal-Karten werden nie als `CanvasRegion` erfasst. `buildCanvasRegions` kennt keine Gegner-Daten. Clicks auf Gegner-Portale triggern nichts; das `activateSharedCharacter`-Move ist von der UI her unerreichbar.

## Goals / Non-Goals

**Goals:**
- Portal-Slot-Region nur erstellen, wenn `me.portal[i]` belegt ist
- Irrlicht-Karten in direkten Nachbar-Portalen als klickbare Regions erfassen
- Hover-Glow und Click-Flash auf diesen Regions funktionieren
- Click öffnet `CharacterActivationDialog` mit `activateSharedCharacter` als Move
- Hit-Testing korrekt im rotierten Koordinatensystem der Gegner-Zonen

**Non-Goals:**
- Keine Änderungen am Aktivierungs-Flow oder Dialog selbst
- Keine Änderungen an `costCalculation.ts` oder Shared-Logik
- Irrlicht-Regions für nicht-direkte Nachbarn (top-left/top-right bei 5+ Spielern)

## Decisions

### D1: Region-Typ `opponent-portal-card` mit zusammengesetzter ID

**Entscheidung:** Neuer Typ `opponent-portal-card` in `CanvasRegionType`. ID = `string` im Format `"{playerId}:{slotIndex}"` (z.B. `"2:0"`).

**Rationale:** Ermöglicht im Click-Handler die direkte Extraktion von `ownerPlayerId` und `portalSlotIndex` für den Move-Call. Alternativen: separates Feld im Region-Interface (erfordert Interface-Änderung) oder numerische Codierung (weniger lesbar).

### D2: Zonen-Koordinaten und Rotationen als exportierte Konstanten

**Entscheidung:** Die vier Zonen-Bounding-Boxes und ihre Rotationsgrade werden als exportierte Funktion `getOpponentZones()` aus `gameRender.ts` bereitgestellt (oder direkt aus `cardLayoutConstants.ts`).

**Rationale:** `buildCanvasRegions` muss die Mittelpunkte und Rotationen der Gegner-Zonen kennen, um die Slot-Positionen im Welt-Koordinatensystem zu berechnen. Diese sind aktuell lokal in `drawOpponentPortals` definiert. Export vermeidet Duplizierung.

### D3: Hit-Testing mit `centered: true` + `angle`

**Entscheidung:** `opponent-portal-card`-Regions werden als `centered: true` gespeichert, wobei `x/y` der Mittelpunkt der Karte im Welt-Koordinatensystem ist und `angle` die Rotation der Zone in Radiant. `hitTestRegion` unterstützt dieses Format bereits.

**Berechnung pro Slot i in Zone mit Mittelpunkt (cx, cy) und Rotation rot:**
```
// Slot-Position relativ zur Zonen-Mitte (im lokalen Koordinatensystem):
localX = -OPP_SCALED_W/2 + OPP_SLOT_REL_X + i*(OPP_SLOT_W + OPP_SLOT_GAP)
localY = -OPP_SCALED_H/2 + OPP_SLOT_REL_Y
// Slot-Mittelpunkt lokal:
slotCX_local = localX + OPP_SLOT_W/2
slotCY_local = localY + OPP_SLOT_H/2
// Rotation in Welt-Koordinaten:
worldX = cx + slotCX_local * cos(rot) - slotCY_local * sin(rot)
worldY = cy + slotCX_local * sin(rot) + slotCY_local * cos(rot)
```

**Rationale:** Wiederverwendung des bestehenden `hitTestRegion`-Mechanismus ohne Code-Duplizierung.

### D4: Irrlicht-Regions nur für direkte Nachbarn (Zonen-Index 0 und 3)

**Entscheidung:** `buildOpponentsArray` legt fest: Index 0 = linker Nachbar (Offset +1), Index 3 = rechter Nachbar (Offset -1). Nur diese sind laut `activateSharedCharacter`-Logik berechtigt. Top-Zonen (Indizes 1, 2) werden ignoriert.

**Rationale:** Entspricht der Server-Validierung. Vermeidet falsche Click-Regions für Nicht-Nachbarn.

### D5: `buildCanvasRegions` erhält `opponents`-Parameter

**Entscheidung:** `buildCanvasRegions` bekommt einen optionalen Parameter `opponents: Array<{playerId: string, data: OpponentZoneData} | null>` mit den direkten Nachbarn (Index 0 = links, Index 1 = rechts).

**Rationale:** Hält die Funktion testbar und vermeidet direkten Zugriff auf `G.playerOrder` in `canvasRegions.ts`.

## Risks / Trade-offs

- **Rotation-Math-Fehler** → Mitigation: Einmal testbar mit einem einfachen Unit-Test (Mittelpunkt eines Slots muss im Hit-Test treffen)
- **`drawRegionEffects` zeichnet Irrlicht-Regions ohne Rotation** → Mitigation: `opponent-portal-card`-Regions haben `centered: true` und `angle`, was `drawRegionEffects` bereits korrekt handhabt (translate+rotate um Mittelpunkt)
- **`CharacterActivationDialog` öffnet sich für eigene Karte vs. Gegner-Karte** → Mitigation: Dialog erhält bereits `card` und `slotIndex`; für `activateSharedCharacter` wird zusätzlich `ownerPlayerId` übergeben. Dialog-Hook muss einen optionalen `ownerPlayerId`-Parameter unterstützen.
