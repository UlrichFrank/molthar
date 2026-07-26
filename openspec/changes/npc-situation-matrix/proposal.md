## Why

Die fünf NPC-Strategien (random, greedy, diamond, efficient, aggressive) wurden bisher nur anhand von Turnierergebnissen bewertet — wir wissen dass `diamond` mit 77% Gewinnrate dominiert, aber nicht *warum* einzelne Entscheidungen gut oder schlecht sind. Um die Spielstärke gezielt zu erhöhen und menschliche Spieler herauszufordern, brauchen wir ein diagnostisches Werkzeug, das Bot-Entscheidungen in isolierten, kontrollierten Situationen vergleicht.

## What Changes

- Neues Skript `backend/src/simulation/situationMatrix.ts` — definiert ~32 benannte Szenarien als Mock-GameStates und ruft alle Bot-Strategien direkt (ohne vollständige Spielsimulation) auf
- CSV-Report-Ausgabe: eine Zeile pro Szenario × Strategie mit Situationsmerkmalen, gewählter Aktion, und Abgleich gegen eine "ideale" Aktion
- Dokumentierter Befund: drei strukturelle Lücken in der aktuellen Bot-Logik, die durch die Matrix sichtbar werden
- Optionale HTML-Visualisierung: farbkodierte Übersicht welche Bots in welchen Szenarien korrekt entscheiden

## Capabilities

### New Capabilities

- `npc-situation-matrix`: Tool zum Aufrufen von Bot-Strategien mit definierten Mock-GameStates; erzeugt CSV + HTML mit Situationsmerkmalen, Bot-Entscheidungen, Korrektheitsbewertung und Notizen

### Modified Capabilities

*(keine Änderungen an bestehenden Spezifikationen)*

## Impact

- Neue Datei: `backend/src/simulation/situationMatrix.ts`
- Neue Datei: `backend/src/simulation/mockState.ts` (Mock-GameState-Builder)
- Optional: Erweiterung von `reporter.ts` um Matrix-HTML-Ausgabe
- Keine Änderungen an Spiellogik, Bot-Code oder bestehendem Simulationsframework
- Abhängigkeit: benötigt reale CardDatabase-Einträge für realistische Charakterkarten

---

## Analyse-Hintergrund (Befunde aus Explore-Session)

Die folgende Analyse ist Grundlage für Design und Tasks.

### Bekannte Lücken im Bot-Code

**Lücke 1 — Portal-Karten-Tausch fehlt komplett**

Alle Bots prüfen nur `portal.length < 2` bevor sie eine Charakterkarte nehmen. Wenn das Portal voll ist (2 Karten) — egal wie schwach sie sind — nehmen Bots nie wieder eine Charakterkarte. Die Move-Funktion `takeCharacterCard(slotIdx, portalSlotToReplace)` existiert im Spielcode und wird von `enumerate.ts` auch korrekt angeboten (`[i, 0]` und `[i, 1]`), aber von keinem Bot je ausgewertet.

Szenario C3: Portal hat [2pts/effort=0, 3pts/effort=3], Display hat [8pts/effort=1] — alle Bots wechseln in Pearl-Sammlung, ein Mensch würde die 3pts-Karte ersetzen.

**Lücke 2 — Timing-Multiplikator zu grob**

`getTimingMultiplier()` schaltet nur bei absoluten Schwellenwerten (9pts) um, ignoriert dabei:
- Wie viele Aktivierungen noch bis zum Sieg nötig sind
- Wie viele Perlen noch im Deck sind (Deckende = Spielende naht)
- Relativen Abstand zum Gegner

Bei Gewinngrenze 12pts ist ein Spieler mit 8pts praktisch schon im Endspurt (noch 1 Aktivierung), bekommt aber timingMult=1.0.

**Lücke 3 — Contest-Score wirkt kontraproduktiv bei Aggressive-Bot**

In `scorePearlSlot()` wird `contestedness` als Abzug berechnet: Je mehr der Gegner von einer Perle profitiert, desto weniger will der Bot sie haben. Das ist gedacht als "Perle blockieren" — aber der Abzug tritt auch dann auf, wenn der Bot die Perle selbst dringend braucht. Aggressive-Bot nimmt eine dringend benötigte Perle, die auch dem Gegner nützt, schlechter als ein nutzlose Perle die nur ihm allein nützt.

**Lücke 4 — WendelinBot kann Portal nicht füllen wenn Tausch nötig wäre**

WendelinBot evaluiert in Schritt 2 alle Kandidaten (Portal + Display) nach pts/effort. Wenn der beste Kandidat bereits im Portal ist (und nicht zahlbar), geht er korrekt zu Pearl-Sammlung. Aber wenn das Portal 2 schwache Karten hat und eine bessere im Display liegt, kann er nicht tauschen — genau wie Lücke 1.

### Erwartete Matrix-Befunde

```
Szenario  │ greedy │ efficient │ diamond │ aggressive │ ideal    │ Befund
──────────┼────────┼───────────┼─────────┼────────────┼──────────┼────────────────────
A1        │ aktiviert│ aktiviert│aktiviert│ aktiviert  │ warten   │ Alle zu ungeduldig
A3 Race   │ aktiviert│aktiviert │aktiviert│ aktiviert  │ aktiviert│ Alle korrekt ✓
C3 Lücke  │ pearl  │ pearl     │ pearl   │ pearl      │ tauschen │ Alle falsch (Lücke!)
P5 Contest│ nimmt  │ nimmt     │ nimmt   │ nimmt WENIGER│ nimmt  │ Aggressive suboptimal
```

### Situationsdimensionen

Die 32 Szenarien decken folgende Trade-offs ab:

**A — Aktivierungsentscheidung (6):**
A1 Früh zahlbar (3pts) vs. warten auf 7pts · A2 Zwei zahlbare: 4pts/0◆ vs 5pts/2◆ · A3 Gegner bei 10pts, Race · A4 Schwache zahlbar (2pts), starke effort=2 · A5 Portal-Slot freimachen · A6 Letzte Runden, kein zahlbares Portal

**P — Perlentscheidung (8):**
P1 Exakt fehlende Perle sichtbar · P2 Keine nützliche Perle, Hand nicht voll · P3 Keine nützliche Perle, Hand voll · P4 Seltene vs. nützliche häufige Perle · P5 Perle hilft mir und Gegner (Contest-Problem) · P6 2 Portal-Karten, verschiedene Zielwerte · P7 Hand bei 4/5, eine nützliche Perle · P8 replacePearlSlots bei 3 Aktionen vs. 1 Aktion

**C — Charakterkarten-Entscheidung (6):**
C1 Portal leer: sofort zahlbar 3pts vs. aufwändig 6pts · C2 1 Karte im Portal (effort=2), Display hat sofort zahlbare 4pts · C3 Portal voll (beide schlecht), Display hat 8pts (Lücke!) · C4 Diamant-reich (2pts/3◆) vs. stark (7pts/0◆) · C5 Direkt aktivierbar vs. pts/effort-optimal · C6 Spätphase: lohnt neue Charakterkarte?

**E — Endgame-Druck (6 + 6 Varianten):**
E1 Ich 9pts, Gegner 10pts, zahlbare 3pts → Sieg · E2 Ich führe 11-8, zahlbare 1pt · E3 Deck leer (<3), kein zahlbares Portal · E4 3-Spieler: A=10pts, B=9pts, ich=6pts+4pts zahlbar · E5 Hoffnungsloser Rückstand (2pts vs. 11pts) · E6 3 Aktionen, beide Portal-Karten zahlbar
