## Context

Die 5 NPC-Bots (IrrnisBot, GierBot, EdelsteinBot, WendelinBot, RalfBot) entscheiden action-by-action mit hardcodierten Prioritätsregeln. Für Perlenauswahl existiert bereits ein strategy-aware Scorer (`botPearlScorer.ts`) der einen Score pro Slot berechnet — bisher wird aber immer deterministisch der höchste Score gewählt. Endgame-Zustand (Punkte-Stand, Race auf 12) wird von keinem Bot berücksichtigt.

## Goals / Non-Goals

**Goals:**
- Softmax-Auswahl für Perlen-, Charakter- und Aktivierungsentscheidungen in allen Bots
- Strategie-spezifische Temperaturen (GierBot = impulsiv, EdelsteinBot = methodisch)
- Timing-Multiplikator der Aktivierungspriorisierung bei Spielstand ≥ 9 Punkte verstärkt
- Beide Features in gemeinsamen Utility-Modulen, nicht dupliziert in jedem Bot

**Non-Goals:**
- Keine Sequenzbewertung (turn-by-turn lookahead)
- Keine neue Bot-Persönlichkeiten
- Keine Frontend-Änderungen oder Schwierigkeitsgrad-UI

## Decisions

### D1: Softmax auf Entscheidungsebene pro Aktionstyp, nicht über alle Moves

**Entscheidung:** Softmax wird separat angewendet für: (a) Perlenauswahl, (b) Charakterkartenauswahl, (c) Aktivierungsauswahl — nicht über einen gemeinsamen Pool aller legalen Züge.

**Rationale:** Ein Bot der zwischen "Perle nehmen" und "Karte aktivieren" zufällig wählt wirkt irrational. Bots sollen ihre Aktions-Priorität (aktivieren > Karte nehmen > Perle nehmen) behalten, aber innerhalb jeder Kategorie stochastisch auswählen.

**Alternative verworfen:** Softmax über `enumerateMoves()` — zu viele Züge, nicht kategorisierbar, Bots verlieren ihre Persönlichkeit.

### D2: Temperatur pro Strategy hardcoded, nicht konfigurierbar

**Entscheidung:** Temperaturen werden als Konstanten in `softmax.ts` definiert, pro `NpcStrategy`.

```
random:     uniform (kein Softmax)
greedy:     T = 1.5
aggressive: T = 1.2
efficient:  T = 0.8
diamond:    T = 0.6
```

**Rationale:** Temperaturen sind Teil der Bot-Persönlichkeit, nicht der Match-Konfiguration. Einfacher, wartbarer. Kann später in `NpcSlotConfig` ausgelagert werden wenn nötig.

### D3: `botPearlScorer.ts` — neue Funktion `scoredPearlSlots()` neben bestehender API

**Entscheidung:** Die bestehende `bestPearlSlotByScore()` bleibt unverändert (keine Breaking Change). Neu: `scoredPearlSlots(G, playerID, strategy): Array<{slot: number, score: number}>` gibt alle Slots mit Scores zurück. Bots rufen diese auf und wenden Softmax selbst an.

**Rationale:** Backward-compatible. `bestPearlSlotByScore` kann intern `scoredPearlSlots` nutzen.

### D4: Timing-Multiplikator nur auf Aktivierungsreihenfolge anwenden

**Entscheidung:** `getTimingMultiplier` beeinflusst ausschließlich, welche Karte ein Bot aktiviert (Sortiergewicht für `powerPoints`). Nicht auf Perlen- oder Charakterkartenauswahl.

**Rationale:** In der Endphase ist die wichtigste Entscheidung: "welche Karte aktiviere ich zuerst?" — Punktemaximierung. Perlenauswahl bleibt strategiespezifisch.

**Schwellenwerte:**
```
eigene Punkte ≥ 9:           1.8  (Endspurt — Punkte maximieren)
max. Gegner-Punkte ≥ 9:      1.4  (Tempo — Druck aufbauen)
sonst:                        1.0  (normal)
```

## Risks / Trade-offs

**[Zufall macht Bots schwächer]** → Akzeptiertes Trade-off. Ziel ist Menschlichkeit, nicht Optimalität. Temperaturen können nachjustiert werden.

**[IrrnisBot nutzt Timing-Multiplikator kaum]** → Durch Zufall-Auswahl wird der Effekt stark gedämpft. Akzeptabel — Irrnis ist der schwache Bot.

**[Score-Werte für Softmax müssen positiv sein]** → Implementierung muss Score-Normalisierung berücksichtigen. Negative Scores (z.B. wenn contestedness dominiert) können Softmax-Verhalten verzerren. Lösung: Score-Shift auf Minimum=0 vor Softmax.

## Migration Plan

Kein Deployment-Schritt nötig — reine Logikänderung in `backend/`. Server-Neustart nach Build genügt. Kein Datenbankschema, keine persistierten Daten betroffen.
