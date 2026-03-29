## Kontext

Das Spiel hat 18 Fähigkeitstypen, die in den Kartendaten definiert sind (`assets/cards.json`, `assets/Anleitung.md`):
- **5 Rote Fähigkeiten** (werden sofort nach Aktivierung einmalig ausgeführt): +3 Aktionen, +1 Aktion für Gegner, Gegner-Karte entfernen, Handkarte stehlen, gespielte Perle zurückholen
- **10 Blaue Fähigkeiten** (permanent, verschiedene Zeitpunkte): Handlimit+1, +1 Aktion/Zug, Wildcard-Substitutionen (1→8, 3→beliebig), Diamant-Modulation, Hand-/Portal-Tausch, Kartenvorschau, Perle-Diamant-Tausch, aufgedruckte Perlenwerte
- **2 Sondertypen**: irrlicht (geteilte Aktivierung), none (keine Fähigkeit)

Derzeit ist nur `handLimitPlusOne` in der Spiellogik implementiert. Die übrigen 17 sind reine Metadaten.

Die Spielarchitektur verwendet:
- **shared/src/game/index.ts**: boardgame.io-Spielspezifikation (Moves, State-Maschine)
- **shared/src/game/costCalculation.ts**: Perlenkarten-Kostenvalidierung (~600 Zeilen, 9 Kostenkomponentenarten)
- **shared/src/game/types.ts**: Typdefinitionen für Spielzustand, Moves, Fähigkeiten

**boardgame.io-spezifische Einschränkungen für die Fähigkeitsimplementierung:**
- **Moves mutieren `G` direkt via Immer** — Moves können nur `undefined` (Erfolg) oder `INVALID_MOVE` zurückgeben. Keine eigenen Metadaten-Rückgabewerte. Fähigkeits-Nebeneffekte müssen in G geschrieben werden; die UI liest den resultierenden State-Diff.
- **`G.actionCount` / `G.maxActions` existieren bereits** — rote Fähigkeiten, die Aktionen hinzufügen, erhöhen `G.maxActions` direkt (kein neues Feld). `G.maxActions` muss am Zugende via `turn.onEnd` zurückgesetzt werden.
- **Alle `G`-Felder sind in Moves zugreifbar** — der Gegner-State (`G.players[opponentId]`) kann direkt in Move-Handlern mutiert werden. Keine Isolationsbarrieren in boardgame.io serverseitigen Moves.
- **Turn-Lifecycle-Hooks fehlen** — es gibt derzeit kein `turn.onBegin` oder `turn.onEnd`. Diese müssen für timing-basierte Fähigkeiten hinzugefügt werden (G.maxActions zurücksetzen, nextPlayerExtraAction anwenden).
- **Timing-gesteuerte Moves** (z.B. „nur vor der ersten Aktion") werden als zusätzliche Einträge im `moves`-Objekt implementiert, bewacht durch `G.actionCount === 0` oder `G.actionCount >= G.maxActions`.

## Ziele / Nicht-Ziele

**Ziele:**
- Alle 18 Fähigkeitstypen mit korrekter Semantik gemäß Regelwerk implementieren
- Deklaratives State-Modell verwenden (Fähigkeiten als Daten in PlayerState/GameState), nicht imperative Handler
- Rote Fähigkeiten werden sofort mit korrekten Nebeneffekten ausgeführt (Aktionszähler, Gegner-State-Änderungen)
- Blaue Fähigkeiten bleiben persistent und beeinflussen zukünftige Moves (Kostenvalidierung, Aktionslimits, timing-gesteuerte Aktionen)
- Manuelle Spielerauswahl bei aufgedruckten Perlenwerten: Der Spieler wählt explizit, welche gedruckten Perlen er zur Kostenerfüllung nutzt
- Tier-1-Implementierung (Rote Fähigkeiten + Foundation) ist vollständig funktional, bevor Tier 2+ hinzugefügt wird
- Erweiterbares Design: Ein neuer Fähigkeitstyp erfordert nur Konfigurationsänderungen (Kartendaten) + minimale Move-Logik

**Nicht-Ziele:**
- Barrierefreiheitsfunktionen oder UI-Animationen für Fähigkeits-Trigger (werden separat implementiert)
- Fähigkeits-Kombos oder Stapelregeln (es wird von orthogonalen Effekten ausgegangen)
- Balancing/Tuning (Fokus auf Implementierungskorrektheit)
- irrlicht-Sonderregel (Tier 7, zukünftige Überlegung)

## Entscheidungen

### Entscheidung 1: State-Modell für Fähigkeitseffekte

**Wahl**: Fähigkeitseffekte als State-Felder in `PlayerState` und `GameState` speichern und das bestehende `G.maxActions` für das Aktionszählen verwenden.

```
PlayerState {
  activeAbilities: CharacterAbility[]        // Blau: persistent (leitet Wildcard-/Modifier-Flags ab)
  handLimitModifier: number                  // Blau: handLimitPlusOne (existiert bereits)
}

GameState {
  maxActions: number                         // EXISTIERT BEREITS — für rote Aktions-Fähigkeiten mutieren
  nextPlayerExtraAction: boolean             // Rot: nextPlayerOneExtraAction-Flag
  lastPlayedPearlId: string | null           // Rot: takeBackPlayedPearl-Unterstützung
}
```

`threeExtraActions` erhöht `G.maxActions` direkt im Move-Handler. `turn.onEnd` setzt es auf die berechnete Basis zurück (3 + permanente blaue Modifier wie `oneExtraActionPerTurn`).

**Begründung**: boardgame.io-Moves mutieren G via Immer — State-Felder sind der natürliche Output-Kanal. `G.maxActions` begrenzt bereits jede Aktion (`if G.actionCount >= G.maxActions`), daher ist die Modifizierung der korrekte Hebel für Aktionszähler-Fähigkeiten. Kein neues Aktionszähler-Feld notwendig.

**Verworfene Alternativen**:
- Neues Feld `extraActionsThisTurn`: Abgelehnt — dupliziert, was G.maxActions bereits ausdrückt; zwei Wahrheitsquellen für Aktionslimits.
- Callback-Handler: Abgelehnt — können nicht serialisiert/über boardgame.io-Clients repliziert werden.

### Entscheidung 2: Fähigkeits-Nebeneffekte direkt im Move-Handler anwenden

**Wahl**: Fähigkeitseffekte werden vom Move-Handler `activatePortalCard` direkt in `G` geschrieben, nicht als Metadaten zurückgegeben oder verzögert.

```typescript
// In activatePortalCard move:
G.actionCount++;

// Rote Fähigkeit anwenden
for (const ability of activatedCard.card.abilities) {
  if (!ability.persistent) {
    applyRedAbility(G, ctx, ability);
  } else {
    player.activeAbilities.push(ability);
  }
}

// applyRedAbility ist eine reine Hilfsfunktion, die G mutiert:
function applyRedAbility(G: GameState, ctx: any, ability: CharacterAbility) {
  switch (ability.type) {
    case 'threeExtraActions':
      G.maxActions += 3;
      break;
    case 'nextPlayerOneExtraAction':
      G.nextPlayerExtraAction = true;
      break;
    // ...
  }
}
```

boardgame.io-Moves können keine eigenen Metadaten zurückgeben — nur `undefined` oder `INVALID_MOVE`. Die UI liest den resultierenden State-Diff (z.B. `G.maxActions` erhöht → Frontend zeigt aktualisierten Aktionszähler).

**Verworfene Alternativen**:
- triggeredAbilities aus Move zurückgeben: **In boardgame.io nicht möglich** — Move-Returns sind entweder undefined oder INVALID_MOVE. Abgelehnt.
- State-Maschinen-Phasen: Abgelehnt — ACTIVATE → EXECUTE_RED-Phasen fügen Komplexität hinzu, die boardgame.io für sofortige Einmal-Effekte schlecht handhabt.

### Entscheidung 3: 8-Tier-Implementierungs-Roadmap

**Wahl**: Fähigkeiten in Abhängigkeitsreihenfolge implementieren, nicht alle auf einmal.

```
TIER 0: Foundation (Typen, State, Turn-Lifecycle)
  □ CharacterAbility-Typsystem erweitern (18 Typen)
  □ PlayerState.activeAbilities: CharacterAbility[] hinzufügen
  □ GameState.nextPlayerExtraAction: boolean hinzufügen
  □ GameState.lastPlayedPearlId: string | null hinzufügen
  □ turn.onBegin-Hook hinzufügen: nextPlayerExtraAction → G.maxActions anwenden
  □ turn.onEnd-Hook hinzufügen: G.maxActions auf berechnete Basis zurücksetzen

TIER 1: Rote Fähigkeiten (Soforteffekte)
  □ threeExtraActions (Aktionslimit erhöhen)
  □ nextPlayerOneExtraAction (nächsten Zug des Gegners setzen)
  □ discardOpponentCharacter (Portal-Karte entfernen)
  □ stealOpponentHandCard (Handkarte vom Gegner nehmen)
  □ takeBackPlayedPearl (Perle vom Ablagestapel zurückholen)

TIER 2: Blaue Wildcards (Kostenvalidierung)
  □ onesCanBeEights (bei Kosten: 1→8)
  □ threesCanBeAny (bei Kosten: 3→1-8)
  □ decreaseWithPearl (bei Kosten: Diamant→-1)

TIER 3: Blaue Aktions-Modulation
  □ oneExtraActionPerTurn (+1 Aktionslimit dauerhaft)
  □ handLimitPlusOne (bereits implementiert, prüfen ✓)

TIER 4: Blaue Hand-/Portal-Aktionen
  □ changeCharacterActions (Portal-Karte vor der ersten Aktion tauschen)
  □ changeHandActions (Hand nach der letzten Aktion neu ziehen)

TIER 5: Blaue Information & Ressourcen
  □ previewCharacter (Deck vor der ersten Aktion einsehen)
  □ tradeTwoForDiamond (2 Perlen → 1 Diamant-Konvertierung)

TIER 6: Kartenspezifisch (Aufgedruckte Perlen + Manuelle Auswahl)
  □ numberAdditionalCardActions (Karte hat aufgedruckten Perlenwert)
  □ anyAdditionalCardActions (Karte hat aufgedruckte Wildcard-Perle)
  □ Manuelle Auswahl: Spieler wählt explizit, welche gedruckten Perlen verwendet werden
  □ Kostenvalidierung berücksichtigt gewählte gedruckte Perlen zusätzlich zu Handkarten

TIER 7: Sonder-/Komplex
  □ irrlicht (geteilte Aktivierung, Nachbarn (Spieler der immer unmittelbar vor oder nach mir an der reihe ist) können aktivieren)
```

**Begründung**:
- Jedes Tier ist unabhängig testbar
- Rot (TIER 1) vor Blau: Rot hat sofortiges Feedback, Blau beeinflusst zukünftige Moves
- Wildcards (TIER 2) hängen von Kostenvalidierungs-Änderungen ab; Verzögerung vermeidet frühe Komplexität
- Jedes Tier entsperrt nachgelagerte Tasks/Tests

**Verworfene Alternativen**:
- Alles auf einmal: nicht wartbar, Probleme nicht isolierbar
- Beliebige Reihenfolge: hätte versteckte Abhängigkeiten und würde Nacharbeit erfordern

### Entscheidung 4: Fähigkeits-Timing-Modell

**Wahl**: Blaue Fähigkeiten an explizite Spielschleifenzeitpunkte binden, nicht an implizite Trigger.

```
Spielschleifenzeitpunkte:
  [VOR_ERSTER_AKTION]    → previewCharacter, changeCharacterActions
  [WÄHREND_AKTION]       → Kostenvalidierung (onesCanBeEights, threesCanBeAny, decreaseWithPearl), Aktionszählung
  [NACH_LETZTER_AKTION]  → changeHandActions
  [ZUGENDE]              → Aufräumen, handLimit anwenden
```

**Begründung**: Das Regelwerk gibt an, dass Fähigkeiten „vor der 1. Aktion", „während des Zuges", „nach der letzten Aktion" auslösen. Explizite Zeitpunkte:
- Passen sauber zur Spielschleifen-Struktur
- Verhindern unbeabsichtigte Reihenfolge-Fehler
- Sind testbar (Zeitpunkt setzen, Fähigkeitsauslösung prüfen)

**Verworfene Alternativen**:
- Event-basiert: „wenn Aktion abgeschlossen" auslösen. Abgelehnt: implizite Reihenfolge, schwer kontrollierbar.
- Karten-spezifisches Timing: Jede Fähigkeit gibt an, wann sie auslöst. Abgelehnt: erhöht Datenpflege, dupliziert Spielschleifenwissen.

### Entscheidung 5: Manuelle Zusammenstellung der virtuellen Bezahlhand (via Frontend)

**Wahl**: `costCalculation.ts` bleibt unberührt. Stattdessen werden die Fähigkeiten im Frontend (`CharacterActivationDialog`) angewendet.

```
// Neues Interface für die Auswahl der Bezahl-Karten
interface PaymentSelection {
  source: 'hand' | 'ability';
  handCardIndex?: number;
  abilityType?: CharacterAbilityType; 
  value: 1|2|3|4|5|6|7|8; // Der gewünschte finale Wert
  diamondsUsed?: number;  // Im Frontend zugewiesene Diamanten
}

activatePortalCard(
  cardIndex: number,
  selections: PaymentSelection[]
) → void
```

**Begründung**: Die Kostenvalidierung ist bereits komplex (~600 Zeilen). Indem das Frontend die Bezahl-Karten explizit formt – d.h. aus einer 3 eine 8 macht (`threesCanBeAny`) oder eine 6 durch einen Diamanten auf 5 reduziert (`decreaseWithPearl`) –, bleiben diese wilden Mutationen aus dem Kern-Algorithmus heraus.
Die Backend-Move-Logik `activatePortalCard` führt (aus Sicherheitsgründen) lediglich eine Integritätsprüfung durch (Hat der Spieler die Karte? Besitzt er die Fähigkeit? Reichen die Diamanten?), konvertiert die `PaymentSelection`s in reguläre `PearlCard`-Objekte und überreicht diese an die originale, dumme Validierungsfunktion `validateCostPayment`.

**Manuelle Auswahl**: Der Spieler macht im UI alle Angaben manuell. Er wählt "Ich benutze Perlenkarte X auf Platz 2 mit Wert 3, wende meine Wildcard-Fähigkeit an und mache sie zu einer 8".
Auch gedruckte Perlenwerte aus aktivierten Charakteren (`numberAdditionalCardActions`) werden im Dialog als anklickbare virtuelle Perlen dargestellt, die der Bezahl-Selektion hinzugefügt werden können.

**Verworfene Alternativen**:
- Move-Handler prüfen Fähigkeiten → Kosten vor Validierung anpassen. Abgelehnt: dupliziert Validierungslogik.
- Ein „Super-Validator" pro Fähigkeit. Abgelehnt: 18 Validatoren = Wartungs-Albtraum.

## Risiken / Trade-offs

### Risiko: Rote Fähigkeits-Nebeneffekte betreffen andere Spieler
**Problem**: `nextPlayerOneExtraAction` muss `G.maxActions` für den *nächsten* Spieler erhöhen, nicht den aktuellen.

**Gegenmaßnahme**:
- `activatePortalCard` setzt `G.nextPlayerExtraAction = true`
- `turn.onBegin`-Hook (neu) liest das Flag: wenn true, `G.maxActions += 1`, dann Flag löschen
- boardgame.io Move-Handler haben vollen Zugriff auf G — keine Isolationsbarrieren. Gegner-State kann direkt in jedem Move geschrieben werden.

### Risiko: Blaue Fähigkeits-Persistenz über Züge
**Problem**: Blaue Fähigkeiten müssen dauerhaft aktiv bleiben, sobald aktiviert. Wenn ein Spieler nie wieder aktiviert, bleibt der Effekt bestehen.

**Gegenmaßnahme**:
- `activeAbilities` ist nur erweiterbar (Karten werden nie entfernt)
- Nur durch `activateCharacter`-Move modifizierbar
- Tests prüfen Persistenz über mehrere Züge

### Risiko: Wildcard-Kostenvalidierung (TIER 2) Komplexität
**Problem**: `costCalculation.ts` ist bereits ~600 Zeilen. Wildcards (onesCanBeEights, threesCanBeAny) fügen 50–100 Zeilen Permutationslogik hinzu.

**Gegenmaßnahme**:
- Wildcard-Logik in separater Funktion isolieren (`getValidPermutationsWithWildcards`)
- Umfangreich testen (100+ Testfälle für Wildcards allein)
- Auf TIER 2 verzögern (erst nach Beweis der Architektur durch rote Fähigkeiten)

### Risiko: Manuelle Auswahl aufgedruckter Perlen (TIER 6) – UI-Koordination
**Problem**: Der Spieler muss vor der Kostenvalidierung explizit angeben, welche gedruckten Perlenwerte er verwenden möchte. Das erfordert eine UI-Interaktionsstufe vor dem eigentlichen `activateCharacter`-Move.

**Gegenmaßnahme**:
- Die UI öffnet einen Auswahl-Dialog für gedruckte Perlen, bevor der Move abgeschickt wird
- Die Spielerauswahl wird als Parameter `selectedPrintedPearls` im Move mitgesendet
- Der Move validiert intern, ob die gewählten gedruckten Perlen + Handkarten die Kosten decken
- Wildcard-Belegungen werden serverseitig automatisch ermittelt (if a valid assignment exists)

### Risiko: irrlicht geteilte Aktivierung (TIER 7)
**Problem**: irrlicht wird von bis zu 3 Spielern in ihrem eigenen Zug aktiviert. Erfordert nicht-standardmäßige Aktivierungslogik.

**Gegenmaßnahme**:
- Karte als „geteilt" in Kartendaten flaggen
- Aktivierenden Spieler in Move-Metadaten speichern
- Auf TIER 7 verschieben (kann nach dem Core-Fähigkeits-System ergänzt werden)

### Trade-off: State-Expansion vs. Zentralisierung
- **Wahl**: PlayerState erhält neue Felder pro Fähigkeitstyp (handLimitModifier, Wildcard-Flags)
- **Trade-off**: Mehr Felder = klarere Semantik, aber leicht größere State-Objekte
- **Begründung**: Klarheit > Kompaktheit; State-Objekte sind klein genug, dass kein Bottleneck entsteht

## Migrationsplan

**Phase 1 (TIER 0)**: Typdefinitionen und State-Felder in den Hauptzweig mergen. Noch keine funktionalen Änderungen – nur Gerüstbau.

**Phase 2 (TIER 1)**: Rote Fähigkeiten implementieren. Spiel wird spielbar mit sofortigen Aktionseffekten.

**Phase 3 (TIER 2–7)**: Blaue Fähigkeiten schrittweise hinzufügen. Jedes Tier ist unabhängig mergefähig.

**Rollback**: Alle Änderungen sind abwärtskompatibel mit dem Spielzustand (keine brechenden Schema-Änderungen). Alte Spiele ohne Fähigkeiten funktionieren weiterhin.

## Offene Fragen

- **Fähigkeits-Stapelung**: Können mehrere Fähigkeiten desselben Typs gestapelt werden? (z.B. zwei Karten mit +1 Aktion/Zug = +2 gesamt?) Für jetzt: ja.
- **Timing-Konflikte**: Wenn zwei blaue Fähigkeiten beide „vor der ersten Aktion" auslösen, welche Reihenfolge? Für jetzt: Spieler wählt Reihenfolge.
- **Ausgewählte gedruckte Perlen und Wildcards**: Wenn eine gedruckte Wildcard-Perle verwendet wird und der Spieler keinen Wert explizit angibt, ermittelt das Spiel automatisch eine gültige Belegung. Soll der Spieler die Belegung auch manuell festlegen können? Für jetzt: Der Spieler muss die Belegung IMMER manuell festlegen.
