# Phase 5: WebApp zur Kartenverwaltung ✅

## Überblick

Phase 5 ist **vollständig implementiert**. Die WebApp zur Verwaltung der 54 Charakterkarten ist produktionsreif.

## Features der Card Manager WebApp

### 🎨 Moderne UI
- React 18 + TypeScript + Tailwind CSS
- Responsive Design
- Dashboard mit Statistiken
- Sidebar mit Suche und Kartenliste
- Rich Card Editor

### 📊 Dashboard
Zeigt live Statistiken:
- **Charakteranzahl:** Aktuelle Kartenbibliothek
- **Machtpunkte:** Summe aller Power Points
- **Diamanten:** Summe aller Diamanten-Belohnungen
- **Fähigkeiten:** Prozentsatz der Karten mit Fähigkeiten

### ✏️ Umfassender Editor

#### Basis-Eigenschaften
- Name
- Bildname (Asset-Referenz)
- Machtpunkte (0-5)
- Diamanten (0-3)

#### Cost Editor (7 Typen)
1. **Gleiche Werte** - Paar/Drilling/etc
2. **Mehrere Paare/Drillinge** - z.B. 2x 3er + 2x 5er
3. **Exakte Werte** - Genau 1, 2, 3
4. **Summe** - Kartensumme = X (optional mit Kartenanzahl)
5. **Zahlenreihe** - Aufeinanderfolgende Werte
6. **Alle geraden Werte** - 2,4,6,8
7. **Alle ungeraden Werte** - 1,3,5,7

#### Ability Editor (13 Typen)

**Rot (Sofort, einmalig):**
- 3 zusätzliche Aktionen
- Nächster Spieler +1 Aktion
- Gegner-Charakter abwerfen
- Gegner-Handkarte stehlen
- Gespielte Perle zurücknehmen

**Blau (Dauerhaft):**
- 1er zählen als 8er
- 3er sind Joker (beliebiger Wert)
- 2er gegen Diamanten tauschen
- Handkartenlimit +1
- Aktionen pro Zug +1
- Virtuelle Perle (mit optionalem Wert)

**Spezial:**
- Irrlicht (Nachbarn können aktivieren)
- Keine Fähigkeit

### 💾 Persistenz & Export
- **localStorage:** Daten persistent im Browser
- **JSON Export:** `cards.json` für Git & Swift App
- **JSON Import:** Reload von Kartensets
- **Suchfunktion:** Schnelle Navigation

## Technologie-Stack

```
Frontend:
  ├── React 18 (UI Framework)
  ├── TypeScript (Type Safety)
  ├── Tailwind CSS (Styling)
  └── lucide-react (Icons)

Build:
  ├── Vite (bundler)
  ├── PostCSS (CSS processing)
  └── Tailwind (@tailwindcss/postcss)

State:
  ├── React Hooks (useState, useEffect)
  ├── localStorage (Persistenz)
  └── Custom cardStore (Business Logic)
```

## Dateistruktur

```
card-manager/
├── src/
│   ├── components/
│   │   ├── CardEditor.tsx      # Main editor interface
│   │   ├── CardList.tsx        # Sidebar with search
│   │   ├── CostEditor.tsx      # Cost type selector
│   │   ├── AbilityEditor.tsx   # Ability type selector
│   │   ├── Dashboard.tsx       # Stats overview
│   │   └── Header.tsx          # Top bar with actions
│   ├── hooks/
│   │   └── useCardManager.ts   # State management hook
│   ├── lib/
│   │   ├── types.ts            # TypeScript definitions
│   │   ├── cardStore.ts        # localStorage wrapper
│   │   └── constants.ts        # UI data (abilities, costs)
│   ├── App.tsx                 # Main app component
│   └── App.css                 # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── README.md                   # WebApp docs
└── example-cards.json          # 13 example cards with all types
```

## Verwendung

### Entwicklung
```bash
cd card-manager
npm install
npm run dev
# http://localhost:5173
```

### Produktion
```bash
npm run build
# Output: dist/ → Ready to deploy
```

### Karten erstellen
1. Neuer Charakter hinzufügen
2. Alle Felder ausfüllen
3. Automatisch in localStorage gespeichert
4. Export button → `cards.json`

## Integration mit Swift App

Siehe `INTEGRATION_GUIDE.md` im Root-Verzeichnis für:
- Schritt-für-Schritt Anleitung
- JSON Format Referenz
- Swift Code Beispiele
- Häufige Fehler & Lösungen

**Kurzfassung:**
1. Karten im Web Tool definieren
2. Exportieren → `cards.json`
3. In Swift App `Resources/cards.json` ablegen
4. GameEngine laden die Karten automatisch

## Beispieldaten

`example-cards.json` enthält 13 Beispielkarten:
- Alle 7 Kostentypen vertreten
- Alle 13 Fähigkeitstypen vertreten
- Realistische Power Points & Diamanten
- Importierbar direkt ins Web Tool

```bash
# Beispielkarten laden
# Im Web Tool: Import → example-cards.json
```

## Nächste Schritte

### Für Phase 6+
1. **Alle 54 Charakterkarten eingeben** im Web Tool
2. **Balancing durchführen** basierend auf Spieltests
3. **Exportieren & in Swift App integrieren**
4. **Optional:** Erweiterungen (Dark Mode, CSV Import, etc.)

### Technische Schulden
- Validierung stärken (Minimum Power Points, etc.)
- Undo/Redo Funktionalität
- Bulk-Import aus CSV
- Zusfällige Kartengenerierung für Tests
- E2E Tests mit Playwright

## Commit History

```bash
# Phase 5 Implementierung
git log --oneline | head -10
# Shows all Phase 5 commits
```

## Lizenz

Siehe Hauptprojekt
