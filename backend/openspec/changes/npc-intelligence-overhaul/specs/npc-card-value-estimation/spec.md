## ADDED Requirements

### Requirement: effectiveCardValue berechnet Kartenwert mit Fähigkeitsbonus
Das System SHALL eine Funktion `effectiveCardValue(card, G, playerID, strategy)` bereitstellen, die `card.powerPoints` um einen fähigkeitsabhängigen Bonus ergänzt. Der Bonus reflektiert den strategischen Wert der Fähigkeit im aktuellen Spielzustand.

#### Scenario: Karte ohne Fähigkeit
- **WHEN** eine Karte keine Fähigkeiten hat
- **THEN** gibt `effectiveCardValue` exakt `card.powerPoints` zurück

#### Scenario: threeExtraActions mit weiteren bezahlbaren Karten
- **WHEN** eine Karte `threeExtraActions` hat UND der Spieler mindestens eine weitere bezahlbare Portal-Karte besitzt
- **THEN** ist der Bonus ≥ 4 (stark positiv)

#### Scenario: threeExtraActions ohne weitere bezahlbare Karten
- **WHEN** eine Karte `threeExtraActions` hat, aber keine anderen Portal-Karten bezahlbar sind
- **THEN** ist der Bonus ≤ 1 (kaum Mehrwert)

#### Scenario: oneExtraActionPerTurn skaliert mit Spielphase
- **WHEN** `G.roundNumber` niedrig ist (frühes Spiel)
- **THEN** ist der Bonus für `oneExtraActionPerTurn` höher als bei hohem `roundNumber`

#### Scenario: discardOpponentCharacter gegen führenden Gegner
- **WHEN** mindestens ein Gegner eine bezahlbare Karte im Portal hat
- **THEN** ist der Bonus für `discardOpponentCharacter` ≥ 3

#### Scenario: Synergist-Strategie wertet Fähigkeitskombinationen höher
- **WHEN** `strategy === 'synergy'` UND der Spieler bereits `threesCanBeAny` aktiv hat
- **THEN** ist der Bonus für `anyAdditionalCardActions` um mindestens +4 höher als bei anderen Strategien

### Requirement: Rundfortschritt als Skalierungsfaktor
Das System SHALL `roundProgress = G.roundNumber / maxExpectedRounds` berechnen und für zeitabhängige Fähigkeitsboni verwenden. `maxExpectedRounds` = 10 als Standardwert.

#### Scenario: Frühes Spiel (roundProgress < 0.3)
- **WHEN** `roundProgress < 0.3`
- **THEN** werden dauerhafte Fähigkeiten (`oneExtraActionPerTurn`, `handLimitPlusOne`) mit vollem Bonus bewertet

#### Scenario: Spätes Spiel (roundProgress > 0.7)
- **WHEN** `roundProgress > 0.7`
- **THEN** werden dauerhafte Fähigkeiten mit reduziertem Bonus (≤ 50%) bewertet
