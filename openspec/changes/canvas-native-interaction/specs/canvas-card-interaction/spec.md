## ADDED Requirements

### Requirement: CardRegion kapselt Position und Animations-Zustand
Das System SHALL für jede interaktive Karte ein `CardRegion`-Objekt bereitstellen, das Position (x, y, w, h, angle), Typ, ID sowie `hoverProgress` (0–1) und `flashProgress` (0–1) enthält.

#### Scenario: CardRegion wird aus Game-State gebaut
- **WHEN** `buildCardRegions(G, playerID)` aufgerufen wird
- **THEN** gibt es für jede Auslage-Karte, Portal-Slot, Hand-Karte und aktivierte Karte eine `CardRegion` mit korrekter Position aus `cardLayoutConstants`

#### Scenario: Animations-Zustand bleibt bei State-Update erhalten
- **WHEN** das Spiel einen neuen State bekommt und `buildCardRegions` erneut aufgerufen wird
- **THEN** werden `hoverProgress` und `flashProgress` bestehender Regions beibehalten (in-place update)

---

### Requirement: Hover-Glow für Mouse
Das System SHALL bei Mouse-Hover über einer Karte einen goldenen Canvas-Glow (shadowBlur) zeichnen, dessen Intensität smooth von 0 auf 1 übergeht.

#### Scenario: Hover-Glow erscheint beim Mouse-Enter
- **WHEN** der Mouse-Pointer über eine Karte fährt (`pointerType === 'mouse'`)
- **THEN** steigt `hoverProgress` der Region über Zeit von 0 auf 1 und der goldene Glow wird sichtbar

#### Scenario: Hover-Glow verschwindet beim Mouse-Leave
- **WHEN** der Mouse-Pointer die Karte verlässt
- **THEN** fällt `hoverProgress` über Zeit auf 0 und der Glow verschwindet

#### Scenario: Kein Hover-Glow auf Touch
- **WHEN** ein Touch-Event (`pointerType === 'touch'`) über einer Karte registriert wird
- **THEN** bleibt `hoverProgress` auf 0; kein Glow wird gezeichnet

---

### Requirement: Click-Flash-Feedback
Das System SHALL bei Klick (Mouse) oder Tap (Touch) auf eine Karte ein weißes semitransparentes Flash-Overlay zeichnen, das innerhalb von ~200ms auf 0 zerfällt.

#### Scenario: Flash erscheint bei Mouse-Click
- **WHEN** eine Karte geklickt wird (`pointerType === 'mouse'`)
- **THEN** wird `flashProgress` der Region auf 1.0 gesetzt und ein weißes Overlay über der Karte gezeichnet

#### Scenario: Flash erscheint bei Touch-Tap
- **WHEN** eine Karte angetippt wird (`pointerType === 'touch'`)
- **THEN** wird `flashProgress` der Region auf 1.0 gesetzt und ein weißes Overlay über der Karte gezeichnet

#### Scenario: Flash zerfällt automatisch
- **WHEN** `flashProgress` auf 1.0 gesetzt wurde
- **THEN** fällt `flashProgress` im rAF-Loop über ~200ms auf 0; danach ist kein Overlay mehr sichtbar

---

### Requirement: Cursor-Feedback
Das System SHALL den Canvas-Cursor auf `pointer` setzen wenn der Mouse-Pointer über einer interaktiven Karte ist, sonst auf `default`.

#### Scenario: Cursor wechselt zu pointer
- **WHEN** `pointerMove` eine Karte trifft
- **THEN** ist `canvas.style.cursor === 'pointer'`

#### Scenario: Cursor wechselt zurück zu default
- **WHEN** `pointerMove` keine Karte trifft oder `pointerLeave` ausgelöst wird
- **THEN** ist `canvas.style.cursor === 'default'`

---

### Requirement: Entfernung des DOM-Overlays
Das System SHALL keine HTML-Button-Elemente für Karten-Interaktion mehr verwenden. `CardButtonOverlay` und `CardButton` werden entfernt.

#### Scenario: Keine DOM-Buttons im gerenderten Output
- **WHEN** das Spielfeld gerendert ist
- **THEN** existieren keine `<button>`-Elemente für Karten-Interaktion im DOM
