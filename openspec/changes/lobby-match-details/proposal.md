## Why

Die Spielliste in der Lobby zeigt aktuell nur eine abgekürzte Match-ID und die Anzahl beigetretener Spieler. Spieler können nicht erkennen wer das Spiel erstellt hat, wer bereits beigetreten ist oder wann das Spiel angelegt wurde. Das erschwert die Orientierung bei mehreren offenen Spielen.

## What Changes

- Das `Match`-Interface in `useLobbyClient.ts` wird um `createdAt: number` und vollständige `players`-Daten (inkl. `name`) erweitert
- `MatchList.tsx` zeigt pro Eintrag: Erstellungszeitpunkt (formatiert), Name des Erstellers (Spieler 0) und Namen aller beigetretenen Teilnehmer
- Neue Übersetzungsschlüssel für die neuen Labels

## Capabilities

### New Capabilities

- `lobby-match-details`: Erweiterte Match-Informationen in der Spielliste (Zeitstempel, Erstellername, Teilnehmer)

### Modified Capabilities

(keine)

## Impact

- `game-web/src/lobby/useLobbyClient.ts` — `Match`-Interface um `createdAt`, `updatedAt` und vollständige Player-Felder erweitern
- `game-web/src/lobby/MatchList.tsx` — neue Informationen rendern
- `game-web/src/i18n/translations.ts` — neue Schlüssel für Zeitstempel- und Namens-Labels
- Keine Backend-Änderungen nötig (Daten sind bereits in der boardgame.io API vorhanden)
