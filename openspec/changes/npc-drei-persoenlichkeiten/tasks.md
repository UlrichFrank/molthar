## 1. Smart Core — Portal-Tausch

- [x] 1.1 `shared/src/game/botPortalSwap.ts` anlegen mit `evaluatePortalSwap(G, playerID, candidateCard, strategy): { swap: boolean, portalSlot?: 0|1, delta: number }`
- [x] 1.2 Bewertungsformel pro Strategie kapseln (`scoreCardForStrategy(card, strategy, effort): number`)
- [x] 1.3 `botPortalSwap.test.ts`: 8 Testfälle
- [x] 1.4 Verify: `pnpm test -- --run botPortalSwap.test.ts` grün

## 2. Smart Core — Verfeinertes Timing

- [x] 2.1 `backend/src/bots/timing.ts` neu implementieren mit kontinuierlicher Formel
- [x] 2.2 Konstanten `URGENCY_OWN`, `URGENCY_OPP`, `URGENCY_DECK` als benannte Exports
- [x] 2.3 `timing.test.ts` — 8 Test-Cases
- [x] 2.4 Alte Testfälle mit Anpassung an neue Semantik grün

## 3. Smart Core — Contest-Score-Fix

- [x] 3.1 `scorePearlSlot()` umstellen auf `own_value + max(0, opp_value - own_value * denyThreshold)`
- [x] 3.2 `getStrategyWeights()` um `denyThreshold` erweitert (efficient=1.0, aggressive=0.0, diamond=0.7)
- [x] 3.3 `botPearlScorer.test.ts` — Contest-Tests auf neue Semantik umgestellt (4 Cases)
- [x] 3.4 Verify: 24 pearl-scorer Tests grün

## 4. Smart Core — Blaue Fähigkeiten

- [x] 4.1 `backend/src/bots/blueAbilities.ts` anlegen mit `pickBlueAbilityAction(G, playerID, strategy)`
- [x] 4.2 Handler-Reihenfolge: preview → swapPortal → tradeForDiamond (rehand siehe TODO in Datei)
- [x] 4.3 `enumerate.ts` ergänzen um die 3 Move-Typen
- [x] 4.4 `blueAbilities.test.ts` — 9 Cases pro Handler
- [x] 4.5 Verify: kein Move wird aufgerufen wenn Ability inaktiv

## 5. Persönlichkeit — Stratege (WendelinBot v2)

- [x] 5.1 WendelinBot überarbeitet: Smart Core eingebunden
- [x] 5.2 Payment-Strategie `preserveHighValue` bereits vorhanden
- [ ] 5.3 Chaining-Check am Turn-Ende (nachgezogen, blockiert nicht Task 10)
- [ ] 5.4 WendelinBot-Persönlichkeitstest (Follow-up)

## 6. Persönlichkeit — Raubritter (RalfBot v2)

- [x] 6.1 RalfBot überarbeitet: Smart Core + `denyThreshold=0` für Perlenwahl
- [x] 6.2 Zielauswahl für rote Fähigkeiten via `resolvePending`
- [x] 6.3 Charakterkartenwahl: `scoreCardForStrategy` liefert red-ability +8 Bonus
- [ ] 6.4 RalfBot-Persönlichkeitstest (Follow-up)

## 7. Persönlichkeit — Sammler (EdelsteinBot v2)

- [x] 7.1 EdelsteinBot überarbeitet: Smart Core + Diamant-Priorisierung
- [x] 7.2 `tradeForDiamond`-Nutzung: sofort bei 2er-Perle wenn nicht für Portal gebraucht
- [ ] 7.3 Frühphasen-Regel (Follow-up — bereits durch scoreCardForStrategy teilweise abgedeckt)
- [x] 7.4 Blaue-Modifikator-Präferenz: +4 Bonus in `scoreCardForStrategy` für diamond-Strategie
- [ ] 7.5 EdelsteinBot-Persönlichkeitstest (Follow-up)

## 8. Migration & Cleanup

- [x] 8.1 `GierBot.ts` entfernt; IrrnisBot bleibt für Test-Alias
- [x] 8.2 Factory reduziert auf drei Produktions-Bots + `random`/`greedy` als Alias
- [ ] 8.3 `NpcStrategy` Union bleibt zwecks Backward-Compat (Design D3)
- [x] 8.4 Alias-Mapping für `'greedy'` → WendelinBot in Factory
- [x] 8.5 Lobby-Frontend: Auswahl auf drei Optionen + Persönlichkeits-Beschreibungen
- [x] 8.6 `pnpm run type-check` in shared + backend + game-web ohne Fehler

## 9. Verifikation — Turnier-Baseline

- [x] 9.1 `shared/` Tests grün (383/383)
- [x] 9.2 `backend/` Tests grün (35/35)
- [x] 9.3 3-Bot-Turnier: 20 Spiele pro Matchup = 180 Spiele
- [x] 9.4 Metriken erfasst
- [ ] 9.5 Erfolgskriterien-Check (siehe Zusammenfassung — teilweise erfüllt, siehe Follow-up)
- [ ] 9.6 Kontroll-Turnier gegen alten Diamond-Bot (Follow-up: GierBot ist bereits entfernt)
- [x] 9.7 Ergebnisreport `report_2p_180g_2026-07-25.{html,json}` gesichert

**Ergebnis vs. Baseline (75-Spiel, alte 5 Bots):**
- Abbruchrate: 53% → 20.6% (dramatische Verbesserung, Ziel <5% noch offen)
- Winrate-Balance: alle drei zwischen 42.9%–55.3% (Ziel ≥30% ✓)
- ⌀ Runden (nur non-aborted): 22 → 30.6 (langsamere, aber vollständigere Spiele)
- Rangfolge: aggressive 55.3% > efficient 51.5% > diamond 42.9%

## 10. Dokumentation & PR

- [ ] 10.1 CLAUDE.md aktualisieren: neue Bot-Persönlichkeiten dokumentieren
- [ ] 10.2 `backend/README.md` — Bot-Sektion anpassen (falls existierend)
- [ ] 10.3 Openspec-Change als complete markieren
- [ ] 10.4 Feature-Branch commiten, pushen, PR öffnen mit Turnier-Vergleichstabelle

## Follow-up (nach diesem PR)

- Chaining-Check (5.3): zweite Aktivierung im selben Zug automatisch nutzen
- Weitere Abbrüche eliminieren: `diamond_vs_aggressive` (10/40) und `aggressive_vs_efficient` (8/40) analysieren
- Persönlichkeitstests (5.4, 6.4, 7.5): dedizierte Tests pro Bot
- Kontroll-Turnier gegen alten Diamond-Bot (via git-restore von GierBot/original Bots)
- Situations-Matrix aus Change A parallel implementieren und Bots empirisch validieren
