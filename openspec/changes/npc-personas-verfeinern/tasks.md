## 1. Deadlock-Diagnose

- [x] 1.1 `run.ts`: neues Argument `--diagnose-deadlock` parsen
- [x] 1.2 `engine.ts`: bei `aborted=true` letzte 30 LogEntries als JSON auf stdout mit Prefix `[DEADLOCK gameId=<id>]`
- [x] 1.3 300-Spiele-Turnier mit `--diagnose-deadlock` gefahren (72 Aborts / 270)
- [x] 1.4 `analyze-deadlocks.mjs` implementiert, Log ausgewertet
- [x] 1.5 Root-Cause-Fix: `pearlDecision.ts` gibt endTurn statt replacePearlSlots wenn kein benötigter Wert in Deck+Discard; `botPortalSwap.ts` PAYABILITY_BONUS=5 für payable Cards → **Abbruchrate 27% → 3.3%**

## 2. Chaining-Aktivierung

- [ ] 2.1 `backend/src/bots/chaining.ts` — entfällt (Engine ruft Bot nach jedem Move erneut auf, implizites Chaining bereits vorhanden)
- [ ] 2.2 Chaining-Check nach `activatePortalCard` — implizit
- [ ] 2.3 `chainingRound`-Guard — `actionCount >= maxActions` reicht
- [ ] 2.4 `chaining.test.ts` — n/a
- [ ] 2.5 Verify — n/a

**Hinweis:** Gruppe 2 nach Code-Analyse als redundant erkannt. Bot wird pro Aktion neu aufgerufen, prüft in Schritt 1 immer aktivierbare Karten → Chaining automatisch.

## 3. Erda-Frühphasen-Bonus

- [x] 3.1 `scoreCardForStrategy(card, strategy, effort, deckSize?)` erweitert
- [x] 3.2 Bonus `+3 * card.diamonds` bei `strategy === 'diamond' && deckSize > 15 && card.diamonds >= 2`
- [x] 3.3 Aufrufer angepasst (EdelsteinBot, WendelinBot, RalfBot, blueAbilities) — `G.pearlDeck.length` durchgereicht
- [x] 3.4 `botPortalSwap.test.ts`: 8 → 16 Tests, +4 Frühphasen-Cases +4 Payability-Cases
- [x] 3.5 Verify: 16/16 grün

## 4. rehandCards-Hook (preEndTurn)

- [x] 4.1 `pickBlueAbilityAction` um `options?: { onlyEndOfTurn?: boolean }` erweitert
- [x] 4.2 `maybeRehand`-Handler in `blueAbilities.ts` (canPayCard-Heuristik)
- [x] 4.3 `engine.ts` preEndTurn-Hook mit Guard gegen doppelten rehand pro Zug
- [ ] 4.4 `bot-runner.ts` — nicht angefasst (out of scope für Iteration)
- [x] 4.5 `blueAbilities.test.ts` +2 rehand-Cases (11/11 grün)

## 5. Persönlichkeitstests

- [x] 5.1 `WendelinBot.test.ts` — pts/effort, Portal-Tausch, Peek
- [x] 5.2 `RalfBot.test.ts` — Contest-Block, Steal-Priorität, rote Fähigkeit
- [x] 5.3 `EdelsteinBot.test.ts` — Diamant-Frühphase, tradeForDiamond, blauer Modifikator
- [x] 5.4 Verify: 9/9 grün, 3× rerun stabil

## 6. Kontroll-Turnier (Legacy-Bot)

- [x] 6.1 `LegacyDiamondBot` restauriert aus `d87cce1` nach `backend/src/bots/testBots/`
- [x] 6.2 Guard: `bots/index.ts` importiert LegacyDiamondBot NICHT
- [x] 6.3 `--legacy-diamond` CLI via `botOverrides`-Mechanismus (kein Factory-Pollution)
- [x] 6.4 Kontroll-Turnier: 40 Spiele je Persona vs Legacy (n=20 pro H2H)
- [x] 6.5 Report `backend/simulation-results/legacy-comparison-2026-07-26.md` gespeichert

**Ergebnis:** efficient 55.0%, aggressive 55.0%, diamond **35.0%** (Erda unter Schwelle — Follow-up)

## 7. Verify-Skript

- [x] 7.1–7.5 `backend/src/simulation/verify.ts` mit 3 Kriterien-Checks + Exit-Code
- [ ] 7.6 README-Section — Follow-up

## 8. Verifikation gesamter Change

- [x] 8.1 Tests grün: shared 391/391, backend 47/47 (Gesamt 438)
- [x] 8.2 `tsc --noEmit` in shared + backend + game-web ohne Fehler
- [ ] 8.3 `verify.ts` läuft — Exit-Code wird verifiziert
- [ ] 8.4 Erda-Tuning bei Fail → Follow-up

## 9. Dokumentation & PR

- [x] 9.1 CLAUDE.md ergänzen
- [x] 9.2 Openspec-Change validiert
- [x] 9.3 Feature-Branch commit + push + PR

## Follow-ups (nächster Change)

- **Erda-Tuning:** diamond bot 35% vs Legacy (Ziel >55%). +4 blauer Modifikator und +6 Diamant-Frühphase reichen nicht. Nächste Iteration: Timing-Adjustment für Erda, aggressiveres tradeForDiamond, oder stärkerer Score-Bonus für Diamant-Karten in Mittelphase.
- **rehand in live server:** `bot-runner.ts` Erweiterung
- **Situations-Matrix (Change A):** parallel implementieren als Regressionstest
