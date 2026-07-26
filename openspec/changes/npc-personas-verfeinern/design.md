## Context

`npc-drei-persoenlichkeiten` (PR #54) hat die Bot-Struktur überarbeitet, aber zwei quantitative Erfolgskriterien fehlen noch: Abbruchrate < 5% und ⌀ Runden < 20. Analyse des 180-Spiele-Turniers zeigt: 37 Abbrüche verteilen sich stark auf zwei Matchups (`diamond_vs_aggressive`: 10, `aggressive_vs_efficient`: 8). Gleichzeitig fehlen dedizierte Persönlichkeitstests und ein Kontroll-Turnier — beides wurde in Change A als Follow-up markiert. Der `rehandCards`-Move ist im Spielcode vorhanden, wird aber von keinem Bot genutzt, weil die Simulation-Engine bei `actionCount >= maxActions` sofort `endTurn` triggert.

## Goals / Non-Goals

**Goals:**
- Abbruchrate von 20.6% auf < 5% senken durch Deadlock-Fix und Chaining
- ⌀ Rundenzahl unter 20 durch aktive zweite Aktivierung pro Zug
- Alle drei Personas > 55% gegen alten Diamond-Bot (Baseline aus PR#54-Vorgängerbranch)
- Persönlichkeitstests pro Bot (3+ Szenarien) — Regressionsschutz
- Automatisches Erfolgskriterien-Check-Skript für CI-Nutzung

**Non-Goals:**
- Keine erneute Änderung an Softmax-Temperaturen oder Score-Gewichten (außer Erda-Frühphase)
- Keine Multiplayer-Balance-Analyse (>2 Spieler)
- Keine ML/Suchbaum-Ansätze
- Keine Änderungen an Spielregeln oder Move-API

## Decisions

### D1: Deadlock-Analyse via annotiertes Log

**Entscheidung:** Neuer Modus `--diagnose-deadlock` in `run.ts`, der bei abgebrochenen Spielen die letzten 30 Züge dumpt und Muster erkennt (z.B. `bot A: replacePearlSlots → bot B: replacePearlSlots → bot A: replacePearlSlots`).

**Warum:** Ohne konkrete Loop-Signatur ist der Fix Kaffeesatzleserei. Ein einziges 300-Spiele-Turnier mit dem Modus liefert die Frequenz-Statistik der Loop-Muster.

**Alternative:** Blindes Tuning der Bot-Parameter — verworfen, weil ohne Diagnose kein gerichteter Fortschritt.

**Vermutliche Ursachen (aus Code-Review, vor Diagnose):**
- Beide Bots haben leere Hand + kein zahlbares Portal + Deck kurz vor Reshuffle → beide wählen `replacePearlSlots` bis Timeout
- Portal-Tausch-Loop: Bot tauscht Karte A gegen B, Gegner-Bot tauscht zurück (unwahrscheinlich wegen strikt > 0 delta)
- `pearlDecision.ts` gibt `null` zurück wenn keine sinnvolle Perle → Bot endet Zug ohne Fortschritt, Gegner ebenso

### D2: Chaining-Check als Wrapper

**Entscheidung:** Neuer Helper `backend/src/bots/chaining.ts` mit `tryChainActivation(G, playerID, strategy): BotAction | null`. Wird von jedem Persona-Bot vor `endTurn` aufgerufen — genau eine zusätzliche Aktivierung, wenn eine Portal-Karte JETZT zahlbar ist (nach der ersten Aktivierung des Zuges).

**Warum:** Aktivierungen kosten in Portale-von-Molthar keine Aktion (sind der Sinn des Zuges); der Bot muss aber die "Ich bin fertig"-Entscheidung revidieren, wenn eine gerade freigewordene Karte spielbar ist.

**Alternative:** Chaining direkt in die 1er-Aktivierung integrieren (Loop innerhalb der Persona-Funktion). Verworfen — kapselt das Verhalten separat, so testbar.

**Guard gegen Endlosschleife:** `chainingRound` als lokaler Zähler im Bot-Aufruf; maximal 2 Aktivierungen pro Zug (Portal-Kapazität).

### D3: Persönlichkeitstests mit Snapshot-Ansatz

**Entscheidung:** Pro Bot ein Test-File mit `makeGame`/`makePlayer`-Helpers (analog zu `botPearlScorer.test.ts`), das gezielt die Persönlichkeits-Deltas verifiziert:

```
WendelinBot.test.ts:
  - Wählt pts/effort-optimale Karte
  - Nutzt Portal-Tausch bei bessere Display-Karte
  - Löst Chaining aus wenn 2. Karte zahlbar

RalfBot.test.ts:
  - Blockiert kontestierte Perle (denyThreshold=0)
  - Wählt rote Fähigkeit trotz niedrigerer Punkte
  - Zielt Steal auf führenden Gegner

EdelsteinBot.test.ts:
  - Bevorzugt Diamant-Karte in Frühphase (deck > 15)
  - Nutzt tradeForDiamond bei ungenutzter 2-Perle
  - Wählt blauen Modifikator trotz gleicher Punkte
```

**Warum:** Die Bots waren bisher nur indirekt über Turnier-Winrate getestet — kein Regressionsschutz gegen versehentliche Deltas.

### D4: Kontroll-Turnier via testBots/-Ordner

**Entscheidung:** `git show <sha>:backend/src/bots/GierBot.ts` (Pre-PR#54-Version des alten `EdelsteinBot`) nach `backend/src/bots/testBots/LegacyDiamondBot.ts` restoren. In `run.ts` neues Argument `--legacy-diamond`, das den alten Bot in Slot X einsetzt.

**Warum:** Vergleich neuer Personas gegen die alte Meta-Sieger-Strategie ohne die alte Strategie zurück in Produktion zu bringen.

**Alternative:** Zwei separate Branches vergleichen. Verworfen — zu umständlich, blockiert Regressionen.

**Sha für Restore:** `d87cce1` (dem Vorgänger-Commit "NPC: Needs-aware pearl selection") — enthält den alten EdelsteinBot.

### D5: Erda-Frühphase als reiner Score-Bonus

**Entscheidung:** In `scoreCardForStrategy(card, 'diamond', effort)` einen Zusatzbonus `+3 * card.diamonds` wenn `G.pearlDeck.length > 15`. Deckgröße wird als 4. Parameter der Funktion übergeben.

**Warum:** Erda spielt aktuell 43% Winrate, klar der Schwächste. Ihre Persönlichkeit "Diamant-Engine" braucht mehr Nachdruck in der Frühphase, wenn die Investition sich noch amortisiert.

**Alternative:** Neue Score-Formel pro Phase. Verworfen — zu viel Komplexität; ein Bonus reicht als erste Iteration.

### D6: rehandCards-Hook via preEndTurn

**Entscheidung:** `engine.ts` und `bot-runner.ts` bekommen einen zusätzlichen Ast: statt bei `actionCount >= maxActions` sofort `endTurn` zu triggern, prüfen sie erst `pickBlueAbilityAction(G, playerID, strategy, { onlyEndOfTurn: true })`. Der Handler-Filter `onlyEndOfTurn: true` gibt nur Moves zurück, die am Turn-Ende gültig sind (`rehandCards`).

**Warum:** Ohne Engine-Änderung ist `rehandCards` nicht erreichbar. Der Filter erlaubt eine minimale API-Erweiterung ohne die bestehende Bot-Struktur zu brechen.

**Alternative:** Bot-Funktionen selbst `rehandCards` als möglichen Move ausgeben. Verworfen — Bots werden aktuell nicht mit `actionCount >= maxActions` aufgerufen (Engine springt vorher raus).

### D7: verify.ts als Akzeptanzskript

**Entscheidung:** Neues Skript `backend/src/simulation/verify.ts`:
- Fährt Turnier (Default 300 Spiele, 3 Personas)
- Vergleicht Metriken gegen fixe Schwellwerte (aus Proposal)
- Exit-Code 0 bei allen bestanden, 1 sonst
- Console-Ausgabe mit klarer Diagnose welche Kriterien versagen

**Warum:** Erlaubt CI-Integration und macht "erfolgreich abgeschlossen" objektiv prüfbar.

## Risks / Trade-offs

**[Risiko] Deadlock-Ursache ist nicht in Bot-Code sondern in Spiellogik**
→ Mitigation: Diagnose-Modus zeigt exakte Move-Sequenz. Falls Ursache in `pearlDecision`/`enumerate` liegt, wird das als zweiter PR aufgesplittet.

**[Risiko] Chaining verlängert Zug-Zeit und damit Turnier-Laufzeit**
→ Mitigation: `chainingRound`-Guard limitiert auf max. 2 Aktivierungen. Turnier-Laufzeit sollte < 15 Min bleiben für 300 Spiele.

**[Risiko] Kontroll-Turnier gegen Legacy-Bot ist unfairer Vergleich (alter Bot kennt neue Spielmechaniken nicht)**
→ Der Legacy-Bot wird 1:1 aus dem Git-Zustand restauriert und läuft im gleichen Spielrahmen. Spielregeln haben sich nicht geändert; nur Bot-Logik.

**[Risiko] Erda-Frühphasen-Bonus überkorrigiert und macht Erda dominant**
→ Mitigation: Verify-Skript prüft Balance (keine Persona > 65% gegen andere zwei). Falls überkorrigiert: Bonus halbieren.

**[Trade-off] preEndTurn-Hook verkompliziert Engine leicht**
→ Notwendig, weil rehand sonst tote Feature bleibt. Klein gehalten (~10 Zeilen in engine.ts).

**[Trade-off] Persönlichkeitstests sind zusätzliche Wartungskosten**
→ Bewusst akzeptiert; ohne Tests keine Regressionssicherheit für die Personas.

## Migration Plan

Alle Änderungen sind additiv oder lokal. Kein Datenbank-Schema, keine API-Änderung. Rollback per `git revert` möglich. Feature-Flag nicht erforderlich, weil Bots serverseitig laufen und beim nächsten Neustart die neue Version verwenden.

## Open Questions

- Sollte das `verify.ts`-Skript in CI laufen (Pre-Merge-Check), oder nur manuell vor Release?
- Reichen 300 Spiele für stabile Metriken, oder brauchen wir 500+?
- Soll der Legacy-Bot dauerhaft in `testBots/` bleiben, oder nach dem Kontroll-Turnier gelöscht werden?
