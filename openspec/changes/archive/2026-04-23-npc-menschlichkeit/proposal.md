## Why

Die bestehenden NPC-Bots spielen vollständig deterministisch — gleiche Spielsituation ergibt immer identisches Verhalten. Das wirkt maschinell und vorhersehbar. Zusätzlich ignorieren alle Bots den Spielstand (Race auf 12 Punkte), was strategische Blindheit im Endgame verursacht.

## What Changes

- **Neu**: `backend/src/bots/softmax.ts` — geteilte Utility-Funktion für Boltzmann/Softmax-Auswahl mit konfigurierbarer Temperatur
- **Neu**: `backend/src/bots/timing.ts` — `getTimingMultiplier(G, playerID)` für Endgame-Awareness
- **Geändert**: Alle 5 Bots (GierBot, EdelsteinBot, WendelinBot, RalfBot, IrrnisBot) nutzen Softmax bei Perlen-, Charakter- und Aktivierungsauswahl
- **Geändert**: Alle 5 Bots berücksichtigen den Timing-Multiplikator bei der Priorisierung von Aktivierungen
- **Geändert**: `bestPearlSlotByScore` gibt Score-Array zurück (statt direkt den besten Slot), damit Bots selbst Softmax anwenden können

## Capabilities

### New Capabilities
- `npc-softmax-selection`: Gewichtete Zufallsauswahl für Bot-Entscheidungen pro Aktionstyp mit strategie-spezifischer Temperatur
- `npc-endgame-timing`: Dynamische Anpassung der Aktivierungspriorisierung basierend auf Spielstand (Punkte-Schwelle 9)

### Modified Capabilities
<!-- Keine bestehenden Spec-Level-Anforderungen ändern sich — reine Implementierungsverbesserung -->

## Impact

- `backend/src/bots/` — alle Bot-Dateien werden angepasst
- `shared/src/game/botPearlScorer.ts` — API-Erweiterung: Score-Array zusätzlich zum besten Slot
- Keine Änderungen an Game-Logic, Frontend oder boardgame.io Server
- Keine Breaking Changes an Spielregeln oder Move-API
