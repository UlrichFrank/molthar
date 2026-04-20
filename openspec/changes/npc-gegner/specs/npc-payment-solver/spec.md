## ADDED Requirements

### Requirement: Payment Solver findet alle gültigen Zahlungskombinationen
Das Modul `botPaymentSolver.ts` in `shared/src/game/` SHALL eine Funktion `findValidPayments(hand, cost, abilities?)` bereitstellen, die alle Teilmengen der Hand zurückgibt, die die gegebenen Kosten erfüllen. Die Validierung MUSS die bestehende `validateCost()`-Funktion aus `costCalculation.ts` nutzen.

#### Scenario: Gültige Kombinationen gefunden
- **WHEN** Hand ist [3, 5, 5, 6] und Kosten sind "Summe 10"
- **THEN** gibt findValidPayments [[5,5], [4,6]] (alle gültigen Teilmengen) zurück

#### Scenario: Keine gültige Kombination
- **WHEN** Hand ist [1, 2, 3] und Kosten sind "Wert 7"
- **THEN** gibt findValidPayments [] zurück

#### Scenario: Abilities werden berücksichtigt
- **WHEN** Spieler hat Ability `onesCanBeEights` und Hand enthält eine 1
- **THEN** wird die 1 bei der Prüfung als 8 behandelt und entsprechende Kombinationen eingeschlossen

### Requirement: chooseBestPayment wählt strategisch unter gültigen Kombinationen
Das Modul SHALL eine Funktion `chooseBestPayment(combinations, strategy, hand?)` bereitstellen, die nach der Strategie eine Zahlungskombination auswählt.

#### Scenario: random-Strategie wählt zufällig
- **WHEN** strategy ist 'random' und mehrere Kombinationen vorhanden
- **THEN** wird eine zufällige Kombination zurückgegeben

#### Scenario: greedy-Strategie wählt kleinste Kombination
- **WHEN** strategy ist 'greedy'
- **THEN** wird die Kombination mit den wenigsten/niedrigsten Perlenwerten gewählt (günstigste Zahlung)

#### Scenario: diamond-Strategie wählt niedrigste Werte
- **WHEN** strategy ist 'diamond'
- **THEN** wird die Kombination mit der kleinsten Summe der Perlenwerte gewählt

#### Scenario: efficient-Strategie erhält beste Restkarten
- **WHEN** strategy ist 'efficient' und hand übergeben
- **THEN** wird die Kombination gewählt, bei der die verbleibenden Handkarten den höchsten Gesamtwert haben

#### Scenario: aggressive-Strategie wie greedy
- **WHEN** strategy ist 'aggressive'
- **THEN** verhält sich wie 'greedy' (Zahlungsstrategie ist nicht strategierelevant für Ralf)

### Requirement: Payment Solver ist unabhängig testbar
Das Modul SHALL keine Abhängigkeit zu boardgame.io, Backend oder React haben. Es MUSS mit `pnpm test` im shared-Paket testbar sein.

#### Scenario: Unit-Tests laufen isoliert
- **WHEN** `cd shared && pnpm test -- --run botPaymentSolver.test.ts` ausgeführt wird
- **THEN** laufen alle Tests erfolgreich ohne Server oder Browser
