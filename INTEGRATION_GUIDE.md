# Integration: Card Manager → Swift App

Anleitung zur Integration der mit dem Web-Tool exportierten Kartendaten in die Swift App.

## Übersicht

1. **Web Tool:** Charakterkarten im Card Manager definieren
2. **Export:** JSON Datei (`cards.json`) exportieren
3. **Swift App:** JSON in die Resources laden
4. **Decoding:** Automatisches Parsing durch GameEngine

## Schritt 1: Karten im Web Tool erstellen

### Web Tool öffnen
```bash
cd card-manager
npm run dev
# Oder öffne dist/index.html im Browser (nach npm run build)
```

### Beispiel: Charakterkarte "Kämpfer"

1. **Klick:** "Neuer Charakter"
2. **Ausfüllen:**
   - Name: `Kämpfer`
   - Bildname: `kaempfer.png`
   - Machtpunkte: `3`
   - Diamanten: `1`
3. **Kosten:** 
   - Typ: `Gleiche Werte (Paar/Drilling)`
   - Anzahl: `2`
   - Wert (optional): leer
4. **Fähigkeit:**
   - Typ: `3 zusätzliche Aktionen` (Rot)
5. **Speichern:** Automatisch in localStorage

### Alle 54 Charaktere eingeben

Wiederhole obige Schritte für alle 54 Charakterkarten. Siehe `example-cards.json` für Referenz mit verschiedenen Kostentypen und Fähigkeiten.

## Schritt 2: Karten exportieren

1. **Klick:** "Exportieren" Button oben rechts
2. **Browser:** Öffnet Download Dialog
3. **Speichern:** `cards.json`

Dateiformat (Beispiel):
```json
[
  {
    "id": "char-01",
    "name": "Kämpfer",
    "imageName": "kaempfer",
    "powerPoints": 3,
    "diamondsReward": 1,
    "cost": {
      "type": "identicalValues",
      "count": 2,
      "specificValue": null
    },
    "ability": {
      "type": "threeExtraActions"
    }
  },
  ...
]
```

## Schritt 3: In Swift App einbinden

### A. Datei in Xcode hinzufügen

```
PortaleVonMolthar/
└── Sources/PortaleVonMolthar/
    └── Resources/
        └── cards.json          ← Hier ablegen
```

1. Im Xcode Project Navigator: Rechtsklick auf `Resources` Folder
2. "Add Files to PortaleVonMolthar..."
3. `cards.json` auswählen und "Copy items if needed" ankreuzen

### B. Cards.swift erweitern (bereits implementiert)

Die `CharacterCard` Struktur in `Cards.swift` muss `Codable` sein:

```swift
struct CharacterCard: Codable, Equatable, Identifiable {
    let id: String
    let name: String
    let imageName: String
    let powerPoints: Int
    let diamondsReward: Int
    let cost: Cost
    let ability: Ability
}

struct Cost: Codable, Equatable {
    let type: CostType
    // ... weitere Felder je nach Typ
}

struct Ability: Codable, Equatable {
    let type: AbilityType
    let value: Int?
}
```

### C. GameEngine erweitern (Beispiel)

In `GameEngine.swift` die statische Methode zum Laden hinzufügen:

```swift
public static func createInitialCharacterDeck() -> [CharacterCard] {
    // Option 1: Aus JSON laden
    guard let url = Bundle.main.url(forResource: "cards", withExtension: "json") else {
        print("cards.json not found")
        return []
    }
    
    do {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        let cards = try decoder.decode([CharacterCard].self, from: data)
        return cards
    } catch {
        print("Error decoding cards.json: \(error)")
        return []
    }
}
```

Dann in `setupGame()` verwenden:

```swift
private func setupGame() {
    // ...
    state.characterDeck = Self.createInitialCharacterDeck()
    state.characterDeck.shuffle()
    // ...
}
```

## Datenformat-Referenz

### Cost Types

Alle möglichen Cost-Strukturen:

```swift
// identicalValues: N Karten mit gleichem Wert
{
  "type": "identicalValues",
  "count": 2,
  "specificValue": null  // null = beliebig, sonst 1-8
}

// multipleIdenticalValues: z.B. 2x 3er + 2x 5er
{
  "type": "multipleIdenticalValues",
  "counts": [2, 2],
  "specificValues": [null, 5]
}

// exactValues: Genau diese Werte
{
  "type": "exactValues",
  "expected": [1, 2, 3]
}

// sum: Kartensumme = X
{
  "type": "sum",
  "target": 10,
  "cardCount": null  // null = beliebig viele Karten
}

// run: Aufeinanderfolgende Werte
{
  "type": "run",
  "length": 3  // 3 aufeinanderfolgende Werte
}

// allEven: N gerade Karten (2,4,6,8)
{
  "type": "allEven",
  "count": 3
}

// allOdd: N ungerade Karten (1,3,5,7)
{
  "type": "allOdd",
  "count": 3
}
```

### Ability Types

```swift
// Rot (Sofort, einmalig)
"threeExtraActions"
"nextPlayerOneExtraAction"
"discardOpponentCharacter"
"stealOpponentHandCard"
"takeBackPlayedPearl"

// Blau (Dauerhaft)
"onesCanBeEights"
"threesCanBeAny"
"tradeTwoForDiamond"
"handLimitPlusOne"
"oneExtraActionPerTurn"
"providesVirtualPearl"  // value: 1-8 oder null

// Spezial
"irrlicht"
"none"

// Beispiel mit Parameter
{
  "type": "providesVirtualPearl",
  "value": null  // null = Wildcard (beliebiger Wert)
}
```

## Tipps & Tricks

### 1. Version-Control für Kartendaten

`cards.json` ins Git-Repository commiten:

```bash
git add PortaleVonMolthar/Sources/PortaleVonMolthar/Resources/cards.json
git commit -m "Update: Add/modify character cards"
```

Ermöglicht Versionskontrolle und einfache Balancing-Änderungen ohne Swift Recompile.

### 2. Schnelle Iteration beim Balancing

1. Ändere Karteneigenschaften im Web Tool
2. Exportiere `cards.json`
3. Ersetze die Datei in Xcode
4. App neu starten → Neue Werte geladen

Kein Swift Recompile nötig!

### 3. CSV/Spreadsheet alternativ

Optional: Konvertiere Kartenliste zu CSV, importiere in Web Tool, exportiere wieder als JSON.

### 4. Validation

Schreibe optional einen Validator in der App:

```swift
func validateCards(_ cards: [CharacterCard]) -> [String] {
    var errors: [String] = []
    
    for card in cards {
        if card.name.isEmpty {
            errors.append("Card \(card.id): Name is empty")
        }
        if card.powerPoints < 0 || card.powerPoints > 5 {
            errors.append("Card \(card.id): Power points must be 0-5")
        }
        // ... mehr Validierung
    }
    
    return errors
}
```

## Häufige Fehler

### ❌ Error: "cards.json not found"

**Lösung:** Stelle sicher, dass:
- Datei in Xcode `Resources` Folder ist
- Im Target unter "Build Phases" → "Copy Bundle Resources" eingetragen
- Dateiname genau `cards.json` (case-sensitive)

### ❌ Decoding Error: "Expected to decode..."

**Grund:** JSON Struktur stimmt nicht mit Swift Types überein

**Lösung:** Vergleiche JSON Keys mit `Codable` Properties (case-sensitive!)

### ❌ Leere Kartenliste nach Export

**Grund:** localStorage ist leer

**Lösung:**
1. Im Web Tool neue Karten erstellen
2. Screenshot/Export Test durchführen
3. Dann erst in Swift App integrieren

## Vollständiges Beispiel

Siehe `example-cards.json` im card-manager Folder:
- Alle 7 Kostentypen vertreten
- Alle 13 Fähigkeitstypen vertreten
- Realistische Werte (Power Points, Diamanten)

```bash
cd card-manager
cat example-cards.json | head -50  # Beispiel anschauen
```

Kannst du direkt in Web Tool importieren zum Testen!

## Nächste Schritte

1. ✅ Alle 54 Charaktere im Web Tool definieren
2. ✅ `cards.json` exportieren
3. ✅ In Swift App `Resources/cards.json` ablegen
4. ✅ GameEngine anpassen zum Laden
5. ✅ App testen
6. ✅ Balancing iterieren (ohne Swift Recompile)
