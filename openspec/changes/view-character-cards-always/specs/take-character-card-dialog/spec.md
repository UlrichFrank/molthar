## ADDED Requirements

### Requirement: Auslage-Charakterkarten sind immer als Vorschau anklickbar
Das System SHALL beim Klick auf eine Charakterkarte in der Auslage (`auslage-card`, id < 2) immer eine Reaktion zeigen — unabhängig davon ob der Spieler am Zug ist oder noch Aktionen hat. Wenn der Spieler nicht am Zug ist oder keine Aktionen mehr hat, SHALL eine read-only Vorschau (`CharacterTakePreviewDialog` ohne „Nehmen"-Button) geöffnet werden.

#### Scenario: Klick auf Auslagekarte außerhalb des eigenen Zugs — Vorschau öffnet sich
- **WHEN** der Spieler auf eine Charakterkarte in der Auslage klickt
- **AND** `isActive === false`
- **THEN** öffnet sich `CharacterTakePreviewDialog` mit der Karte (faceDown=false) ohne „Nehmen"-Button, nur „Schließen"

#### Scenario: Klick auf Auslagekarte bei ausgeschöpften Aktionen — Vorschau öffnet sich
- **WHEN** der Spieler auf eine Charakterkarte in der Auslage klickt
- **AND** `isActive === true` aber `actionCount >= maxActions`
- **THEN** öffnet sich `CharacterTakePreviewDialog` mit der Karte (faceDown=false) ohne „Nehmen"-Button, nur „Schließen"

#### Scenario: Klick auf Auslagekarte bei aktivem Zug mit Aktionen — bisheriges Verhalten
- **WHEN** der Spieler auf eine Charakterkarte in der Auslage klickt
- **AND** `isActive === true` und `actionCount < maxActions`
- **THEN** öffnet sich der Vorschau- oder Austauschdialog wie bisher (keine Änderung)
