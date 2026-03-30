## ADDED Requirements

### Requirement: Dialog öffnet sich automatisch bei Pending-Flag
Das Frontend SHALL den `StealOpponentHandCardDialog` anzeigen, wenn `G.pendingStealOpponentHandCard === true` und der lokale Spieler `ctx.currentPlayer` ist.

#### Scenario: Dialog öffnet sich für aktiven Spieler
- **WHEN** `G.pendingStealOpponentHandCard === true` und lokaler Spieler ist `ctx.currentPlayer`
- **THEN** wird der `StealOpponentHandCardDialog` gerendert

#### Scenario: Kein Dialog für andere Spieler
- **WHEN** `G.pendingStealOpponentHandCard === true` und lokaler Spieler ist NICHT `ctx.currentPlayer`
- **THEN** wird kein Dialog angezeigt

### Requirement: Stufe 1 — Spielerauswahl mit verdeckten Handkarten
Der Dialog SHALL in Stufe 1 alle Gegner anzeigen, die mindestens eine Handkarte haben. Pro Gegner werden `hand.length` verdeckte Kartenrückseiten gerendert (Wert nicht sichtbar). Der Spieler wählt einen Gegner durch Klick.

#### Scenario: Verdeckte Karten pro Gegner
- **WHEN** Dialog in Stufe 1 ist und Gegner hat `hand.length === 3`
- **THEN** werden 3 Kartenrückseiten für diesen Gegner angezeigt, keine Werte sichtbar

#### Scenario: Gegner ohne Handkarten ausgeblendet
- **WHEN** ein Gegner hat `hand.length === 0`
- **THEN** wird dieser Gegner nicht im Dialog angezeigt

#### Scenario: Klick auf Gegner wechselt zu Stufe 2
- **WHEN** Spieler klickt auf einen Gegner in Stufe 1
- **THEN** wechselt der Dialog zu Stufe 2 mit dem gewählten Gegner

### Requirement: Stufe 2 — Kartenauswahl mit aufgedeckten Handkarten
Nach Spielerauswahl SHALL der Dialog die Handkarten des gewählten Gegners vollständig aufgedeckt anzeigen. Der Spieler wählt eine Karte durch Klick.

#### Scenario: Aufgedeckte Karten des gewählten Gegners
- **WHEN** Dialog in Stufe 2 ist und gewählter Gegner hat 3 Handkarten
- **THEN** werden alle 3 Perlenkarten mit Wert sichtbar angezeigt

#### Scenario: Klick auf Karte löst Resolve-Move aus und schließt Dialog
- **WHEN** Spieler klickt auf eine Karte in Stufe 2
- **THEN** wird `resolveStealOpponentHandCard(targetPlayerId, handCardIndex)` aufgerufen und der Dialog schließt sich

#### Scenario: Zurück zu Stufe 1 möglich
- **WHEN** Dialog in Stufe 2 ist
- **THEN** gibt es eine "Zurück"-Schaltfläche, die zu Stufe 1 zurückkehrt (anderer Gegner wählen), ohne den Move aufzurufen

### Requirement: Dialog ist nicht abbrechbar
Der Dialog SHALL keine Schließen- oder Abbrechen-Schaltfläche haben. Er schließt sich ausschließlich durch Kartenauswahl.

#### Scenario: Kein Abbrechen ohne Auswahl
- **WHEN** Dialog angezeigt wird (Stufe 1 oder 2)
- **THEN** gibt es keine Abbrechen-Schaltfläche und kein Schließen per Escape oder Außenklick
