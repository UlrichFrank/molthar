## Why

Spieler sollen beim Erstellen eines Spiels wählen können, ob Sonderkarten (neue Karten mit erweiterten Fähigkeiten wie Joker-Perlenkarte, Tischlein deck dich u. a.) ins Deck kommen. So können Gruppen mit dem Basisspiel oder mit dem erweiterten Kartenset spielen.

## What Changes

- Karten in `cards.json` erhalten ein optionales Flag `isSpecial: true` für Karten, die zum erweiterten Set gehören
- Die Lobby-Erstellmaske bekommt eine Toggle-Option „Mit Sonderkarten"
- Die Option wird als `setupData: { withSpecialCards: boolean }` an `createMatch` übergeben
- `setup()` im Shared-Paket filtert Charakter- und Perlenkarten anhand von `setupData.withSpecialCards`
- Im Wartezimmer wird der gewählte Modus für alle Spieler sichtbar angezeigt
- Beitretende Spieler sehen in der Spielliste, ob ein Match mit oder ohne Sonderkarten läuft

## Capabilities

### New Capabilities

- `lobby-game-mode-selection`: Spielmodus-Auswahl (mit/ohne Sonderkarten) in der Lobby

### Modified Capabilities

- (keine bestehenden Specs ändern sich auf Anforderungsebene)

## Impact

- `assets/cards.json` — `isSpecial: true` bei Sonderkarten-Einträgen setzen
- `shared/src/game/types.ts` — `CharacterCard` und `PearlCard` um optionales `isSpecial?: boolean` erweitern; `GameState` um `withSpecialCards: boolean` für UI-Anzeige
- `shared/src/game/index.ts` — `setup()` nimmt `setupData` entgegen und filtert Karten
- `shared/src/game/cardDatabase.ts` / Loader — `isSpecial`-Flag wird aus `cards.json` übernommen
- `game-web/src/lobby/LobbyScreen.tsx` — Toggle in der Erstellmaske, `setupData` an `createMatch`
- `game-web/src/lobby/WaitForPlayersScreen.tsx` (oder äquivalent) — Modus-Anzeige
- `game-web/src/i18n/translations.ts` — neue Übersetzungsschlüssel
