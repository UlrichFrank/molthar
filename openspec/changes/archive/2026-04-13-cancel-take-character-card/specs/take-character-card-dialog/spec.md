## MODIFIED Requirements

### Requirement: Direkt-Austauschdialog bei belegtem Portal
Das System SHALL beim Klick auf eine Charakterkarte, wenn das Portal des Spielers bereits belegt ist, den Austauschdialog direkt öffnen — ohne vorherigen separaten Vorschau-Schritt. Der Dialog zeigt die neue Karte, die Portal-Karten zur Auswahl sowie einen „Verwerfen"-Button. Zusätzlich SHALL ein „Abbrechen"-Button angezeigt werden, wenn die Quelle eine offen ausliegende Karte aus der Auslage ist (`canCancel = true`). Bei einer blind gezogenen Stapelkarte SHALL kein „Abbrechen"-Button erscheinen (`canCancel = false`).

#### Scenario: Austauschdialog erscheint direkt bei belegtem Portal (Auslage) — mit Abbrechen
- **WHEN** der Spieler auf eine Karte in der Auslage klickt
- **AND** das Portal des Spielers bereits belegt ist
- **THEN** öffnet sich der Austauschdialog direkt (kein separater Vorschau-Dialog) und zeigt einen „Abbrechen"-Button

#### Scenario: Abbrechen schließt Dialog ohne Move (Auslage)
- **WHEN** der Spieler im Austauschdialog den „Abbrechen"-Button drückt
- **AND** die Quelle war eine offen ausliegende Karte
- **THEN** wird kein Move ausgeführt, die Karte bleibt in der Auslage, und der Dialog wird geschlossen

#### Scenario: Austauschdialog erscheint direkt bei belegtem Portal (Stapel) — ohne Abbrechen
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** das Portal des Spielers bereits belegt ist
- **THEN** öffnet sich der Austauschdialog direkt und zeigt KEINEN „Abbrechen"-Button

#### Scenario: Blind-Pflichtaustausch — kein Abbrechen möglich
- **WHEN** ein Blind-Pflichtaustausch vorliegt (blind gezogen, Portal belegt)
- **THEN** ist kein Abbrechen möglich; der Spieler muss eine Portalkarte ersetzen oder verwerfen
