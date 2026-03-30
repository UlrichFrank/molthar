## ADDED Requirements

### Requirement: Frontend-gesteuerte Kostenmodifikatoren
Das Spiel SHALL Kostenvalidierungs-Modifikationen durch Charakter-Fähigkeiten unterstützen, indem diese bereits im UI vom Spieler zusammengestellt werden. Wenn ein Spieler eine aktive Fähigkeit hat, die Perlenwert-Anforderungen verändert, SHALL er im `CharacterActivationDialog` virtuelle Anpassungen vornehmen können.

#### Scenario: Wildcard-Fähigkeit onesCanBeEights
- **WHEN** ein Spieler mit der Fähigkeit `onesCanBeEights` versucht, einen Charakter zu aktivieren
- **THEN** kann er im UI explizit eine 1-Perle auswählen und sie als 8-Perle deklarieren
- **AND** das Frontend sendet diese manipulierte Perle als Teil der Bezahlung (`PaymentSelection`) an das Backend
- **AND** das Backend verifiziert, dass die 1 tatsächlich in der Hand war und die Fähigkeit aktiv ist

#### Scenario: Wildcard-Fähigkeit threesCanBeAny
- **WHEN** ein Spieler mit der Fähigkeit `threesCanBeAny` versucht, einen Charakter zu aktivieren
- **THEN** kann er im UI explizit eine 3-Perle auswählen und sie in einen beliebigen Wert (1–8) umwandeln
- **AND** das Backend verifiziert, dass eine 3-Perle verwendet wurde und die Fähigkeit aktiv ist

#### Scenario: Diamant-Modulations-Fähigkeit decreaseWithPearl
- **WHEN** ein Spieler mit der Fähigkeit `decreaseWithPearl` versucht, einen Charakter zu aktivieren
- **THEN** kann er im UI für jede ausgewählte Perlenkarte festlegen, ob ein Diamant zur Wertreduktion eingesetzt wird
- **AND** der Wert sinkt um 1, wobei der Mindestwert 1 nicht unterschritten werden darf
- **AND** das Backend verifiziert, dass der Spieler ausreichend Diamanten für alle Reduzierungen besitzt und die Fähigkeit aktiv ist

### Requirement: Manuell hinzugefügte gedruckte Perlenwerte
Das Spiel SHALL auf Charakterkarten aufgedruckte Perlenwerte oder Wildcards erkennen und anwenden, indem der Spieler sie manuell zu seiner Bezahlhand hinzufügt. 

#### Scenario: Charakterkarte mit aufgedrucktem Perlenwert
- **WHEN** ein Spieler eine aktivierte Karte mit `numberAdditionalCardActions` (z.B. Wert 5) besitzt
- **THEN** bietet ihm das UI an, diese "virtuelle 5" zur Bezahlung hinzuzufügen
- **AND** das Backend akzeptiert diese Karte als Teil der Bezahlhand, konsumiert dafür aber keine echte Handkarte

#### Scenario: Charakterkarte mit aufgedrucktem Wildcard
- **WHEN** ein Spieler eine aktivierte Karte mit `anyAdditionalCardActions` (Wildcard ?) besitzt
- **THEN** bietet ihm das UI an, diesen Wildcard als einen bestimmten manuell gewählten Wert (1-8) zur Bezahlung hinzuzufügen
- **AND** das Backend verifiziert den Anspruch und leitet den Wert an die Kostenberechnung weiter

### Requirement: Strenge Trennung von Backend-Validierung und Move-Prüfung
Die originale Kostenvalidierungslogik (`validateCostPayment`) SHALL von diesen Mutationen isoliert bleiben. 

#### Scenario: `activatePortalCard` verarbeitet `PaymentSelection`
- **WHEN** das Frontend einen Kauf requestet
- **THEN** sendet es ein Array von `PaymentSelection`-Objekten statt simpler Karten-Indizes
- **AND** der Move-Handler `activatePortalCard` führt einen Sicherheits-Check (Missbrauchsprävention) aller Deklarationen durch
- **AND** er generiert Array von virtuellen `PearlCard`s und übergibt diese an `validateCostPayment`
- **AND** schlägt die Validierung fehl, wird der Move als `INVALID_MOVE` abgelehnt

