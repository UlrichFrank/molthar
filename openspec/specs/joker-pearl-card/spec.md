# joker-pearl-card Specification

## Purpose
TBD - created by archiving change joker-perlenkarte. Update Purpose after archive.
## Requirements
### Requirement: Joker-Perlenkarte existiert als Perlenkarten-Variante
Das System SHALL eine Joker-Perlenkarte unterstützen, die durch `isJoker: true` im `PearlCard`-Typ gekennzeichnet ist. Sie hat keinen festen Wert; der Spieler wählt den gewünschten Wert (1–8) zum Aktivierungszeitpunkt.

#### Scenario: Joker-Karte hat keinen festen Wert
- **WHEN** eine Joker-Perlenkarte im System existiert
- **THEN** ist ihr `value`-Feld nicht für die Kostenberechnung maßgeblich
- **AND** der Spieler kann beim Bezahlen jeden Wert 1–8 wählen

#### Scenario: Joker-Karte wird mit Bild `PerlenkarteJoker.png` dargestellt
- **WHEN** eine Joker-Perlenkarte auf der Hand oder im Auslegebereich sichtbar ist
- **THEN** wird das Bild `PerlenkarteJoker.png` angezeigt

### Requirement: Joker-Perlenkarte erfordert 1 Diamant beim Einsatz
Wenn ein Spieler eine Joker-Perlenkarte zur Aktivierung eines Charakters einsetzt, MUSS er zusätzlich 1 Diamant ausgeben. Joker-Karte und Diamant werden auf die jeweiligen Ablagestapel gelegt.

#### Scenario: Diamant-Abzug bei Joker-Nutzung
- **WHEN** ein Spieler eine Joker-Karte in einer `PaymentSelection` mit gewähltem Wert einsetzt
- **THEN** wird 1 Diamant (`diamondCards`) des Spielers auf den `characterDiscardPile` gelegt
- **AND** die Joker-Karte selbst geht auf den `pearlDiscardPile`

#### Scenario: Keine ausreichenden Diamanten → Joker nicht nutzbar
- **WHEN** ein Spieler 0 Diamanten hat
- **THEN** kann er eine Joker-Karte nicht als Zahlungsmittel auswählen

### Requirement: Aktivierungsdialog ermöglicht Wertauswahl für Joker-Karten
Der Aktivierungsdialog SHALL für jede Joker-Karte in der Hand eine Wertauswahl (1–8) anbieten. Erst nach Wahl eines Wertes wird die Karte zur Zahlung gezählt. Der Dialog zeigt an, dass der Einsatz 1 Diamant kostet.

#### Scenario: Joker-Karte in der Hand zeigt Wertauswahl
- **WHEN** der Spieler eine Joker-Karte auf der Hand hat und den Aktivierungsdialog öffnet
- **THEN** wird die Joker-Karte mit einem Wert-Picker (1–8) dargestellt
- **AND** ein Hinweis „kostet 1 Diamant" ist sichtbar

#### Scenario: Joker ohne Wertauswahl zählt nicht zur Zahlung
- **WHEN** der Spieler eine Joker-Karte nicht ausgewählt hat (kein Wert gewählt)
- **THEN** ist sie nicht Teil der `PaymentSelection`

#### Scenario: Joker mit Wert deselektieren
- **WHEN** der Spieler einen bereits gewählten Joker-Wert erneut anklickt oder die Karte abwählt
- **THEN** wird die Karte aus der Auswahl entfernt und der gebundene Diamant freigegeben

### Requirement: Backend validiert Joker-Einsatz
Das Backend SHALL beim Empfang einer `PaymentSelection` mit einer Joker-Karte prüfen:
- Die Karte ist tatsächlich `isJoker: true`
- Der Spieler besitzt mindestens 1 freien Diamant (nach Abzug anderer Diamantkosten)
- Der gewählte Wert liegt zwischen 1 und 8

#### Scenario: Gültige Joker-Auswahl wird akzeptiert
- **WHEN** der Spieler eine Joker-Karte mit Wert 5 und ausreichend Diamanten einreicht
- **THEN** ist der Move gültig und der Charakter wird aktiviert

#### Scenario: Joker ohne Diamant wird abgelehnt
- **WHEN** der Spieler eine Joker-Karte einreicht, hat aber keine freien Diamanten
- **THEN** gibt das Backend `INVALID_MOVE` zurück

#### Scenario: Joker mit ungültigem Wert wird abgelehnt
- **WHEN** der Spieler eine Joker-Karte mit Wert 0 oder 9 einreicht
- **THEN** gibt das Backend `INVALID_MOVE` zurück

