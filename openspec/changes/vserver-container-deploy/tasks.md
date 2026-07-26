## 1. DNS & Netcup-Vorbereitung (manuell, nicht blockierend)

- [x] 1.1 A-Record `apps` → vServer-IPv4 in Netcup CCP DNS-Editor anlegen
- [x] 1.2 A-Record `*.apps` (Wildcard) → vServer-IPv4 anlegen
- [x] 1.3 IPv6-Status geprüft: vServer hat keine globale IPv6-Adresse → keine AAAA-Records nötig
- [ ] 1.4 Netcup CCP API-Zugang aktivieren (Menü: Stammdaten → Webservice/API)
- [ ] 1.5 Customer-Nummer, API-Key, API-Passwort notieren (sicher ablegen — werden in `deploy/traefik/.env` gebraucht)
- [ ] 1.6 Verify: `dig apps.<domain> +short` liefert vServer-IP; `dig xyz.apps.<domain> +short` ebenfalls (Wildcard-Test)

## 2. vServer-Bootstrap (einmalig, per SSH)

- [ ] 2.1 SSH auf vServer: `ssh vServer`, Docker-Version prüfen (`docker --version`, `docker compose version`)
- [ ] 2.2 Falls Docker fehlt: `curl -fsSL https://get.docker.com | sh` (siehe `deploy/README.md`)
- [ ] 2.3 GHCR-Login: `docker login ghcr.io` mit GitHub-PAT (`read:packages`-Scope)
- [ ] 2.4 Verzeichnisse anlegen: `mkdir -p ~/deploy/traefik ~/deploy/molthar`
- [ ] 2.5 Docker-Netzwerk erstellen: `docker network create web`
- [ ] 2.6 Verify: `make deploy-init` (vom lokalen Repo aus) liefert grüne Häkchen

## 3. Traefik-Stack (Dateien im Repo)

- [x] 3.1 `deploy/traefik/traefik.yml` erstellt: entryPoints (web/websecure mit HTTP→HTTPS-Redirect), providers.docker (exposedByDefault=false, network=web)
- [x] 3.2 `deploy/traefik/traefik.yml`: `api.dashboard: false`, `api.insecure: false`, `log.level: INFO`, `accessLog: {}`
- [x] 3.3 `deploy/traefik/docker-compose.yml` erstellt (traefik:v3.2, Ports 80/443, Volumes für yml/acme.json/docker.sock, Netcup-Env, ACME-Resolver als command args — netcup DNS-01 + delayBeforeCheck 120)
- [x] 3.4 `deploy/traefik/.env.example` erstellt: `ACME_EMAIL`, `NETCUP_CUSTOMER_NUMBER`, `NETCUP_API_KEY`, `NETCUP_API_PASSWORD`
- [x] 3.5 `deploy/traefik/.gitignore` erstellt: `.env`, `acme.json`
- [x] 3.6 Verify: `docker compose config` mit gesetzten Env-Vars validiert ohne Fehler (OK)

## 4. App-Stack (Dateien im Repo)

- [x] 4.1 `deploy/molthar/docker-compose.yml` erstellt: services backend + frontend mit `${IMAGE_TAG:-latest}`
- [x] 4.2 Backend-Service: Traefik-Labels Host `molthar-api.${APPS_DOMAIN}`, entrypoints=websecure, tls.certresolver=letsencrypt, tls.domains[0].main=`*.${APPS_DOMAIN}` (Wildcard), Service-Port 3001, Volume `./data:/app/data`, Env `EXTRA_ORIGINS=https://molthar.${APPS_DOMAIN}`, keine ports
- [x] 4.3 Frontend-Service: Traefik-Labels Host `molthar.${APPS_DOMAIN}`, entrypoints=websecure, tls.certresolver=letsencrypt, tls.domains[0].main=`*.${APPS_DOMAIN}`, Service-Port 80, `depends_on: [backend]`, keine ports
- [x] 4.4 Beide Services: `restart: unless-stopped`
- [x] 4.5 `deploy/molthar/.env.example` erstellt: `APPS_DOMAIN=apps.example.com`, `IMAGE_TAG=latest`
- [x] 4.6 `deploy/molthar/.gitignore` erstellt: `.env`, `data/`
- [x] 4.7 Verify: `docker compose config` mit gesetzten Env-Vars validiert ohne Fehler (OK)

## 5. Bootstrap-Deployment (einmalig)

- [ ] 5.1 `deploy/traefik/` per `scp -r deploy/traefik vServer:~/deploy/` übertragen
- [ ] 5.2 Auf vServer: `~/deploy/traefik/.env` aus `.env.example` erstellen und Netcup-Credentials + `ACME_EMAIL` befüllen
- [ ] 5.3 Auf vServer: `touch ~/deploy/traefik/acme.json && chmod 600 ~/deploy/traefik/acme.json`
- [ ] 5.4 Auf vServer: `cd ~/deploy/traefik && docker compose up -d`
- [ ] 5.5 Verify: `docker compose logs traefik` zeigt keinen Fehler; kein "ACME account" Fehler nach 2 Minuten
- [ ] 5.6 `deploy/molthar/` per `scp -r deploy/molthar vServer:~/deploy/` übertragen
- [ ] 5.7 Auf vServer: `~/deploy/molthar/.env` aus `.env.example` erstellen und `APPS_DOMAIN=apps.<domain>` setzen

## 6. Makefile-Erweiterung

- [x] 6.1 Neue Variablen: `DEPLOY_HOST`, `DEPLOY_PATH`, `APPS_DOMAIN`, `GIT_SHA` — im Deployment-Block ergänzt
- [x] 6.2+6.3 Target `deploy-build`: buildx `--platform linux/amd64 --push` (build + push in einem Schritt, taggt latest + git-<sha>), Frontend mit `--build-arg VITE_SERVER_URL=https://molthar-api.$(APPS_DOMAIN)` — die getrennten Targets `deploy-build` und `deploy-push` aus der ursprünglichen Task wurden zu einem zusammengeführt (buildx --push macht beides)
- [x] 6.4 Target `deploy-remote`: ssh mit `IMAGE_TAG=$${TAG:-latest} docker compose pull && up -d`
- [x] 6.5 Target `deploy`: `deploy-build → deploy-remote`
- [x] 6.6 Target `deploy-rollback`: erfordert `TAG=...`, ruft `deploy-remote` mit gesetztem TAG
- [x] 6.7 Target `deploy-logs`: `ssh -t` mit `docker compose logs -f --tail=100`
- [x] 6.8 Target `deploy-status`: `docker compose ps` via SSH
- [x] 6.9 Target `deploy-restart`: `docker compose restart` via SSH
- [x] 6.10 Target `deploy-init`: prüft Docker-Version, Compose-Plugin, Netzwerk `web`, Ordner, `.env`-Dateien
- [x] 6.11 Help-Text um "Deployment (vServer via SSH + Traefik)"-Sektion erweitert
- [x] 6.12 Verify: `make help` zeigt neue Targets, `make -n deploy-status` liefert korrekte SSH-Kommandozeile

## 7. Lokaler Docker-Workflow (Beibehaltung + Klarstellung)

- [x] 7.1 ~~`docker-compose.local.yml` erstellen~~ → **entfallen**: reine Duplikation. `docker-compose.yml` IST der lokale Compose-File und bleibt der default für `docker compose up`.
- [x] 7.2 `docker-compose.yml` bleibt unverändert (kein Edit gemacht)
- [x] 7.3 `docker-compose.prod.yml` gelöscht
- [x] 7.4 Makefile-Target `docker-run-prod` entfernt
- [x] 7.5 Help-Text: `docker-*`-Sektion mit "Docker (local — build & run on this machine)" Überschrift
- [x] 7.6 Verify: `docker compose config` (Root) validiert ohne Fehler

## 8. Dokumentation

- [x] 8.1 `deploy/README.md` erstellt: Voraussetzungen, Erst-Bootstrap (Schritte 1–8), Deploy-Workflow, Rollback, Betriebs-Playbook, Backup, Neue-App-Anleitung, Troubleshooting
- [x] 8.2 Bootstrap-Sektion: DNS, Netcup-API, Docker-Install, GHCR-Login, Netzwerk, scp-Schritte für beide Stacks, deploy-init-Check
- [x] 8.3 Backup-Notiz enthalten (acme.json, data/, .env)
- [x] 8.4 ~~Root-`.env.example` erweitern~~ → **entfällt**: Makefile liest keine deploy-relevanten Vars aus Root-`.env`; alle deploy-Vars leben in `deploy/*/.env`
- [x] 8.5 Haupt-`README.md`: alte "Docker Compose Integration"- und "Mit Traefik"-Sektionen (bezogen sich auf gelöschten `docker-compose.prod.yml`) durch schlanke "Production Deployment"-Sektion mit Verweis auf `deploy/README.md` ersetzt
- [x] 8.6 `CLAUDE.md` erweitert: neue "Deployment (vServer)"-Sektion mit Kommandos + Verweis auf deploy/README.md

## 9. End-to-End Smoke Test (nach abgeschlossener Bootstrap)

- [ ] 9.1 `make deploy` ausführen
- [ ] 9.2 `curl -I https://molthar.apps.<domain>` → HTTP 200, gültiges Cert
- [ ] 9.3 `curl -I https://molthar-api.apps.<domain>` → HTTP 404 oder 200 (je nach bgio-Root-Handler), gültiges Cert
- [ ] 9.4 Browser: `https://molthar.apps.<domain>` öffnen, DevTools Network → WSS-Verbindung zu `molthar-api.apps.<domain>` erfolgreich
- [ ] 9.5 Lobby laden, Spiel starten mit zweitem Browser/Tab, Move ausführen — State-Sync funktioniert
- [ ] 9.6 `make deploy-logs` zeigt Requests, keine CORS- oder ACME-Fehler
- [ ] 9.7 Rollback-Test: `make deploy-rollback TAG=git-<previous-sha>` läuft durch, App zeigt vorherige Version
