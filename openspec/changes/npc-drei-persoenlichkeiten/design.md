## Context

Aus der Explore-Session vom 2026-07-25 (auf Basis der 2026-04-24-Analyse) ist die Diagnose stabil: Alle fünf aktuellen Bots teilen sich strukturelle Fehler, die ihre absolute Spielstärke deckeln. Wir bauen keinen "besseren einzelnen Bot", sondern **drei Persönlichkeiten auf einem gemeinsamen Smart Core**, damit unterschiedliche Priorisierungen sichtbar werden können, ohne dass eine davon einfach schlechter spielt.

Parallel läuft Change `npc-situation-matrix` als diagnostische Zange: Sie belegt jede Fehlentscheidung isoliert, so dass Fortschritte objektiv messbar sind.

## Goals / Non-Goals

**Goals:**
- Drei stark spielende Bot-Persönlichkeiten mit klar unterschiedlichen Schwerpunkten (Effizienz, Disruption, Diamant-Engine)
- Alle vier bekannten Bot-Lücken (Portal-Tausch, Timing, Contest, blaue Fähigkeiten) beseitigen
- Turnierabbruchsrate von 53% auf unter 5% senken
- Rundenzahl pro Sieg von 22 auf unter 20 reduzieren

**Non-Goals:**
- Keine ML- oder Suchbaum-Ansätze (Monte-Carlo, Minimax) — bleibt regelbasiert mit Softmax
- Keine Änderungen an Spielregeln oder Move-API
- Kein Rebalancing der Charakterkarten oder Kosten
- Keine Bot-Anpassung an spezifische Gegnerstrategien (Meta-Adaptivität)

## Decisions

### D1: Smart Core als geteilte Grundlage

**Entscheidung:** Fünf konkrete Bausteine, die alle drei Bots teilen. Persönlichkeiten differenzieren sich nur über Gewichtungen und Prioritäten oberhalb dieser Bausteine.

**Bausteine:**

1. **Portal-Tausch-Evaluator** (`shared/src/game/botPortalSwap.ts`):
   `evaluatePortalSwap(G, playerID, candidateDisplayCard, strategy)` → `{ swap: boolean, portalSlot?: 0|1, delta: number }`. Vergleicht Display-Karte gegen die schwächere der beiden Portal-Karten unter dem strategie-spezifischen Bewertungsmaßstab (pts/effort für Stratege, pts+diamonds*3 für Sammler, pts+redAbility für Raubritter). Nur wenn der Zugewinn positiv ist, wird getauscht. Die Bots rufen den Evaluator vor jeder `takeCharacterCard`-Entscheidung.

2. **Kontinuierlicher Timing-Multiplikator** (`backend/src/bots/timing.ts`):
   Neue Formel:
   ```
   mult = 1.0
         + max(0, (own_pts   - 6) / 6)   * urgency_own    // linear ab 6 pts
         + max(0, (leader_pts - 6) / 6)  * urgency_opp    // linear ab Gegner-6-pts
         + max(0, (30 - deck_size) / 30) * urgency_deck   // spätes Deck erhöht Druck
   ```
   Werte: `urgency_own=0.9`, `urgency_opp=0.5`, `urgency_deck=0.3`. Damit wird bei `own_pts=11` (Sieg 1 Aktivierung entfernt) der Multiplikator ~2.5 statt hart 1.8, und ein leeres Deck erhöht den Druck kontinuierlich.

3. **Contest-Score-Fix** (`shared/src/game/botPearlScorer.ts`):
   Contestedness wird nicht mehr subtraktiv abgezogen. Neue Semantik:
   ```
   own_value  = help * helpfulness + urgency * urgency_signal
   opp_value  = contest * contestedness
   final      = own_value + max(0, opp_value - own_value * denyThreshold)
   ```
   `denyThreshold=0.5` bedeutet: Der Bot straft eine Perle, die Gegner brauchen, nur dann ab, wenn sie ihm selbst weniger als halb so viel bringt. Der Raubritter setzt `denyThreshold=0` (nimmt aggressiv weg), der Stratege `denyThreshold=1.0` (nimmt nur was er selbst gut brauchen kann).

4. **Blaue-Fähigkeiten-Handler** (`backend/src/bots/blueAbilities.ts`):
   `pickBlueAbilityAction(G, playerID, strategy)` → `BotAction | null`. Prüft in Reihenfolge:
   - `previewCharacter` sofort am Zuganfang wenn ungenutzt
   - `swapPortalCharacter` wenn ungenutzte Karte im Portal und stärkere Kandidat im Display
   - `rehandCards` wenn Hand nicht ausreichend für nächste Ziel-Aktivierung
   - `tradeForDiamond` wenn 2-Perle in Hand, keine kurzfristige Aktivierung geplant, und Ziel-Karte hat hohe Kosten
   Wird von allen drei Bots als **zweiter Schritt** nach `resolvePending` aufgerufen (vor allen normalen Aktionen).

5. **Aktivierungs-Chaining-Check** (`backend/src/bots/chaining.ts`):
   Nach einer Aktivierung im gleichen Zug prüfen, ob eine weitere Portal-Karte JETZT zahlbar geworden ist (durch neu erhaltene Diamanten oder freigemachten Slot). Bots führen dann nicht `endTurn` aus, sondern versuchen sofort die zweite Aktivierung. Die Aktivierungs-Logik ist bereits idempotent (`canPayCard` prüft aktuellen Hand-Zustand) — der Chaining-Check ist eine Nicht-Regression im Bot, keine Änderung der Spielregeln.

### D2: Drei Persönlichkeiten und ihre Deltas

**Stratege (`efficient` / WendelinBot)**
- Score-Formel Aktivierung: `powerPoints * timingMult`
- Score-Formel Charakterkartenwahl: `powerPoints / (effort + 1)`
- Payment-Strategie: `preserveHighValue` (behält 7er/8er wenn möglich)
- `denyThreshold = 1.0` (kein aggressives Contest-Blocking)
- Softmax-Temperatur: niedrig (T=0.7), spielt sehr fokussiert

**Raubritter (`aggressive` / RalfBot)**
- Score-Formel Aktivierung: `redAbilityBonus + powerPoints * timingMult`
- Rote Fähigkeiten (`stealOpponentHandCard`, `discardOpponentCharacter`) auf den führenden Gegner zielen — nutzt bereits vorhandene `resolvePending`-Logik, aber nur der Raubritter erhält Bonus für diese Karten bei der Charakterkartenwahl
- `denyThreshold = 0` — nimmt Perlen weg die Gegner braucht
- Charakterkartenwahl: `powerPoints + hasRedAbility*8` (starker Präferenz-Bonus)
- Softmax-Temperatur: mittel (T=1.0), spielt reaktiv

**Sammler (`diamond` / EdelsteinBot)**
- Score-Formel Aktivierung: `diamonds*3 + powerPoints * timingMult`
- Frühphase (deck > 15): Priorisiert Karten mit ≥2 Diamanten
- Nutzt `tradeForDiamond` aktiv (2er-Perle → Diamant) wenn keine Aktivierung im nächsten Zug realistisch
- Priorisiert blaue Modifikatoren (`onesCanBeEights`, `threesCanBeAny`, `decreaseWithPearl`) beim Charakterkartenkauf
- `denyThreshold = 0.7` (mäßiges Blockieren)
- Softmax-Temperatur: mittel (T=0.9)

### D3: Migration und Rückwärtskompatibilität

**Entscheidung:** `NpcStrategy` behält die alten String-Werte als Typ-Union, mapped aber im Factory-Aufruf auf neue Bots:
```ts
type NpcStrategy = 'efficient' | 'aggressive' | 'diamond' | 'random'
// - 'efficient'  → neuer WendelinBot (Stratege)
// - 'aggressive' → neuer RalfBot (Raubritter)
// - 'diamond'    → neuer EdelsteinBot (Sammler)
// - 'random'     → IrrnisBot (nur Tests, nicht in Lobby)
```
`'greedy'` wird auf `'efficient'` gemappt (Lobby-Migration).

**Warum:** Bestehende Turnier-Reports und Testdaten bleiben lesbar; neue Reports zeigen die drei Persönlichkeiten direkt.

**Alternative:** Neue String-Namen (`'strategist'`, `'raider'`, `'gatherer'`). Verworfen weil zu viele Berührungspunkte im Frontend/UI-Text; die alten Namen sind mit den Persönlichkeiten inhaltlich konsistent.

### D4: Ausrufemetrik — Fortschrittsabbruch als Nord-Stern

Der 75-Spiel-Report zeigt 40 abgebrochene Spiele (53%). Das ist die schärfste Messgröße für "Bots blockieren sich strukturell". Nach jedem Smart-Core-Baustein wird ein Zwischen-Turnier gefahren (100 Spiele). Ein Baustein ist erst akzeptiert wenn er die Abbruchrate nicht erhöht **und** die durchschnittliche Rundenzahl nicht verschlechtert.

### D5: Reihenfolge der Implementierung

```
Phase 1 (Smart Core, nicht spielbar sichtbar):
  1. Portal-Tausch-Helper + Tests
  2. Timing-Verfeinerung + Tests
  3. Contest-Fix + Tests
  4. Blaue-Fähigkeiten-Helper + Tests

Phase 2 (Persönlichkeiten):
  5. Neuer Stratege (WendelinBot v2)
  6. Neuer Raubritter (RalfBot v2)
  7. Neuer Sammler (EdelsteinBot v2)

Phase 3 (Migration + Verifikation):
  8. Alte Bots entfernen, NpcStrategy anpassen, Lobby aktualisieren
  9. Turnier-Baseline gegen Erfolgskriterien
 10. Situation-Matrix erneut auswerten (aus Change A) — sollte die 4 dokumentierten Lücken jetzt als "gelöst" markieren
```

## Risiken / Trade-offs

**[Risiko] Contest-Fix ändert Score-Skala global**
→ Mitigation: Score-Fix hinter Feature-Flag (Konstante `USE_CONTEST_FIX = true`), damit alte Turnier-Reports reproduzierbar bleiben. Kann nach erfolgreicher Verifikation ausgebaut werden.

**[Risiko] Blaue-Fähigkeiten-Aufruf könnte Endlosschleifen erzeugen**
→ Mitigation: `pickBlueAbilityAction` prüft `activeAbility.usedThisTurn`-Flag. Der Handler wird pro Turn maximal einmal pro Ability aufgerufen. Wenn kein Fortschritt: fallback zu normalem Bot-Flow.

**[Risiko] Portal-Tausch könnte in Endlosschleife tauschen (Karte A → B → A)**
→ Mitigation: `evaluatePortalSwap` verlangt strikten Delta > 0 (nicht ≥). Zusätzlich: nie tauschen wenn Portal-Karte gerade in dieser Runde erst gelegt wurde (Flag `entry.acquiredRound === currentRound`).

**[Trade-off] Aggressive-Deny bei Raubritter kann in 1v1 hyperdominant werden**
→ Mitigation: Turnier-Balance-Check als Akzeptanzkriterium. Wenn Raubritter > 65% gegen die anderen, `denyThreshold` auf 0.3 erhöhen.

**[Trade-off] Migration mit alten String-Werten macht neue Persönlichkeitsnamen weniger sichtbar**
→ Bewusst gewählt. Der UI-Anzeigetext (`Weiser Wendelin`, `Raubritter Ralf`, `Edelsteinsammlerin Erda`) bleibt in `strategyName()` konsistent.

## Open Questions

- Sollen die drei Bots im UI-Text auf Deutsch bleiben oder englische Persönlichkeitsnamen bekommen (`Strategist`, `Raider`, `Gatherer`)?
- Wollen wir eine Difficulty-Skala einführen (leicht/mittel/schwer über Softmax-Temperatur), oder ist der Persönlichkeits-Wechsel Difficulty genug?
- Wie oft soll die Situation-Matrix in CI laufen — nur bei Bot-PRs oder immer?
