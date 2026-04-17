## Why

Mehrere Dialoge zeigen Charakterkarten (Bild, Name, Kosten), enthalten aber keine Beschreibung der Fähigkeiten. Spieler müssen sich an Fähigkeiten erinnern oder den Dialog schließen um die Karte anderswo nachzulesen — besonders störend beim Aktivieren, Vorschauen und Entfernen von Karten.

## What Changes

- Ein wiederverwendbarer `CharacterAbilityList`-Block wird aus `ActivatedCharacterDetailView` extrahiert
- Folgende Dialoge erhalten den Fähigkeiten-Block:
  - `CharacterActivationDialog` — Karte die aktiviert werden soll
  - `CharacterReplacementDialog` — Karte die ersetzt wird
  - `CharacterSwapDialog` — Karte im Portal die getauscht werden soll
  - `CharacterTakePreviewDialog` — Karte vom Stapel (Vorschau-Fähigkeit)
  - `DiscardOpponentCharacterDialog` — Portal-Karten des Gegners

## Capabilities

### New Capabilities

- `character-ability-display`: Wiederverwendbarer Fähigkeiten-Block für Charakterkarten-Dialoge

### Modified Capabilities

_(keine)_

## Impact

- `game-web/src/components/CharacterAbilityList.tsx` — neue Komponente (extrahiert aus `ActivatedCharacterDetailView`)
- `game-web/src/components/ActivatedCharacterDetailView.tsx` — nutzt neue Komponente
- `game-web/src/components/CharacterActivationDialog.tsx` — Fähigkeiten-Block für Zielkarte
- `game-web/src/components/CharacterReplacementDialog.tsx` — Fähigkeiten-Block hinzufügen
- `game-web/src/components/CharacterSwapDialog.tsx` — Fähigkeiten-Block hinzufügen
- `game-web/src/components/CharacterTakePreviewDialog.tsx` — Fähigkeiten-Block hinzufügen
- `game-web/src/components/DiscardOpponentCharacterDialog.tsx` — Fähigkeiten-Block pro Karte
