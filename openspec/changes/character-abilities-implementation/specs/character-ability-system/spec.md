## ADDED Requirements

### Requirement: Charakter-Fähigkeitssystem
Das Spiel SHALL alle 18 Fähigkeitstypen mit korrekter Spielmechanik implementieren. Fähigkeiten SHALL zum richtigen Zeitpunkt ausgeführt werden (vor der ersten Aktion, während einer Aktion, nach der letzten Aktion) und gemäß den Regelwerk-Vorgaben bestehen bleiben oder erlöschen.

#### Scenario: Rote Fähigkeit wird sofort nach Aktivierung ausgeführt
- **WHEN** ein Charakter mit einer roten Fähigkeit aktiviert wird
- **THEN** wird die rote Fähigkeit sofort ausgeführt (keine weitere Spieleraktion erforderlich)
- **AND** ihre Effekte werden direkt in den Spielzustand (G) geschrieben
- **AND** die Ausführung ist für die UI über den State-Diff nachvollziehbar

#### Scenario: Blaue Fähigkeit bleibt auf aktiviertem Charakter bestehen
- **WHEN** ein Charakter mit einer blauen Fähigkeit aktiviert wird
- **THEN** wird die Fähigkeit in `PlayerState.activeAbilities` gespeichert
- **AND** sie bleibt für alle nachfolgenden Züge aktiv (bis Spielende)
- **AND** sie beeinflusst zukünftige Moves ohne erneute Aktivierung

#### Scenario: Rote Fähigkeit threeExtraActions
- **WHEN** ein Charakter mit der Fähigkeit threeExtraActions aktiviert wird
- **THEN** erhält der aktuelle Spieler 3 zusätzliche Aktionen in diesem Zug
- **AND** `G.maxActions` wird um 3 erhöht
- **AND** `turn.onEnd` setzt `G.maxActions` auf den Basiswert zurück

#### Scenario: Rote Fähigkeit nextPlayerOneExtraAction
- **WHEN** ein Charakter mit der Fähigkeit nextPlayerOneExtraAction aktiviert wird
- **THEN** wird `G.nextPlayerExtraAction` auf true gesetzt
- **AND** beim Zugbeginn des nächsten Spielers erhöht `turn.onBegin` `G.maxActions` um 1
- **AND** das Flag wird nach dem onBegin-Hook gelöscht

#### Scenario: Rote Fähigkeit discardOpponentCharacter
- **WHEN** ein Charakter mit der Fähigkeit discardOpponentCharacter aktiviert wird
- **THEN** wird eine Charakterkarte vom Portal eines Gegners entfernt (durch den aktiven Spieler gesteuert)
- **AND** die entfernte Karte kommt auf den Charakterkarten-Ablagestapel
- **AND** die Anzahl der Karten auf dem Portal des Gegners verringert sich um 1

#### Scenario: Rote Fähigkeit stealOpponentHandCard
- **WHEN** ein Charakter mit der Fähigkeit stealOpponentHandCard aktiviert wird
- **THEN** wird eine Perlenkarte aus der Hand eines Gegners durch den aktivierenden Spieler gewählt und auf die Hand des aktivierenden Spielers übertragen
- **AND** die Handkartenanzahl des Gegners verringert sich um 1
- **AND** hat in diesem Zug kein Mitspieler eine Perlenkarte auf der Hand, hat die Fähigkeit keinen Effekt

#### Scenario: Rote Fähigkeit takeBackPlayedPearl
- **WHEN** ein Charakter mit der Fähigkeit takeBackPlayedPearl aktiviert wird
- **THEN** wird die zuletzt gespielte Perlenkarte vom Ablagestapel zurück auf die Hand des Spielers gelegt
- **AND** war in diesem Zug keine Perlenkarte ausgespielt worden, hat die Fähigkeit keinen Effekt
- **AND** `G.lastPlayedPearlId` wird auf null zurückgesetzt

#### Scenario: Blaue Fähigkeit handLimitPlusOne
- **WHEN** ein Charakter mit der Fähigkeit handLimitPlusOne aktiviert wird
- **THEN** wird `PlayerState.handLimitModifier` dauerhaft um 1 erhöht
- **AND** das effektive Handkartenlimit des Spielers (5 + Modifier) erhöht sich um 1
- **AND** der Modifier bleibt für alle nachfolgenden Züge bestehen

#### Scenario: Blaue Fähigkeit oneExtraActionPerTurn
- **WHEN** ein Charakter mit der Fähigkeit oneExtraActionPerTurn aktiviert wird
- **THEN** erhält der Spieler dauerhaft 1 zusätzliche Aktion pro Zug
- **AND** `turn.onEnd` setzt `G.maxActions` auf 4 (statt 3) für alle nachfolgenden Züge
- **AND** der Effekt stapelt sich bei mehrfacher Aktivierung

### Requirement: Fähigkeitstyp-System
Das Spiel SHALL alle 18 Fähigkeitstypen mit eindeutigen Bezeichnern und Metadaten definieren. Jeder Fähigkeitstyp SHALL auf genau einen Handler oder State-Modifier abgebildet werden.

#### Scenario: Alle 18 Fähigkeitstypen werden erkannt
- **WHEN** eine Charakterkarte mit einem Fähigkeitstyp aus assets/cards.json geladen wird
- **THEN** wird der Fähigkeitstyp erkannt und in CharacterCard.abilities gespeichert
- **AND** folgende Typen werden unterstützt: none, handLimitPlusOne, oneExtraActionPerTurn, threeExtraActions, nextPlayerOneExtraAction, discardOpponentCharacter, stealOpponentHandCard, takeBackPlayedPearl, onesCanBeEights, threesCanBeAny, decreaseWithPearl, changeCharacterActions, changeHandActions, previewCharacter, tradeTwoForDiamond, numberAddditionalCardActions, anyAddditionalCardActions, irrlicht
- **AND** unbekannte Typen werden ignoriert und in der Console als Warning ausgegeben (keine Auswirkung auf Gameplay)

#### Scenario: Klassifizierung in rote und blaue Fähigkeiten
- **WHEN** eine Fähigkeit klassifiziert wird
- **THEN** werden rote Fähigkeiten (nicht-persistent, `persistent: false`) zur sofortigen Ausführung markiert
- **AND** blaue Fähigkeiten (persistent, `persistent: true`) zur dauerhaften Speicherung markiert

### Requirement: Isolation von Fähigkeitseffekten
Das Spiel SHALL unbeabsichtigte Nebeneffekte bei gleichzeitig aktiven Fähigkeiten verhindern. Die Effekte jeder Fähigkeit SHALL unabhängig und kombinierbar sein.

#### Scenario: Mehrere blaue Fähigkeiten stapeln sich ohne Konflikt
- **WHEN** ein Spieler zwei Karten mit blauen Fähigkeiten aktiviert (z.B. handLimitPlusOne + oneExtraActionPerTurn)
- **THEN** werden beide Effekte angewendet: Handkartenlimit erhöht sich um 1 und Aktionslimit erhöht sich um 1
- **AND** keine der Fähigkeiten beeinträchtigt den Zustand der anderen

#### Scenario: Rote Fähigkeiten akkumulieren sich nicht über Züge
- **WHEN** eine rote Fähigkeit ausgeführt wird
- **THEN** wird ihr Effekt genau einmal angewendet
- **AND** `turn.onEnd` setzt turn-spezifische Effekte (z.B. `G.maxActions`) auf den Basiswert zurück
