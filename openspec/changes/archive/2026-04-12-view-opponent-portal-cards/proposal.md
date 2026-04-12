## Why

Aktivierte Charakterkarten der Gegner lassen sich bereits durch Anklicken in der Detail-Ansicht betrachten — Portal-Karten (noch nicht aktivierte) jedoch nicht. Das ist inkonsistent und verhindert es, die Fähigkeiten der Gegner einzuschätzen, ohne auf deren Zug zu warten.

## What Changes

- Klick auf eine **Portal-Karte eines Gegners** öffnet dieselbe read-only Detail-Ansicht (`ActivatedCharacterDetailView`) wie bei aktivierten Gegner-Karten — unabhängig davon, ob es der eigene Zug ist.
- Der **Hover-Glow** auf Portal-Karten der Gegner verhält sich identisch zu dem auf aktivierten Gegner-Karten (gleiche Darstellung, gleiche Intensität).
- **Irrlicht-Sonderfall bleibt vollständig erhalten:** Hat eine Portal-Karte eines Gegners die Irrlicht-Fähigkeit (`irrlicht`/`sharedActivation`) und es ist der eigene Zug mit noch verfügbaren Aktionen, öffnet der Klick wie bisher den Aktivierungsdialog — nicht die read-only Ansicht. Keine andere Gegner-Karte ist aktivierbar.

## Capabilities

### New Capabilities

*(keine neuen Capabilities)*

### Modified Capabilities

- `canvas-card-interaction`: Klick auf `opponent-portal-card` öffnet nun immer die Detail-Ansicht (auch außerhalb des eigenen Zugs) — außer bei Irrlicht-Karten im eigenen Zug, wo der Aktivierungsdialog weiterhin geöffnet wird. Hover-Glow-Verhalten angeglichen.

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — Klick-Handler für `opponent-portal-card` aus dem `isActive`-Zweig herausziehen; Detail-View-State für Portal-Karten ergänzen
- `game-web/src/lib/gameRender.ts` — Hover-Glow-Rendering für `opponent-portal-card` an `opponent-activated-character` angleichen (falls abweichend)
- Keine Backend-Änderungen
