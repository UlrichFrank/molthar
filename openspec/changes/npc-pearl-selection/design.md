## Context

Bots haben vollen Zugriff auf `G` (boardgame.io-Vollsicht), können also `pearlDeck`, `pearlDiscardPile`, alle Spieler-Hände und alle Portal-Karten lesen. Das ermöglicht exaktes Zählen statt Schätzen.

Aktueller Zustand:
- `GierBot`, `RalfBot`: `bestPearlSlotIndex()` — nimmt immer höchsten sichtbaren Perlenwert
- `EdelsteinBot`: `neededPearlValues()` — prüft nur `number`-Kosttypen, ignoriert `nTuple`, `sumAnyTuple`, etc.
- `WendelinBot`: `findPearlForTarget()` + `estimateEffort()` — funktionierender Ansatz, aber nicht wiederverwendbar
- `IrrnisBot`: zufällig — kein Handlungsbedarf

Das Problem: Zielkarten-Auswahl (wer soll aktiviert werden?) und Pearl-Auswahl (welche Perle nimmt der Bot?) sind nicht verbunden.

## Goals / Non-Goals

**Goals:**
- Gemeinsame `scorePearlSlot()`-Funktion mit drei Signalen: Helpfulness, Urgency, Contestedness
- Strategie-spezifische Gewichtungen statt einheitlicher Logik
- Explizite Verknüpfung: jeder Bot ermittelt Zielkarte → übergibt an Scorer
- WendelinBots `estimateEffort()` als shared utility (wird ohnehin schon von allen benötigt)

**Non-Goals:**
- Mehrzug-Planung ("in 3 Zügen brauche ich X") — zu komplex, falsche Abstraktionsebene
- Änderungen an Spielregeln, Moves oder Game State
- IrrnisBot-Verhalten ändern

## Decisions

### 1. Drei Signale, konfigurierbare Gewichtungen

```
score = w_help × helpfulness
      + w_urgency × urgency
      - w_contest × contestedness
```

**Helpfulness**: Effort-Reduktion durch diese Perle für die Zielkarte.
- `helpfulness = estimateEffort(ziel, hand) - estimateEffort(ziel, hand + pearl)`
- 0 wenn keine Hilfe, 1+ wenn Aufwand sinkt

**Urgency**: Wie knapp ist dieser Wert im Deck?
- `remaining = pearlDeck.filter(p => p.value === v).length`
- `urgency = 1 - remaining / Math.max(pearlDeck.length, 1)`
- Dämpfung nahe Reshuffle: wenn `pearlDeck.length < 4`, urgency × 0.5
  (bald gibt es sowieso neue Karten)

**Contestedness**: Wie viele andere Spieler würden von dieser Perle profitieren?
- Für jeden anderen Spieler: `estimateEffort` mit und ohne diese Perle für ihre beste Portalzielkarte
- Gewichtung nach Zugreihenfolge: nächster Spieler zählt doppelt
- `contestedness = Σ(weight_i × benefit_i)`

**Warum nicht eine komplexere Formel?** Die drei Signale sind direkt aus dem Game State ableitbar, erklärbar und testbar. Mehrzug-Lookahead wäre teuer und für dieses Spiel übertrieben.

### 2. `estimateEffort()` in shared package verschieben

Aktuell nur in `WendelinBot`. Wird für Signal 1 und 3 benötigt → nach `botPearlScorer.ts` (oder als eigene Export-Funktion in `botPaymentSolver.ts`).

**Entscheidung**: In neue Datei `botPearlScorer.ts`, nicht in `botPaymentSolver.ts` (andere Verantwortlichkeit).

### 3. Gewichtungen als Konstanten, nicht als Konfiguration

```typescript
const WEIGHTS: Record<NpcStrategy, PearlWeights> = {
  greedy:     { help: 3, urgency: 1.5, contest: 0.5 },
  efficient:  { help: 3, urgency: 2,   contest: 0.5 },
  diamond:    { help: 3, urgency: 1.5, contest: 0.5 },
  aggressive: { help: 2, urgency: 1.5, contest: 3   },
  random:     { help: 0, urgency: 0,   contest: 0   }, // nicht genutzt
};
```

**Warum Konstanten?** Keine Runtime-Konfiguration nötig, einfach zu tunen nach Playtests.

### 4. Jeder Bot ermittelt explizit seine Zielkarte

Die Zielkarten-Logik ist bereits in den Bots vorhanden (für Charakter-Auswahl). Sie wird in eine `pickTargetCard(G, playerID, strategy)` Hilfsfunktion in `botPearlScorer.ts` extrahiert und von Pearl-Auswahl und Charakter-Auswahl gleichermaßen genutzt.

Fallback: wenn kein Portal und kein Charakter-Display → `scorePearlSlot` ohne `helpfulness` (nur urgency + contestedness).

## Risks / Trade-offs

- [Bots sehen vollständiges Deck] → Das ist eine bekannte boardgame.io-Eigenschaft bei AI-Bots; akzeptiert. Urgency-Signal wäre ohne Deck-Einsicht nicht möglich.
- [estimateEffort ist eine Heuristik, keine exakte Lösung] → Für viele Kosttypen (z.B. `run`, `evenTuple`) ist der Effort-Schätzer grob. Das ist akzeptabel — Bots müssen nicht perfekt sein, nur besser als zufällig.
- [Gewichtungen müssen getuned werden] → Startwerte sind vernünftig, aber erst nach Playtests zu bewerten. Konstanten sind leicht anpassbar.

## Open Questions

- Soll `pickTargetCard()` auch Charakterkarten aus dem Display (`characterSlots`) einbeziehen, oder nur Portalzielkarten? (Empfehlung: Portal-first, Display als Fallback — wie bisher)
