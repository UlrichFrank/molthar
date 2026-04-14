## Context

Der gesamte Diamond-Mechanismus durchzieht drei Schichten: Spielzustand (`types.ts`), Game-Logic (`index.ts`) und UI-Komponenten. Aktuell existieren sieben Karten mit `diamondsReward > 0` (Kobold, Zwerg, Red Sonja usw.) sowie eine Karte mit Diamond-Kosten (Captain Hook). Die Abilities `decreaseWithPearl` und `tradeTwoForDiamond` nutzen ebenfalls Diamanten.

Der `characterDeck`/`characterDiscardPile`-Reshuffle-Mechanismus ist bereits implementiert — Diamond-Karten die in den `characterDiscardPile` wandern, werden automatisch korrekt behandelt.

## Goals / Non-Goals

**Goals:**
- `player.diamonds: number` vollständig durch `player.diamondCards: CharacterCard[]` ersetzen
- Alle Diamond-Operationen ziehen aus / geben zurück in den Charakterstapel
- UI zeigt weiterhin die Anzahl (keine Kartenidentitäten sichtbar)
- `fix-diamond-cost-payment`-Change kann nahtlos auf dem neuen Modell aufbauen

**Non-Goals:**
- Sichtbarkeits-Isolierung (kein `playerView` — Kartenidentitäten im State sind wie bisher für alle sichtbar, aber die UI zeigt sie nicht an)
- Änderungen am Reshuffle-Mechanismus
- Änderungen an der `diamondsReward`-Konfiguration in `cards.json`

## Decisions

### Decision 1: Direktes Ersetzen statt Wrapper

**Gewählt:** `player.diamonds` wird vollständig entfernt und durch `player.diamondCards: CharacterCard[]` ersetzt. Kein Kompatibilitäts-Getter.

**Warum:** Es gibt keinen externen Consumer (kein öffentliches API, kein Persistenz-Schema außer boardgame.io-State). TypeScript-Fehler führen direkt zu allen Stellen die angepasst werden müssen. Sauberer als eine Übergangs-Abstraktionsschicht.

### Decision 2: Ausgabe-Reihenfolge (welche Karte wird genommen?)

**Gewählt:** `player.diamondCards.pop()` — die zuletzt erworbene Karte wird zuerst ausgegeben (LIFO).

**Warum:** Im physischen Spiel nimmt der Spieler eine beliebige Karte aus seinem Vorrat. LIFO ist die einfachste Implementierung und entspricht dem Stapel-Konzept. Da alle Karten verdeckt und gleichwertig sind, spielt die Reihenfolge spielerisch keine Rolle.

### Decision 3: Diamond-Karten sind nicht wählbar

**Gewählt:** Der Spieler wählt keine spezifische Diamond-Karte aus — die Auswahl erfolgt automatisch (pop).

**Warum:** Die Karten sind verdeckt und semantisch identisch (alle "wert" 1 Diamant). Eine Auswahlmöglichkeit wäre UX-Overhead ohne spielerischen Mehrwert.

### Decision 4: tradeTwoForDiamond zieht vom characterDeck

**Gewählt:** Wenn `tradeTwoForDiamond` ausgelöst wird, wird 1 Karte vom `characterDeck` gezogen (mit Reshuffle wenn leer) und in `player.diamondCards` gelegt.

**Warum:** Entspricht der Originalmechanik — ein Diamant ist eine Charakterkarte, egal woher er kommt.

## Risks / Trade-offs

- **Breaking Change im State:** Laufende Spiele (falls Persistenz aktiv) wären inkompatibel. Da `game-persistence` existiert, sollte geprüft werden ob ein State-Migration-Pfad nötig ist. → Einfachste Lösung: Spieler müssen laufende Runden neu starten.
- **characterDeck-Depletion:** Karten die als Diamanten gehalten werden, stehen nicht im Portal zur Verfügung. Bei vielen gleichzeitigen Diamond-Rewards könnte der Stapel schneller leer laufen. Das ist die korrekte Originalmechanik — kein Bug.
- **fix-diamond-cost-payment muss nach diesem Change aktualisiert werden:** Tasks 1.2, 2.1, 3.1, 3.2, 4.x in diesem Change referenzieren `player.diamonds` — sie müssen auf `player.diamondCards.length` umgeschrieben werden.

## Open Questions

- Soll die Anzeige in Zukunft tatsächlich Kartenrücken zeigen statt nur eine Zahl? (Nice-to-have, out of scope für diesen Change)
