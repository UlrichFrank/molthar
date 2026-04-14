## ADDED Requirements

### Requirement: Keine Überzahlung beim Aktivieren einer Charakterkarte
Der Aktivierungsdialog SHALL den Aktivierungs-Button deaktivieren, wenn die ausgewählten Zahlungskarten die Kosten erfüllen, aber mindestens eine ausgewählte Karte ohne Verlust der Kostenerfüllung entfernt werden könnte (Überzahlung). Das Backend SHALL eine solche Auswahl mit `INVALID_MOVE` ablehnen.

#### Scenario: Button deaktiviert bei Überzahlung
- **WHEN** der Spieler mehr Handkarten auswählt als zur Kostenerfüllung notwendig sind
- **THEN** ist der Aktivierungs-Button deaktiviert
- **AND** es erscheint ein Hinweis "Zu viele Karten ausgewählt"

#### Scenario: Button aktiv bei exakter Zahlung
- **WHEN** der Spieler genau die Karten auswählt, die zur Kostenerfüllung mindestens notwendig sind
- **THEN** ist der Aktivierungs-Button aktiv

#### Scenario: Backend lehnt Überzahlung ab
- **WHEN** der Move `activatePortalCard` mit einer überzähligen `PaymentSelection`-Liste aufgerufen wird
- **THEN** gibt der Move `INVALID_MOVE` zurück und der Spielzustand bleibt unverändert

#### Scenario: Kein Effekt auf ungültige Auswahl
- **WHEN** die ausgewählten Karten die Kosten nicht erfüllen
- **THEN** bleibt der Button deaktiviert (bestehende Logik unverändert)
