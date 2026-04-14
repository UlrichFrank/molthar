## MODIFIED Requirements

### Requirement: Schlussrunde umfasst aktuelle Runde + eine vollständige weitere Runde
Das System SHALL nach dem Auslösen der Schlussrunde (Spieler erreicht ≥ 12 Punkte) zunächst die aktuelle Runde fertigspielen lassen (alle Spieler nach dem Auslöser spielen noch ihren Zug), danach eine vollständige Schlussrunde (alle N Spieler in Reihenfolge). Der Startspieler (der Spieler mit dem Startspieler-Marker, Reihenfolge-Index 0) ist niemals der letzte Spieler der Schlussrunde.

#### Scenario: Auslöser ist erster Spieler der Runde
- **WHEN** der Spieler mit Reihenfolge-Index 0 die 12-Punkte-Schwelle überschreitet
- **THEN** spielen alle anderen Spieler noch ihren aktuellen Rundenzug
- **AND** danach spielen alle N Spieler in Reihenfolge eine vollständige Schlussrunde
- **AND** der Spieler mit dem höchsten Reihenfolge-Index ist der letzte Spieler

#### Scenario: Auslöser ist letzter Spieler der Runde
- **WHEN** der Spieler mit Reihenfolge-Index N-1 die 12-Punkte-Schwelle überschreitet
- **THEN** gibt es keine verbleibenden Spieler in der aktuellen Runde
- **AND** alle N Spieler spielen eine vollständige Schlussrunde in Reihenfolge
- **AND** Spieler N-1 ist der letzte Spieler

#### Scenario: Startspieler ist nie der letzte
- **WHEN** die Schlussrunde abgeschlossen wird (egal wer ausgelöst hat)
- **THEN** ist der letzte Spieler der Schlussrunde niemals der Spieler mit Reihenfolge-Index 0
