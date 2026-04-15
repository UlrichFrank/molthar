## 1. Kartendaten

- [ ] 1.1 `assets/cards.json` — Joker-Perlenkarte mit `isSpecial: true` kennzeichnen (sobald angelegt)
- [ ] 1.2 `assets/cards.json` — „Tischlein deck dich" (Charakterkarte41) mit `isSpecial: true` kennzeichnen (sobald angelegt)

## 2. Typen (shared)

- [x] 2.1 `CharacterCard` in `shared/src/game/types.ts` um optionales Feld `isSpecial?: boolean` erweitern
- [x] 2.2 `PearlCard` in `shared/src/game/types.ts` um optionales Feld `isSpecial?: boolean` erweitern
- [x] 2.3 `GameState` in `shared/src/game/types.ts` um Feld `withSpecialCards: boolean` erweitern

## 3. Backend – setup() und Kartenfilterung

- [x] 3.1 `setup()` in `shared/src/game/index.ts` auf `setup(ctx, setupData?)` umstellen
- [x] 3.2 Kartenfilter einbauen: wenn `!setupData?.withSpecialCards`, Karten mit `isSpecial: true` aus Charakter- und Perlendeck entfernen
- [x] 3.3 `G.withSpecialCards = setupData?.withSpecialCards ?? false` in der Initialisierung setzen
- [x] 3.4 Sicherstellen dass `isSpecial` aus `cards.json` beim Laden in `CharacterCard`/`PearlCard` übernommen wird (Loader/cardDatabase prüfen)

## 4. Tests (shared)

- [x] 4.1 Test: `setup()` ohne `setupData` → keine Sonderkarten im Deck
- [x] 4.2 Test: `setup()` mit `withSpecialCards: true` → Sonderkarten im Deck enthalten
- [x] 4.3 Test: `setup()` mit `withSpecialCards: false` → keine Sonderkarten im Deck

## 5. Frontend – CreateMatch

- [x] 5.1 State `withSpecialCards: boolean` (default `false`) in `LobbyScreen` hinzufügen
- [x] 5.2 `CreateMatch`-Komponente um Prop `withSpecialCards` + `onWithSpecialCardsChange` erweitern
- [x] 5.3 Toggle/Checkbox in `CreateMatch.tsx` rendern mit Label aus `t('create.withSpecialCards')`
- [x] 5.4 `createMatch` in `LobbyScreen` auf `setupData: { withSpecialCards }` erweitern

## 6. Frontend – WaitingRoom

- [x] 6.1 `WaitingRoom`-Komponente um Prop `withSpecialCards?: boolean` erweitern
- [x] 6.2 Modus-Anzeige in `WaitingRoom.tsx` einbauen (Label aus `t('waiting.mode.base')` / `t('waiting.mode.special')`)
- [x] 6.3 `withSpecialCards`-Wert aus `matchData`/`setupData` an `WaitingRoom` übergeben (aus `getMatch`-Response oder aus `G`)

## 7. Frontend – MatchList

- [x] 7.1 Prüfen ob `listMatches`-Response `setupData` enthält; falls ja, `isSpecial`-Modus je Match anzeigen
- [x] 7.2 Badge/Label „Sonderkarten" in `MatchList.tsx` anzeigen wenn verfügbar

## 8. Übersetzungen

- [x] 8.1 `translations.ts` — `'create.withSpecialCards'` (DE/EN/FR) hinzufügen
- [x] 8.2 `translations.ts` — `'waiting.mode.base'` und `'waiting.mode.special'` (DE/EN/FR) hinzufügen
- [x] 8.3 `translations.ts` — `'lobby.modeSpecial'` für MatchList-Badge (DE/EN/FR) hinzufügen
