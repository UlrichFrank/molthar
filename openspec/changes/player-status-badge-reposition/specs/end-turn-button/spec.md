## ADDED Requirements

### Requirement: End-Turn-Button Sichtbarkeit
Der Button SHALL ausschließlich dann gerendert werden, wenn alle Aktionen des aktiven Spielers verbraucht sind. Andernfalls SHALL er überhaupt nicht im DOM erscheinen.

#### Scenario: Button erscheint bei erschöpften Aktionen
- **WHEN** `isActive === true` und `actionCount >= maxActions`
- **THEN** wird der Button gerendert und ist klickbar

#### Scenario: Button erscheint nicht bei laufenden Aktionen
- **WHEN** `isActive === true` und `actionCount < maxActions`
- **THEN** wird `null` zurückgegeben (kein DOM-Element)

#### Scenario: Button erscheint nicht für inaktive Spieler
- **WHEN** `isActive === false`
- **THEN** wird `null` zurückgegeben

### Requirement: End-Turn-Button Aktion
Ein Klick auf den Button SHALL `onEndTurn()` aufrufen.

#### Scenario: Klick ruft Callback auf
- **WHEN** der Button sichtbar ist und der Benutzer klickt
- **THEN** wird `onEndTurn()` genau einmal aufgerufen

### Requirement: End-Turn-Button Erscheinungsbild
Der Button SHALL optisch zum Spielstil passen (roter Hintergrund, weiße Schrift, abgerundete Ecken) und einen hover-Effekt haben.

#### Scenario: Roter Button mit hover
- **WHEN** der Button angezeigt wird
- **THEN** hat er einen roten Hintergrund (`#ef4444`), weißen Text und beim Hover einen dunkleren Ton
