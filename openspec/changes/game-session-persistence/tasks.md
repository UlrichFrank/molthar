## 1. Backend: Persistente Storage einrichten

- [x] 1.1 `boardgame.io/storage` Paket prüfen/installieren (FlatFile-Adapter)
- [x] 1.2 `./data/`-Verzeichnis in `.gitignore` eintragen
- [x] 1.3 `server-bgio.ts`: FlatFile-Adapter mit `dir: './data'` konfigurieren und in `Server()` einbinden

## 2. Shared: terminateGame-Move

- [x] 2.1 Move `terminateGame` in `shared/src/game/index.ts` hinzufügen (nur playerID `"0"`, sonst `INVALID_MOVE`)
- [x] 2.2 Nach `terminateGame` `ctx.events.endGame({ reason: 'terminated' })` aufrufen
- [x] 2.3 TypeScript-Typen in `shared/src/game/types.ts` um `terminateGame` ergänzen (falls nötig)
- [x] 2.4 Test für `terminateGame`-Move schreiben (Ersteller darf, andere nicht)

## 3. Backend: Match nach Termination löschen

- [x] 3.1 boardgame.io `onMatchEnd`-Hook (oder `onGameEnd`) im Server konfigurieren
- [x] 3.2 Im Hook prüfen ob `gameover.reason === 'terminated'`; wenn ja, Match via `db.wipeout(matchID)` löschen

## 4. Frontend: Session-Persistenz (LocalStorage)

- [x] 4.1 Hilfsfunktionen `saveSession` / `loadSession` / `clearSession` in `game-web/src/lobby/` anlegen (Key: `pvm_session`)
- [x] 4.2 `LobbyScreen.tsx`: Nach erfolgreichem Join/Create `saveSession({ matchID, playerID, credentials, playerName })` aufrufen
- [x] 4.3 `LobbyScreen.tsx`: Bei Leave und nach Spielende `clearSession()` aufrufen

## 5. Frontend: Automatisches Wiederverbinden

- [x] 5.1 `LobbyScreen.tsx`: Beim Initialisieren `loadSession()` aufrufen und Match-Status über Lobby-API prüfen
- [x] 5.2 Wenn Match noch aktiv: direkt in `in-game`-View wechseln mit gespeicherten Credentials
- [x] 5.3 Wenn Match nicht mehr existiert: Session löschen und Lobby anzeigen

## 6. Frontend: Rejoin-Anzeige in der Lobby

- [x] 6.1 `LobbyScreen.tsx`: Separaten Bereich "Meine laufenden Spiele" hinzufügen wenn Session vorhanden
- [x] 6.2 "Wiedereinsteigen"-Button rendern der direkt in die Spielansicht führt (ohne erneuten Join-API-Call)

## 7. Frontend: "Spiel beenden"-Button für Ersteller

- [x] 7.1 In der Spielansicht (`LobbyScreen.tsx` `in-game`-View) Button "Spiel beenden" nur für playerID `"0"` rendern
- [x] 7.2 Bestätigungsdialog vor Ausführung des Moves einbauen (einfaches `window.confirm` oder Modal)
- [x] 7.3 `terminateGame`-Move über boardgame.io-Client absenden
- [x] 7.4 Nach Spielende (`gameover`) Session löschen und zurück zur Lobby navigieren
