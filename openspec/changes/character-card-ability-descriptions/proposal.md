## Why

Der `ActivatedCharacterDetailView`-Dialog zeigt bereits eine Abilities-Sektion für rote und blaue Fähigkeiten, rendert aber nur `ability.description` — ein Feld das in der Kartendatenbank stets leer (`''`) ist. Spieler sehen den Typ-Label (z.B. „Red (Instant)") ohne jede Erklärung was die Fähigkeit tatsächlich bewirkt.

`abilityDisplayMap.ts` enthält bereits `symbol` und `name` für alle blauen Fähigkeiten, aber keine Erklärungstexte — und rote Fähigkeiten fehlen vollständig.

## What Changes

- `abilityDisplayMap.ts`: `AbilityDisplayInfo` um ein `description`-Feld (German) erweitern; Beschreibungstexte für alle 17 Ability-Typen hinzufügen (inkl. bisher fehlender roter Fähigkeiten).
- `ActivatedCharacterDetailView`: Statt `ability.description` (immer leer) den Text aus `getAbilityDisplay(ability.type).description` anzeigen.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `opponent-activated-card-detail`: Der Detail-Dialog zeigt für jede Fähigkeit einen erklärenden deutschen Text.

## Impact

- `game-web/src/lib/abilityDisplayMap.ts`: `description`-Feld in Interface + Map-Einträge
- `game-web/src/components/ActivatedCharacterDetailView.tsx`: `ability.description` → `getAbilityDisplay(ability.type).description`
- `game-web/src/test/abilityDisplayMap.test.ts`: Test-Coverage für `description`-Feld + rote Ability-Typen ergänzen
