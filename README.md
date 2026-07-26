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

Sind die Standardports belegt, können sie überschrieben werden. Da `VITE_SERVER_URL` beim Build eingebrannt wird, müssen beide Images neu gebaut werden:

```bash
# Backend auf 3002, Frontend auf 8080
BACKEND_PORT=3002 FRONTEND_PORT=8080 make docker-build
BACKEND_PORT=3002 FRONTEND_PORT=8080 make docker-run
```

### Images aus der GitHub Container Registry

Fertig gebaute Images (AMD64 + ARM64) sind auf ghcr.io verfügbar:

```
ghcr.io/ulrichfrank/molthar-backend:latest
ghcr.io/ulrichfrank/molthar-frontend:latest
```

---

## Production Deployment

Für den Betrieb auf einem entfernten Server (Netcup vServer via SSH, HTTPS über Traefik + Let's Encrypt Wildcard-Cert) siehe **[`deploy/README.md`](./deploy/README.md)**.

Kurzform nach abgeschlossenem Bootstrap:

```bash
make deploy                      # build + push + SSH pull + up
make deploy-status               # laufende Container prüfen
make deploy-rollback TAG=git-<sha>   # auf frühere Version zurück
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
