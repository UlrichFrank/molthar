## ADDED Requirements

### Requirement: Gezieltes Nehmen nützlicher Perlen
Das System SHALL in allen Bots (außer IrrnisBot) Perlen bevorzugen, deren Wert in `computeNeededValues()` enthalten ist. Nur Perlen die einen tatsächlichen Fortschritt bringen, sind primäre Kandidaten.

#### Scenario: Nützliche Perle vorhanden — wird bevorzugt
- **WHEN** Portal-Karte braucht Wert 5 und Slot 2 enthält eine 5
- **THEN** wählt der Bot Slot 2 (oder Softmax unter allen nützlichen Slots)

#### Scenario: Keine nützliche Perle im Markt
- **WHEN** kein Perlenslot enthält einen Wert aus neededValues
- **THEN** nimmt der Bot keine Perle aus dem Markt (Fallback-Logik greift)

### Requirement: Fallback auf replacePearlSlots
Das System SHALL `replacePearlSlots` als primären Fallback verwenden, wenn keine Perle im Markt nützlich ist und entweder die Hand voll ist oder keine urgenten Perlen vorhanden sind.

#### Scenario: Kein nützlicher Slot, Hand voll
- **WHEN** neededValues ∩ pearlSlots = leer, Hand == handLimit
- **THEN** spielt der Bot `replacePearlSlots` statt eine Perle zu nehmen

#### Scenario: Kein nützlicher Slot, Hand hat Platz, aber Deck leer
- **WHEN** neededValues ∩ pearlSlots = leer, Hand < handLimit, pearlDeck leer
- **THEN** spielt der Bot `replacePearlSlots` oder endTurn

### Requirement: Handlimit-Bewusstsein
Das System SHALL vor dem Nehmen einer Perle prüfen, ob die Hand bereits voll ist. Falls ja, wird die Perle nur genommen, wenn mindestens eine Handkarte nutzlos ist (Wert nicht in neededValues für keine Portal-Karte).

#### Scenario: Hand voll, nutzlose Karte vorhanden — Perle nehmen erlaubt
- **WHEN** Hand == handLimit, neededValues enthält Wert X, Hand enthält Karte Y (Y nicht in neededValues)
- **THEN** darf der Bot Perle X nehmen (Y wird später beim Discard weggeworfen)

#### Scenario: Hand voll, alle Karten nützlich — keine Perle nehmen
- **WHEN** Hand == handLimit, alle Handkarten haben Werte in neededValues
- **THEN** nimmt der Bot KEINE Perle — spielt stattdessen replacePearlSlots oder endTurn

### Requirement: Urgency-Fallback für seltene Perlen
Das System SHALL bei leerer neededValues-Menge (alle Portal-Karten zahlbar oder kein Portal) oder wenn keine nützliche Perle im Markt ist und Hand Platz hat, Perlen mit hohem Urgency-Score (selten im Deck) als sekundäre Option in Betracht ziehen.

#### Scenario: Keine Zielkarten, aber seltene Perle verfügbar
- **WHEN** Portal leer und Deck hat fast keine Perlen einer bestimmten Sorte
- **THEN** kann Bot diese seltene Perle als "Vorrat" nehmen (urgency > 0.6)

### Requirement: IrrnisBot — Handlimit-Schutz
Das System SHALL auch in IrrnisBot verhindern, dass eine Perle genommen wird wenn Hand voll und alle Handkarten nützlich sind. Ansonsten bleibt IrrnisBot zufällig.

#### Scenario: IrrnisBot schützt nützliche Handkarten
- **WHEN** IrrnisBot, Hand voll, alle Karten nützlich für Portal
- **THEN** wählt IrrnisBot keine takePearlCard-Aktion aus dem Kandidatenpool
