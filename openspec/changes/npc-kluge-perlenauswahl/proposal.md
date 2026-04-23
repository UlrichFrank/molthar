## Why

NPC-Bots nehmen systematisch Perlenkarten, die nichts bringen: die Helpfulness-Berechnung erkennt keinen Teilfortschritt (Wert fast immer 0), aktive blaue Fähigkeiten werden ignoriert, und das Handlimit wird blind überschritten. Das Ergebnis sind Bots, die zufällig wirken statt zielorientiert auf eine Aktivierung hinzuarbeiten.

## What Changes

- **Neu**: `shared/src/game/botNeededValues.ts` — Kernfunktion `computeNeededValues()` die für alle Kostentypen und aktive Fähigkeiten berechnet, welche Perlenwerte noch fehlen
- **Neu**: Neues Pearl-Entscheidungsmodell in allen 5 Bots: erst benötigte Werte bestimmen, dann gezielt nehmen — mit Handlimit-Bewusstsein und `replacePearlSlots`/endTurn als echte Alternativen
- **Geändert**: `shared/src/game/botPearlScorer.ts` — urgency/contestedness bleiben als sekundäre Signale erhalten (Tiebreaker), sind aber nicht mehr Haupttreiber der Perlenauswahl

## Capabilities

### New Capabilities
- `npc-needed-values`: Berechnung fehlender Perlenwerte pro Portal-Karte unter Berücksichtigung aller Kostentypen und aktiver Fähigkeiten
- `npc-pearl-decision`: Neues Entscheidungsmodell für Perlennahme mit Handlimit-Bewusstsein und Fallback auf replacePearlSlots/endTurn

### Modified Capabilities

## Impact

- `shared/src/game/botNeededValues.ts` — neue Datei, wird aus shared exportiert
- `shared/src/game/botPearlScorer.ts` — urgency-Signal bleibt, wird sekundär
- `backend/src/bots/` — alle 5 Bot-Dateien erhalten neue Pearl-Entscheidungslogik
- Keine Änderungen an Game-Logic, Frontend, boardgame.io Server oder Move-API
