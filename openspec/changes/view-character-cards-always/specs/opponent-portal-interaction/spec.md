## ADDED Requirements

### Requirement: Eigene Portalkarten sind immer als Detailansicht anklickbar
Das System SHALL beim Klick auf eine eigene Portalkarte (`portal-slot`) immer eine Reaktion zeigen — unabhängig davon ob der Spieler am Zug ist oder noch Aktionen hat. Wenn der Spieler aktiv und Aktionen vorhanden → Aktivierungsdialog (bisheriges Verhalten). Andernfalls SHALL die `ActivatedCharacterDetailView` als read-only Detailansicht geöffnet werden, identisch zur Ansicht für gegnerische Portalkarten.

#### Scenario: Klick auf eigene Portalkarte außerhalb des eigenen Zugs — Detailansicht öffnet sich
- **WHEN** der Spieler auf eine seiner Portalkarten klickt
- **AND** `isActive === false`
- **THEN** öffnet sich die `ActivatedCharacterDetailView` mit den Daten dieser Portalkarte

#### Scenario: Klick auf eigene Portalkarte bei ausgeschöpften Aktionen — Detailansicht öffnet sich
- **WHEN** der Spieler auf eine seiner Portalkarten klickt
- **AND** `isActive === true` aber `actionCount >= maxActions`
- **THEN** öffnet sich die `ActivatedCharacterDetailView` mit den Daten dieser Portalkarte

#### Scenario: Klick auf eigene Portalkarte bei aktivem Zug mit Aktionen — bisheriges Verhalten
- **WHEN** der Spieler auf eine seiner Portalkarten klickt
- **AND** `isActive === true` und `actionCount < maxActions`
- **THEN** öffnet sich der Aktivierungsdialog wie bisher (keine Änderung)

#### Scenario: Schließen der Detailansicht für eigene Portalkarte
- **WHEN** die `ActivatedCharacterDetailView` einer eigenen Portalkarte offen ist und der Spieler Escape drückt oder den Close-Button anklickt
- **THEN** schließt sich die Detailansicht
