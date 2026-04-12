## Why

Spieler können aktuell ihre eigenen aktivierten Charakterkarten anschauen, indem sie darauf klicken — aber die aktivierten Karten der Gegner sind nur als kleine Icons im Gegnerbereich sichtbar und nicht anklickbar. Da die Fähigkeiten der Gegner spielentscheidend sind, sollen diese auch im Detail betrachtet werden können.

## What Changes

- Aktivierte Charakterkarten im Gegnerbereich werden klickbar und öffnen die `ActivatedCharacterDetailView`
- Die bestehende Detailansicht wird für schreibgeschützte Nutzung (kein eigener Zug) verwendet
- Klick auf eine gegnerische aktivierte Karte öffnet dieselbe Ansicht wie bei eigenen Karten

## Capabilities

### New Capabilities
- `opponent-activated-card-detail`: Anzeige der Detailansicht einer aktivierten Charakterkarte eines Gegners beim Anklicken im Canvas

### Modified Capabilities
- `canvas-card-interaction`: Gegnerische aktivierte Karten erhalten klickbare Hit-Regions und lösen die Detailansicht aus

## Impact

- `game-web/src/lib/canvasRegions.ts` — Hit-Regions für gegnerische aktivierte Karten hinzufügen
- `game-web/src/lib/cardLayoutConstants.ts` — Positions-Berechnung für gegnerische aktivierte Karten (ggf. bereits vorhanden über OPP_ACT_*)
- `game-web/src/lib/gameRender.ts` — keine Änderung erforderlich (Karten werden bereits gezeichnet)
- `game-web/src/components/CanvasGameBoard.tsx` — Click-Handler für neue Region-Typen, State für gegnerische Kartenauswahl
- `game-web/src/components/ActivatedCharacterDetailView.tsx` — ggf. schreibgeschützter Modus prüfen
