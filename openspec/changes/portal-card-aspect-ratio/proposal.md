## Why

Das Portal-Bild wird derzeit über die gesamte Höhe der Spielerzone (`ZONE_PLAYER_H = 290 px`) gestreckt. Das tatsächliche Pixel-Verhältnis von Portal-Bildhöhe zu Charakterkarten-Bildhöhe beträgt **1325 : 1030**. Bei einer gerenderten Kartenhöhe von `CARD_H = 138 px` ergibt sich eine korrekte Portal-Bildhöhe von ca. **178 px** — deutlich kürzer als die bisherigen 290 px. Das Portal-Bild erscheint dadurch aktuell zu hoch/gestaucht.

## What Changes

- Das Portal-Bild (eigener Spieler) wird in der Höhe auf das korrekte Verhältnis reduziert: `PORTAL_IMG_H = round(CARD_H × 1325/1030)`.
- Die horizontale Ausdehnung (`PORTAL_W`) bleibt unverändert.
- Das Portal-Bild wird vertikal so positioniert, dass die Portal-Slots (`SLOT_AREA_Y`) mittig innerhalb des Bildes zentriert sind.
- Die Positionen aller Karten auf dem Spielfeld (Slots, Hand, Auslage, Decks) bleiben unverändert.
- Für Gegner-Portale gilt dieselbe Korrektur: `OPP_PORTAL_IMG_H = round(PORTAL_IMG_H × OPP_SCALE)`, ebenfalls vertikal um die Slots zentriert.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

_(keine spec-level Änderungen — reine Layout-Korrektur)_

## Impact

- `game-web/src/lib/cardLayoutConstants.ts` — neue Konstante `PORTAL_IMG_H` und `OPP_PORTAL_IMG_H`; `OPP_SCALED_H` bleibt (wird für Koordinaten-Berechnungen weiter benötigt)
- `game-web/src/lib/gameRender.ts` — `drawPlayerPortal`: Portal-Bild mit `PORTAL_IMG_H` und korrigiertem Y zeichnen; `drawOpponentZone`: Portal-Bild mit `OPP_PORTAL_IMG_H` und korrigiertem Y zeichnen
