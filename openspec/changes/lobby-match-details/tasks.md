## 1. Interface-Erweiterung

- [x] 1.1 `MatchPlayer` in `useLobbyClient.ts` um `isConnected?: boolean` erweitern
- [x] 1.2 `Match` in `useLobbyClient.ts` um `createdAt?: number` und `updatedAt?: number` erweitern

## 2. Hilfsfunktion Zeitformatierung

- [x] 2.1 Hilfsfunktion `formatMatchTime(createdAt: number): string` in `MatchList.tsx` oder `lib/` implementieren: heute → `HH:MM`, sonst → `DD.MM. HH:MM` via `Intl.DateTimeFormat`

## 3. MatchList-Komponente

- [x] 3.1 Erstellungszeitpunkt pro Match-Eintrag anzeigen (via `formatMatchTime`, nur wenn `createdAt` vorhanden)
- [x] 3.2 Erstellername anzeigen: `players[0]?.name` (Label aus `t('matches.creator')`)
- [x] 3.3 Teilnehmernamen anzeigen: alle `players` mit gesetztem `name`, kommagetrennt (Label aus `t('matches.participants')`)

## 4. Übersetzungen

- [x] 4.1 `translations.ts` — `'matches.creator'` (DE: „Erstellt von", EN: „Created by", FR: „Créé par")
- [x] 4.2 `translations.ts` — `'matches.participants'` (DE: „Spieler", EN: „Players", FR: „Joueurs")
