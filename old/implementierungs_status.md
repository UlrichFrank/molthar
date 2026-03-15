# Implementierungs-Statusbericht

Basierend auf der Analyse des `prompt.md`, der Spielregeln in `Anleitung.md` und des aktuellen Codes im Ordner `PortaleVonMolthar`, hier eine detaillierte Aufstellung, was bereits implementiert ist und was noch fehlt.

## ✅ Bereits implementiert

### 1. Grundstruktur & Architektur
- Das Projekt ist als Swift Package aufgesetzt.
- Die MVVM-Architektur (Models, ViewModels, Views) ist angelegt.
- Test-Infrastruktur (`GameEngineTests`) ist vorhanden.

### 2. Kern-Spielelogik (`GameEngine`)
- **Vollständige Spielelogik:** Kostenprüfung für Charaktere (Paare, Summen, Runs, etc.) inkl. Diamanten-Modifikatoren.
- **Spezialfähigkeiten:** Rote (sofort) und Blaue (dauerhaft) Fähigkeiten implementiert.
- **Irrlicht:** Neighbor-Aktivierungslogik hinzugefügt.
- **Turn-Phasen:** Phasen zum Aktionen ausführen und Karten abwerfen (Handlimit am Ende des Zuges).
- **Spielende:** Automatische Erkennung von 12+ Machtpunkten und korrekte Abwicklung der Final Round.
- **Tauschsymbol:** Mechanik zum Refresh der Charakterauslage bei Perlen mit Tauschsymbol.

### 3. Benutzeroberfläche (`GameBoardView`)
- **Overhaul:** Premium-Design mit Hover-Effekten, Turn-Indikatoren und dynamic Layout.
- **Sichtbarkeit:** Unterscheidung zwischen lokalen Spielerdaten und kompakten Gegneransichten (verdeckte Hand).
- **Responsive:** Layout passt sich an iPhone/iPad/Mac an.

### 4. Admin-Tools
- **Card Manager WebApp:** HTML/JS/CSS Tool zum Erstellen und Exportieren von Charakterkarten (`cards.json`).

---

## 🏗 Teilweise implementiert / Fehlt noch

### 1. Finale Kartendaten
- **Teilweise:** Die Logik für alle Fähigkeitstypen ist da, aber die 54 konkreten Karten müssen noch via WebApp definiert und ins Spiel importiert werden.

### 2. Startbildschirm & Lobby (Lokaler Mehrspieler)
- **Fehlt:** Startbildschirm zur Auswahl der Spieleranzahl und Multipeer-Vernetzung.

### 3. Computergegner (KI)
- **Fehlt:** Die Logik für Computergegner steht noch aus (geplant für Phase 4).

## Fazit & Nächste Schritte
Die Kernspielmechanik ist nun vollständig. Als nächstes folgen Phase 3 (Networking/Startscreen) und Phase 4 (KI).
