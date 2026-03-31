## Why

Die Gegner-Zonen werden aktuell mit einer eigenen, nicht-konsistenten Positionierungslogik gerendert: Portal-Slots, Handkarten-Stapel und aktivierte Karten werden in der lokalen Zonengeometrie hart positioniert, anstatt das Spieler-Layout gespiegelt darzustellen. Das Ergebnis ist, dass die Karten aus Mitspielersicht an falschen Positionen sitzen (z. B. Portal-Slots „oberhalb" des Portals). Zusätzlich wird kein einheitlicher Skalierungsfaktor für alle Gegner-Zonen verwendet, wodurch Karten je nach Zone unterschiedlich groß erscheinen.

## What Changes

- `drawOpponentZone` wird auf ein **virtuelles Spieler-Canvas** (gleiche Proportionen wie die Spieler-Zone) umgestellt
- Ein einheitlicher `OPP_SCALE`-Faktor (abgeleitet von der kleinsten Zone) wird für alle Gegner und alle Kartentypen verwendet
- Die Positionen von Hand-Stapel, Portal-Slots und aktivierten Charakteren werden exakt aus den Spieler-Layout-Konstanten abgeleitet (multipliziert mit `OPP_SCALE`)
- `OPP_SLOT_W/H`, `OPP_ACT_W/H`, `OPP_HAND_W/H` werden durch einheitlich skalierte Werte ersetzt

## Capabilities

### New Capabilities

- `opponent-zone-layout`: Korrekte, einheitlich skalierte und rotierte Darstellung der Gegner-Zonen mit identischem Layout wie die Spieler-Zone

### Modified Capabilities

_(keine bestehenden Specs betroffen — das ist eine rein visuelle Renderkorrektur)_

## Impact

- `game-web/src/lib/cardLayoutConstants.ts` — `OPP_*`-Konstanten werden durch `OPP_SCALE` + abgeleitete Werte ersetzt
- `game-web/src/lib/gameRender.ts` — `drawOpponentZone` erhält neue Positionierungslogik
