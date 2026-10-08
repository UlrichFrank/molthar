# Design

## Context

Motivation und Umfang: siehe `proposal.md`. Anforderungen: siehe `specs/single-binary-deploy/spec.md`. Vorlage ist der produktive Ausgebremst-Change (`/Users/ulrich/Dev/Ausgebremst/openspec/changes/single-binary-deploy/`, PR #41); die dort gelösten Probleme werden übernommen, die Molthar-Unterschiede sind hier festgehalten.

Ausgangslage Molthar:
- Backend `backend/src/server-bgio.ts`: boardgame.io 0.50 (Koa, socket.io 3 / engine.io 4), bisher unter **Node** (tsc → `dist/`). `HOST` wird nur geloggt, `server.run(PORT)` lauscht auf allen Interfaces.
- Speicher: `MatchStore` erweitert boardgame.io `FlatFile` (node-persist) um atomare Schreibvorgänge; Verzeichnis fest `./data` relativ zum cwd, `writeQueue: false` (jeder Zug wird sofort geschrieben).
- NPCs: `BotRunner` läuft im selben Prozess und verbindet sich als boardgame.io-Client per Lobby-API und Socket.IO mit `http://127.0.0.1:${PORT}`. Die Sitz-Zugangsdaten liegen in `${NPC_DATA_DIR:-__dirname/../data-npc}/credentials.json`; ohne sie hängen laufende NPC-Partien.
- Kartendaten: `shared/src/game/cardDatabaseLoader.js` liest `assets/cards.json` beim Import per `fs` (Kandidaten: `CARDS_JSON_PATH`, `<cwd>/assets/cards.json`, relativ zu `__dirname`).
- Frontend: Vite-Build; `game-web/public/assets` ist ein Symlink auf `assets/` (224 MB, davon `raw/` 132 MB, `Anleitung.af` 39 MB, `Anleitung.jpg` 13 MB — keines davon wird vom Spiel geladen). `SERVER_URL = VITE_SERVER_URL || <hostname>:3001`; Produktion backt `https://molthar-api.apps.diefranks.eu` ein.
- vServer: Ubuntu 24.04 x86-64, root, 850 MB RAM, 3,4 GB frei. Traefik v3.7 in `~/deploy/traefik` mit Docker-Provider **und bereits aktivem File-Provider** (`/etc/traefik/dynamic`, `watch: true`, Mount `./dynamic`) — im Repo unter `deploy/traefik/` fehlt das noch. Ausgebremst-Binary belegt `172.18.0.1:3001`.

## Goals / Non-Goals

**Goals:**
- Ein Artefakt pro Release, auf dem Mac cross-kompiliert, ohne Registry.
- Kein Eingriff in Zertifikat, ACME-Konfiguration oder laufenden Traefik; kein Traefik-Neustart.
- Umstellung ohne Verlust laufender Partien, auch nicht der NPC-Partien.
- Lokale Entwicklung (`make dev`, Node + Vite) bleibt unverändert nutzbar.

**Non-Goals:**
- Entwicklung/Tests generell auf Bun umstellen (nur das Binary läuft unter Bun).
- Traefik ersetzen oder Docker vom Server entfernen (Traefik bleibt ein Compose-Stack).
- `card-manager` oder die Simulation (`backend/src/simulation`) ins Binary aufnehmen.

## Decisions

### 1. Eigener Binary-Einstiegspunkt mit eingebetteten Kartendaten
Das Binary wird aus `backend/src/main-binary.ts` gebaut:
```
bun build backend/src/main-binary.ts --compile --target=bun-linux-x64 --outfile dist/molthar-linux-x64
```
`main-binary.ts` lädt per `require` **zuerst** `./embedded/cards` (JSON-`require` von `assets/cards.json`, legt die Daten auf `globalThis.__MOLTHAR_RAW_CARDS__`) und danach `./server-bgio` (das seinerseits das Asset-Manifest lädt). `require` hält die Reihenfolge explizit, die Karten stehen also bereit, bevor `@portale-von-molthar/shared` den Loader ausführt. `cardDatabaseLoader.js` prüft das Global zuerst und fällt sonst auf die bisherige `fs`-Suche zurück — Node-Entwicklung, Tests und Simulation bleiben unverändert.
- *Alternative verworfen:* `CARDS_JSON_PATH` auf eine Datei neben dem Binary — dann gäbe es wieder zwei Artefakte.
- *Alternative verworfen:* Erkennung über `Bun.main.startsWith("/$bunfs/")` im gemeinsamen `server-bgio.ts` (Ausgebremst-Weg). Ein eigener Einstiegspunkt ist bei Molthar nötig, weil die Karten vor dem Import von `shared` gesetzt sein müssen; er macht die Erkennung für das Manifest gleich mit überflüssig.

### 2. Asset-Manifest mit Ausschlussliste
`backend/scripts/gen-assets.ts` (läuft mit Bun) durchläuft `game-web/dist` und erzeugt `backend/src/embedded/assets.gen.ts`: pro Datei `import f from "<pfad>" with { type: "file" }` plus Map *URL-Pfad → eingebetteter Pfad*. Nicht aufgenommen werden: `assets/raw/**`, `*.af`, `*.md`, `*.txt`, `assets/Anleitung.jpg`, `*.map`, `test-images.html`. Das Skript gibt Anzahl und Gesamtgröße aus und bricht ab, wenn die eingebetteten Dateien 150 MB überschreiten (Schutz gegen versehentlich eingebettete Rohdaten). Die generierte Datei ist in `.gitignore` und von `tsc` ausgenommen. `embedded/assets.ts` lädt sie per `require` nur im kompilierten Binary (Erkennung über `Bun.main` im `$bunfs`, wie bei Ausgebremst) — Bun würde sonst das `.js`-Bundle der Seite ausführen statt es als Datei einzubetten. Außerhalb des Binaries ist das Manifest leer.
- Ausschlussliste statt Positivliste: neue Kartenbilder werden ohne Pflege der Liste ausgeliefert; die Größenschranke fängt den gefährlichen Fall ab.
- *Alternative verworfen:* den Symlink `game-web/public/assets` durch eine gefilterte Kopie ersetzen — betrifft den Dev-Server und ist fehleranfälliger.

### 3. Statische Auslieferung als Koa-Middleware vor dem Lobby-Router
Wie Ausgebremst: `backend/src/staticFiles.ts` wird per `server.app.use(...)` vor `server.run()` eingehängt; nur `GET`/`HEAD`; Content-Type nach Endung; `/assets/index-*.{js,css}` (Vite-Hash) `immutable`, Kartenbilder `max-age=86400`, alles andere `no-cache`; `/games` und `/games/…` gehen unverändert an den Lobby-Router; Pfade **ohne** Dateiendung bekommen die `index.html` (SPA-Fallback), fehlende Pfade **mit** Endung ein 404. URL-Pfade werden dekodiert (Dateinamen mit Leerzeichen wie `Charakterkarte Hinten.png`). Die Middleware liest per `fs.readFileSync` aus dem Manifest — das funktioniert im `$bunfs` des Binaries ebenso wie unter Node; Tests (vitest, `backend/src/__tests__/static.test.ts`) übergeben ein Test-Manifest mit temporären Dateien. Ist das Manifest leer (Node-Entwicklung), ist die Middleware ein No-op.

### 4. WebSocket-Fix aus Ausgebremst
`backend/src/wsTextFrames.ts` wird übernommen: einmaliger Patch auf `require("ws").Server.prototype.handleUpgrade`, der Text-Frames als String an engine.io weiterreicht; `wsEngine` bleibt Standard. Unter Node (ws@7) läuft der Patch ins Leere, er wird trotzdem nur unter Bun angewendet (`typeof Bun !== "undefined"`). Betrifft Browser **und** die In-Process-NPC-Clients — ohne Fix würden alle auf Long-Polling zurückfallen.

### 5. Bind-Adresse, Port und BotRunner-URL
- `app.listen` wird vor `run()` so umhüllt, dass `HOST` durchgereicht wird (boardgame.io kennt keinen Host). Ohne `HOST` lauscht der Server wie bisher auf allen Interfaces (der bisherige Default `127.0.0.1` war nie wirksam und entfällt).
- Produktion: `HOST=172.18.0.1` (Gateway des Docker-Netzes `web`, für Traefik erreichbar, aus dem Internet nicht), `PORT=3002`, weil Ausgebremst `3001` belegt.
- Der BotRunner verbindet sich mit `http://${HOST}:${PORT}`, bei fehlendem `HOST` oder `0.0.0.0`/`::` mit `127.0.0.1`. Sonst würde er im Produktionsbetrieb ins Leere verbinden.

### 6. Datenverzeichnisse per Umgebung
`MATCHES_DIR` (Default `./data`) ersetzt das fest verdrahtete `./data`; `NPC_DATA_DIR` existiert schon, der `__dirname`-Default zeigt im Binary aber in das virtuelle `$bunfs` — die Unit setzt beide Variablen explizit, der Default wird auf `<cwd>/data-npc` umgestellt (`__dirname` würde im Binary nie stimmen; unter `make backend` ist cwd ohnehin `backend/`, also identisch zum bisherigen Pfad). node-persist (über `FlatFile`) wird **mit** gebündelt (kein `--external`); der Build-Test prüft, dass Spielstände geschrieben werden.

### 7. Frontend nutzt standardmäßig den eigenen Origin
`SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin`. `game-web/.env.development` setzt `VITE_SERVER_URL=http://localhost:3001`, damit `make dev` unverändert funktioniert. Der Binary-Build setzt keine Server-URL.

### 8. CORS / Origins
Socket.IO prüft auch bei gleichem Origin den `Origin`-Header gegen die boardgame.io-Origins. Die Unit setzt daher weiter `EXTRA_ORIGINS=https://molthar.apps.diefranks.eu` (deckt auch Anfragen alter Clients an `molthar-api` ab). Die bisherigen Docker/nginx-Einträge (`http://localhost:80` usw.) bleiben harmlos stehen.

### 9. Traefik: Repo nachziehen, Route als Datei
- `deploy/traefik/traefik.yml` bekommt `providers.file` (`directory: /etc/traefik/dynamic`, `watch: true`), `deploy/traefik/docker-compose.yml` den Mount `./dynamic:/etc/traefik/dynamic:ro`, `deploy/traefik/dynamic/.gitkeep`. Damit entspricht das Repo dem Server; ein späteres `scp -r deploy/traefik` hängt Ausgebremst nicht mehr ab. Nach `scp` von Traefik-Dateien ist **kein** Neustart nötig, solange `traefik.yml` und Compose-Datei unverändert gegenüber dem Server sind (wird vor der Umstellung per `diff` geprüft).
- Routing-Datei `deploy/molthar/traefik-molthar.yml` → Server `~/deploy/traefik/dynamic/molthar.yml`: Router `molthar` (`Host(molthar.apps.diefranks.eu)`) und `molthar-api` (Übergang), `entryPoints: websecure`, `tls.certResolver: letsencrypt`, `tls.domains: *.apps.diefranks.eu`; Service `molthar` → `http://172.18.0.1:3002`. Resolver und Domain identisch zu den bisherigen Labels → das vorhandene Wildcard-Zertifikat wird verwendet.
- **Reihenfolge:** Docker-Router (`molthar@docker`) und File-Router (`molthar@file`) mit gleicher Host-Regel dürfen nie gleichzeitig existieren → erst Container stoppen, dann Routing-Datei ablegen.

### 10. systemd-Unit
`deploy/molthar/molthar.service`: `User=molthar` (Systembenutzer), `ExecStart=/opt/molthar/molthar`, `StateDirectory=molthar`, `WorkingDirectory=/var/lib/molthar`, `Environment=HOST=172.18.0.1 PORT=3002 MATCHES_DIR=/var/lib/molthar/data NPC_DATA_DIR=/var/lib/molthar/data-npc MATCH_TTL_DAYS=1 EXTRA_ORIGINS=https://molthar.apps.diefranks.eu`, `Restart=always`, `RestartSec=2`, `After=docker.service network-online.target`, `Wants=docker.service` (die Bridge-Adresse existiert erst mit dem Docker-Netz), Härtung `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`. Logs über journald (systemd-Standardrotation, damit entfällt die Docker-Logrotation).

### 11. Deploy und Rollback
Wie Ausgebremst: `make deploy` = Frontend bauen (ohne `VITE_SERVER_URL`), Manifest generieren, cross-kompilieren; auf dem Server Gateway-IP per `docker network inspect web` prüfen (Abbruch bei Abweichung), `scp` nach `/opt/molthar/molthar.new`, Unit und Routing-Datei mit übertragen, `molthar` → `molthar.prev`, `.new` → `molthar`, `daemon-reload`, `systemctl restart molthar`, Health-Check `curl http://172.18.0.1:3002/games`. `make deploy-rollback` tauscht `molthar` und `molthar.prev` und startet neu. Dazu `deploy-status` (systemctl status + Traefik-Container) und `deploy-logs` (`journalctl -fu molthar`).

### 12. Smoke-Test über die bestehende E2E-Suite
Statt eines neuen Skripts wird `backend/e2e/lobby-e2e.cjs` wiederverwendet (echte LobbyClients und boardgame.io-Socket-Clients inkl. NPC-Szenarien, `SERVER=…`). Neues Make-Target `smoke URL=…` startet die Szenarien `handy`, `npc`, `mixed` (das Szenario `corrupt` braucht Zugriff aufs lokale Datenverzeichnis und läuft nur lokal). Die Clients laufen unter Node, verbinden sich aber per WebSocket mit dem Bun-Binary — genau die Strecke, die der WS-Fix absichert.

## Risks / Trade-offs

- [Der Molthar-Server lief nie unter Bun; boardgame.io/koa/socket.io, node-persist und die In-Process-Bots im Binary sind ungetestet] → Vor jeder Server-Umstellung lokal `make binary-local`, dann `make smoke` und ein Neustart-Test mit laufender NPC-Partie gegen das lokale Binary; erst danach `make binary` für Linux.
- [Unterschiede im Spielverhalten Bun vs. Node, z. B. `seedrandom`, Zeitgeber der Bots] → Die Spiellogik selbst ist reine JS-Logik; der Smoke-Test spielt komplette NPC-Partien. Die Unit-Tests bleiben unter Node.
- [Binary-Größe ~150 MB (Bun-Laufzeit ~90 MB + ~50 MB Bilder) bei 3,4 GB freier Platte] → Nur `molthar`, `.new`, `.prev` werden gehalten; `docker image rm` der Molthar-Images gibt mehr frei, als die drei Binaries belegen.
- [RAM: Ausgebremst ~90 MB + Molthar-Binary + Traefik bei 850 MB] → Nach der Umstellung `systemctl status` (Memory) beobachten; der Wegfall von zwei Containern (Node + nginx) sollte den Mehrbedarf ausgleichen.
- [Gateway-IP 172.18.0.1 ändert sich, falls das Netz `web` neu angelegt wird] → Prüfung im Deploy (Entscheidung 11), IP nur in Unit und Routing-Datei.
- [Traefik-Dateien im Repo und auf dem Server weichen ab] → Vor der Umstellung `diff` Repo ↔ Server; kein `scp` von `traefik.yml`/Compose, wenn ein Neustart die Folge wäre. Vor jedem Traefik-Neustart `acme.json` auf gültiges JSON prüfen (Vorfall vom 23.09.).
- [Alte Clients mit gecachtem Bundle rufen `molthar-api` auf] → Übergangs-Router bleibt; Entfernen in einem späteren Change.
- [Server-Eingriffe (Daten kopieren, Container stoppen) sind riskant und wurden in der Ausgebremst-Session vom Auto-Mode teils blockiert] → Diese Schritte werden als einzelne, dokumentierte Befehle vorbereitet und mit dem Nutzer abgestimmt bzw. von ihm ausgeführt; keine Umgehung.

## Migration Plan

1. Lokal: `make binary-local`, Smoke-Test, Neustart-Test mit NPC-Partie, Browser-Test; Kopie der Server-Daten (`data`, `data-npc`) lokal laden und prüfen, dass Partien abrufbar sind.
2. Server vorbereiten (ohne Unterbrechung): Systembenutzer `molthar`, `/opt/molthar`, Unit installieren (nicht starten), Binary hochladen, Probestart auf `127.0.0.1:3999` mit Kopie der Daten in einem Temp-Verzeichnis.
3. Umstellung (kurzer Ausfall): `docker compose down` in `~/deploy/molthar`; `data` und `data-npc` nach `/var/lib/molthar/` kopieren (Eigentümer `molthar`); `systemctl enable --now molthar`; `curl http://172.18.0.1:3002/games/portale-von-molthar` prüfen.
4. Routing: `molthar.yml` nach `~/deploy/traefik/dynamic/` (Traefik lädt per Watch). HTTPS für `molthar`, `molthar-api` und `ausgebremst` prüfen.
5. Aufräumen: `~/deploy/molthar` (Compose, alte Daten) archivieren, Molthar-Images entfernen; ghcr.io-Pakete `molthar-backend/-frontend` löscht der Nutzer manuell.

**Rollback der Umstellung:** `systemctl disable --now molthar`, `dynamic/molthar.yml` entfernen, Container mit dem bisherigen Compose (`IMAGE_TAG=latest`) wieder starten, `data`/`data-npc` aus `/var/lib/molthar` zurückkopieren (die alten Verzeichnisse bleiben bis zum Aufräumen unangetastet erhalten).

## Open Questions

- Wann wird der Übergangs-Router `molthar-api.apps.diefranks.eu` entfernt? Betrifft nur den Aufräumzeitpunkt.
