## ADDED Requirements

### Requirement: Vorschau-Dialog beim Nehmen aus der Auslage
Das System SHALL vor dem Ausführen des `takeCharacterCard`-Moves aus der Auslage einen Dialog öffnen, der die Karte vollständig (Vorderseite) darstellt. Der Spieler MUSS explizit bestätigen oder abbrechen können.

#### Scenario: Dialog öffnet bei Klick auf Auslage-Karte
- **WHEN** der Spieler auf eine Charakterkarte in der Auslage klickt
- **AND** das Portal des Spielers noch nicht belegt ist
- **THEN** öffnet sich ein Dialog mit der vollständigen Vorderseite der Karte sowie einem Bestätigen- und einem Abbrechen-Button

#### Scenario: Move wird erst nach Bestätigung ausgelöst
- **WHEN** der Spieler im Vorschau-Dialog den Bestätigen-Button drückt
- **THEN** wird der `takeCharacterCard`-Move ausgeführt und der Dialog geschlossen

#### Scenario: Abbrechen schließt Dialog ohne Move
- **WHEN** der Spieler im Vorschau-Dialog den Abbrechen-Button drückt
- **THEN** wird kein Move ausgeführt und der Dialog geschlossen

---

### Requirement: Vorschau-Dialog beim Nehmen vom Stapel (Blind-Ziehen)
Das System SHALL vor dem Ausführen des `takeCharacterCard`-Moves vom Stapel einen Dialog öffnen. Standardmäßig wird die Kartenrückseite angezeigt. Hat der Spieler die Fähigkeit `previewCharacter`, wird stattdessen die Vorderseite angezeigt.

#### Scenario: Dialog zeigt Rückseite beim Blind-Ziehen
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** der Spieler NICHT die Fähigkeit `previewCharacter` hat
- **AND** das Portal des Spielers noch nicht belegt ist
- **THEN** öffnet sich ein Dialog mit der Kartenrückseite sowie einem Bestätigen- und einem Abbrechen-Button

#### Scenario: Dialog zeigt Vorderseite bei previewCharacter-Fähigkeit
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** der Spieler die Fähigkeit `previewCharacter` hat
- **AND** das Portal des Spielers noch nicht belegt ist
- **THEN** öffnet sich ein Dialog mit der Vorderseite der obersten Karte sowie einem Bestätigen- und einem Abbrechen-Button

---

### Requirement: Direkt-Austauschdialog bei belegtem Portal
Das System SHALL beim Klick auf eine Charakterkarte (Auslage oder Stapel), wenn das Portal des Spielers bereits belegt ist, den Austauschdialog direkt öffnen — ohne vorherigen separaten Vorschau-Schritt.

#### Scenario: Austauschdialog erscheint direkt bei belegtem Portal (Auslage)
- **WHEN** der Spieler auf eine Karte in der Auslage klickt
- **AND** das Portal des Spielers bereits belegt ist
- **THEN** öffnet sich der Austauschdialog (kein separater Vorschau-Dialog)

#### Scenario: Austauschdialog erscheint direkt bei belegtem Portal (Stapel)
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** das Portal des Spielers bereits belegt ist
- **THEN** öffnet sich der Austauschdialog (kein separater Vorschau-Dialog)

---

### Requirement: Blind-Pflichtaustausch — Karte offen, Abbrechen deaktiviert
Das System SHALL im Sonderfall, dass der Spieler blind vom Stapel zieht und das Portal bereits belegt ist (Zwangsaustausch ohne Wahlmöglichkeit), die gezogene Karte im Austauschdialog mit der **Vorderseite** anzeigen. Der Abbrechen-/Zurücklegen-Button MUSS deaktiviert sein.

#### Scenario: Gezogene Karte wird offen im Austauschdialog gezeigt
- **WHEN** ein Blind-Pflichtaustausch vorliegt (blind gezogen, Portal belegt, kein Wahlrecht)
- **THEN** zeigt der Austauschdialog die Vorderseite der gezogenen Karte

#### Scenario: Abbrechen-Button ist deaktiviert beim Blind-Pflichtaustausch
- **WHEN** ein Blind-Pflichtaustausch vorliegt
- **THEN** ist der Abbrechen-/Zurücklegen-Button im Dialog deaktiviert (nicht klickbar)

---

### Requirement: Einheitliches Dialog-Erscheinungsbild
Das System SHALL sicherstellen, dass der Vorschau-Dialog für Charakterkarten visuell und strukturell identisch mit den übrigen Dialogen (z. B. Aktivierungsdialog) ist.

#### Scenario: Dialog verwendet bestehende Dialog-Wrapper-Komponente
- **WHEN** der Vorschau-Dialog geöffnet ist
- **THEN** nutzt er dieselbe Dialog-Wrapper-Komponente und Kartendarstellungs-Komponente wie der Aktivierungsdialog
