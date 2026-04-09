# Portale von Molthar

Digitale Multiplayer-Umsetzung des Kartenspiels **Portale von Molthar**. Rundenbasiertes Strategiespiel für 2–4 Spieler, bei dem Charakterkarten mithilfe von Perlenkarten (1–8) aktiviert werden, um Machtpunkte zu sammeln.

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Express.js, boardgame.io, Node.js 20+ |
| Multiplayer | boardgame.io (Socket.IO) |
| Testing | Vitest, React Testing Library |
| Paketmanager | pnpm Workspaces |

## Monorepo-Struktur

```
molthar/
├── shared/        # Spiellogik, Typen, Kostenberechnung
├── backend/       # Express + boardgame.io Server
├── game-web/      # React Frontend (Vite)
├── card-manager/  # Karten-Verwaltungswerkzeug
└── assets/        # Kartenbilder und Ressourcen
```

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Installation & Start

```bash
make install   # Abhängigkeiten installieren
make dev       # Backend (localhost:3001) + Frontend (localhost:5173) starten
```

Weitere Befehle:

```bash
make test          # Tests ausführen
make build-all     # Backend + Shared bauen
make help          # Alle verfügbaren Befehle anzeigen
```

---

## Docker

### Images lokal bauen

```bash
make docker-build        # Backend + Frontend Images bauen
make docker-run          # Container starten (Backend :3001, Frontend :80)
make docker-stop         # Container stoppen
make docker-logs         # Logs verfolgen
```

Frontend: **http://localhost** · Backend: **http://localhost:3001**

### Images aus der GitHub Container Registry

Fertig gebaute Images (AMD64 + ARM64) sind auf ghcr.io verfügbar:

```
ghcr.io/ulrichfrank/molthar-backend:latest
ghcr.io/ulrichfrank/molthar-frontend:latest
```

---

## Docker Compose Integration

### Standalone (Raspberry Pi, Homeserver, Synology)

`docker-compose.prod.yml` auf den Server kopieren und starten:

```bash
# Einmalig einrichten
mkdir -p ~/docker/molthar && cd ~/docker/molthar
curl -O https://raw.githubusercontent.com/UlrichFrank/molthar/main/docker-compose.prod.yml

# Starten
docker compose -f docker-compose.prod.yml up -d
```

Das Frontend ermittelt die Backend-URL automatisch aus `window.location.hostname` —
kein manuelles Konfigurieren der IP nötig.

Werden Requests von einer bestimmten Origin blockiert (z.B. bei Reverse Proxy),
kann die CORS-Allowlist per Umgebungsvariable erweitert werden:

```bash
EXTRA_ORIGINS=http://mein-nas.local docker compose -f docker-compose.prod.yml up -d
```

### Integration in ein bestehendes Docker Compose Setup

Portale von Molthar lässt sich als Sektion in ein vorhandenes `docker-compose.yml` einbinden:

```yaml
services:
  # ... deine anderen Services ...

  portale-backend:
    image: ghcr.io/ulrichfrank/molthar-backend:latest
    ports:
      - "3001:3001"
    restart: unless-stopped
    volumes:
      - portale_data:/app/data
    environment:
      # Comma-separated zusätzliche CORS-Origins (optional)
      - EXTRA_ORIGINS=http://192.168.1.100,http://mein-server.local

  portale-frontend:
    image: ghcr.io/ulrichfrank/molthar-frontend:latest
    ports:
      - "3000:80"       # Port anpassen falls 80 belegt ist
    depends_on:
      - portale-backend
    restart: unless-stopped

volumes:
  portale_data:
```

Nach dem Start ist das Spiel erreichbar unter **http://\<server-ip\>:3000**.

### Mit Traefik Reverse Proxy

```yaml
services:
  portale-backend:
    image: ghcr.io/ulrichfrank/molthar-backend:latest
    restart: unless-stopped
    volumes:
      - portale_data:/app/data
    environment:
      - EXTRA_ORIGINS=https://molthar.example.com
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.molthar-api.rule=Host(`molthar.example.com`) && PathPrefix(`/games`, `/socket.io`)"
      - "traefik.http.services.molthar-api.loadbalancer.server.port=3001"

  portale-frontend:
    image: ghcr.io/ulrichfrank/molthar-frontend:latest
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.molthar.rule=Host(`molthar.example.com`)"
      - "traefik.http.services.molthar.loadbalancer.server.port=80"

volumes:
  portale_data:
```

### Updates

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Release & CI/CD

Ein neues Release wird durch einen Git-Tag ausgelöst:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Die GitHub Action (`release.yml`) erstellt automatisch:
1. Ein GitHub Release mit generierten Release Notes
2. Docker Images für `linux/amd64` und `linux/arm64` auf ghcr.io

---

## Spielmechanik

- **Ziel:** Als Erster 12 Machtpunkte erreichen
- **Perlen:** Karten mit Werten 1–8, werden zum Aktivieren von Charakteren eingesetzt
- **Charaktere:** Karten im Portal des Spielers mit einmaligen (rot) oder dauerhaften (blau) Fähigkeiten
- **Finalrunde:** Nach Erreichen von 12 Punkten spielen alle Mitspieler noch eine vollständige Runde
