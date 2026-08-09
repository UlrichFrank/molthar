## ADDED Requirements

### Requirement: Feste Spielerreihenfolge mit einer Detailbox

Die Statusleiste SHALL alle Spieler in einer festen Reihenfolge zeigen (eigener Spieler zuerst). Genau ein Spieler SHALL als aufgeklappte Detailbox dargestellt werden, alle übrigen als kompakte Avatare. Ein Tipp auf einen Avatar SHALL die Detailbox an dessen feste Position verschieben, ohne die Reihenfolge der Spieler zu ändern.

#### Scenario: Standard-Detail ist der eigene Spieler
- **WHEN** die mobile Ansicht startet
- **THEN** ist der eigene Spieler als Detailbox aufgeklappt, die Gegner als Avatare

#### Scenario: Avatar antippen verschiebt die Detailbox
- **WHEN** der Spieler einen Gegner-Avatar antippt
- **THEN** klappt dieser Spieler an seiner festen Position zur Detailbox auf und der zuvor aufgeklappte Spieler wird an seiner festen Position wieder zum Avatar

#### Scenario: Reihenfolge bleibt stabil
- **WHEN** die Detailbox von einem Spieler zu einem anderen wechselt
- **THEN** bleibt die Links-nach-rechts-Reihenfolge aller Spieler unverändert

### Requirement: Inhalt der Detailbox und der Avatare

Die Detailbox SHALL Initiale, Name, Platzierung/Rang (nach Machtpunkten), ★-Machtpunkte und 💎-Diamanten zeigen; für den Spieler „am Zug" zusätzlich ein „am Zug"-Badge und den Aktionszähler. Ein Avatar SHALL Initiale (farbcodiert) und ★-Machtpunkte zeigen.

#### Scenario: Platzierung in der Detailbox
- **WHEN** ein Spieler als Detailbox dargestellt wird
- **THEN** zeigt die Box seinen Rang bezogen auf die Machtpunkte aller Spieler (z. B. „Rang 2/5")

#### Scenario: Aktionszähler nur beim aktiven Spieler
- **WHEN** der als Detailbox dargestellte Spieler am Zug ist
- **THEN** zeigt die Box ein „am Zug"-Badge und seinen Aktionszähler (z. B. „2/5")

### Requirement: Identitäts- und Zug-Indikatoren

Der eigene Spieler SHALL durchgängig durch einen Goldring markiert sein (als Avatar und als Detailbox); der Spieler „am Zug" SHALL durch einen grünen Punkt markiert sein. Beide Indikatoren SHALL gleichzeitig darstellbar sein.

#### Scenario: Eigener Spieler als Avatar
- **WHEN** der eigene Spieler nicht die aufgeklappte Detailbox ist
- **THEN** trägt sein Avatar einen Goldring

#### Scenario: Eigener Spieler ist am Zug, aber ein Gegner ist aufgeklappt
- **WHEN** der eigene Spieler am Zug ist und als Avatar dargestellt wird
- **THEN** trägt sein Avatar gleichzeitig Goldring und grünen Zug-Punkt

### Requirement: Skalierung bis 5 Spieler

Die Statusleiste SHALL bis zu 5 Spieler (max. 4 Gegner) in einer Zeile ohne Umbruch darstellen.

#### Scenario: Volle Besetzung
- **WHEN** eine Partie mit 5 Spielern läuft
- **THEN** passen die eine Detailbox und die vier Avatare einzeilig in die Statusleiste
