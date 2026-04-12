## ADDED Requirements

### Requirement: Kartenbewegungen werden animiert
Das System SHALL jede sichtbare Kartenbewegung (Ziehen, Ablegen, Aktivieren) mit einer Fluganimation darstellen. Die Karte SHALL von ihrer Ursprungsposition zur Zielposition gleiten. Die Animation SHALL ~400 ms dauern und ease-in-out verwenden.

#### Scenario: Perlkarte vom Stapel nehmen
- **WHEN** ein Spieler eine Perlkarte vom Nachziehstapel zieht
- **THEN** erscheint eine fliegende Karte am Perlenstapel und gleitet zur neuen Handkartenposition des Spielers

#### Scenario: Auslagekarte als Handkarte nehmen
- **WHEN** ein Spieler eine Perlkarte aus der Auslage nimmt
- **THEN** erscheint eine fliegende Karte an der Auslageposition und gleitet zur neuen Handkartenposition

#### Scenario: Charakterkarte ins Portal nehmen
- **WHEN** ein Spieler eine Charakterkarte vom Deck oder der Auslage ins Portal legt
- **THEN** erscheint eine fliegende Karte am Ursprungsort und gleitet zum entsprechenden Portalslot

#### Scenario: Charakterkarte aktivieren
- **WHEN** ein Spieler eine Charakterkarte aktiviert (Portal → Aktiviert)
- **THEN** erscheint eine fliegende Karte am Portalslot und gleitet zur Aktiviertposition

### Requirement: Abgeworfene Karten fliegen aus dem Bild
Das System SHALL Karten, die abgelegt oder entfernt werden (ohne ein Canvas-Ziel), zum gegenüberliegenden Bildschirmrand animieren. Die Karte SHALL den sichtbaren Bereich vollständig verlassen.

#### Scenario: Handkarte wird verworfen
- **WHEN** eine Handkarte abgelegt wird (z. B. als Bezahlung oder durch eine Fähigkeit)
- **THEN** fliegt die Karte von ihrer Handposition zum gegenüberliegenden Bildschirmrand hinaus

#### Scenario: Portalfeld wird entfernt
- **WHEN** eine Charakterkarte aus dem Portal entfernt wird (z. B. durch `discardOpponentCharacter`)
- **THEN** fliegt die Karte von ihrer Portalposition zum gegenüberliegenden Bildschirmrand hinaus

### Requirement: Animationen laufen für alle Spieler
Das System SHALL Kartenbewegungen aller Spieler (lokal und Mitspieler) animieren. Mitspieler-Animationen SHALL in deren rotierter Spielerzone korrekt positioniert sein.

#### Scenario: Mitspieler zieht Perlkarte
- **WHEN** ein Mitspieler eine Perlkarte zieht
- **THEN** erscheint eine fliegende Karte am Perlenstapel und gleitet zur Handposition des Mitspielers in dessen rotierter Zone

#### Scenario: Mitspieler aktiviert Charakterkarte
- **WHEN** ein Mitspieler eine Charakterkarte aktiviert
- **THEN** erscheint eine fliegende Karte am Portalslot des Mitspielers und gleitet zu dessen Aktiviertposition

### Requirement: Fliegende Karten liegen über allen anderen Elementen
Das System SHALL fliegende Karten immer im Vordergrund des Canvas zeichnen, sodass sie nicht von anderen Spielelementen verdeckt werden.

#### Scenario: Karte fliegt über Auslage
- **WHEN** eine Karte über die Auslage fliegt
- **THEN** ist die fliegende Karte vollständig sichtbar und nicht von Auslagekarten verdeckt

### Requirement: Gleichzeitige Animationen werden begrenzt
Das System SHALL maximal 5 fliegende Karten gleichzeitig darstellen. Überschüssige Bewegungen SHALL übersprungen werden (Karte erscheint direkt am Ziel).

#### Scenario: Mehr als 5 Karten gleichzeitig
- **WHEN** durch einen Spielzug mehr als 5 Kartenbewegungen gleichzeitig ausgelöst werden
- **THEN** werden die ersten 5 animiert; weitere Karten erscheinen sofort an ihrer Zielposition
