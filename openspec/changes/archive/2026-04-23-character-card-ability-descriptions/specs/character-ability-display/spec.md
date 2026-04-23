## ADDED Requirements

### Requirement: CharacterAbilityList-Komponente
Das System SHALL eine wiederverwendbare `CharacterAbilityList`-Komponente bereitstellen, die für eine `CharacterCard` alle Fähigkeiten mit Name und Beschreibung anzeigt, getrennt nach roter (sofort) und blauer (dauerhaft) Kategorie.

#### Scenario: Karte mit roten und blauen Fähigkeiten
- **WHEN** `CharacterAbilityList` mit einer Karte gerendert wird, die sowohl rote als auch blaue Fähigkeiten hat
- **THEN** werden rote Fähigkeiten mit rotem Rand und blaue mit blauem Rand dargestellt, jeweils mit lokalisiertem Namen und Beschreibungstext

#### Scenario: Karte ohne Fähigkeiten
- **WHEN** `CharacterAbilityList` mit einer Karte ohne Fähigkeiten gerendert wird
- **THEN** wird nichts gerendert (null)

### Requirement: Fähigkeiten in Charakterkarten-Dialogen
Alle Dialoge, die eine Charakterkarte zur Auswahl oder Bestätigung anzeigen, MÜSSEN die Fähigkeiten der Karte via `CharacterAbilityList` darstellen.

Betroffene Dialoge:
- `CharacterActivationDialog` (Karte die aktiviert werden soll)
- `CharacterReplacementDialog` (Karte die ersetzt wird)
- `CharacterSwapDialog` (Portal-Karte die getauscht werden soll)
- `CharacterTakePreviewDialog` (Vorschau-Karte vom Stapel)
- `DiscardOpponentCharacterDialog` (Portal-Karten des Gegners, je Karte)

#### Scenario: Aktivierungsdialog zeigt Fähigkeiten
- **WHEN** der Spieler eine Charakterkarte aktivieren will
- **THEN** zeigt der Dialog unterhalb des Kartenbilds die Fähigkeiten der Karte

#### Scenario: Vorschau-Dialog zeigt Fähigkeiten
- **WHEN** der Spieler die `previewCharacter`-Fähigkeit nutzt und eine Karte vom Stapel sieht
- **THEN** zeigt der Dialog die Fähigkeiten der Vorschau-Karte

#### Scenario: Gegner-Discard-Dialog zeigt Fähigkeiten je Karte
- **WHEN** der Spieler eine Portal-Karte eines Gegners entfernen soll
- **THEN** zeigt jede auswählbare Karte ihre Fähigkeiten
