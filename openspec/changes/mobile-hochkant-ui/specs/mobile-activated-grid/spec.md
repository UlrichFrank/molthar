## ADDED Requirements

### Requirement: Zähler für aktivierte Charaktere

Das eigene Portal SHALL einen Zähler `aktiviert ×N ▸` anzeigen, der die Anzahl der aktivierten Charaktere des Spielers wiedergibt. Der Zähler SHALL antippbar sein und das Raster-Sheet öffnen.

#### Scenario: Zähler spiegelt Anzahl
- **WHEN** der Spieler N aktivierte Charaktere besitzt
- **THEN** zeigt der Zähler `aktiviert ×N ▸` mit korrektem N

#### Scenario: Zähler öffnet das Raster
- **WHEN** der Spieler den Zähler antippt
- **THEN** öffnet sich ein Bottom-Sheet mit dem Raster der aktivierten Charaktere

### Requirement: Scrollbares Raster für beliebige Anzahl

Das Raster-Sheet SHALL alle aktivierten Charaktere des Spielers in einem scrollbaren Gitter zeigen und dabei realistisch 8–15 Karten ohne Layout-Bruch tragen. Ein Tipp auf eine Karte SHALL deren Detailansicht öffnen.

#### Scenario: Viele aktivierte Karten
- **WHEN** der Spieler 15 aktivierte Charaktere besitzt und das Raster öffnet
- **THEN** sind alle 15 Karten durch Scrollen im Sheet erreichbar

#### Scenario: Kartendetail aus dem Raster
- **WHEN** der Spieler im Raster eine Karte antippt
- **THEN** öffnet sich die Detailansicht dieser Charakterkarte
