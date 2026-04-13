# Hosting-Analyse: Portale von Molthar

## Das Kernproblem: boardgame.io braucht einen persistenten Server

```
  game-web (Vite/React)         backend (boardgame.io)
  ┌──────────────────┐          ┌──────────────────┐
  │                  │          │                  │
  │  boardgame.io    │◄────────►│  boardgame.io    │
  │  client          │  Socket  │  server          │
  │                  │   .IO    │  (Express)       │
  └──────────────────┘  WS/TCP  └──────────────────┘
                         ↑
                    PERSISTENTE VERBINDUNG
                    (bleibt offen für
                     gesamte Spielsession)
```

boardgame.io braucht Socket.IO — eine persistente TCP-Verbindung für die gesamte Spielsession.
Der Server ist die **Spielautorität**: er validiert Moves (INVALID_MOVE), mutiert den State und
broadcastet ihn an alle Clients. Clients senden nur Intents; der Server entscheidet.

Die Spiellogik in `shared/src/game/index.ts` ist vollständig vom Server getrennt — sie
wird aber serverseitig ausgeführt und kann nicht einfach in den Client verlagert werden.

---

## Was auf Vercel funktioniert, was nicht

```
  game-web  ✅  Vite-Build → statisches Bundle → Vercel CDN
  shared    ✅  Kein Deploy nötig (wird in game-web eingebaut)
  backend   ❌  Socket.IO braucht long-running Process
```

Vercel Functions sind stateless und Request/Response-basiert. Socket.IO ist
technisch inkompatibel.

---

## Option A — Split-Deploy (empfohlen für schnellen Start)

```
  Vercel (gratis)        Railway / Render / Fly.io
  ┌──────────────┐       ┌─────────────────────────┐
  │  game-web    │◄─────►│  backend                │
  │  Vite CDN    │  WS   │  long-running Node.js   │
  │  auto-deploy │       │  FlatFile persistence   │
  │  per branch  │       │  ~$5-7/Monat            │
  └──────────────┘       └─────────────────────────┘
```

**Was zu tun ist:**

1. `game-web/vercel.json` anlegen:
   ```json
   { "buildCommand": "pnpm build", "outputDirectory": "dist" }
   ```
2. In Vercel: Env var `VITE_SERVER_URL=https://dein-backend.railway.app` setzen
3. Backend auf Railway/Render deployen — `Dockerfile` existiert bereits,
   `PORT` und `EXTRA_ORIGINS` env vars werden bereits gelesen

**Vorteile:** Vercel-DX (Preview per PR, CDN), kein Code-Umbau  
**Nachteile:** zwei Plattformen, $5-7/Monat für Backend

---

## Option B — Alles auf Railway/Render/Fly.io

```
  Eine Plattform
  ┌─────────────────────────────────┐
  │  backend  (Express + Socket.IO) │
  │  game-web (static via Express)  │
  └─────────────────────────────────┘
```

**Was zu tun ist:** Docker Compose bereits vorhanden (`docker-compose.prod.yml`),
Container-Images bereits in GitHub Container Registry.

**Vorteile:** einfacher zu managen, eine Rechnung  
**Nachteile:** kein CDN für Frontend, kein Preview-Deploy per Branch

---

## Option C — Cloudflare Workers + Durable Objects (kein selbst verwalteter Server)

```
  Vercel CDN              Cloudflare Workers
  ┌──────────────┐        ┌─────────────────────────────┐
  │  game-web    │◄──────►│  backend                    │
  │  (static)    │   WS   │  Durable Object:            │
  └──────────────┘        │  persistenter Socket-State  │
                          │  boardgame.io Server-Code   │
                          └─────────────────────────────┘

  FREE TIER: 1M requests/Tag, 1GB storage, $0/Monat
```

boardgame.io hat eine Community-Integration für Cloudflare Durable Objects.
Durable Objects können persistente WebSocket-Verbindungen halten — genau das,
was Socket.IO braucht.

**Was zu tun ist:** `server-bgio.ts` durch ein Cloudflare Workers Setup ersetzen.
`shared/`-Spiellogik bleibt unverändert.

**Aufwand:** mittel (neue Deployment-Infrastruktur, kein Logik-Umbau)  
**Vorteile:** gratis, kein Server zu verwalten, global edge deployment  
**Nachteile:** Cloudflare-Lock-in, Community-Integration (kein offizieller Support)

---

## Option D — Kompletter Umbau (pure frontend)

boardgame.io durch Firebase Realtime DB / Liveblocks / Ably ersetzen.
State-Sync und Lobby-Logik komplett neu schreiben.

**Aufwand:** sehr hoch — nicht empfohlen.

---

## Entscheidungsmatrix

```
                      Aufwand    Kosten/Mo   Server-Mgmt   Zuverlässigkeit
                      ─────────  ──────────  ────────────  ───────────────
A: Vercel + Railway   minimal    ~$5-7       Railway mgmt  ★★★★★
B: Alles Railway      minimal    ~$5-7       Railway mgmt  ★★★★★
C: CF Workers         mittel     $0          keins         ★★★★★
D: Firebase-Umbau     sehr hoch  $0*         keins         ★★★★
Fly.io free tier      minimal    $0†         Fly.io mgmt   ★★★

† schläft nach Inaktivität ein (~2s Delay beim ersten Request)
* Firebase-Kosten bei höherem Traffic
```

---

## Empfehlung

- **Schnell starten, minimal Aufwand:** Option A (Vercel + Railway) — kein Code-Umbau,
  sofort lauffähig mit dem bestehenden Dockerfile
- **Gratis und kein Server-Management:** Option C (Cloudflare Workers) — mittlerer
  Umbau, aber danach wartungsfrei und kostenlos
- **Einfachste Gesamtlösung:** Option B (alles Railway) — eine Plattform,
  Docker Compose vorhanden, kein Vercel nötig
