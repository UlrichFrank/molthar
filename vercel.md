  Das Kernproblem: Socket.IO auf Vercel

  DEINE ARCHITEKTUR
  ═══════════════════════════════════════════════════

    game-web (Vite/React)         backend (boardgame.io)
    ┌──────────────────┐          ┌──────────────────┐
    │                  │          │                  │
    │  boardgame.io    │◄────────►│  boardgame.io    │
    │  client          │  Socket  │  server          │
    │                  │   .IO    │  (Express)       │
    └──────────────────┘  WS/TCP  └──────────────────┘
                           ↑
                      PERSISTENTE
                      VERBINDUNG
                      (bleibt offen
                      für ganze
                      Spielsession)

  VERCEL FUNCTIONS
  ═══════════════════════════════════════════════════

    Request → Function startet → Response → Function stirbt

    Kein State. Keine offene Verbindung. Kein Socket.IO.

  Vercel Functions sind stateless und Request/Response-basiert. boardgame.io braucht Socket.IO — eine persistente TCP-Verbindung, die für die gesamte Spielsession offen bleibt. Das ist technisch
   inkompatibel.

  ---
  Was auf Vercel funktioniert, was nicht

    game-web  ✅  Vite-Build → statisches Bundle → Vercel CDN
    shared    ✅  Kein Deploy nötig (wird in game-web eingebaut)
    backend   ❌  Socket.IO braucht long-running Process

  shared ist eine interne Library — die wird beim Build von game-web und backend eingebunden, nicht separat deployed.

  ---
  Die realistischen Optionen

  Option A: Split-Deploy (empfohlen)

    Vercel          Railway / Render / Fly.io
    ┌────────┐      ┌─────────────────────┐
    │game-web│◄────►│      backend        │
    │ (CDN)  │ WS   │ (long-running Node) │
    └────────┘      └─────────────────────┘

    Vercel: gratis für Frontend
    Railway/Render: ~$5-7/Monat für kleinen Node-Server

  Vorteil: Vercel für Frontend ist exzellent (CDN, Preview-Deployments, einfaches CI). Backend läuft stabil als persistenter Prozess.

  Option B: Alles auf Railway/Render/Fly.io

    Eine Plattform
    ┌─────────────────────────────────┐
    │  backend  (Express + Socket.IO) │
    │  game-web (static files served  │
    │            by Express)          │
    └─────────────────────────────────┘
  Einfacher zu managen, aber kein CDN für das Frontend.

  Option C: Alles auf Vercel (mit Architektur-Umbau)

  boardgame.io auf einen anderen Transport umschreiben (z.B. Ably, Pusher, Partykit). Erheblicher Aufwand, lohnt sich wahrscheinlich nicht.

  ---
  Was würdest du bevorzugen?

  Einige Fragen, die die Entscheidung prägen:

  1. Ist das für Production oder Hobby/Demo? Bei einem kleinen Spielprojekt ist Railway mit $5/Monat völlig ausreichend.
  2. Wie wichtig sind Vercel-Features (Preview-Deployments per PR, automatische CDN-Invalidierung)? Die gibt es für das Frontend bei Option A.
  3. Hast du schon eine Präferenz für die Backend-Plattform? Railway und Fly.io sind beide gut, haben aber unterschiedliche Tradeoffs.

  Meine spontane Empfehlung wäre Option A: Vercel für game-web, Railway für backend — das nutzt Vercels Stärken (Frontend-DX, CDN) ohne die Architektur anzufassen.