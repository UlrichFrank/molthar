## Context

Bots haben vollen `G`-Zugriff (boardgame.io-Vollsicht). Die bisherige Infrastruktur (Pearl-Scoring, `estimateEffort`, `canPayCard`) ist stabil und wird hier aufgebaut. Das zentrale Problem: jeder `strategy()`-Aufruf ist stateless — der Bot "weiß" nicht, was er in dieser Runde schon getan hat, und kann keine Aktionsketten planen.

Aktueller Entscheidungsbaum (alle smart Bots):
```
canActivate? → aktiviere (höchste Punkte)
portalNichtVoll? → nimm Charakterkarte
→ nimm beste Perle
```

Fähigkeiten spielen keine Rolle. Aktivierungsreihenfolge ist zufällig. Kein Zugplan.

## Goals / Non-Goals

**Goals:**
- `effectiveCardValue()`: Kartenwert = Punkte + fähigkeitsabhängiger Bonus
- `turnPlan` in BotClient: Zugbeginn-Plan der pro Aktion abgearbeitet wird
- `planTurn()`: berechnet optimale Aktionssequenz für den Zug
- Aktivierungsreihenfolge: `threeExtraActions` zuerst, `changeHandActions` zuletzt
- Portal-Tausch wenn Display-Karte deutlich besser als schlechteste Portal-Karte
- Blind Draw + `replacePearlSlots` in Pearl-Entscheidung einbeziehen
- Endspiel-Modus ab `G.finalRound` oder Gegner nahe am Sieg
- Zwei neue Bots: Flinker Fritz (tempo) und Kluge Karla (synergy)

**Non-Goals:**
- MCTS / vollständige Lookahead-Suche — zu aufwändig für dieses Spiel
- IrrnisBot verändern — bleibt zufällig
- Änderungen an Spielregeln, Moves oder Game State
- Persistente Bot-Lernfähigkeit über Spiele hinweg

## Decisions

### 1. `turnPlan` im BotClient, nicht im Game State

Der Plan wird server-seitig in `BotClient.turnPlan: BotAction[]` gespeichert. Er wird bei `actionCount === 0` befüllt und per Schicht abgearbeitet. Wenn der Plan erschöpft ist oder eine unerwartete Gelegenheit auftaucht (z.B. `maxActions` hat sich durch `threeExtraActions` erhöht), wird er neu berechnet.

**Warum nicht im Game State?** Game State ist für Spiellogik reserviert. Bot-interne Planung ist Server-State.

**Warum Plan statt pure reactive?** Reaktive Bots können `threeExtraActions`-Ketten nicht planen — sie wissen beim ersten Aufruf nicht, dass sie nachher noch mehr Aktionen haben werden. Mit Plan: Bot plant zu Beginn "Aktion 1: threeExtraActions aktivieren → Aktion 2+3+4+5: kette weiteres".

### 2. `effectiveCardValue()` als additiver Bonus auf `powerPoints`

```typescript
effectiveCardValue(card, G, playerID, strategy) =
  card.powerPoints + abilityBonus(card.abilities, G, playerID, strategy)
```

Boni sind konservativ geschätzt damit `powerPoints` weiterhin die Hauptmetrik bleibt:

| Fähigkeit | Bonus | Begründung |
|---|---|---|
| `threeExtraActions` | +4 wenn weitere Karten aktivierbar, sonst +1 | 3 extra Aktionen ≈ 3 × avg_action_value |
| `oneExtraActionPerTurn` | `+3 × (1 - roundProgress)` | compounds, weniger wert spät |
| `threesCanBeAny` | +3 | sehr flexibel, fast immer nützlich |
| `anyAdditionalCardActions` | +3 | gedruckte Wildcard = gratis Perle |
| `numberAdditionalCardActions` | +2 | fester Perlenwert |
| `changeHandActions` | +2 wenn Hand ≤ 2 Karten nützlich | situational |
| `discardOpponentCharacter` | +3 wenn Gegner Portal mit bezahlbarer Karte hat | reaktiv |
| `onesCanBeEights` | +1 | nur nützlich bei passender Hand |
| `handLimitPlusOne` | +1 | kleiner Vorteil |

**Warum nicht Multiplikator?** Additiv ist einfacher zu tunen und verhindert dass Fähigkeitskarten immer dominieren.

### 3. `planTurn()`: Greedy-Sequenz statt exhaustiver Suche

Algorithmus:
```
1. Sammle alle aktivierbaren Portal-Karten mit effectiveCardValue
2. Sortiere: threeExtraActions zuerst, dann nach effectiveCardValue
3. Simuliere: aktiviere in dieser Reihenfolge (zähle Aktionen hoch)
4. Falls threeExtraActions aktiviert: re-evaluiere was nach +3 Aktionen möglich wird
5. Füge Pearl/Char-Aktionen für verbleibende Aktionen hinzu
6. changeHandActions als letzte Aktion wenn Karte im Portal und bezahlbar
```

Maximale Plantiefe: `maxActions` (nie mehr als 6+3=9 Schritte). Kein rekursiver Lookahead — nur eine Runde.

### 4. Portal-Tausch-Schwelle: 40% Wertvorteil

```
tauschen wenn:
  effectiveCardValue(beste Display-Karte) > 1.4 × effectiveCardValue(schlechteste Portal-Karte)
```

Schwelle variiert je nach Strategie: Tempo-Bot tauscht aggressiver (1.2×), Effizienz-Bot konservativer (1.6×).

### 5. Blind Draw: Erwartungswert aus Deck berechnen

```
E[blind_pearl] = Σ scorePearlSlot(deck_card.value, ...) / deck.length
E[blind_char]  = effectiveCardValue(characterDeck.at(-1), ...)  ← exakt, da Deck sichtbar
```

Blind Pearl ziehen wenn `E[blind_pearl] > 1.1 × best_visible_slot_score`.
`replacePearlSlots` wenn alle Slots `< 0.3 × E[blind_pearl]`.

### 6. Endspiel-Modus: Schwellen statt neuer Strategie

```
isEndgame = G.finalRound || max(opponent.powerPoints) >= 8

In Endspiel-Modus:
  - Aktiviere JEDE bezahlbare Karte (effectiveValue-Schwelle auf 0 senken)
  - Pearl-Urgency ×2
  - Portal-Tausch-Schwelle auf 1.0× (immer tauschen wenn besser)
```

### 7. Neue Bot-Identitäten

**Flinker Fritz** (`tempo`):
- `effectiveCardValue` mit +6 für `threeExtraActions`, +5 für `oneExtraActionPerTurn`
- Bevorzugt Karten mit `effort ≤ 1` (fast sofort bezahlbar)
- Hohe Portal-Tausch-Bereitschaft (1.2×)
- Zieht häufiger blind wenn Deck gut ist (Schwelle 1.05×)

**Kluge Karla** (`synergy`):
- Erkennt Fähigkeitskombinationen: `threesCanBeAny` + `anyAdditionalCardActions` = Synergiebonus +4
- `handLimitPlusOne` + `changeHandActions` = +3 zusätzlich
- Langzeitplanung: bevorzugt blaue Fähigkeiten über Punkte früh im Spiel
- Konservativerer Portal-Tausch (1.8×), wartet auf die "richtigen" Karten

## Risks / Trade-offs

- [turnPlan veraltet] Wenn ein Gegner eine Karte aus dem Portal entfernt (discardOpponentCharacter), kann der Plan ungültig werden → Mitigation: vor jeder Plan-Aktion validieren ob Karte noch im Portal
- [effectiveCardValue-Boni schlecht kalibriert] Zu hohe Boni machen alle Bots Fähigkeitskarten-Jäger → Mitigation: Boni konservativ starten, nach Playtests tunen; Konstanten sind leicht anpassbar
- [Chaining-Bugs] Nach threeExtraActions könnte Bot falsche Aktionskarte wählen → Mitigation: Simulationsschritt in planTurn validiert Zahlbarkeit zum geplanten Zeitpunkt
- [Performance] `planTurn()` läuft bei jedem Zugbeginn → Mitigation: maximal 9 Aktionen × kleine Kartensets → vernachlässigbar

## Open Questions

- Soll `Kluge Karla` aktiv Karten aus dem Display stehlen die andere Spieler für ihre Synergien brauchen? (defensiver Synergist)
- Wie soll der Debug-Log Turn-Pläne darstellen? (optional: Plan zu Zugbeginn ausgeben)
