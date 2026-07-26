## Why

Der Vorgänger-Change `npc-drei-persoenlichkeiten` (PR #54) hat die Bot-Landschaft strukturell verbessert: Abbruchrate 53% → 20.6%, keine Persönlichkeits-Dominanz mehr. Zwei Erfolgskriterien sind aber weiterhin offen: Abbruchrate < 5% und ⌀ Runden < 20. Zusätzlich fehlen dedizierte Persönlichkeitstests, ein Kontroll-Turnier gegen die alte Bot-Generation und ein Hook für `rehandCards`, weil die aktuelle Engine dem Bot vor `endTurn` keine Chance gibt. Ohne diese Nacharbeiten bleibt die Turnier-Qualität hinter dem Ziel zurück.

## What Changes

- **Deadlock-Analyse:** Logging der abgebrochenen Matchups (`diamond_vs_aggressive`, `aggressive_vs_efficient`) — welche Zustände wiederholen sich? Fix in den identifizierten Loops (z.B. wechselseitiges `replacePearlSlots` ohne Fortschritt)
- **Chaining-Check:** Neuer Helper `backend/src/bots/chaining.ts` — nach einer erfolgreichen Aktivierung im gleichen Zug prüfen, ob eine zweite Portal-Karte JETZT zahlbar geworden ist
- **Persönlichkeitstests:** `WendelinBot.test.ts`, `RalfBot.test.ts`, `EdelsteinBot.test.ts` mit je 3+ Szenarien (Portal-Tausch, blaue Fähigkeit, Chaining bzw. Steal-Priorität bzw. Diamant-Kauf)
- **Kontroll-Turnier:** `GierBot.ts` und ursprünglicher `EdelsteinBot.ts` per git-restore aus PR-Vorgängerbranch nach `backend/src/bots/testBots/`; Turnier-CLI unterstützt Alias `--legacy-diamond` zum direkten Vergleich
- **Frühphasen-Regel für Erda:** Zusätzlicher Score-Bonus in `scoreCardForStrategy(card, 'diamond', effort)` wenn `deck > 15` UND `card.diamonds >= 2` — bevorzugt Diamant-Karten selbst bei niedrigen Punkten
- **rehandCards-Hook:** `backend/src/simulation/engine.ts` und `backend/src/bots/bot-runner.ts` bekommen einen `preEndTurn(G, playerID)`-Callback, der `pickBlueAbilityAction` mit Filter für `rehandCards` aufruft, bevor `endTurn` ausgeführt wird
- **Turnier-Baseline-Skript:** `backend/src/simulation/verify.ts` — führt 300-Spiele-Turnier und prüft die drei Erfolgskriterien automatisch, Exit-Code ≠ 0 bei Verletzung

## Capabilities

### New Capabilities

- `npc-personas-verfeinern`: Nachschärfen der drei Bot-Persönlichkeiten mit Deadlock-Fix, Chaining, Erda-Frühphase, Persönlichkeitstests, Kontroll-Turnier und rehand-Hook

### Modified Capabilities

- `npc-pearl-scoring`: Frühphasen-Score-Bonus für Diamant-Karten im `diamond`-Strategie-Pfad
- `npc-endgame-timing`: Chaining-Regel (zweite Aktivierung im selben Zug) als Erweiterung des Timing-Prinzips

## Impact

- `backend/src/bots/chaining.ts` (neu) + Aufrufer in allen drei Persona-Bots
- `backend/src/bots/{Wendelin,Ralf,Edelstein}Bot.test.ts` (neu, je ~150 Zeilen)
- `backend/src/bots/testBots/` (neu, restore alter Bots)
- `backend/src/simulation/engine.ts` — `preEndTurn`-Hook
- `backend/src/simulation/run.ts` — CLI-Argument `--legacy-diamond`
- `backend/src/simulation/verify.ts` (neu) — Akzeptanzkriterien-Check
- `shared/src/game/botPortalSwap.ts` — Score-Bonus Erweiterung für diamond
- `shared/src/game/botPearlScorer.ts` — Frühphasen-Bonus in `getStrategyWeights` (optional)
- Keine Änderung an Spielregeln, Move-API oder boardgame.io Server

## Erfolgskriterien

Nach diesem Change gilt der Fortschritt als abgeschlossen, wenn `pnpm tsx src/simulation/verify.ts --games 300 --seed final-check` bei allen drei Kriterien Exit-Code 0 liefert:

- Abgebrochene Spiele < **5%** (heute: 20.6%)
- Durchschnittliche Rundenzahl pro Sieg < **20** (heute: 30.6)
- Jede der drei Persönlichkeiten gewinnt in einem Kontroll-Turnier gegen den alten `diamond`-Bot mit **> 55%** Winrate
