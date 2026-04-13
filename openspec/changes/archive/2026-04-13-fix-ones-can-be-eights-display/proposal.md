## Why

Im Aktivierungsdialog wird die `onesCanBeEights`-Fähigkeit (1→8) falsch dargestellt:

1. **Auto-Aktivierung**: Wenn eine 1-Perlenkarte in der Hand ausgewählt wird, aktiviert `toggleHandCard` die Fähigkeit automatisch (setzt `value=8`, `abilityType='onesCanBeEights'`). Der Badge erscheint sofort blau/aktiv — ohne dass der Spieler ihn angeklickt hat. Der Spieler kann die Fähigkeit nicht wählen, ob er sie nutzen möchte.

2. **Position**: Die per-Karte-Badges (inkl. `1→8`) werden in Section 1 (Handkarten) gerendert — oberhalb der „Fähigkeiten"-Section 2 in der die Charakterkarte mit `onesCanBeEights` nochmals als Beschreibungstext erscheint. Dieselbe Information wird so doppelt und in umgekehrter Reihenfolge angezeigt.

## What Changes

- `toggleHandCard`: Auto-Anwendung von `onesCanBeEights` entfernen — 1-Perlenkarten werden wie alle anderen Karten mit ihrem echten Wert (1) und ohne `abilityType` selektiert. Der Spieler aktiviert die Fähigkeit manuell per Badge-Klick.
- Kein Layout-Umbau nötig: Sobald die Auto-Aktivierung entfernt ist, startet der Badge im inaktiven (gedimmten) Zustand und der Spieler sieht denselben Workflow wie bei `decreaseWithPearl`.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `game-web-spec`: Das Verhalten von `onesCanBeEights` im Aktivierungsdialog — kein Auto-Apply mehr, konsistent mit den anderen Ability-Badges.

## Impact

- `game-web/src/components/CharacterActivationDialog.tsx`: Auto-Apply-Block in `toggleHandCard` (~Zeile 115–119) entfernen
