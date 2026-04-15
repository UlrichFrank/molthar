## Why

Das Spiel erhält eine neue Charakterkarte „Tischlein deck dich" mit einer permanenten Fähigkeit, die dem Spieler einmal pro Zug einen kostenlosen Perlenkartenaustauch vor seiner ersten regulären Aktion erlaubt. Der normale Perlentausch als Aktion bleibt danach zusätzlich verfügbar.

## What Changes

- Neue Charakterkarte „Tischlein deck dich" wird `cards.json` hinzugefügt (Charakterkarte41.png, Kosten: eine 4er-Perle, 0 Siegpunkte)
- Neuer permanenter Fähigkeitstyp `replacePearlSlotsBeforeFirstAction`
- Neuer Move `replacePearlSlotsAbility`: tauscht alle 4 Perlenkarten kostenlos (kein Aktionsverbrauch), nur vor der ersten Aktion (`actionCount === 0`), einmal pro Zug
- Neues Flag `G.replacePearlSlotsAbilityUsed` im GameState: verhindert doppelte Nutzung der Gratis-Fähigkeit im selben Zug; wird in `turn.onBegin` zurückgesetzt
- Nach Nutzung der Gratis-Fähigkeit ist der normale Perlentausch (`replacePearlSlots`) weiterhin als reguläre Aktion(en) nutzbar
- Canvas-UI: Button „Gratis tauschen" vor der ersten Aktion, wenn Fähigkeit aktiv und noch nicht genutzt

## Capabilities

### New Capabilities

- `tischlein-deck-dich-card`: Neue Charakterkarte mit Gratis-Perlenaustauch-Fähigkeit vor erster Aktion

### Modified Capabilities

- `replace-pearl-slots-button`: UI muss den Gratis-Tausch-Button vor der ersten Aktion anzeigen, wenn die Fähigkeit aktiv ist

## Impact

- `assets/cards.json` — neuer Karteneintrag
- `shared/src/game/types.ts` — neuer Fähigkeitstyp, neues GameState-Flag
- `shared/src/game/abilityHandlers.ts` — neuer Typ in `PERSISTENT_ABILITY_TYPES`
- `shared/src/game/index.ts` — neuer Move `replacePearlSlotsAbility`, Reset in `turn.onBegin`
- `game-web/src/lib/canvasRegions.ts` — neue Region für Gratis-Tausch-Button
- `game-web/src/lib/gameRender.ts` — Button rendern
- `game-web/src/components/CanvasGameBoard.tsx` — Click-Handler für neuen Move
- `game-web/src/i18n/translations.ts` — neue Übersetzungsschlüssel
