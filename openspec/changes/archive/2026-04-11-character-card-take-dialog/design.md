## Context

Aktuell löst ein Klick auf eine Charakterkarte in der Auslage oder auf den Charakterstapel sofort den `takeCharacterCard`-Move aus — ohne Bestätigungsschritt und ohne die Karte vorher zu sehen. Das steht im Widerspruch zu anderen Interaktionen (z. B. Aktivierungsdialog), die immer einen Dialog-Zwischenschritt haben.

Das Projekt verwendet eine Canvas-basierte Spielfeldoberfläche (`CanvasGameBoard`). Klick-Events werden über `CanvasRegion`-Hitboxen erkannt und in `useGameActions` (oder ähnlichen Hooks) zu bgio-Moves umgewandelt. Die Dialoge (z. B. Charakteraktivierung) sind als React-Komponenten umgesetzt und folgen einem einheitlichen Muster.

## Goals / Non-Goals

**Goals:**
- Dialog-Vorschau vor dem Nehmen einer Karte aus der Auslage (Vorderseite sichtbar)
- Dialog-Vorschau vor dem Nehmen vom Stapel (Rückseite sichtbar, oder Vorderseite bei `previewCharacter`-Fähigkeit)
- Austauschdialog direkt wenn Portal belegt — kein separater Vorschau-Schritt
- Sonderfall „Blind-Pflichtaustausch": Karte offen, Abbrechen-Button deaktiviert
- Konsistentes Aussehen und Verhalten mit bestehenden Dialogen

**Non-Goals:**
- Keine Änderungen an Backend-Moves oder Game-State
- Keine Änderungen an der Kostenkalkulation oder Aktivierungslogik
- Kein Redesign der Dialog-Infrastruktur

## Decisions

### 1. Klick-Intercept auf Hook-Ebene, nicht auf Canvas-Ebene

**Entscheidung:** Der bestehende Click-Handler in `useGameActions` (oder dem jeweiligen Klick-Dispatcher) öffnet bei Charakterkarten-Klick zunächst den Dialog, anstatt direkt den Move zu feuern. Der Move wird erst nach Bestätigung im Dialog ausgelöst.

**Warum:** Die Canvas-Schicht soll nicht wissen, ob ein Dialog notwendig ist — sie meldet nur das Klick-Event. Die Entscheidungslogik (welche Karte, welcher Zustand) gehört in den Hook, der bereits Zugriff auf `G`, `playerID` und `moves` hat.

**Alternative verworfen:** Dialog direkt in `CanvasGameBoard` — würde Canvas-Komponente mit Game-Logik koppeln.

---

### 2. Dialog-Zustand via lokalen React-State (kein Zustand in Zustand-Store)

**Entscheidung:** Der Dialog-Zustand (offen/geschlossen, welche Karte wird angezeigt, ob Blind-Pflicht) wird als lokaler `useState` im Board-Component oder im zuständigen Hook gehalten.

**Warum:** Es ist ein rein UI-seitiger Zustand, der nach Bestätigung/Abbruch verworfen wird. Kein Persistenz-Bedarf.

---

### 3. Dialog-Komponente: Bestehende Infrastruktur wiederverwenden

**Entscheidung:** Der neue Dialog folgt dem Muster des bestehenden Charakteraktivierungs-Dialogs (gleiche Wrapper-Komponente, gleiche Kartendarstellung). Die Kartenanzeige nutzt dieselbe Komponente, die auch in anderen Dialogen verwendet wird.

**Warum:** Konsistenz mit dem Rest der UI. Keine neue Dialog-Architektur nötig.

---

### 4. Rückseitenlogik: Prop statt separater Komponente

**Entscheidung:** Die Kartenanzeigekomponente erhält eine `faceDown`-Prop. Wenn `faceDown={true}`, wird die Rückseite gerendert.

**Warum:** Einfachste Erweiterung der bestehenden Komponente ohne strukturellen Umbau.

---

### 5. Blind-Pflichtaustausch: Gleicher Dialog, Buttons kontrolliert via Prop

**Entscheidung:** Im Sonderfall (blind gezogen, Portal belegt, kein Wahlrecht) wird derselbe Austauschdialog gezeigt, aber der Abbrechen-/Zurücklegen-Button ist via Prop `canCancel={false}` deaktiviert.

**Warum:** Kein separater Dialog-Typ nötig. Verhaltensunterschied ist minimal und gut über eine Prop steuerbar.

## Risks / Trade-offs

- **[Risiko] previewCharacter-Fähigkeit nicht korrekt ausgelesen** → Mitigation: Fähigkeit über bestehende `getPlayerAbilities`-Hilfsfunktion (oder Äquivalent) abfragen; expliziter Test-Case
- **[Risiko] Dialog öffnet bei falschen Klicks** → Mitigation: Klick-Typ-Check (`regionType === 'characterDisplay'` vs. `'characterDeck'`) bleibt im Handler

## Open Questions

- Gibt es bereits eine `faceDown`-Prop an der Kartenanzeige-Komponente, oder muss sie ergänzt werden?
- Ist der Austauschdialog (`SwapPortalDialog` o. ä.) bereits eine eigenständige Komponente, oder ist Austausch-UI noch in die allgemeine Aktivierungslogik eingebettet?
