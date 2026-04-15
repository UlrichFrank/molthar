## 1. Kartendaten

- [x] 1.1 `assets/cards.json` um Eintrag für „Tischlein deck dich" ergänzen: `name`, `imageName: 'Charakterkarte41.png'`, `cost: [{ type: 'number', value: 4 }]`, `powerPoints: 0`, `diamonds: 0`, `ability: { type: 'replacePearlSlotsBeforeFirstAction', persistent: true }`

## 2. Typen & Konstanten (shared)

- [x] 2.1 `CharacterAbilityType` in `shared/src/game/types.ts` um `'replacePearlSlotsBeforeFirstAction'` erweitern
- [x] 2.2 `GameState` in `shared/src/game/types.ts` um Flag `replacePearlSlotsAbilityUsed: boolean` erweitern
- [x] 2.3 `PERSISTENT_ABILITY_TYPES` in `shared/src/game/abilityHandlers.ts` um `'replacePearlSlotsBeforeFirstAction'` erweitern

## 3. Backend – GameState Initialisierung & Reset

- [x] 3.1 In `setup()` in `shared/src/game/index.ts`: `replacePearlSlotsAbilityUsed: false` initialisieren
- [x] 3.2 In `turn.onBegin`: `G.replacePearlSlotsAbilityUsed = false` zurücksetzen

## 4. Backend – Move `replacePearlSlotsAbility`

- [x] 4.1 Perltausch-Logik aus `replacePearlSlots` in lokale Hilfsfunktion `doReplacePearlSlots(G)` extrahieren
- [x] 4.2 Neuen Move `replacePearlSlotsAbility` implementieren: prüft `actionCount === 0`, Fähigkeit aktiv, `!replacePearlSlotsAbilityUsed`; ruft Hilfsfunktion auf; setzt `G.replacePearlSlotsAbilityUsed = true`
- [x] 4.3 `replacePearlSlots` auf Hilfsfunktion umstellen

## 5. Tests (shared)

- [x] 5.1 Test: `replacePearlSlotsAbility` bei `actionCount === 0` → erfolgreich, `replacePearlSlotsAbilityUsed === true`, `actionCount` unverändert
- [x] 5.2 Test: `replacePearlSlotsAbility` bei `actionCount > 0` → `INVALID_MOVE`
- [x] 5.3 Test: `replacePearlSlotsAbility` wenn `replacePearlSlotsAbilityUsed === true` → `INVALID_MOVE`
- [x] 5.4 Test: `replacePearlSlotsAbility` ohne aktive Fähigkeit → `INVALID_MOVE`
- [x] 5.5 Test: Nach Gratis-Nutzung ist `replacePearlSlots` als normale Aktion weiterhin verfügbar

## 6. Frontend – Canvas-Button

- [x] 6.1 In `canvasRegions.ts`: Region `'replace-pearl-slots-ability'` hinzufügen — sichtbar wenn `actionCount === 0 && hasAbility && !replacePearlSlotsAbilityUsed`
- [x] 6.2 Normale `'replace-pearl-slots'`-Region ausblenden wenn Gratis-Button aktiv (Bedingung anpassen)
- [x] 6.3 In `gameRender.ts`: Gratis-Tausch-Button rendern (gleiche Position wie normaler Tausch-Button, anderes Label)
- [x] 6.4 In `CanvasGameBoard.tsx` Click-Handler: Case `'replace-pearl-slots-ability'` → `moves.replacePearlSlotsAbility()`

## 7. Übersetzungen & Ability-Display

- [x] 7.1 In `translations.ts`: Schlüssel `'canvas.freePearlReplace'` (DE/EN/FR) hinzufügen
- [x] 7.2 In `translations.ts`: `'ability.replacePearlSlotsBeforeFirstAction.name'` und `.description'` (DE/EN/FR) hinzufügen
- [x] 7.3 In `abilityDisplayMap.ts`: Eintrag für `replacePearlSlotsBeforeFirstAction` hinzufügen (Symbol, Name, Beschreibung)
