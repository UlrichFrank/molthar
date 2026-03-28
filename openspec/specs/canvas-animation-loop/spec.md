## ADDED Requirements

### Requirement: requestAnimationFrame-Loop für Canvas-Rendering
Das System SHALL einen kontinuierlichen `requestAnimationFrame`-Loop verwenden, der den Canvas in jedem Frame neu zeichnet und Animations-Zustand zeitbasiert interpoliert.

#### Scenario: Loop läuft während Komponente gemountet ist
- **WHEN** `CanvasGameBoard` gemountet wird
- **THEN** startet ein rAF-Loop der kontinuierlich läuft bis die Komponente unmountet wird

#### Scenario: Loop wird beim Unmount gestoppt
- **WHEN** `CanvasGameBoard` unmountet wird
- **THEN** wird der rAF-Loop via `cancelAnimationFrame` gestoppt; kein Memory-Leak

---

### Requirement: Zeitbasierte Animation mit Delta-Time
Das System SHALL Animations-Übergänge zeitbasiert (Delta-Time in Sekunden) berechnen, unabhängig von der Frame-Rate.

#### Scenario: hoverProgress interpoliert zeitbasiert
- **WHEN** eine Region als gehovered markiert ist
- **THEN** steigt `hoverProgress` mit einer Rate von ~5 pro Sekunde (0→1 in ~200ms), unabhängig von FPS

#### Scenario: flashProgress zerfällt zeitbasiert
- **WHEN** `flashProgress` auf 1.0 gesetzt wurde
- **THEN** fällt `flashProgress` mit einer Rate von ~5 pro Sekunde (1→0 in ~200ms), unabhängig von FPS

---

### Requirement: Canvas-Redraw im rAF-Loop
Das System SHALL den Canvas in jedem rAF-Frame vollständig neu zeichnen mit aktuellem Game-State und Animations-Zustand.

#### Scenario: Canvas reflektiert aktuellen Game-State
- **WHEN** ein neuer Game-State eintrifft
- **THEN** wird der neue State im nächsten rAF-Frame gezeichnet (kein separates useEffect-Redraw nötig)

#### Scenario: Canvas reflektiert Hover-Zustand
- **WHEN** `hoverProgress` einer Region > 0 ist
- **THEN** wird der Glow-Effekt mit entsprechender Intensität in jedem Frame gezeichnet
