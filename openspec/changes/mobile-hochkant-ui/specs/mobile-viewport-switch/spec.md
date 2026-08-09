## ADDED Requirements

### Requirement: Viewport-basierte Ansichtswahl

Das Spiel SHALL bei einer Viewport-Breite unter 768px die mobile Hochkant-Ansicht rendern und ab 768px die bestehende Desktop-Canvas-Ansicht (`CanvasGameBoard`). Der Wechsel SHALL live auf Größenänderungen des Viewports reagieren.

#### Scenario: Schmaler Viewport zeigt Mobile-Ansicht
- **WHEN** die Viewport-Breite unter 768px liegt
- **THEN** rendert die App die mobile DOM-Ansicht und NICHT das `CanvasGameBoard`

#### Scenario: Breiter Viewport zeigt Desktop-Canvas
- **WHEN** die Viewport-Breite 768px oder mehr beträgt
- **THEN** rendert die App das unveränderte `CanvasGameBoard`

#### Scenario: Wechsel bei Größenänderung
- **WHEN** die Viewport-Breite die 768px-Grenze während einer laufenden Partie über- oder unterschreitet
- **THEN** wechselt die App auf die passende Ansicht, ohne den Spielzustand zu verlieren

### Requirement: Geteilte Spiellogik über beide Ansichten

Beide Ansichten SHALL denselben boardgame.io-Zustand und dieselben `moves` verwenden; die mobile Ansicht SHALL keine eigene Spiellogik oder eigenen Zustand einführen.

#### Scenario: Move über die mobile Ansicht
- **WHEN** der Spieler in der mobilen Ansicht eine Aktion auslöst
- **THEN** wird derselbe boardgame.io-`move` aufgerufen wie in der Desktop-Ansicht und der Zustand identisch aktualisiert

#### Scenario: Zustandsquelle
- **WHEN** die mobile Ansicht Spielzustand anzeigt
- **THEN** liest sie ausschließlich aus den übergebenen Props (`G`, `ctx`, `moves`, `playerID`, `matchData`) ohne abweichende lokale Kopie des Spielzustands
