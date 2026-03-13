# Molthar Card Manager

Moderne Web-Anwendung zur Verwaltung der Charakterkarten für "Die Portale von Molthar".

## Features

- ✨ **Modernes UI** mit React + TypeScript + Tailwind CSS
- 📊 **Dashboard** mit Statistiken (Charakteranzahl, Machtpunkte, Diamanten, Fähigkeiten)
- ✏️ **Umfassender Editor** für alle Charaktereigenschaften
- 💰 **7 Kostentypen** mit visuellem Editor:
  - Gleiche Werte (Paar/Drilling)
  - Mehrere Paare/Drillinge
  - Exakte Werte
  - Summe
  - Zahlenreihe (Run)
  - Alle geraden/ungeraden Werte
- ⚡ **13 Fähigkeitstypen** (Rot, Blau, Spezial)
- 💾 **localStorage Persistierung** - Daten bleiben beim Browser erhalten
- 📥 **Import/Export** - JSON Format für Versionskontrolle und Swift Integration
- 🔍 **Suche** - Charaktere schnell finden

## Installation & Nutzung

### Lokal entwickeln

```bash
cd card-manager
npm install
npm run dev
```

Die App läuft dann auf `http://localhost:5173`

### Produktions-Build

```bash
npm run build
```

Output ist in `dist/` Verzeichnis

### Deployment

Der `dist/` Ordner kann auf jedem Web-Server (S3, GitHub Pages, Vercel, etc.) gehostet werden.

## Benutzung

1. **Charakter erstellen:** Klick auf "Neuer Charakter"
2. **Eigenschaften ausfüllen:** Name, Bildname, Machtpunkte, Diamanten
3. **Kosten definieren:** Wähle Kostentyp und fülle Parameter ein
4. **Fähigkeit wählen:** Wähle aus 13 Fähigkeitstypen (oder "Keine")
5. **Speichern:** Automatisch in localStorage gespeichert
6. **Exportieren:** "Exportieren"-Button → `cards.json` für Swift App

## Integration mit Swift App

### 1. Karten exportieren

Im Card Manager: `Exportieren` → `cards.json`

### 2. In Swift App einbinden

Datei `PortaleVonMolthar/Sources/PortaleVonMolthar/Resources/cards.json` verwenden

### 3. JSON Format

```json
[
  {
    "id": "char-1",
    "name": "Beispielcharakter",
    "imageName": "charakter_1",
    "powerPoints": 3,
    "diamondsReward": 1,
    "cost": {
      "type": "identicalValues",
      "count": 2,
      "specificValue": null
    },
    "ability": {
      "type": "onesCanBeEights"
    }
  }
]
```

## Kostentypen Referenz

| Typ | Beispiel | Parameter |
|-----|----------|-----------|
| **identicalValues** | 2x beliebiger Wert oder 2x genau 5er | `count`, `specificValue` |
| **multipleIdenticalValues** | 2x 3er + 2x 5er | `counts[]`, `specificValues[]` |
| **exactValues** | Genau 1, 2, 3 | `expected[]` |
| **sum** | Summe = 10 (egal wieviele Karten) | `target`, `cardCount?` |
| **run** | Reihe von 3 aufeinanderfolgenden Werten | `length` |
| **allEven** | 3x gerade Werte (2,4,6,8) | `count` |
| **allOdd** | 3x ungerade Werte (1,3,5,7) | `count` |

## Fähigkeitstypen Referenz

### Rot (Sofort, einmalig)
- `threeExtraActions` - 3 zusätzliche Aktionen
- `nextPlayerOneExtraAction` - Nächster Spieler +1 Aktion
- `discardOpponentCharacter` - Gegner-Charakter abwerfen
- `stealOpponentHandCard` - Gegner-Handkarte stehlen
- `takeBackPlayedPearl` - Gespielte Perle zurück

### Blau (Dauerhaft)
- `onesCanBeEights` - 1er zählen als 8er
- `threesCanBeAny` - 3er sind Joker
- `tradeTwoForDiamond` - 2er gegen Diamanten tauschen
- `handLimitPlusOne` - Handkartenlimit +1
- `oneExtraActionPerTurn` - Aktion pro Zug +1
- `providesVirtualPearl` - Virtuelle Perle (mit optionalem Wert 1-8)

### Spezial
- `irrlicht` - Nachbarn können aktivieren
- `none` - Keine Fähigkeit

## Stack

- **Frontend:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **State:** React Hooks + localStorage
- **Data Format:** JSON

## Dateistruktur

```
src/
├── components/
│   ├── CardEditor.tsx
│   ├── CardList.tsx
│   ├── CostEditor.tsx
│   ├── AbilityEditor.tsx
│   ├── Dashboard.tsx
│   └── Header.tsx
├── hooks/
│   └── useCardManager.ts
├── lib/
│   ├── types.ts
│   ├── cardStore.ts
│   └── constants.ts
└── App.tsx
```
