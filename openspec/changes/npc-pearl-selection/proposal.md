## Why

NPC-Bots wählen Perlenkarten ohne Bezug zu den Charakterkarten, die sie aktivieren wollen — GierBot und RalfBot nehmen immer die höchste Perle, EdelsteinBot prüft nur einfache `number`-Kosten. Das führt dazu, dass Bots zufällig wirken und nie zielgerichtet sammeln.

## What Changes

- Neue shared Funktion `scorePearlSlot()` in `botPearlScorer.ts` mit drei Signalen: Helpfulness (hilft die Perle meiner Zielkarte?), Urgency (wie knapp ist dieser Wert im Deck?), Contestedness (brauchen andere Spieler diesen Wert?)
- Jeder Bot ermittelt eine explizite Zielkarte und übergibt sie an den gemeinsamen Scorer
- GierBot, RalfBot: `bestPearlSlotIndex` (nimm höchste) wird durch strategie-gewichtetes Scoring ersetzt
- EdelsteinBot: `neededPearlValues`/`findMatchingPearlSlot` (nur `number`-Typen) wird ersetzt
- WendelinBot: `findPearlForTarget` wird durch den gemeinsamen Scorer ersetzt
- IrrnisBot: keine Änderung (bleibt zufällig)

## Capabilities

### New Capabilities
- `npc-pearl-scoring`: Strategie-bewusste Perlenbewertung für NPC-Bots — drei Signale (Helpfulness, Urgency, Contestedness) mit per-Strategie konfigurierbaren Gewichtungen

### Modified Capabilities

## Impact

- `shared/src/game/botPearlScorer.ts` — neue Datei
- `backend/src/bots/GierBot.ts`, `RalfBot.ts`, `EdelsteinBot.ts`, `WendelinBot.ts` — Pearl-Auswahl-Logik ersetzt
- `shared/src/index.ts` — Export des neuen Scorers
- Keine Änderungen an Spielregeln, Game State oder Moves
