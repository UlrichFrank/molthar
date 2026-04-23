## ADDED Requirements

### Requirement: Bots berechnen Erwartungswert von Blind-Draws
Das System SHALL Funktionen `expectedBlindPearlScore()` und `expectedBlindCharValue()` bereitstellen, die den Erwartungswert eines blinden Zugs aus dem jeweiligen Deck berechnen.

#### Scenario: Blind-Pearl-Erwartungswert aus Deck
- **WHEN** `pearlDeck.length > 0`
- **THEN** berechnet `expectedBlindPearlScore()` den Durchschnitt von `scorePearlSlot(card.value, ...)` über alle Karten im Deck

#### Scenario: Blind-Char-Erwartungswert ist deterministisch
- **WHEN** `characterDeck.length > 0`
- **THEN** gibt `expectedBlindCharValue()` den `effectiveCardValue` von `characterDeck.at(-1)` zurück (Bot sieht das Deck)

#### Scenario: Leeres Deck
- **WHEN** das Deck leer ist
- **THEN** geben beide Funktionen 0 zurück

### Requirement: Bots ziehen blind wenn sinnvoller als sichtbare Optionen
Ein Bot SHALL `takePearlCard(-1)` wählen, wenn `expectedBlindPearlScore() > 1.1 × bestVisibleSlotScore`. Ein Bot SHALL `replacePearlSlots()` wählen, wenn alle sichtbaren Slots einen Score unter `0.3 × expectedBlindPearlScore()` haben.

#### Scenario: Blind-Zug statt nutzloser sichtbarer Perle
- **WHEN** kein sichtbarer Pearl-Slot den Effort der Zielkarte reduziert UND Deck hat nützliche Werte
- **THEN** zieht der Bot blind (`takePearlCard(-1)`)

#### Scenario: Alle Slots ersetzen bei systematisch schlechter Auslage
- **WHEN** alle 4 Slots einen Score unter dem Schwellwert haben
- **THEN** wählt der Bot `replacePearlSlots()` um neue Karten aufzudecken

#### Scenario: Kein Blind-Draw bei guter sichtbarer Option
- **WHEN** mindestens ein sichtbarer Slot einen Score ≥ `1.1 × expectedBlindPearlScore()` hat
- **THEN** wird der sichtbare Slot bevorzugt (Gewissheit vor Erwartungswert)

### Requirement: Bots berücksichtigen Deck-Top für Charakterkarten-Entscheidung
Beim Vergleich von Display-Karten SHALL der Bot auch `characterDeck.at(-1)` (die nächste blind ziehbare Karte) als Option berücksichtigen.

#### Scenario: Deck-Top besser als alle Display-Karten
- **WHEN** `effectiveCardValue(characterDeck.at(-1)) > effectiveCardValue(beste Display-Karte)`
- **THEN** wird die Deck-Top-Karte als bevorzugte Option gewählt (`takeCharacterCard(-1)`)

#### Scenario: Display-Karte bevorzugt bei Gleichstand
- **WHEN** Deck-Top und Display-Karte haben ähnlichen Wert
- **THEN** wird die sichtbare Display-Karte bevorzugt (kein unnötiges Risiko)
