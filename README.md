# Portale von Molthar

Digitale Multiplayer-Umsetzung des Kartenspiels **Portale von Molthar**. Rundenbasiertes Strategiespiel für 2–4 Spieler, bei dem Charakterkarten mithilfe von Perlenkarten (1–8) aktiviert werden, um Machtpunkte zu sammeln.

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | boardgame.io (Koa), Node.js 20+ in der Entwicklung, Bun im Single Binary |
| Multiplayer | boardgame.io (Socket.IO) |
| Testing | Vitest, React Testing Library |
| Paketmanager | pnpm Workspaces |

## Monorepo-Struktur

```
molthar/
├── shared/        # Spiellogik, Typen, Kostenberechnung
├── backend/       # boardgame.io-Server, NPC-BotRunner
├── game-web/      # React Frontend (Vite)
├── card-manager/  # Karten-Verwaltungswerkzeug
└── assets/        # Kartenbilder und Ressourcen
```

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Bun ≥ 1.3 (nur für das Single Binary)

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

## Single Binary

Für den Betrieb wird alles — Spielserver, NPC-Gegner, Kartendaten und die gebaute Spielseite — mit `bun build --compile` zu **einer** ausführbaren Datei gebaut. Seite, Lobby-API und Socket.IO laufen über denselben Port.

```bash
make binary-local        # dist/molthar für diesen Rechner
make binary              # dist/molthar-linux-x64 für den vServer
```

Lokal starten (Daten landen in `./data` und `./data-npc` des Arbeitsverzeichnisses):

```bash
PORT=3002 ./dist/molthar          # → http://localhost:3002
make smoke URL=http://127.0.0.1:3002   # echte Lobby-/NPC-Partien dagegen spielen
```

Konfiguration über Umgebungsvariablen: `PORT`, `HOST` (Bind-Adresse, Standard: alle Interfaces), `MATCHES_DIR`, `NPC_DATA_DIR`, `MATCH_TTL_DAYS`, `EXTRA_ORIGINS`.

---

## Production Deployment

Auf dem vServer läuft das Binary als systemd-Dienst hinter Traefik (Wildcard-Zertifikat `*.apps.diefranks.eu`), siehe **[`deploy/README.md`](./deploy/README.md)**.

```bash
make deploy              # bauen, hochladen, neu starten, prüfen
make deploy-status       # Dienststatus
make deploy-rollback     # zurück auf das vorherige Binary
```

---

## Release & CI/CD

Ein neues Release wird durch einen Git-Tag ausgelöst:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Die GitHub Action (`release.yml`) erstellt ein GitHub Release mit generierten Release Notes und hängt das Linux-Binary `molthar-linux-x64` an.

---

## Spielmechanik

- **Ziel:** Als Erster 12 Machtpunkte erreichen
- **Perlen:** Karten mit Werten 1–8, werden zum Aktivieren von Charakteren eingesetzt
- **Charaktere:** Karten im Portal des Spielers mit einmaligen (rot) oder dauerhaften (blau) Fähigkeiten
- **Finalrunde:** Nach Erreichen von 12 Punkten spielen alle Mitspieler noch eine vollständige Runde
