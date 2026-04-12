## 1. Neue Konstanten in cardLayoutConstants.ts

- [x] 1.1 `PORTAL_IMG_H = Math.round(CARD_H * 1325 / 1030)` hinzufügen (korrekte Portal-Bildhöhe nach Verhältnis)
- [x] 1.2 `PORTAL_IMG_Y = Math.round(SLOT_AREA_Y + CARD_H / 2 - PORTAL_IMG_H / 2)` hinzufügen (Portal-Bild-Y, vertikal um Slot-Mitte zentriert)
- [x] 1.3 `OPP_PORTAL_IMG_H = Math.round(PORTAL_IMG_H * OPP_SCALE)` hinzufügen (Gegner-Variante skaliert)
- [x] 1.4 `OPP_PORTAL_IMG_REL_Y = Math.round(OPP_SLOT_REL_Y + OPP_SLOT_H / 2 - OPP_PORTAL_IMG_H / 2)` hinzufügen (Y-Offset in Zone-Koordinaten)
- [x] 1.5 `PORTAL_IMG_H`, `PORTAL_IMG_Y`, `OPP_PORTAL_IMG_H`, `OPP_PORTAL_IMG_REL_Y` aus `cardLayoutConstants.ts` in `gameRender.ts` importieren

## 2. Eigenes Spieler-Portal in gameRender.ts korrigieren

- [x] 2.1 In `drawPlayerPortal`: `drawImageOrFallback`-Aufruf für das Portal-Bild auf `PORTAL_X, PORTAL_IMG_Y, PORTAL_W, PORTAL_IMG_H` umstellen (statt der lokalen `portalX/Y/W/H`-Variablen)

## 3. Gegner-Portale in gameRender.ts korrigieren

- [x] 3.1 In `drawOpponentZone`: `drawImageOrFallback`-Aufruf für das Portal-Bild auf `(-hw, -hh + OPP_PORTAL_IMG_REL_Y, OPP_SCALED_W, OPP_PORTAL_IMG_H)` umstellen (statt `-hh` und `OPP_SCALED_H`)
