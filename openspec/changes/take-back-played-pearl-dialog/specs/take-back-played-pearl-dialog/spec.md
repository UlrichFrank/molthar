## ADDED Requirements

### Requirement: Dialog öffnet sich automatisch bei Pending-Flag
Das Frontend SHALL den `TakeBackPlayedPearlDialog` anzeigen, wenn `G.pendingTakeBackPlayedPearl === true` und der lokale Spieler `ctx.currentPlayer` ist.

#### Scenario: Dialog für aktiven Spieler
- **WHEN** `G.pendingTakeBackPlayedPearl === true` und lokaler Spieler ist `ctx.currentPlayer`
- **THEN** wird der `TakeBackPlayedPearlDialog` gerendert

#### Scenario: Kein Dialog für andere Spieler
- **WHEN** `G.pendingTakeBackPlayedPearl === true` und lokaler Spieler ist NICHT `ctx.currentPlayer`
- **THEN** wird kein Dialog angezeigt

### Requirement: Dialog zeigt auswählbare echte Perlenkarten
Der Dialog SHALL alle Karten anzeigen, deren IDs in `G.playedRealPearlIds` sind und die sich aktuell in `G.pearlDiscardPile` befinden. Jede Karte wird mit ihrem Wert angezeigt.

#### Scenario: Echte gespielte Karten werden angezeigt
- **WHEN** `playedRealPearlIds` enthält 3 IDs und alle 3 sind in `pearlDiscardPile`
- **THEN** zeigt der Dialog 3 Perlenkarten mit ihren Werten

#### Scenario: Klick auf Karte ruft Resolve-Move auf
- **WHEN** Spieler klickt auf eine angezeigte Perlenkarte
- **THEN** wird `resolveReturnPearl(pearlId)` aufgerufen und der Dialog schließt sich

### Requirement: Dialog zeigt Leerstate bei ausschließlich virtuellen Karten
Wenn `G.playedRealPearlIds` leer ist (keine echten Karten gespielt), SHALL der Dialog einen Informationstext anzeigen: "Nur virtuelle Perlenkarten wurden gespielt." Ein Klick auf diesen Text schließt den Dialog.

#### Scenario: Leerstate mit Informationstext
- **WHEN** `G.pendingTakeBackPlayedPearl === true` und `playedRealPearlIds` ist leer (oder keine Karten im Discard gefunden)
- **THEN** zeigt der Dialog den Text "Nur virtuelle Perlenkarten wurden gespielt." — kein Kartenraster

#### Scenario: Klick auf Informationstext schließt Dialog
- **WHEN** Spieler klickt auf den Informationstext im Leerstate
- **THEN** wird `dismissReturnPearlDialog()` aufgerufen und der Dialog schließt sich

### Requirement: Dialog hat keinen separaten Schließen-Button
Der Dialog soll sich ausschließlich durch Kartenauswahl oder Klick auf den Leerstate-Text schließen. Es gibt keine Abbrechen-Schaltfläche.

#### Scenario: Kein Abbrechen
- **WHEN** Dialog angezeigt wird
- **THEN** gibt es keine Abbrechen-Schaltfläche und kein Schließen per Escape oder Außenklick
