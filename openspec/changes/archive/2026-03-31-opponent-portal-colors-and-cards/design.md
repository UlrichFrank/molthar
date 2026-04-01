## Context

**Bestehender Zustand:**
- `drawOpponentPortals` rendert `Gegner Portal2.png` bis `Gegner Portal5.png` ohne Karten
- `drawPlayerPortal` rendert `Kleiderschrank Portal.png` als eigenes Portal
- `setup` setzt `startingPlayer: playerIds[0]` — immer Spieler 0
- `PlayerState` hat kein `colorIndex`-Feld
- Das Spiel hat nur `turn`-Konfiguration, keine `phases`
- Assets `Portal1.jpeg`–`Portal5.jpeg` und `Portal-Startspieler1.jpeg`–`Portal-Startspieler5.jpeg` liegen bereit

**Opponent-Zonen Maße (für Karten-Skalierung):**
| Zone    | Breite  | Höhe    | Rotation |
|---------|---------|---------|----------|
| Links   | 200 px  | 310 px  | 90°      |
| Oben-L  | 400 px  | 200 px  | 180°     |
| Oben-R  | 400 px  | 200 px  | 180°     |
| Rechts  | 200 px  | 310 px  | 270°     |

## Goals / Non-Goals

**Goals:**
- Individuelle Portal-Farben pro Spieler inkl. Startspieler-Variante
- Zufälliger Startspieler beim Setup
- Interaktive Farbwahl vor Spielbeginn (optionaler Schritt; Default = sequenziell)
- Vollständiges Karten-Rendering in Opponent-Zonen (Portal-Slots offen, Handkarten verdeckt, aktivierte Charaktere offen), rotiert und skaliert

**Non-Goals:**
- Kein Farbe-Wechsel während des laufenden Spiels
- Keine persistente Farbspeicherung über Spielsitzungen hinaus

## Decisions

### 1. `colorIndex` in `PlayerState` + Default-Zuweisung im Setup

**Entscheidung:** `PlayerState` bekommt `colorIndex: number` (1–5). Im `setup` werden Farben sequenziell zugewiesen: `playerIds[i]` bekommt `colorIndex = i + 1`. Der `startingPlayer` wird via zufälligem Pick aus `playerIds` (mit `Math.random()`, konsistent mit `shuffleArray`) gewählt.

**Begründung:** Einfachste Zustandshaltung. Kein separates Farb-Array in `GameState` nötig — jeder Player kennt seine Farbe selbst.

### 2. `colorSelection`-Phase mit simultaner Farbwahl

**Entscheidung:** Neues boardgame.io `phases`-Array mit einer Phase `colorSelection` als erste Phase (vor dem bisherigen Spielfluss). In dieser Phase können alle Spieler simultan `selectColor(colorIndex: number)` aufrufen. Constraint: Farbe muss frei sein. Default-Auswahl (die bereits zugewiesene) zählt als "bereit". Wer keine Wahl trifft, behält seine Default-Farbe. Ein `confirmColor()` Move signalisiert Bereitschaft. Wenn alle Spieler confirmed haben (endPhase-Condition), beginnt das Spiel.

**Implementierung mit boardgame.io `activePlayers`:**
```
phases: [{
  name: 'colorSelection',
  start: true,
  turn: { activePlayers: { all: 'selectingColor', moveLimit: 1 } },
  endIf: ({ ctx }) => ctx.activePlayers && Object.keys(ctx.activePlayers).length === 0,
  // Or simpler: endPhase via explicit confirmColor from all players
}]
```

**Alternativen verworfen:**
- *Farbe in setupData (bei createMatch)*: Nur der Host kann setupData setzen — andere Spieler können nicht auswählen
- *Farbe als normaler Move in Spielzug 1*: Nur der aktive Spieler kann wählen, andere müssen warten
- *Keine Wahl, nur Zufallszuweisung*: User-Anforderung nicht erfüllt

### 3. Portal-Bild bestimmen: `colorIndex` + Startspieler-Flag

**Entscheidung:** `getPortalImageName(colorIndex: number, isStartingPlayer: boolean): string` — gibt `Portal-Startspieler{colorIndex}.jpeg` oder `Portal{colorIndex}.jpeg` zurück. Wird in `drawPlayerPortal` und `drawOpponentPortals` verwendet.

**Begründung:** Zentralisiert die Bildinamen-Logik; einfach testbar.

### 4. Opponent-Karten in Zonen: `drawOpponentZone`-Hilfsfunktion

**Entscheidung:** Neue Funktion `drawOpponentZone(ctx, zone, opponentData, rotation)` rendert innerhalb einer Opponent-Zone:
1. Portal-Hintergrundbild (skaliert auf Zonengröße)
2. Portal-Slots (2 Karten, offen, skaliert auf ~40% der normalen Kartengröße)
3. Aktivierte Charaktere (kleine Kacheln, offen, skaliert auf ~25%)
4. Handkarten (verdeckt, Perlenkartenrückseite, Anzahl als Stack oder Fächer)

Alle Elemente werden via `ctx.save() / translate(zoneMittelpunkt) / rotate(rotation) / draw / restore()` in der Zonen-Koordinaten gerendert.

**Skalierungsfaktoren für Opponent-Zonen:**
- Portal-Slots: ~35% (ca. 31×48 px) — klein aber erkennbar
- Handkarten: verdeckt gestapelt mit Anzahl-Label — keine Einzelkarten-Darstellung nötig
- Aktivierte Karten: ~25% (ca. 22×35 px) in einer Reihe

**Alternativen verworfen:**
- *Ohne Rotation (nur Hintergrundtausch)*: Karten wären für andere Spieler "verkehrt herum" — schlechtere UX
- *Volle Kartengröße in Zonen*: Passt nicht in die verfügbaren Zone-Dimensionen (200×310 / 400×200)

### 5. Schriftrolle für leere Zonen bleibt unverändert

Zonen ohne zugewiesenen Spieler rendern weiterhin `Schriftrolle.png`. Keine Änderung an der Logik, nur an der Bedingung: `opponentData === null`.

## Risks / Trade-offs

- **boardgame.io `phases` Integration**: Das Spiel hat bisher keine `phases`. Das Hinzufügen einer `colorSelection`-Phase erfordert, dass die bisherige `turn`-Konfiguration als Default-Phase verwendet wird — boardgame.io unterstützt dies via `phases[].turn`-Übernahme. Risiko: unerwartete Side-Effects auf `endTurn`/`onBegin`. → Mitigation: Gründliche Tests nach Integration
- **Canvas-Koordinaten für rotierende Zonen**: Karten müssen relativ zur Zone-Mitte positioniert sein (nicht relativ zum Canvas-Ursprung). Der `translate → rotate → draw`-Ansatz ist bewährt (bereits für Deck-Rotation genutzt)
- **Phase-Sync für Spectators / Reconnects**: Falls ein Spieler während `colorSelection` disconnectet, behält er seinen Default-`colorIndex` — das ist akzeptabel
