## Context

Das Spielfeld ist ein HTML-Canvas-Overlay (`CanvasGameBoard.tsx`), über dem React-HTML-Elemente als absolute Overlays positioniert werden. Bestehende Dialoge nutzen die `GameDialog`-Komponente mit CSS-Klassen (`game-dialog`, `game-dialog-overlay`). Der eigene Spieler (`me`) hat einen HUD-Bereich oben links mit `PlayerNameDisplay`. Gegner-Zonen werden als Canvas-Zeichnungen auf dem 1200×800-Modellkoordinaten-Board gerendert.

Aktueller Stand: Punkte, Diamanten und aktive Fähigkeiten sind nicht direkt sichtbar — nur im Canvas implizit.

## Goals / Non-Goals

**Goals:**
- Kompaktes Status-Badge je Spieler (ich + alle aktiven Mitspieler)
- Badge zeigt: Kraftpunkte, Diamanten-Anzahl, Symbole für aktive blaue Fähigkeiten
- Klick auf Badge öffnet Detail-Dialog (nutzt bestehende `GameDialog`-Infrastruktur)
- Detail-Dialog zeigt: Name, alle oben genannten Werte plus Liste der Fähigkeiten mit Namen
- Nicht-teilnehmende Spieler (nicht in `G.playerOrder`) werden übersprungen

**Non-Goals:**
- Keine Änderungen an Canvas-Rendering
- Keine Anzeige der Handkarten oder Portal-Karten des Gegners im Status-Dialog
- Kein Echtzeit-Animations-Feedback bei Punkteänderungen

## Decisions

### 1. HTML-Overlay statt Canvas-Zeichnung

**Entscheidung:** Status-Badges als React-HTML-Elemente über dem Canvas positioniert (wie `PlayerNameDisplay`).

**Alternativen:**
- Canvas-Zeichnung: Mehr Aufwand, keine Interaktivität (Klick-Events schwerer zu handeln), kein CSS-Styling.
- HTML-Overlay: Konsistent mit bestehenden Overlays, interaktiv, styled mit Tailwind.

**Rationale:** Konsistenz mit der bestehenden Architektur. `PlayerNameDisplay` ist bereits ein HTML-Overlay — das Badge erweitert dieses Muster.

### 2. Position der Badges

**Entscheidung:**
- Eigener Spieler: Badge direkt unter `PlayerNameDisplay` (oben links, absolut positioniert)
- Gegner: Badges in den jeweiligen Gegner-Zonen (oben links/rechts/mitte je nach Position)

**Alternativen:**
- Feste Leiste am Rand: Verliert räumlichen Bezug zur jeweiligen Spielerzone.
- Canvas-koordinatenbasiert: Komplex, unflexibel bei responsivem Layout.

**Rationale:** Räumliche Nähe zur jeweiligen Spielerzone erleichtert die Zuordnung.

### 3. Dialog-Integration

**Entscheidung:** Neue `PlayerStatusDialog`-Komponente nutzt `GameDialog` + `GameDialogTitle` direkt. Kein neuer Dialog-Typ im Dialog-Context — der Dialog wird als lokaler State des Badge verwaltet (`useState`).

**Alternativen:**
- Dialog-Context-Integration: Mehr Boilerplate, kein Vorteil bei einfachem lokalen State.

**Rationale:** Einfachste Lösung, da der Dialog keine Interaktion mit dem Spielzustand benötigt.

### 4. Fähigkeits-Symbole

**Entscheidung:** Jede aktive blaue Fähigkeit (`activeAbilities`) bekommt ein kleines Emoji/Icon-Symbol im Badge (1-2 Zeichen). Im Detail-Dialog erscheint der volle Fähigkeitsname (aus einer Mapping-Tabelle).

**Rationale:** Kompakte Darstellung im Badge, lesbare Erklärung im Dialog.

## Risks / Trade-offs

- **Responsive Positionierung** → Das Canvas skaliert via CSS transform. Badge-Positionen müssen als `absolute` innerhalb des skalierten Canvas-Containers gesetzt werden, damit sie korrekt skalieren. Mitigation: Gleiche Technik wie `PlayerNameDisplay`.
- **Überlappung bei vielen Fähigkeiten** → Viele Symbole könnten das Badge zu breit machen. Mitigation: Max. 5 Symbole anzeigen, Rest als `+N`.
- **Unbekannte Fähigkeits-Typen** → Neue Fähigkeiten ohne Mapping werden ohne Symbol angezeigt. Mitigation: Fallback-Symbol (z.B. `★`).
