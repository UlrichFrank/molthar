## 1. Kartendaten

- [ ] 1.1 `assets/cards.json` — Joker-Perlenkarte mit `isSpecial: true` kennzeichnen (sobald angelegt)
- [ ] 1.2 `assets/cards.json` — „Tischlein deck dich" (Charakterkarte41) mit `isSpecial: true` kennzeichnen (sobald angelegt)

## 2. Typen (shared)

- [ ] 2.1 `CharacterCard` in `shared/src/game/types.ts` um optionales Feld `isSpecial?: boolean` erweitern
- [ ] 2.2 `PearlCard` in `shared/src/game/types.ts` um optionales Feld `isSpecial?: boolean` erweitern
- [ ] 2.3 `GameState` in `shared/src/game/types.ts` um Feld `withSpecialCards: boolean` erweitern

## 3. Backend – setup() und Kartenfilterung

- [ ] 3.1 `setup()` in `shared/src/game/index.ts` auf `setup(ctx, setupData?)` umstellen
- [ ] 3.2 Kartenfilter einbauen: wenn `!setupData?.withSpecialCards`, Karten mit `isSpecial: true` aus Charakter- und Perlendeck entfernen
- [ ] 3.3 `G.withSpecialCards = setupData?.withSpecialCards ?? false` in der Initialisierung setzen
- [ ] 3.4 Sicherstellen dass `isSpecial` aus `cards.json` beim Laden in `CharacterCard`/`PearlCard` übernommen wird (Loader/cardDatabase prüfen)

## 4. Tests (shared)

- [ ] 4.1 Test: `setup()` ohne `setupData` → keine Sonderkarten im Deck
- [ ] 4.2 Test: `setup()` mit `withSpecialCards: true` → Sonderkarten im Deck enthalten
- [ ] 4.3 Test: `setup()` mit `withSpecialCards: false` → keine Sonderkarten im Deck

## 5. Frontend – CreateMatch

- [ ] 5.1 State `withSpecialCards: boolean` (default `false`) in `LobbyScreen` hinzufügen
- [ ] 5.2 `CreateMatch`-Komponente um Prop `withSpecialCards` + `onWithSpecialCardsChange` erweitern
- [ ] 5.3 Toggle/Checkbox in `CreateMatch.tsx` rendern mit Label aus `t('create.withSpecialCards')`
- [ ] 5.4 `createMatch` in `LobbyScreen` auf `setupData: { withSpecialCards }` erweitern

## 6. Frontend – WaitingRoom

- [ ] 6.1 `WaitingRoom`-Komponente um Prop `withSpecialCards?: boolean` erweitern
- [ ] 6.2 Modus-Anzeige in `WaitingRoom.tsx` einbauen (Label aus `t('waiting.mode.base')` / `t('waiting.mode.special')`)
- [ ] 6.3 `withSpecialCards`-Wert aus `matchData`/`setupData` an `WaitingRoom` übergeben (aus `getMatch`-Response oder aus `G`)

## 7. Frontend – MatchList

- [ ] 7.1 Prüfen ob `listMatches`-Response `setupData` enthält; falls ja, `isSpecial`-Modus je Match anzeigen
- [ ] 7.2 Badge/Label „Sonderkarten" in `MatchList.tsx` anzeigen wenn verfügbar

## 8. Übersetzungen

- [ ] 8.1 `translations.ts` — `'create.withSpecialCards'` (DE/EN/FR) hinzufügen
- [ ] 8.2 `translations.ts` — `'waiting.mode.base'` und `'waiting.mode.special'` (DE/EN/FR) hinzufügen
- [ ] 8.3 `translations.ts` — `'lobby.modeSpecial'` für MatchList-Badge (DE/EN/FR) hinzufügen
