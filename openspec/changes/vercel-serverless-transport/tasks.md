## 1. Transport-Abstraction einführen (Refactoring, kein Verhaltens-Änderung)

- [ ] 1.1 `game-web/src/transport/types.ts` anlegen: Interface `LobbyAPI` und Typ `GameClientComponent` definieren
- [ ] 1.2 `game-web/src/transport/socket/index.ts` anlegen: Inhalt von `useLobbyClient.ts` hierher verschieben (1:1, keine Änderungen)
- [ ] 1.3 `game-web/src/lobby/useLobbyClient.ts` löschen
- [ ] 1.4 `vite.config.ts` erweitern: `path`-Import + `resolve.alias` für `@transport` basierend auf `process.env.VITE_TRANSPORT` (default: `socket`)
- [ ] 1.5 `LobbyScreen.tsx`: Import von `./useLobbyClient` → `@transport`
- [ ] 1.6 `WaitingRoom.tsx`: Import von `./useLobbyClient` → `@transport`
- [ ] 1.7 Bestehende Tests laufen lassen (`make test-shared`, `cd game-web && pnpm lint`); alle grün

## 2. Vercel API Routes implementieren

- [ ] 2.1 `@vercel/kv` zu `game-web/package.json` hinzufügen (pnpm install)
- [ ] 2.2 `game-web/api/matches/index.ts` implementieren: `GET` (list) + `POST` (create); KV-Keys: `match:{id}:state`, `match:{id}:meta`, `matches:index`
- [ ] 2.3 `game-web/api/matches/[id]/index.ts` implementieren: `GET` — lädt State + Meta aus KV, gibt `{ G, ctx, matchData }` zurück
- [ ] 2.4 `game-web/api/matches/[id]/join.ts` implementieren: `POST { playerID, playerName }` — schreibt Spielernamen in Meta, gibt `{ playerCredentials }` zurück
- [ ] 2.5 `game-web/api/matches/[id]/move.ts` implementieren: `POST { playerID, credentials, moveType, args }` — validiert credentials, wendet Move via `createGameReducer` aus `boardgame.io/internal` an, speichert neuen State in KV
- [ ] 2.6 `game-web/api/matches/[id]/leave.ts` implementieren: `DELETE` — prüft playerID === "0", löscht Match aus KV

## 3. Vercel-Transport im Frontend implementieren

- [ ] 3.1 `game-web/src/transport/vercel/index.ts` anlegen: `lobbyClient`-Objekt mit `createMatch`, `listMatches`, `getMatch`, `joinMatch` via `fetch()` auf `/api/matches`
- [ ] 3.2 `useGameClient` Hook in `game-web/src/transport/vercel/useGameClient.ts` implementieren: pollt `GET /api/matches/[id]` alle 500 ms, liefert `{ G, ctx, moves, playerID, isActive, matchData }`
- [ ] 3.3 `moves`-Objekt im Hook: für jeden Move-Type aus `PortaleVonMolthar.moves` eine Funktion erstellen, die `POST /api/matches/[id]/move` aufruft
- [ ] 3.4 `GameClientComponent` in `transport/vercel/index.ts` exportieren: React-Komponente, die `useGameClient` nutzt und `CanvasGameBoard` mit den Props rendert
- [ ] 3.5 Polling stoppt wenn `ctx.gameover` gesetzt ist (Spec: polling-stoppt-nach-spielende)

## 4. Vercel-Deployment konfigurieren

- [ ] 4.1 `game-web/vercel.json` anlegen: `buildCommand` (shared → game-web), `outputDirectory: dist`, `installCommand`, `env: { VITE_TRANSPORT: "vercel" }`
- [ ] 4.2 TypeScript-Config für `api/`-Routen prüfen: Vercel kompiliert `api/` separat; sicherstellen dass `@portale-von-molthar/shared` auflösbar ist
- [ ] 4.3 `.env.example` aktualisieren: `VITE_TRANSPORT=socket` dokumentieren

## 5. Lokal testen (Vercel-Modus)

- [ ] 5.1 Vercel CLI installieren: `pnpm add -g vercel`
- [ ] 5.2 Vercel KV-Datenbank anlegen (Vercel Dashboard) und dev-Credentials in `game-web/.env.local` eintragen
- [ ] 5.3 `vercel dev` im `game-web`-Verzeichnis starten und Grundfunktionen testen: Match erstellen, beitreten, Zug machen, Spielende
- [ ] 5.4 Gleichzeitiger Zugriff testen: zwei Browser-Tabs, gegnerischer Move erscheint nach ≤500 ms

## 6. Vercel-Deployment

- [ ] 6.1 Vercel-Projekt anlegen: Root Directory = `game-web`, KV-Datenbank verknüpfen
- [ ] 6.2 Deployment testen: vollständiges Spiel von Lobby bis Spielende
- [ ] 6.3 CORS-Header in API Routes prüfen (falls nötig)
