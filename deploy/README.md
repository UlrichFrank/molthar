# Deployment: vServer mit Traefik

Dieses Verzeichnis enthält die Infrastruktur, um die App als Container auf einem entfernten Server (Netcup vServer, SSH-Alias `vServer`) zu betreiben, mit Traefik als HTTPS-Reverse-Proxy und Wildcard-Zertifikat via Let's Encrypt.

```
deploy/
├── traefik/            # Zentraler Reverse-Proxy (läuft einmal, für alle Apps)
│   ├── docker-compose.yml
│   ├── traefik.yml
│   └── .env.example
└── molthar/            # Dieser App-Stack (Backend + Frontend)
    ├── docker-compose.yml
    └── .env.example
```

## Voraussetzungen

- Netcup vServer erreichbar über SSH-Alias `vServer`
- Eine Domain, deren DNS-Zone du in Netcup CCP verwaltest
- GitHub Personal Access Token (PAT) mit `read:packages`-Scope für ghcr.io

## Erst-Bootstrap (einmalig, auf dem vServer)

### 1. DNS in Netcup CCP anlegen

- A-Record `apps.<domain>` → `<vServer-IP>`
- A-Record `*.apps.<domain>` → `<vServer-IP>` (Wildcard, für weitere Apps)

Prüfen: `dig apps.<domain> +short` und `dig irgendwas.apps.<domain> +short` müssen die vServer-IP zurückgeben.

### 2. Netcup API aktivieren

Netcup CCP → Stammdaten → Webservice/API → API-Zugang aktivieren. Notieren: Customer-Nr., API-Key, API-Passwort. Wird für die DNS-01 ACME-Challenge gebraucht.

### 3. Docker auf vServer installieren

```bash
ssh vServer
docker --version   # falls installiert, weiter mit Schritt 4
```

Falls nicht installiert, offizielles Skript:

```bash
curl -fsSL https://get.docker.com | sh
```

Compose-Plugin sollte inklusive sein: `docker compose version`.

### 4. Verzeichnisse, Netzwerk, GHCR-Login

```bash
ssh vServer
mkdir -p ~/deploy/traefik ~/deploy/molthar
docker network create web
docker login ghcr.io   # username: <github-user>, password: <PAT mit read:packages>
```

### 5. Traefik-Stack übertragen und starten

Vom lokalen Repo aus:

```bash
scp -r deploy/traefik vServer:~/deploy/
```

Auf dem vServer:

```bash
ssh vServer
cd ~/deploy/traefik
cp .env.example .env
vi .env            # ACME_EMAIL + Netcup-Credentials eintragen
touch acme.json && chmod 600 acme.json
docker compose up -d
docker compose logs -f    # kontrollieren: kein Fehler nach ~2 Min
```

### 6. App-Stack übertragen

Vom lokalen Repo aus:

```bash
scp -r deploy/molthar vServer:~/deploy/
```

Auf dem vServer:

```bash
ssh vServer
cd ~/deploy/molthar
cp .env.example .env
vi .env            # APPS_DOMAIN=apps.deinedomain.de setzen
```

### 7. Bootstrap prüfen

Vom lokalen Repo aus:

```bash
make deploy-init
```

Sollte grüne Häkchen für Docker, Compose, Netzwerk, Ordner und beide `.env`-Dateien liefern.

### 8. Ersten Deploy auslösen

```bash
make deploy
```

Dann `https://molthar.apps.deinedomain.de` im Browser öffnen. Beim allerersten Aufruf kann die Cert-Ausstellung bis zu 2 Minuten dauern (Netcup DNS-Propagation).

## Deploy-Workflow (Alltag)

```bash
make deploy              # build (linux/amd64) + push + SSH pull + up
make deploy-status       # welche Container laufen mit welchem Image?
make deploy-logs         # Live-Logs
make deploy-restart      # Container neustarten (ohne neues Image)
```

Nach jedem Pull + Up räumt `make deploy` auf dem vServer automatisch mit `docker system prune -af` auf: alte (nicht mehr referenzierte) Images, gestoppte Container, ungenutzte Netzwerke und der komplette Build-Cache werden entfernt. Läuft, damit der vServer-Speicherplatz bei jedem Deploy nicht weiter zuwächst — betrifft nur ungenutzte Objekte, laufende Container (`backend`, `frontend`, `traefik`) und das Bind-Mount `~/deploy/molthar/data` bleiben unangetastet.

## Rollback

Jeder `make deploy` pusht zwei Tags: `latest` und `git-<current-sha>`. Rollback:

```bash
make deploy-rollback TAG=git-<older-sha>
```

Zurück auf latest:

```bash
make deploy-rollback TAG=latest
```

Um zu sehen welche Tags verfügbar sind: https://github.com/UlrichFrank/molthar/pkgs/container/molthar-backend

## Betriebs-Playbook

**App reagiert nicht:**
```bash
make deploy-status       # Container-Status (Traefik + molthar)
make deploy-logs         # Fehler in den Logs?
make deploy-restart      # Neustart versuchen
```

`deploy-status` und `deploy-init` prüfen auch, ob der Traefik-Container läuft. Wichtig: `make deploy`/`deploy-remote` starten **nur** den `molthar`-Stack — Traefik läuft als eigener Stack unter `~/deploy/traefik` und wird nie automatisch mitgestartet. Falls der Traefik-Container manuell entfernt wurde (z.B. durch `docker rm`/`docker system prune` direkt auf dem vServer), bleibt er weg, bis er explizit neu gestartet wird:
```bash
ssh vServer 'cd ~/deploy/traefik && docker compose up -d'
```
Backend/Frontend können dabei problemlos weiterlaufen (`deploy-status` zeigt sie als "Up"), obwohl von außen kein Traffic ankommt — sie exponieren keine Host-Ports und hängen komplett vom Traefik-Routing ab.

**Traefik reagiert nicht (kein HTTPS, kein Redirect):**
```bash
ssh vServer 'cd ~/deploy/traefik && docker compose ps'
ssh vServer 'cd ~/deploy/traefik && docker compose logs --tail=100'
ssh vServer 'cd ~/deploy/traefik && docker compose restart'
```

**Cert-Erneuerung fehlgeschlagen (nach 90 Tagen):**
- Netcup-API-Credentials prüfen (könnten rotiert worden sein)
- `~/deploy/traefik/acme.json` inspizieren: `sudo cat ~/deploy/traefik/acme.json | jq '.letsencrypt.Certificates[].domain'`
- Traefik-Logs zeigen ACME-Fehler mit Detail

## Backup

Sichere regelmäßig:
- `~/deploy/traefik/acme.json` — enthält Let's Encrypt Certs (Rate-Limit beim Neuausstellen!)
- `~/deploy/molthar/data/` — Container-Volume (aktuell leer, wird bei bgio-Persistenz relevant)
- `~/deploy/{traefik,molthar}/.env` — Zugangsdaten

## Neue App unter `*.apps.<domain>` hinzufügen

1. Neuen Compose-Stack anlegen unter `deploy/<appname>/docker-compose.yml`
2. Am externen Netzwerk `web` teilnehmen
3. Traefik-Labels analog zu `deploy/molthar/docker-compose.yml` setzen (Hostname `<appname>.${APPS_DOMAIN}`)
4. Auf vServer scp'en, `docker compose up -d`

Kein Anfassen von `deploy/traefik/` nötig — Wildcard-Cert deckt neue Subdomain automatisch ab.

## Troubleshooting

**"CORS error" im Browser:**
- `EXTRA_ORIGINS` im Backend muss exakt die Frontend-URL enthalten (inkl. `https://`, kein Trailing-Slash)
- Im `deploy/molthar/docker-compose.yml` steht `EXTRA_ORIGINS=https://molthar.${APPS_DOMAIN}` — prüfen dass `APPS_DOMAIN` in `.env` gesetzt ist

**"exec format error" beim Container-Start:**
- Image wurde ohne `--platform linux/amd64` gebaut. `make deploy` macht das automatisch.

**ACME-Challenge schlägt fehl:**
- Netcup DNS ist langsam; `delayBeforeCheck: 120` in `traefik.yml` sollte reichen
- Netcup API-Credentials prüfen: Customer-Nr., Key, Passwort exakt aus CCP
- Rate-Limit: Let's Encrypt erlaubt 5 fehlgeschlagene Requests pro Stunde. Bei viel Debugging Staging nutzen: `--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory`
