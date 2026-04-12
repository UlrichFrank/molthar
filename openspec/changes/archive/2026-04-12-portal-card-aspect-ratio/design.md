## Context

Das Canvas-Modell ist 1200×800 px. Die Spielerzone beginnt bei `PORTAL_Y = 510` und ist `ZONE_PLAYER_H = 290` px hoch. Das Portal-Bild wird derzeit auf `(PORTAL_X, PORTAL_Y, PORTAL_W, ZONE_PLAYER_H)` = `(200, 510, 800, 290)` gezeichnet.

Die Portal-Slots liegen bei `SLOT_AREA_Y = PORTAL_Y + ZONE_PLAYER_H × 0.35 ≈ 611.5 px`, Karten-Mitte bei `611.5 + 69 = 680.5 px`.

## Goals / Non-Goals

**Goals:**
- Portal-Bildhöhe proportional zur Charakterkarten-Höhe (Ratio 1325:1030)
- Portal-Bild vertikal um die Slot-Karten-Mitte zentrieren
- Karten-Positionen unverändert lassen

**Non-Goals:**
- Änderungen an Karten-Positionen, Slot-Koordinaten, Hand-Koordinaten
- Änderungen an `ZONE_PLAYER_H` oder `OPP_SCALED_H` (diese werden für Koordinaten-Berechnungen weiterhin verwendet)

## Decisions

### Neue Konstanten in `cardLayoutConstants.ts`

```ts
// Verhältnis Portal-Bild zu Charakterkarte: 1325:1030
export const PORTAL_IMG_H = Math.round(CARD_H * 1325 / 1030);
// Vertikal zentriert um Slot-Mitte: SLOT_AREA_Y + CARD_H/2 - PORTAL_IMG_H/2
export const PORTAL_IMG_Y = Math.round(SLOT_AREA_Y + CARD_H / 2 - PORTAL_IMG_H / 2);

// Opponent-Variante (skaliert)
export const OPP_PORTAL_IMG_H = Math.round(PORTAL_IMG_H * OPP_SCALE);
// OPP_SLOT_REL_Y ist relativ zu -hh (d.h. Oberkante der virtuellen Zone)
// Slot-Mitte in Zone-Koordinaten: OPP_SLOT_REL_Y + OPP_SLOT_H/2
// Portal-Bild-Y in Zone-Koordinaten (relativ zu -hh): slot_center - OPP_PORTAL_IMG_H/2
export const OPP_PORTAL_IMG_REL_Y = Math.round(OPP_SLOT_REL_Y + OPP_SLOT_H / 2 - OPP_PORTAL_IMG_H / 2);
```

### Änderungen in `gameRender.ts`

**`drawPlayerPortal`** (eigener Spieler):
```ts
// Vorher:
drawImageOrFallback(ctx, portalImg, portalX, portalY, portalW, portalH);
// Nachher (portalX, PORTAL_W unverändert):
drawImageOrFallback(ctx, portalImg, PORTAL_X, PORTAL_IMG_Y, PORTAL_W, PORTAL_IMG_H);
```

**`drawOpponentZone`** (Gegner):
```ts
// Vorher:
drawImageOrFallback(ctx, portalImg, -hw, -hh, OPP_SCALED_W, OPP_SCALED_H, ...);
// Nachher (x bleibt -hw, y berechnet aus OPP_PORTAL_IMG_REL_Y):
drawImageOrFallback(ctx, portalImg, -hw, -hh + OPP_PORTAL_IMG_REL_Y, OPP_SCALED_W, OPP_PORTAL_IMG_H, ...);
```

Die lokalen Variablen `portalX/portalY/portalW/portalH` in `drawPlayerPortal` können entfernt oder durch die neuen Konstanten ersetzt werden.

## Risks / Trade-offs

- `OPP_SCALED_H` bleibt unverändert, damit alle abhängigen Koordinaten-Berechnungen (`OPP_HAND_REL_Y`, `OPP_SLOT_REL_Y` etc.) korrekt bleiben.
- Das Portal-Bild kann bei sehr großem `OPP_SCALE` leicht über die Zone-Grenzen ragen — wie bisher (intentional, laut Kommentar im Code).
