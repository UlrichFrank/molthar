## ADDED Requirements

### Requirement: Reshuffle-Flags werden zu Beginn jedes Zuges zurückgesetzt
`turn.onBegin` SHALL `G.isReshufflingPearlDeck` und `G.isReshufflingCharacterDeck` auf `false` setzen, bevor die übrige Initialisierungslogik des Zuges ausgeführt wird. Dadurch ist sichergestellt, dass Reshuffle-Animationen spätestens beim nächsten Zugwechsel verschwinden.

#### Scenario: Reshuffle-Flag ist gesetzt wenn ein neuer Zug beginnt
- **WHEN** `turn.onBegin` wird aufgerufen und `G.isReshufflingPearlDeck === true`
- **THEN** `G.isReshufflingPearlDeck` wird zu `false` gesetzt

#### Scenario: Reshuffle-Flag ist nicht gesetzt — kein Seiteneffekt
- **WHEN** `turn.onBegin` wird aufgerufen und `G.isReshufflingPearlDeck === false`
- **THEN** `G.isReshufflingPearlDeck` bleibt `false`; kein Fehler

### Requirement: Nur der aktive Spieler ruft acknowledgeReshuffle auf
Im Frontend SHALL `DeckReshuffleAnimation.onDone` nur dann `moves.acknowledgeReshuffle` aufrufen, wenn der lokale Client der aktive Spieler ist (`isActive === true`). Für nicht-aktive Spieler SHALL `onDone` eine No-Op-Funktion sein.

#### Scenario: Aktiver Spieler: automatisches Dismiss nach 1500 ms
- **WHEN** `isActive === true` und der interne Timer von `DeckReshuffleAnimation` abläuft
- **THEN** `moves.acknowledgeReshuffle('pearl')` bzw. `'character'` wird aufgerufen; `isReshufflingPearlDeck` / `isReshufflingCharacterDeck` wird zu `false`; Animation verschwindet für alle Clients

#### Scenario: Nicht-aktiver Spieler: kein Move-Aufruf
- **WHEN** `isActive === false` und der interne Timer von `DeckReshuffleAnimation` abläuft
- **THEN** kein Move wird aufgerufen; Animation bleibt sichtbar bis ein anderer Client das Flag löscht oder `turn.onBegin` ausgelöst wird; kein Optimistic-Update-Rollback-Cycle
