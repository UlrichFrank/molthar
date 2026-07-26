## Context

Fünf NPC-Strategien (random, greedy, diamond, efficient, aggressive) sind als reine Funktionen `(G, ctx, playerID) => BotAction` implementiert. Im Live-Betrieb laufen sie über WebSocket gegen einen boardgame.io-Server mit 1–2,5s Delays pro Zug — ein vollständiges Spiel dauert 5–10 Minuten. Für systematische Auswertung von Stärken/Schwächen sind Hunderte von Spielen nötig, was im Live-Betrieb nicht praktikabel ist.

boardgame.io 0.50 exportiert `CreateGameReducer` + `InitializeGame` aus `boardgame.io/core` (als CJS-Exporte bestätigt), die eine vollständig in-process Simulation ohne Server ermöglichen.

## Goals / Non-Goals

**Goals:**
- Einzelne Spiele in <50ms simulieren (kein Netzwerk, keine Delays)
- 100 Spiele pro Matchup in <5s laufen lassen
- Deterministische Ergebnisse via seedrandom (reproduzierbare A/B-Tests)
- JSON-Report mit Spiellog + Aggregat-Statistiken
- Selbst-enthaltenes HTML-Dashboard (Win-Rates, Head-to-Head, Box-Plots, Histogramm)
- 2–5 Spieler unterstützen; 2P Head-to-Head als Hauptauswertung

**Non-Goals:**
- Keine Änderungen an der Spiellogik oder Bot-Strategien
- Kein Live-Monitoring oder persistente Datenbank
- Kein automatisiertes CI-Turnier (manuell ausgeführt)
- Keine Optimierung der Strategien selbst (Simulation ist Mess-Werkzeug)

## Decisions

### D1: boardgame.io-Reducer direkt verwenden (statt eigener State-Machine)

**Entscheidung:** `CreateGameReducer` + `InitializeGame` aus `boardgame.io/core` für die Simulation nutzen.

**Alternativen:**
- *Eigene State-Machine*: Fehleranfällig, müsste alle Spielregeln duplizieren
- *Test-Client mit `singleplayer`-Multiplayer*: Async, unübersichtlich

**Rationale:** Die boardgame.io-Reducer sind die Single Source of Truth für die Spiellogik. Direkte Nutzung vermeidet Divergenz und ist nachweislich verfügbar.

**Aktions-Format:**
```ts
// MAKE_MOVE
{ type: 'MAKE_MOVE', payload: { type: moveName, args, playerID } }
// GAME_EVENT  
{ type: 'GAME_EVENT', payload: { type: 'endTurn', playerID } }
```
Die genauen Action-Creator-Signaturen werden in `engine.ts` gegen die boardgame.io-CJS-Exports verifiziert.

---

### D2: seedrandom via Math.random()-Patching

**Entscheidung:** `seedrandom` patcht `Math.random` global vor jedem Spiel: `seed = masterSeed + ':' + gameIndex`.

**Alternativen:**
- *Eigene PRNG-Instanz übergeben*: Würde Änderungen an `shared/` erfordern (shuffleArray etc.)
- *Kein Seeding*: Keine Reproduzierbarkeit

**Rationale:** `Math.random`-Patching ist der minimalinvasive Weg — `shared/` bleibt unverändert. Das Muster ist in der boardgame.io-Community etabliert.

**Seed-Strategie:**
- Default: zufällig generierter Master-Seed (im Report gespeichert)
- Per-Spiel-Seed: `"${masterSeed}:${gameIndex}"` → jedes Spiel anders, aber deterministisch
- CLI: `--seed abc123` für volle Reproduzierbarkeit

---

### D3: Turnier-Modus — Strategie-Rotations-Schema

**Entscheidung:** Für P Spieler und S Strategien: alle Kombinationen mit Wiederholung (`combinations(strategies, P)`) ohne Slot-Rotation für 2P; für 3P+ werden Strategien auf Slots 0..P-1 gleichmäßig verteilt.

**2P-Sonderfall:** Alle 10 Paare (5 Strategien choose 2) + 5 Spiegel-Matchups (gleiche Strategie vs. sich selbst). Spiegel-Matchups helfen, Varianz zu messen.

**Rationale:** Für 2P ist symmetrische Auswertung (A vs B und B vs A im gleichen Pool) einfacher als Slot-Rotation.

---

### D4: Ausgabe-Format

**Entscheidung:** Zwei Dateien pro Turnier-Lauf:
1. `report_<players>p_<games>g_<date>.json` — maschinenlesbare Daten
2. `report_<players>p_<games>g_<date>.html` — selbst-enthaltenes Dashboard

**HTML-Strategie:** Chart.js via CDN, alle Daten als `<script>` inline. Keine Build-Tools nötig — einfach im Browser öffnen.

**Verbose-Modus:** Vollständiger `log[]` pro Spiel nur bei `--verbose`. Standard: nur `ranking` + Aggregate pro Spiel (hält JSON-Größe im Rahmen).

---

### D5: Sicherheits-Safeguards

- **Max-Aktionen-Guard:** 10.000 Aktionen pro Spiel → Abbruch mit `{ error: 'timeout' }`
- **Infinite-Loop-Schutz:** Wenn ein Bot mehrfach hintereinander `endTurn` ohne Fortschritt wählt, wird das Spiel beendet
- Abgebrochene Spiele werden im Report als `aborted: true` markiert und in Statistiken ausgeschlossen

## Risks / Trade-offs

**[Risiko] boardgame.io interne Action-Creator-API könnte sich zwischen Versionen ändern**
→ Mitigation: Version in `package.json` ist gepinnt (`^0.50.2`). Eigener schmaler Wrapper in `engine.ts` isoliert den Rest der Simulation.

**[Risiko] `Math.random`-Patching ist nicht thread-safe**
→ Mitigation: Simulation läuft single-threaded (Node.js Event-Loop). Kein paralleles Spiel-Dispatching — Spiele laufen sequenziell.

**[Risiko] Simuliertes Spielverhalten weicht von Live-Spielverhalten ab**
→ Mitigation: Identischer Reducer und identische Bot-Funktionen — kein Code-Duplikat. Unterschied ist nur das Fehlen von Netzwerk-Rauschen.

**[Trade-off] Sequentielle statt parallele Spiele**
→ 1000 Spiele in ~10s ist ausreichend schnell. Worker-Threads würden das Math.random-Patching komplizieren.

## Migration Plan

Rein additiv — keine bestehenden Dateien werden geändert. Deployment:
1. `seedrandom` zu `backend/package.json` hinzufügen
2. `backend/src/simulation/` erstellen
3. Lokal ausführen: `cd backend && pnpm tsx src/simulation/run.ts`

Rollback: Dateien löschen. Kein Einfluss auf Server-Betrieb.

## Open Questions

- Soll `withSpecialCards: true` auch simuliert werden, oder zunächst nur `false`?
  *(Vorschlag: Default `false`, via `--special-cards` Flag opt-in)*
- Sollen Spiegel-Matchups (gleiche Strategie vs. sich selbst) im Standard-Turnier enthalten sein?
  *(Vorschlag: ja, zeigt Varianz der Strategie)*
