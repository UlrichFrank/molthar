# Player Status Dialog Specification

**Last Updated:** 2026-04-12
**Source of Truth:** `/game-web/src/` implementation (Code is authoritative)

## Overview

The **player-status-dialog** capability provides a modal detail view for a player's full status, opened by clicking a player status badge. It uses the shared `GameDialog` component and displays complete ability information.

## Requirements

### Requirement: Detail-Dialog für Spieler-Status
Das System SHALL beim Klick auf ein Status-Badge einen modalen Dialog im Stil der bestehenden `GameDialog`-Komponente öffnen.

#### Scenario: Dialog öffnet sich
- **WHEN** der Benutzer auf ein Status-Badge klickt
- **THEN** erscheint ein Dialog mit der `GameDialog`-Komponente (Standard-Variante), der den Namen des Spielers als Titel zeigt

#### Scenario: Dialog schließt sich bei Overlay-Klick
- **WHEN** der Benutzer auf das Dialog-Overlay (außerhalb des Dialog-Rahmens) klickt
- **THEN** schließt sich der Dialog

### Requirement: Dialog-Inhalt
Der Dialog SHALL folgende Details des jeweiligen Spielers anzeigen:
- Spieler-Name
- Kraftpunkte (`powerPoints`)
- Diamanten (`diamonds`)
- Liste aller aktiven blauen Fähigkeiten mit vollem Fähigkeitsnamen (lesbarer Name aus Mapping-Tabelle)

#### Scenario: Dialog ohne Fähigkeiten
- **WHEN** der Spieler keine aktiven blauen Fähigkeiten hat
- **THEN** zeigt der Dialog einen Hinweistext „Keine aktiven Fähigkeiten"

#### Scenario: Dialog mit Fähigkeiten
- **WHEN** der Spieler eine oder mehrere aktive blaue Fähigkeiten hat
- **THEN** zeigt der Dialog jede Fähigkeit mit Symbol und vollem Namen in einer Liste

### Requirement: Fähigkeits-Mapping
Das System SHALL für alle bekannten blauen Fähigkeits-Typen (`CharacterAbilityType`) einen lesbaren deutschen Namen und ein Symbol bereitstellen. Für unbekannte Typen SHALL ein Fallback-Symbol (`★`) und der technische Typ-Name angezeigt werden.

#### Scenario: Bekannte Fähigkeit im Dialog
- **WHEN** eine Fähigkeit vom Typ `handLimitPlusOne` aktiv ist
- **THEN** zeigt der Dialog „+1 Handlimit" mit passendem Symbol

#### Scenario: Unbekannte Fähigkeit im Dialog
- **WHEN** eine Fähigkeit mit unbekanntem Typ aktiv ist
- **THEN** zeigt der Dialog `★` und den technischen Typ-Namen als Fallback
