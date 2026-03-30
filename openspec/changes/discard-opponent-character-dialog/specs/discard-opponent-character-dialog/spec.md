## ADDED Requirements

### Requirement: Dialog öffnet sich automatisch bei Pending-Flag
Das Frontend SHALL den `DiscardOpponentCharacterDialog` anzeigen, wenn `G.pendingDiscardOpponentCharacter === true` und der aktuelle Spieler der lokale Spieler ist.

#### Scenario: Dialog öffnet sich bei gesetztem Flag
- **WHEN** der Game-State `pendingDiscardOpponentCharacter === true` enthält und der lokale Spieler `ctx.currentPlayer` ist
- **THEN** wird der `DiscardOpponentCharacterDialog` gerendert

#### Scenario: Dialog öffnet sich nicht für andere Spieler
- **WHEN** der Game-State `pendingDiscardOpponentCharacter === true` enthält und der lokale Spieler NICHT `ctx.currentPlayer` ist
- **THEN** wird kein Dialog angezeigt

### Requirement: Dialog zeigt alle Gegner-Portal-Karten geordnet nach Spielerreihenfolge
Der Dialog SHALL alle Spieler (außer dem aktiven Spieler) in der Reihenfolge ihres nächsten Zugs anzeigen, beginnend mit dem Spieler direkt nach dem aktiven. Pro Spieler werden alle Karten in `portal` angezeigt. Spieler ohne Portal-Karten werden übersprungen.

#### Scenario: Reihenfolge der Spieler im Dialog
- **WHEN** der Dialog angezeigt wird und `G.playerOrder = ['A', 'B', 'C', 'D']` und `currentPlayer = 'B'`
- **THEN** werden Spieler in Reihenfolge C, D, A angezeigt (Wrap-Around, 'B' übersprungen)

#### Scenario: Spieler ohne Portal-Karten werden ausgeblendet
- **WHEN** ein Gegner `portal.length === 0` hat
- **THEN** erscheint dieser Spieler nicht im Dialog

#### Scenario: Dialog zeigt Kartendetails
- **WHEN** eine Portal-Karte angezeigt wird
- **THEN** sind Name, Kosten und Fähigkeiten der Charakterkarte sichtbar (analog zur bestehenden Kartendarstellung)

### Requirement: Dialog ist nicht abbrechbar
Der Dialog SHALL keine Schließen- oder Abbrechen-Schaltfläche haben. Er schließt sich ausschließlich durch Auswahl einer Karte.

#### Scenario: Kein Schließen ohne Auswahl
- **WHEN** der Dialog angezeigt wird
- **THEN** gibt es keine Schaltfläche zum Abbrechen und kein Schließen per Escape oder Klick außerhalb

### Requirement: Auswahl einer Karte löst Resolve-Move aus
**WHEN** der Spieler eine Karte im Dialog auswählt, SHALL das Frontend den Move `resolveDiscardOpponentCharacter(targetPlayerId, portalEntryId)` aufrufen und der Dialog schließt sich.

#### Scenario: Erfolgreiche Kartenauswahl
- **WHEN** der Spieler auf eine Charakterkarte im Dialog klickt
- **THEN** wird `resolveDiscardOpponentCharacter` mit der `targetPlayerId` des Kartenbesitzers und der `portalEntryId` der Karte aufgerufen, und der Dialog schließt sich
