## Why

Das Spiel ist auf dem Handy praktisch unspielbar: Das Board ist ein fixes 1200×800-Querformat-Canvas, das per Aspect-Fit in den Viewport skaliert wird. Im Hochformat (z. B. iPhone 390×844) schrumpft es auf ~260px Höhe (Faktor ~0.33) — Karten landen bei ~29px, unlesbar. Die Statusanzeigen sind DOM-Overlays mit fixer rem-Größe über prozentualen Canvas-Ankern und überlagern deshalb die Grafik. Die Dialoge sind in Desktop-Dichte gebaut und zwingen im Hochformat zum Dauer-Scrollen. Ziel: das Handy soll **gleichwertig spielbar** sein.

## What Changes

- **Eigene native Hochkant-Ansicht (DOM statt Canvas).** Bei `max-width: 768px` rendert eine neue React-Ansicht das Spiel als echtes, reflowendes DOM (Karten als real dimensionierte Elemente) statt des skalierten Canvas. Der Desktop behält `CanvasGameBoard` unverändert. Beide Ansichten teilen dieselbe Spiellogik (shared package + boardgame.io `moves`).
- **Hand-Dock-Layout.** Die Perlen-Hand liegt als fixe, aufgefächerte Leiste am unteren Rand; darüber scrollen Markt (4 Perlenkarten + 2 Charakterkarten + Nachziehstapel) und das eigene Portal (max. 2 Charakterslots). Oben eine fixe Statusleiste, unten eine fixe Aktionsleiste.
- **Statusleiste „Variante C".** Alle Spieler in fester Reihenfolge (eigener Spieler zuerst); genau ein Spieler als aufgeklappter Detail-Chip (Initiale, Name, Rang nach Machtpunkten, ★, 💎, „am Zug"-Badge + Aktionszähler), die übrigen als kompakte Farbkreis-Avatare (Initiale + ★). Tippen lässt die Detailbox an die feste Position des Spielers wandern; Reihenfolge bleibt stabil. Goldring = eigener Spieler, grüner Punkt = am Zug. Skaliert bis 5 Spieler (max. 4 Gegner).
- **Aktivierte-Karten-Raster.** Ein Zähler `aktiviert ×N ▸` am Portal öffnet ein scrollbares Raster (Bottom-Sheet), das realistisch 8–15 Karten trägt.
- **Responsive Dialog-Shell.** Die bestehenden Dialoge bekommen eine gemeinsame Shell: zentriertes Modal am Desktop, content-großes Bottom-Sheet am Handy. Dialog-*Inhalte* bleiben geteilt.
- **Feature-Parität.** Jede heutige Canvas-Interaktion bekommt ein Handy-Zuhause (siehe Impact / Checkliste in tasks).

## Capabilities

### New Capabilities
- `mobile-viewport-switch`: Auswahl zwischen Desktop-Canvas und mobiler DOM-Ansicht anhand `max-width: 768px`; Tablet-Verhalten bewusst offen gelassen; Weiterreichen von `G`, `ctx`, `moves`, `playerID` an beide Ansichten.
- `mobile-hand-dock-layout`: Hochkant-Board mit fixer Perlen-Hand unten, scrollbarem Markt + Portal darüber, fixer Aktionsleiste; alle Board-Interaktionen (Perle/Charakter nehmen, Portal-Vorschau, Kontextaktionen).
- `mobile-status-bar`: Statusleiste „Variante C" mit fester Reihenfolge, wandernder Detailbox, Platzierung/Rang, Zug-Indikator, Skalierung bis 5 Spieler.
- `mobile-activated-grid`: Zähler + scrollbares Bottom-Sheet-Raster für die aktivierten Charaktere des eigenen Spielers.
- `responsive-dialog-shell`: Gemeinsame Shell für alle Spieldialoge — zentriertes Modal (Desktop) bzw. Bottom-Sheet (Handy) bei geteiltem Inhalt.

### Modified Capabilities
<!-- Keine spec-level-Änderung an bestehenden Capabilities: Der Desktop-Canvas und die Dialog-Inhalte bleiben verhaltensgleich; die mobile Ansicht ist additiv. -->

## Impact

- **Frontend (`game-web/`):** Neue Viewport-Weiche (vermutlich in `App`/Board-Einstiegspunkt); neue Komponenten unter `components/mobile/` (Board, Statusleiste, Zonen, Sheets); responsive Erweiterung von `styles/dialogs.css` + `GameDialog`-Shell. `CanvasGameBoard` bleibt unangetastet.
- **Shared (`shared/`):** Keine Änderungen an Spiellogik/`moves` erwartet — die mobile Ansicht konsumiert dieselben Typen und Moves.
- **Assets:** Wiederverwendung der bestehenden Karten-Bilder (`<img>` wie in den Dialogen).
- **Kein Backend-Impact.** boardgame.io-Server und Netzwerkschicht bleiben gleich.
- **Risiken:** Doppelte Board-View (Canvas + DOM) erhöht Pflegeaufwand; Feature-Parität muss lückenlos abgedeckt sein, sonst ist Handy „fast" spielbar. Tablet-Verhalten offen.
