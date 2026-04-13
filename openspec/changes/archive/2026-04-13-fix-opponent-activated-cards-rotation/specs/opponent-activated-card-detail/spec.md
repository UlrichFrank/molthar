## ADDED Requirements

### Requirement: Gegnerische aktivierte Charakterkarten werden um 180° gedreht gerendert
Das System SHALL jede aktivierte Charakterkarte eines Gegners um 180° relativ zu ihrer lokalen Position innerhalb der Gegnerzone zeichnen — identisch zur Darstellung beim lokalen Spieler. Die Drehung erfolgt zusätzlich zur Zonen-Rotation (90°/180°/270°).

#### Scenario: Aktivierte Karte im Gegner-Grid erscheint auf dem Kopf stehend
- **WHEN** ein Gegner eine oder mehrere aktivierte Charakterkarten hat
- **THEN** wird jede dieser Karten um 180° relativ zu ihrer lokalen Zone-Position gerendert (Kopf zeigt zur Zonengrenze hin, wie beim physischen Spiel)

#### Scenario: Region-Winkel für gegnerische aktivierte Karte enthält die 180°-Komponente
- **WHEN** die `opponent-activated-character`-Regionen in canvasRegions aufgebaut werden
- **THEN** ist der `angle`-Wert der Region `Zonen-Rotation + Math.PI` (nicht nur die Zonen-Rotation allein)
