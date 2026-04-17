## ADDED Requirements

### Requirement: Vercel API Routes stellen Lobby und Move-Execution bereit
Das System SHALL folgende Serverless-Endpunkte in `game-web/api/` bereitstellen:
- `GET /api/matches` — Liste aller offenen Matches
- `POST /api/matches` — Neues Match erstellen
- `GET /api/matches/[id]` — Match-State abrufen
- `POST /api/matches/[id]/join` — Match beitreten
- `POST /api/matches/[id]/move` — Move ausführen
- `DELETE /api/matches/[id]` — Match beenden

#### Scenario: Match erstellen
- **WHEN** `POST /api/matches` mit `{ numPlayers, setupData }` aufgerufen wird
- **THEN** wird ein neues Match in Vercel KV gespeichert und `{ matchID }` zurückgegeben

#### Scenario: Match beitreten
- **WHEN** `POST /api/matches/[id]/join` mit `{ playerID, playerName }` aufgerufen wird
- **THEN** wird der Spieler im Match-Metadaten registriert und `{ playerCredentials }` zurückgegeben

#### Scenario: Move ausführen
- **WHEN** `POST /api/matches/[id]/move` mit `{ playerID, credentials, moveType, args }` aufgerufen wird
- **THEN** werden credentials validiert, der Move via `createGameReducer` angewendet, der neue State in KV gespeichert und `200 OK` zurückgegeben

#### Scenario: Ungültige Credentials
- **WHEN** `POST /api/matches/[id]/move` mit falschen credentials aufgerufen wird
- **THEN** wird `401 Unauthorized` zurückgegeben und der State bleibt unverändert

#### Scenario: Match beenden (terminate)
- **WHEN** `DELETE /api/matches/[id]` vom Match-Ersteller (playerID "0") aufgerufen wird
- **THEN** wird das Match aus KV gelöscht

### Requirement: State-Persistenz via Vercel KV
Das System SHALL Vercel KV (`@vercel/kv`) für Match-State und Match-Metadaten verwenden. Reads und Writes SHALL atomic sein (kein paralleler Write darf State korrumpieren).

#### Scenario: State nach Move korrekt persistiert
- **WHEN** ein Move erfolgreich ausgeführt wird
- **THEN** gibt `GET /api/matches/[id]` den neuen State zurück

#### Scenario: Konkurrente Writes
- **WHEN** zwei Spieler gleichzeitig einen Move senden
- **THEN** wird nur einer akzeptiert; der zweite erhält den aktuellen State ohne seinen Move

### Requirement: Frontend pollt State via 500 ms Intervall
Das System SHALL im Vercel-Transport-Modus den Match-State alle 500 ms via `GET /api/matches/[id]` abrufen. Der Polling-Hook SHALL `G`, `ctx`, `moves`, `playerID`, `isActive` und `matchData` liefern — identisch zum `CanvasGameBoardProps`-Interface.

#### Scenario: State-Update nach gegnerischem Move
- **WHEN** der Gegner einen Move macht
- **THEN** sieht der wartende Spieler den neuen State spätestens nach 500 ms

#### Scenario: CanvasGameBoard Interface unverändert
- **WHEN** `CanvasGameBoard` im Vercel-Modus gerendert wird
- **THEN** erhält es `G`, `ctx`, `moves` als Props — ohne Änderung an der Komponente selbst

#### Scenario: Polling stoppt nach Spielende
- **WHEN** `ctx.gameover` gesetzt ist
- **THEN** wird das Polling-Intervall gestoppt

### Requirement: Vercel-Build baut shared vor game-web
Das System SHALL in `game-web/vercel.json` einen `buildCommand` definieren, der `@portale-von-molthar/shared` zuerst baut, danach `game-web` mit `VITE_TRANSPORT=vercel`.

#### Scenario: Vercel-Deployment schlägt nicht wegen fehlendem shared/dist fehl
- **WHEN** Vercel das Projekt baut (Root Directory: `game-web`)
- **THEN** ist `shared/dist/index.js` vor dem Vite-Build von `game-web` vorhanden

#### Scenario: Lokaler Vercel-Dev-Modus
- **WHEN** `vercel dev` im `game-web`-Verzeichnis gestartet wird
- **THEN** sind Frontend und API Routes lokal erreichbar und nutzen Vercel KV (dev-Credentials)
