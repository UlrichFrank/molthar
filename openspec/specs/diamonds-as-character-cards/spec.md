# Diamonds as Character Cards

## Overview

In the physical game, "diamonds" are face-down character cards drawn from the character deck — not an abstract counter. This capability defines the data model and game mechanics for representing diamonds as actual `CharacterCard` objects in the game state.

## Requirements

### Requirement: Diamanten als CharacterCard-Liste im Spielzustand
Der Spielzustand SHALL für jeden Spieler eine Liste `diamondCards: CharacterCard[]` führen statt eines numerischen `diamonds`-Zählers. Die Länge dieser Liste entspricht der Anzahl verfügbarer Diamanten.

#### Scenario: Initialer Spielzustand
- **WHEN** ein neues Spiel gestartet wird
- **THEN** ist `player.diamondCards` für alle Spieler ein leeres Array

#### Scenario: Diamanten-Zähler als Länge
- **WHEN** Code die Anzahl verfügbarer Diamanten eines Spielers benötigt
- **THEN** wird `player.diamondCards.length` verwendet

### Requirement: Diamant-Erwerb zieht vom Charakternachziehstapel
Wenn ein Spieler durch Kartenaktivierung Diamanten erhält (`diamondsReward > 0`), SHALL das Spiel die entsprechende Anzahl Karten vom `characterDeck` ziehen und in `player.diamondCards` legen.

#### Scenario: Karte mit diamondsReward=1 aktivieren
- **WHEN** ein Spieler eine Karte mit `diamondsReward=1` aktiviert
- **THEN** wird 1 Karte vom `characterDeck` entfernt
- **AND** diese Karte wird `player.diamondCards` hinzugefügt
- **AND** `player.diamondCards.length` steigt um 1

#### Scenario: Karte mit diamondsReward=2 aktivieren
- **WHEN** ein Spieler eine Karte mit `diamondsReward=2` aktiviert (z.B. Einhorn)
- **THEN** werden 2 Karten vom `characterDeck` entfernt
- **AND** beide Karten werden `player.diamondCards` hinzugefügt

#### Scenario: characterDeck ist leer beim Diamant-Erwerb
- **WHEN** der `characterDeck` leer ist und ein Spieler Diamanten erwerben würde
- **THEN** wird der `characterDiscardPile` gemischt und als neuer `characterDeck` verwendet
- **AND** danach werden die Karten normal gezogen

### Requirement: Diamant-Ausgabe gibt Karten in den Ablagestapel
Wenn ein Spieler Diamanten ausgibt (für `decreaseWithPearl`, `diamond`-Kostenkomponenten oder andere Mechanismen), SHALL das Spiel die entsprechende Anzahl Karten aus `player.diamondCards` entfernen und in den `characterDiscardPile` legen.

#### Scenario: decreaseWithPearl-Ability nutzen
- **WHEN** ein Spieler die `decreaseWithPearl`-Ability nutzt (1 Diamant ausgeben)
- **THEN** wird 1 Karte aus `player.diamondCards` entfernt (letzte Karte)
- **AND** diese Karte wird dem `characterDiscardPile` hinzugefügt

#### Scenario: diamond-Kostenkomponente bezahlen
- **WHEN** ein Spieler eine Karte mit `{ type: 'diamond', value: N }` Kosten aktiviert
- **THEN** werden N Karten aus `player.diamondCards` entfernt
- **AND** diese Karten werden dem `characterDiscardPile` hinzugefügt

### Requirement: tradeTwoForDiamond zieht vom Charakternachziehstapel
Wenn ein Spieler die `tradeTwoForDiamond`-Ability nutzt, SHALL das Spiel 1 Karte vom `characterDeck` ziehen und in `player.diamondCards` legen (zusätzlich zur normalen Perlenabgabe).

#### Scenario: tradeTwoForDiamond ausführen
- **WHEN** ein Spieler eine 2er-Perle für die `tradeTwoForDiamond`-Ability abgibt
- **THEN** wird 1 Karte vom `characterDeck` gezogen
- **AND** diese Karte wird `player.diamondCards` hinzugefügt

### Requirement: UI zeigt Diamanten-Anzahl numerisch an
Die Benutzeroberfläche SHALL die Anzahl der Diamanten eines Spielers als Zahl anzeigen (`player.diamondCards.length`). Die Kartenidentitäten der Diamond-Karten werden nicht angezeigt.

#### Scenario: Diamanten-Anzeige im PlayerStatusBadge
- **WHEN** ein Spieler 3 Diamond-Karten hält
- **THEN** zeigt das PlayerStatusBadge `💎 3` an

#### Scenario: Gegner-Diamanten sichtbar als Zahl
- **WHEN** ein Spieler die Statusanzeige eines Gegners sieht
- **THEN** ist die Anzahl der Diamanten des Gegners sichtbar
- **AND** die Identität der Diamond-Karten ist nicht erkennbar
