## Context

Das Spieler-Portal wird in `drawPlayerPortal` über ein festes Layout gerendert:
- Breite: `PORTAL_W = 800`, Höhe: `ZONE_PLAYER_H = 290`
- Handkarten: linkes Drittel (fächerförmig), zentriert bei `HAND_CENTER_Y`
- Portal-Slots: Mitte, `SLOT_AREA_X / SLOT_AREA_Y`
- Aktivierte Charaktere: Rechts der Portal-Slots, `ACTIVATED_GRID_X / ACTIVATED_GRID_Y`

Die aktuellen `drawOpponentZone`-Funktion positioniert dieselben Elemente unabhängig davon: Portal-Slots oben in der Zone, Aktivierte darunter, Hand ganz unten — ohne Bezug zum Spieler-Layout. Der Rotationskontext wird korrekt gesetzt (translate+rotate), aber die Inhaltspositionen spiegeln nicht das Spieler-Layout wider.

**Zonenmaße:**

| Zone | w | h | Rotation | Lokale Content-Breite | Lokale Content-Höhe |
|------|---|---|----------|-----------------------|---------------------|
| Links | 200 | 310 | 90° | 310 | 200 |
| Oben-Links | 400 | 200 | 180° | 400 | 200 |
| Oben-Rechts | 400 | 200 | 180° | 400 | 200 |
| Rechts | 200 | 310 | 270° | 310 | 200 |

Nach Rotation bestimmt die Zone die lokale Content-Größe: bei 90°/270° ist lokal-X entlang der Zonenhöhe (310), lokal-Y entlang der Zonenbreite (200). Bei 180° bleibt w×h erhalten (400×200).

## Goals / Non-Goals

**Goals:**
- Einheitlicher `OPP_SCALE`-Faktor für alle 4 Gegner-Zonen (Karten gleich groß überall)
- Gegner-Zoneninhalt wird als skaliertes Abbild des Spieler-Layouts gerendert
- Aus Mitspielersicht: Handkarten links, Portal-Slots in der Mitte, Aktivierte rechts — identisch zum Spieler, nur skaliert und rotiert

**Non-Goals:**
- Keine Änderung an der Spieler-Zone oder deren Layout-Konstanten
- Keine Änderung an Treffertest-Logik (Gegner-Zonen sind nicht klickbar)
- Kein Fan-Layout für Gegner-Handkarten (Stapel mit Anzahl-Badge reicht)

## Decisions

### Entscheidung 1: Virtuelles Spieler-Canvas als Referenz

**Ansatz:** `drawOpponentZone` definiert einen virtuellen Canvas der Größe `PORTAL_W × ZONE_PLAYER_H` (800×290). Alle Elemente werden darin mit identischen relativen Positionen wie beim Spieler platziert, multipliziert mit `OPP_SCALE`. Danach wird alles zentriert und der ctx-Transform erledigt die Rotation.

**Alternative:** Eigene Positionierung je Zone (status quo) → uneinheitlich, schwer wartbar.

**Warum dieser Ansatz:** Sichert automatisch korrekte Relativpositionen. Wenn sich das Spieler-Layout ändert, folgt das Gegner-Layout automatisch.

### Entscheidung 2: OPP_SCALE aus kleinstem Zone-Content ableiten

Die kleinste Content-Dimension ist die Höhe der Links/Rechts-Zonen: 200px. Das Spieler-Layout hat `ZONE_PLAYER_H = 290`. Scale nach Höhe: `200 / 290 ≈ 0.69`. Nach Breite (310 / 800 = 0.388). Die engste Beschränkung ist die Breite → `OPP_SCALE ≈ 0.38`.

Konkrete Berechnung:
```
MIN_CONTENT_W = ZONE_CENTER_H  // 310 (h der Links/Rechts-Zone = lokale Breite nach 90°)
MIN_CONTENT_H = MARGIN_H       // 200 (w der Links/Rechts-Zone = lokale Höhe nach 90°)
OPP_SCALE = min(MIN_CONTENT_W / PORTAL_W, MIN_CONTENT_H / ZONE_PLAYER_H)
           = min(310/800, 200/290) = min(0.3875, 0.6897) = 0.3875
```

Wird als Konstante `OPP_SCALE` in `cardLayoutConstants.ts` exportiert. Alle anderen `OPP_*`-Dimensionen werden daraus abgeleitet (können `OPP_SLOT_W/H` etc. ersetzen oder koexistieren).

### Entscheidung 3: Rendering-Reihenfolge und Positionierung in `drawOpponentZone`

Im rotierten lokalen Koordinatensystem (Ursprung = Zone-Mittelpunkt):

1. **Portal-Hintergrund:** zentriert: `(-scaledW/2, -scaledH/2, scaledW, scaledH)`
   wobei `scaledW = PORTAL_W * OPP_SCALE`, `scaledH = ZONE_PLAYER_H * OPP_SCALE`

2. **Hand-Stapel (links):** Position analog zu `HAND_AREA_X` und `HAND_CENTER_Y`, skaliert.
   `handX = -scaledW/2 + HAND_AREA_X_REL * scaledW`
   `handY = -scaledH/2 + HAND_CENTER_Y_REL * scaledH - OPP_HAND_H/2`
   (Als verdeckter Stapel mit Badge, kein Fan-Layout nötig)

3. **Portal-Slots (Mitte):** Position analog zu `SLOT_AREA_X` und `SLOT_AREA_Y`, skaliert.

4. **Aktivierte Charaktere (rechts der Slots):** Analog zu `ACTIVATED_GRID_X/Y`, skaliert.

Für die relativen Positionen werden direkt die Konstanten aus `cardLayoutConstants.ts` verwendet (nicht hartcodierte Magic Numbers), also z. B.:
```
slotAreaLocalX = -scaledW/2 + (SLOT_AREA_X - PORTAL_X) * OPP_SCALE
slotAreaLocalY = -scaledH/2 + (SLOT_AREA_Y - PORTAL_Y) * OPP_SCALE
```

### Entscheidung 4: Handkarten als Stapel (kein Fan)

Der Fan-Layout braucht exakte Kartenwerte (zum Rendern des korrekten Perlenkarten-Bildes) und ist bei kleinen Skalen schwer lesbar. Ein verdeckter Stapel mit Anzahl-Badge ist ausreichend und konsistenter mit dem Prinzip „Gegner sieht nur Rückseiten".

Bild: `'Perlenkarte Hinten.png'` (korrekt — aktuell war `'Perlenkarte_Rueckseite.png'` falsch).

## Risks / Trade-offs

- **Sehr kleine Karten bei OPP_SCALE ≈ 0.39:** Portal-Slots werden ~35×54px, aktivierte Chars ~22×35px. Das ist klein aber vertretbar — Gegner-Infos sind Überblicksinformation. → Kann später mit einem größeren Mindest-Scale gelöst werden.
- **Zoneninhalt überlappt Auslage-Bereich bei 180°-Zonen:** Mit scaledW=310px in einer 400px-Zone ist Platz vorhanden. → Kein Problem erwartet.
- **Änderung OPP_SLOT_W/H etc.:** Konsumenten dieser Konstanten (nur `gameRender.ts`) werden aktualisiert. → Überschaubar.
