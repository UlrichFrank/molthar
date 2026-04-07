## 1. Backend: Persistente Storage einrichten

- [ ] 1.1 `boardgame.io/storage` Paket prüfen/installieren (FlatFile-Adapter)
- [ ] 1.2 `./data/`-Verzeichnis in `.gitignore` eintragen
- [ ] 1.3 `server-bgio.ts`: FlatFile-Adapter mit `dir: './data'` konfigurieren und in `Server()` einbinden

## 2. Shared: terminateGame-Move

- [ ] 2.1 Move `terminateGame` in `shared/src/game/index.ts` hinzufügen (nur playerID `"0"`, sonst `INVALID_MOVE`)
- [ ] 2.2 Nach `terminateGame` `ctx.events.endGame({ reason: 'terminated' })` aufrufen
- [ ] 2.3 TypeScript-Typen in `shared/src/game/types.ts` um `terminateGame` ergänzen (falls nötig)
- [ ] 2.4 Test für `terminateGame`-Move schreiben (Ersteller darf, andere nicht)

## 3. Backend: Match nach Termination löschen

- [ ] 3.1 boardgame.io `onMatchEnd`-Hook (oder `onGameEnd`) im Server konfigurieren
- [ ] 3.2 Im Hook prüfen ob `gameover.reason === 'terminated'`; wenn ja, Match via `db.wipeout(matchID)` löschen

## 4. Frontend: Session-Persistenz (LocalStorage)

- [ ] 4.1 Hilfsfunktionen `saveSession` / `loadSession` / `clearSession` in `game-web/src/lobby/` anlegen (Key: `pvm_session`)
- [ ] 4.2 `LobbyScreen.tsx`: Nach erfolgreichem Join/Create `saveSession({ matchID, playerID, credentials, playerName })` aufrufen
- [ ] 4.3 `LobbyScreen.tsx`: Bei Leave und nach Spielende `clearSession()` aufrufen

## 5. Frontend: Automatisches Wiederverbinden

- [ ] 5.1 `LobbyScreen.tsx`: Beim Initialisieren `loadSession()` aufrufen und Match-Status über Lobby-API prüfen
- [ ] 5.2 Wenn Match noch aktiv: direkt in `in-game`-View wechseln mit gespeicherten Credentials
- [ ] 5.3 Wenn Match nicht mehr existiert: Session löschen und Lobby anzeigen

## 6. Frontend: Rejoin-Anzeige in der Lobby

- [ ] 6.1 `LobbyScreen.tsx`: Separaten Bereich "Meine laufenden Spiele" hinzufügen wenn Session vorhanden
- [ ] 6.2 "Wiedereinsteigen"-Button rendern der direkt in die Spielansicht führt (ohne erneuten Join-API-Call)

## 7. Frontend: "Spiel beenden"-Button für Ersteller

- [ ] 7.1 In der Spielansicht (`LobbyScreen.tsx` `in-game`-View) Button "Spiel beenden" nur für playerID `"0"` rendern
- [ ] 7.2 Bestätigungsdialog vor Ausführung des Moves einbauen (einfaches `window.confirm` oder Modal)
- [ ] 7.3 `terminateGame`-Move über boardgame.io-Client absenden
- [ ] 7.4 Nach Spielende (`gameover`) Session löschen und zurück zur Lobby navigieren
