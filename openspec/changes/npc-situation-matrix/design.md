## Context

Das NPC-Turnier-Framework (simulation engine, tournament runner, reporter) ist fertig und liefert aggregierte Statistiken. Was fehlt ist ein **diagnostisches Werkzeug auf Aktions-Ebene**: Für isolierte, kontrollierte Spielsituationen sehen wir, welche Entscheidung jede Strategie trifft — ohne Rauschen aus zufälligen Spielverläufen.

Die Exploration hat vier konkrete Lücken im Bot-Code identifiziert (siehe Proposal). Die Matrix soll diese empirisch belegen und als Baseline dienen, bevor Bot-Verbesserungen implementiert werden.

## Goals / Non-Goals

**Goals:**
- ~32 benannte Szenarien als kontrollierte Mock-GameStates definieren
- Alle 4 nicht-zufälligen Bots (greedy, efficient, diamond, aggressive) pro Szenario aufrufen
- CSV-Report mit Situationsmerkmalen, Bot-Aktionen, und Korrektheitsbewertung erzeugen
- Gefundene Lücken empirisch belegen (A1, C3, P5)
- Analyse als dauerhafte Grundlage für Bot-Verbesserungen persistieren

**Non-Goals:**
- Keine Vollspiel-Simulation (das macht `engine.ts`)
- Keine Änderungen an Bot-Strategien (das kommt nach der Diagnose)
- Keine Multiplayer-Szenarien (>2 Spieler) in der ersten Version
- Keine automatische "ideale Aktion" — diese bleibt ein manuell gesetzter Wert pro Szenario

## Decisions

### D1: Mock-GameState statt echter Spielinitialisierung

**Entscheidung:** Eigener `mockState`-Builder der nur die Felder setzt, die Bot-Funktionen lesen.

**Warum:** `InitializeGame()` zieht aus einem echten Deck mit Zufallselement. Das macht Szenarien nicht reproduzierbar ohne Seed-Management. Mock-States sind explizit und deterministisch.

**Alternative:** `InitializeGame` + seedrandom + Züge manipulieren bis gewünschter Zustand erreicht. Zu fragil — kleine Regeländerungen brechen alle Szenarien.

**Kritische Mock-Felder:**
```typescript
// Was Bots lesen:
G.players[id].hand, .portal, .powerPoints, .diamondCards,
  .handLimitModifier, .activeAbilities, .id

G.pearlSlots[0..3]       // sichtbare Perlenslots
G.pearlDeck              // für Urgency-Berechnung (Länge + Wertverteilung)
G.characterSlots         // sichtbare Charakterkarten
G.characterDeck          // für Deck-Größe
G.playerOrder            // für Contest-Berechnung
G.roundNumber, .actionCount, .maxActions
G.requiresHandDiscard    // immer false in Szenarien
G.pendingStealOpponentHandCard etc. // alle false
```

Karten-Objekte (CharacterCard, PearlCard) werden als minimale Mocks erstellt — nur die Felder, die Bots auswerten (powerPoints, diamonds, cost, abilities, id, value).

### D2: Charakterkarten als minimale Inline-Mocks

**Entscheidung:** Karten werden direkt im Szenario als Objekte definiert (keine Datenbankabfrage).

**Warum:** Szenarien müssen die Kartenattribute präzise kontrollieren (exakt 3 Diamanten, exakt effort=1). Reale Karten aus der Datenbank könnten sich ändern.

**Alternative:** Reale Karten importieren. Vorteil: realistische Kostenstrukturen. Nachteil: Szenario-Reproduzierbarkeit hängt von Datenbankinhalt ab.

### D3: CSV als primäres Ausgabeformat

**Entscheidung:** Eine CSV-Datei, eine Zeile pro Szenario, alle Bots in Spalten.

**Warum:** Der Benutzer möchte die Daten in Numbers/Excel analysieren — filtern, sortieren, Gewichtungen anpassen.

**Sekundär:** HTML-Übersicht mit farbkodierter Korrektheitstabelle (gleiche CDN-Abhängigkeit wie bestehender reporter.ts).

### D4: Korrektheitsbewertung ist manuell

**Entscheidung:** `ideal_action` ist ein String der im Szenario-Objekt hart kodiert ist (`"activatePortalCard"`, `"takePearlCard(2)"`, etc.).

**Warum:** "Ideal" ist spieltheoretisch nicht eindeutig ableitbar — es ist eine Designentscheidung, die dokumentiert werden soll. Automatische Bewertung über Spielausgänge wäre konfundiert mit anderen Faktoren.

**Folge:** `*_correct`-Spalten vergleichen Bot-Aktion gegen `ideal_action` als String-Präfix-Match.

### D5: Szenario-Kategorien und Nummerierung

32 Szenarien in 4 Kategorien (A/P/C/E), mit je 6-8 Szenarien. Jedes Szenario hat:
- `id` (A1..E6)
- `name` (kurz, englisch-kompatibel)
- `description` (Deutsch, erklärt den Trade-off)
- `ideal_action` (Aktionstyp als String)
- `ideal_reason` (1 Satz Begründung)

## CSV-Spaltenstruktur

```
id | category | name | description
hand_values | portal_1_pts | portal_1_effort | portal_1_payable
portal_2_pts | portal_2_effort | portal_2_payable
diamonds | own_pts | pts_gap | game_phase | deck_size | timing_mult
useful_slots | pearl_slots
char_display_best_pts
greedy_action | efficient_action | diamond_action | aggressive_action
ideal_action | ideal_reason
greedy_ok | efficient_ok | diamond_ok | aggressive_ok
notes
```

`*_ok` Werte: `TRUE` / `FALSE` / `PARTIAL` (Aktion ist akzeptabel aber nicht optimal).

## HTML-Übersicht (sekundär)

Einfache Tabelle mit farbkodierten Zellen:
- Grün: Bot-Aktion entspricht ideal_action
- Gelb: PARTIAL
- Rot: falsch
- Zeilenheader: Szenario-ID + Name
- Spalten: greedy / efficient / diamond / aggressive

Kein Chart.js nötig — reine CSS-Tabelle.

## Risiken / Trade-offs

**[Risiko] Mock-States bilden Spielregeln nicht vollständig ab**
→ Mitigation: Bot-Funktionen nur mit Feldern aufrufen, die sie tatsächlich lesen. Wenn ein Bot crasht, fehlt ein Feld → Fehler sind selbstdokumentierend.

**[Risiko] "Ideal"-Bewertung ist subjektiv**
→ Mitigation: Begründung (`ideal_reason`) ist Pflichtfeld. Diskussionen über einzelne Szenarien sind wertvoll — das ist das Ziel des Tools.

**[Risiko] Szenarien werden mit Bot-Verbesserungen obsolet**
→ Mitigation: Szenarien sind Verhaltensdokumentation. Wenn ein Bot C3 korrekt löst, ist `greedy_ok = TRUE` die Bestätigung, nicht ein Problem.

**[Trade-off] Nur 2-Spieler-Szenarien**
→ Contest-Logik (scorePearlSlot) ist in 3+-Spieler-Spielen anders. Für die erste Version akzeptabel — die wichtigsten Lücken (A1, C3, P5) zeigen sich auch im 2P-Spiel.

## Open Questions

- Soll die Matrix in CI laufen (als Regression-Test) oder nur manuell?
- Wollen wir eine "Schwierigkeitsgraduierung" pro Szenario (wie viele Bots sollten es lösen)?
- Werden nach Bot-Verbesserungen neue Szenarien automatisch hinzugefügt, oder ist die Liste stabil?
