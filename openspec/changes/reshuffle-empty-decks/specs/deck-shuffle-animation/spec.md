## ADDED Requirements

### Requirement: Shuffle-Animation bei Perlen-Reshuffle anzeigen
Das Frontend SHALL eine kurze visuelle Animation anzeigen, wenn `isReshufflingPearlDeck` im Game-State `true` ist. Die Animation soll den Shuffle-Vorgang darstellen (z.B. Karten bewegen sich vom Ablagestapel zum Nachziehstapel, oder ein Shuffle-Icon pulsiert).

#### Scenario: Animation startet automatisch
- **WHEN** der Game-State `isReshufflingPearlDeck === true` enthält
- **THEN** zeigt das Frontend die Shuffle-Animation für den Perlen-Deck-Bereich

#### Scenario: Animation endet und bestätigt
- **WHEN** die Shuffle-Animation abgeschlossen ist (nach ~1.5 Sekunden)
- **THEN** ruft das Frontend den Move `acknowledgeReshuffle` mit `deckType: 'pearl'` auf

#### Scenario: Animation blockiert Spielfluss nicht
- **WHEN** die Shuffle-Animation läuft
- **THEN** kann der aktuelle Spieler seinen Zug fortsetzen (Animation ist nicht-modal)

### Requirement: Shuffle-Animation bei Charakter-Reshuffle anzeigen
Das Frontend SHALL eine kurze visuelle Animation anzeigen, wenn `isReshufflingCharacterDeck` im Game-State `true` ist.

#### Scenario: Charakter-Animation startet automatisch
- **WHEN** der Game-State `isReshufflingCharacterDeck === true` enthält
- **THEN** zeigt das Frontend die Shuffle-Animation für den Charakter-Deck-Bereich

#### Scenario: Charakter-Animation endet und bestätigt
- **WHEN** die Charakter-Shuffle-Animation abgeschlossen ist (nach ~1.5 Sekunden)
- **THEN** ruft das Frontend den Move `acknowledgeReshuffle` mit `deckType: 'character'` auf

### Requirement: Animation ist für alle Spieler sichtbar
Die Shuffle-Animation SHALL auf allen verbundenen Clients gleichzeitig ausgelöst werden, da der Game-State via boardgame.io synchronisiert wird.

#### Scenario: Alle Clients animieren beim Reshuffle
- **WHEN** `isReshufflingPearlDeck` oder `isReshufflingCharacterDeck` im synchronisierten Game-State `true` wird
- **THEN** zeigen alle verbundenen Clients die entsprechende Animation
