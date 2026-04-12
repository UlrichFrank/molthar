## ADDED Requirements

### Requirement: Threshold-Indikator anzeigen wenn ein Spieler ≥ 12 Punkte erreicht
Das System SHALL einen dauerhaften, gut sichtbaren Indikator auf dem Spielfeld einblenden, sobald mindestens ein Spieler 12 oder mehr Punkte (`powerPoints`) erreicht hat. Der Indikator bleibt bis zum Spielende sichtbar.

#### Scenario: Indikator erscheint beim Erreichen der Schwelle
- **WHEN** `G.finalRound === true` (d. h. ein Spieler hat ≥ 12 Punkte erreicht)
- **THEN** wird ein Overlay-Element mit einem Text wie "⚔ Schlussrunde ausgelöst – jemand hat 12+ Punkte!" auf dem Spielfeld angezeigt

#### Scenario: Indikator ist für alle Spieler sichtbar
- **WHEN** ein Spieler das Spielfeld betrachtet und `G.finalRound === true`
- **THEN** ist der Threshold-Indikator unabhängig davon sichtbar, ob der lokale Spieler selbst ≥ 12 Punkte hat

#### Scenario: Indikator nicht angezeigt wenn Schwelle nicht erreicht
- **WHEN** `G.finalRound === false`
- **THEN** wird kein Threshold-Indikator gerendert
