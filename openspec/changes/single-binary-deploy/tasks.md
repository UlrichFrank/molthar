# Tasks

## 1. Backend: Single-Binary-tauglich machen

- [x] 1.1 `HOST` als echte Bind-Adresse: `app.listen` vor `run()` umhüllen, ohne `HOST` weiter alle Interfaces; BotRunner-URL aus `HOST`/`PORT` ableiten (`0.0.0.0`/`::`/leer → `127.0.0.1`); verifizieren: `HOST=127.0.0.1 PORT=3911 node dist/server-bgio.js` lauscht nur auf 127.0.0.1 (`lsof -i :3911`) und das Log zeigt „BotRunner started“ ohne Scan-Fehler
- [x] 1.2 `MATCHES_DIR` (Default `./data`) für den `MatchStore`, `NPC_DATA_DIR`-Default auf `<cwd>/data-npc` umstellen, Kommentar in `bot-runner.ts` (Verweis auf docker-compose) anpassen; verifizieren: `MATCHES_DIR=/tmp/m NPC_DATA_DIR=/tmp/n` → nach Erstellen eines NPC-Matches liegen Dateien in beiden Verzeichnissen; `make test-e2e ONLY=npc RUNS=1` grün
- [x] 1.3 `backend/src/wsTextFrames.ts` aus Ausgebremst übernehmen und nur unter Bun anwenden; verifizieren: `bun backend/dist/server-bgio.js` (bzw. Bun-Start des Quellcodes) + `make test-e2e ONLY=npc RUNS=1` grün, Socket.IO-Client mit `transports: ["websocket"]` bleibt verbunden
- [x] 1.4 Eingebettete Kartendaten: `backend/src/embedded/cards.ts` (statischer JSON-Import, setzt `globalThis.__MOLTHAR_RAW_CARDS__`), `cardDatabaseLoader.js` nutzt das Global vorrangig, Fallback unverändert; verifizieren: `make test-shared` grün, `make backend` lädt Karten wie bisher aus der Datei
- [x] 1.5 Asset-Manifest: `backend/scripts/gen-assets.ts` → `backend/src/embedded/assets.gen.ts` (in `.gitignore`, von `tsc` ausgenommen; geladen nur im kompilierten Binary, daher kein Fallback-Modul nötig), Ausschlussliste (`raw/`, `*.af`, `*.md`, `*.txt`, `Anleitung.jpg`, `*.map`, `test-images.html`), Größen-Ausgabe und Abbruch über 150 MB; verifizieren: mit und ohne `game-web/dist` entsteht ein Modul, `cd backend && pnpm type-check` grün, Ausgabe nennt < 150 MB und keine `raw/`-Datei
- [x] 1.6 `backend/src/staticFiles.ts` als Koa-Middleware vor dem Lobby-Router (Content-Types, Cache-Header, URL-Dekodierung, SPA-Fallback nur ohne Dateiendung, 404 für fehlende Dateien, `/games…` unangetastet, No-op bei leerem Manifest) mit vitest-Tests `backend/src/__tests__/static.test.ts` (Datei, Datei mit Leerzeichen im Namen, Fallback, `HEAD`, fehlende `.png` → 404, `/games/portale-von-molthar/<unbekannt>` → 404); verifizieren: `cd backend && pnpm test -- --run` grün
- [x] 1.7 Binary-Einstiegspunkt `backend/src/main-binary.ts` (Import-Reihenfolge Karten → Assets → Server); verifizieren: `bun backend/src/main-binary.ts` startet, meldet die geladenen Karten ohne „cards.json not found“

## 2. Frontend: eigener Origin als Standard

- [x] 2.1 `SERVER_URL` in `game-web/src/lobby/useLobbyClient.ts` auf `VITE_SERVER_URL || window.location.origin` umstellen, `game-web/.env.development` mit `VITE_SERVER_URL=http://localhost:3001` anlegen (nicht von `.gitignore` erfasst prüfen); verifizieren: `make dev` → Spiel im Browser erstellen funktioniert; nach `pnpm --filter game-web build` findet `grep -l "molthar-api\|:3001" game-web/dist/assets/*.js` nichts

## 3. Build-Tooling und lokale Abnahme

- [x] 3.1 Makefile-Targets `binary` (→ `dist/molthar-linux-x64`, `--target=bun-linux-x64`) und `binary-local` (→ `dist/molthar`): shared bauen, Frontend bauen, Manifest generieren, `bun build --compile` (node-persist **nicht** external); verifizieren: `make binary-local`, Binary in leerem Temp-Verzeichnis starten → `/`, `/assets/cards.json`, `/assets/Charakterkarte%20Hinten.png`, `/games` liefern 200, `/assets/raw/…` 404; `file dist/molthar-linux-x64` meldet ELF x86-64
- [x] 3.2 Make-Target `smoke URL=…` (startet `backend/e2e/lobby-e2e.cjs` mit `SERVER=$(URL)`, `ONLY=handy,npc,mixed`, `RUNS=1`); verifizieren: `make smoke URL=http://127.0.0.1:3002` gegen das lokale Binary endet mit „3/3 bestanden“
- [x] 3.3 Neustart- und Übernahme-Test lokal: NPC-Partie starten, Binary während der Partie beenden und neu starten, Partie im Browser fortsetzen, NPC zieht weiter; zusätzlich eine Kopie von Server-`data` + `data-npc` (lesend per `scp` geholt) mit dem Binary laden und per `GET /games/portale-von-molthar` abrufen; Ergebnis in tasks.md notieren
  - Ergebnis 08.10.: zwei SIGTERM-Neustarts mitten in NPC-Partien (Szenarien `npc`, `mixed`) — beide Partien liefen bis zum Spielende weiter, BotRunner hat sich nach jedem Start wieder verbunden. Server-Kopie (11 Dateien, 2 beendete Partien, `credentials.json`) wird vollständig gelistet. Binary 112 MB (macOS) mit 83 eingebetteten Dateien / 40,9 MB; alle 56 vom Spiel genutzten Kartenbilder liefern 200.
- [ ] 3.4 `CLAUDE.md` (Befehle, Ports, Laufzeit Bun im Binary) und `README.md` aktualisieren; verifizieren: alle dort genannten `make`-Targets existieren (`make -n <target>`)

## 4. Server-Artefakte, Deploy und Docker-Abbau im Repo

- [x] 4.1 `deploy/traefik/` an den Server angleichen (`providers.file`, Mount `./dynamic`, `dynamic/.gitkeep`); verifizieren: `diff` gegen `ssh vServer cat ~/deploy/traefik/traefik.yml` bzw. `docker-compose.yml` zeigt keine Unterschiede
- [ ] 4.2 `deploy/molthar/molthar.service` und `deploy/molthar/traefik-molthar.yml` anlegen (siehe Design 9/10); verifizieren: `systemd-analyze verify` auf dem Server (Datei nach `/tmp`) ohne Fehler, YAML per `traefik`-Container oder YAML-Lint ohne Fehler
- [ ] 4.3 Makefile `deploy` (Build, Gateway-IP-Prüfung, Upload `.new`, Unit + Routing übertragen, Tausch `.prev`, Neustart, Health-Check), `deploy-rollback`, `deploy-status`, `deploy-logs`, `deploy-init` auf die neuen Voraussetzungen umbauen; verifizieren: `make -n deploy` zeigt die erwarteten Befehle; real in Gruppe 5
- [ ] 4.4 Docker-Artefakte von Molthar entfernen (`Dockerfile`, `Dockerfile.frontend`, `docker-compose.yml`, `deploy/molthar/docker-compose.yml`, `deploy/molthar/.env.example`, `docker-*`-Targets, `.dockerignore` falls vorhanden); Traefik-Stack bleibt; verifizieren: `grep -rn "docker" Makefile CLAUDE.md README.md` zeigt nur noch Traefik-bezogene Stellen
- [ ] 4.5 `deploy/README.md` neu schreiben (Erstinstallation, Traefik-File-Provider, `acme.json`-Prüfung vor Traefik-Neustart, Deploy, Rollback, Logs, Backup von `/var/lib/molthar`); verifizieren: jeder Befehl wird in Gruppe 5 so ausgeführt

## 5. Umstellung auf dem vServer (Schritte mit dem Nutzer abstimmen)

- [ ] 5.1 Server vorbereiten ohne Unterbrechung: Systembenutzer `molthar`, `/opt/molthar`, Unit installieren (nicht starten), Binary hochladen, Probestart mit `HOST=127.0.0.1 PORT=3999` und Datenkopie in Temp-Verzeichnis; verifizieren: `/games/portale-von-molthar` listet die Partien, Prozess wieder beendet
- [ ] 5.2 Container stoppen, `data` und `data-npc` nach `/var/lib/molthar/` kopieren (Eigentümer `molthar`), Dienst aktivieren und starten; verifizieren: `curl http://172.18.0.1:3002/games/portale-von-molthar` listet die übernommenen Partien, Log zeigt BotRunner ohne Fehler
- [ ] 5.3 `molthar.yml` nach `~/deploy/traefik/dynamic/` legen (kein Traefik-Neustart); verifizieren: `https://molthar.apps.diefranks.eu/` und `https://molthar-api.apps.diefranks.eu/games` liefern 200 mit Zertifikat `*.apps.diefranks.eu`, `https://ausgebremst.apps.diefranks.eu/` weiterhin 200
- [ ] 5.4 Erreichbarkeit nur über Traefik: `curl` von außen auf `<öffentliche-IP>:3002` schlägt fehl
- [ ] 5.5 Automatischer Neustart: `kill -9` auf den Dienstprozess → binnen Sekunden `active`, `/` liefert 200
- [ ] 5.6 `make deploy` und `make deploy-rollback` einmal real; verifizieren: nach Rollback läuft das vorherige Binary (Checksumme), Spielstände unverändert
- [ ] 5.7 Aufräumen: `~/deploy/molthar` archivieren, Molthar-Images entfernen; verifizieren: `docker ps` zeigt nur Traefik, `df -h /` zeigt freigewordenen Platz; Nutzer auf das manuelle Löschen der ghcr.io-Pakete hinweisen

## 6. Abnahme

- [ ] 6.1 `make smoke URL=https://molthar.apps.diefranks.eu` gegen die Produktion: alle Szenarien bestanden
- [ ] 6.2 Manueller Browser-Test (Desktop und Handy): Spiel mit NPC erstellen, Züge spielen, Seite neu laden und fortsetzen
