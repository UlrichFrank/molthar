## ADDED Requirements

### Requirement: Visuelles Hervorheben geänderter Canvas-Elemente
Das Canvas-Rendering SHALL Elemente, die sich seit dem letzten State-Update verändert haben, kurz visuell hervorheben (Glow-Effekt, 800ms), um Zustandsänderungen für den Spieler sichtbar zu machen.

#### Scenario: Neue Handkarte wird hervorgehoben
- **WHEN** eine neue Perlkarte zur Hand des lokalen Spielers hinzukommt
- **THEN** wird die neue Karte im Canvas für 800ms mit einem cyan-farbenen Glow-Effekt hervorgehoben

#### Scenario: Aktivierte Charakterkarte wird hervorgehoben
- **WHEN** eine Charakterkarte im Portal des lokalen Spielers als aktiviert markiert wird
- **THEN** wird die Karte für 800ms hervorgehoben

#### Scenario: Gegner-Portaländerung wird hervorgehoben
- **WHEN** eine Änderung an einem Gegner-Portal erkannt wird (neue Karte, Aktivierung)
- **THEN** wird das betroffene Element in der Gegnerzone für 800ms hervorgehoben

#### Scenario: Highlight verschwindet nach Ablauf
- **WHEN** 800ms seit Beginn des Highlights vergangen sind
- **THEN** ist der Glow-Effekt vollständig verschwunden (linear fade)

#### Scenario: Mehrere gleichzeitige Highlights
- **WHEN** mehrere Elemente gleichzeitig geändert werden (z.B. bei rehandCards)
- **THEN** werden alle geänderten Elemente gleichzeitig hervorgehoben — kein sequenzielles Warten

### Requirement: Highlight-Diff basiert auf Karten-IDs
Der Highlight-Mechanismus SHALL Änderungen durch Vergleich von Karten-IDs erkennen (nicht Objekt-Referenzen), um False-Positives durch boardgame.io-interne Re-Serialisierung zu vermeiden.

#### Scenario: Unveränderte Karte wird nicht hervorgehoben
- **WHEN** boardgame.io ein neues Array-Objekt für eine unveränderte Handkarte erstellt
- **THEN** wird die Karte NICHT hervorgehoben (da `card.id` gleich geblieben ist)
