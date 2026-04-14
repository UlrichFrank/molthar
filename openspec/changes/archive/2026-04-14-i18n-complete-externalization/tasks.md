## 1. TranslationKeys erweitern

- [x] 1.1 In `translations.ts`: neue Keys für CharacterSwapDialog hinzufügen (`swap.title`, `swap.description`, `swap.cancel`) in DE / EN-GB / FR
- [x] 1.2 In `translations.ts`: neue Keys für TakeBackPlayedPearlDialog hinzufügen (`takeBackPearl.title`, `takeBackPearl.noVirtualCards`, `takeBackPearl.chooseCard`) in DE / EN-GB / FR
- [x] 1.3 In `translations.ts`: neuen Key für EndTurnButton hinzufügen (`game.endTurn`) in DE / EN-GB / FR
- [x] 1.4 In `translations.ts`: neue Keys für PlayerStatusDialog hinzufügen (`player.points`, `player.diamonds`, `player.activeAbilities`, `player.noAbilities`) in DE / EN-GB / FR
- [x] 1.5 In `translations.ts`: neue Keys für DeckReshuffleAnimation hinzufügen (`deck.reshufflingPearl`, `deck.reshufflingCharacter`) in DE / EN-GB / FR
- [x] 1.6 In `translations.ts`: neue Keys für Canvas-Labels hinzufügen (`canvas.swap`, `canvas.discardCards`, `canvas.clickToTake`) in DE / EN-GB / FR
- [x] 1.7 In `translations.ts`: neue Keys für LobbyScreen Session-Info hinzufügen (`lobby.sessionInfo`, `lobby.fallbackPlayerName`) in DE / EN-GB / FR
- [x] 1.8 In `translations.ts`: 26 neue Keys für Fähigkeiten hinzufügen (`ability.<type>.name` und `ability.<type>.description` für alle 13 Typen) in DE / EN-GB / FR

## 2. Komponenten umstellen

- [x] 2.1 `CharacterSwapDialog.tsx`: `useTranslation` importieren, hardcodierte Strings durch `t(key)` ersetzen
- [x] 2.2 `TakeBackPlayedPearlDialog.tsx`: `useTranslation` importieren, hardcodierte Strings durch `t(key)` ersetzen, alt-Text ebenfalls
- [x] 2.3 `EndTurnButton.tsx`: `useTranslation` importieren (Props erweitern um `t` oder Hook direkt nutzen), "Zug beenden" durch `t('game.endTurn')` ersetzen
- [x] 2.4 `PlayerStatusDialog.tsx`: `useTranslation` importieren, alle vier hardcodierten Labels ersetzen
- [x] 2.5 `DeckReshuffleAnimation.tsx`: `useTranslation` importieren (oder Label als Prop von außen), LABELS-Konstante durch `t(key)` ersetzen
- [x] 2.6 `LobbyScreen.tsx`: Session-Info-Text und Fallback-Spielername durch `t(key)`-Aufrufe mit Interpolation ersetzen

## 3. Canvas-Lib externalisieren

- [x] 3.1 `canvasRegions.ts`: `buildCanvasRegions`-Signatur um optionales `labels`-Objekt erweitern (`{ swap: string; discardCards: string; clickToTake: string }`), hardcodierte Labels durch Parameter ersetzen
- [x] 3.2 `gameRender.ts`: `drawDeckStack`-Signatur um optionalen `clickHintLabel`-Parameter erweitern, hardcodierten `'← Klick zum Nehmen'`-Text ersetzen
- [x] 3.3 `CanvasGameBoard.tsx`: Labels mit `t()` übersetzen und an `buildCanvasRegions` + `drawDeckStack` übergeben

## 4. abilityDisplayMap umstellen

- [x] 4.1 `abilityDisplayMap.ts`: `AbilityDisplayInfo`-Interface anpassen — `name` und `description` werden zu `nameKey: TranslationKey` und `descriptionKey: TranslationKey`; `symbol` bleibt als String
- [x] 4.2 `abilityDisplayMap.ts`: Alle 13 Einträge in `ABILITY_MAP` auf Keys umstellen (z.B. `nameKey: 'ability.threeExtraActions.name'`)
- [x] 4.3 `PlayerStatusDialog.tsx`: `getAbilityDisplay` aufrufen, dann `t(display.nameKey)` statt `display.name`
- [x] 4.4 `ActivatedCharacterDetailView.tsx`: `getAbilityDisplay` aufrufen, dann `t(display.descriptionKey)` statt `display.description`

## 5. Verifikation

- [x] 5.1 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` — alle neuen Keys müssen in allen drei Locales vorhanden sein
- [ ] 5.2 Manueller Test: Sprache auf EN umstellen und alle geänderten Komponenten auf korrekte Übersetzung prüfen
- [ ] 5.3 Manueller Test: Sprache auf FR umstellen und Stichproben nehmen
- [x] 5.4 `cd game-web && pnpm lint` — keine neuen Lint-Fehler (pre-existing errors unverändert)
