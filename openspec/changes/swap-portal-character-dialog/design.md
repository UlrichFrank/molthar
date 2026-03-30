## Context

**Backend (vollständig):**
- `swapPortalCharacter(portalSlotIndex, tableSlotIndex)` in `index.ts`: tauscht `player.portal[portalSlotIndex].card` mit `G.characterSlots[tableSlotIndex]`. Guard: `actionCount > 0` → INVALID_MOVE, Ability-Check. Kostet keine Aktion.

**Frontend (Stand):**
- Portal-Karten werden in `gameRender.ts:drawPlayerPortal` auf dem Canvas gezeichnet.
- `canvasRegions.ts` erzeugt `portal-slot`-Regionen (je eine pro Portal-Slot, max 2).
- Klick auf `portal-slot` → öffnet `CharacterActivationDialog`.
- `CharacterReplacementDialog` zeigt: neue Karte oben, Portal-Karten unten zur Auswahl.

## Goals / Non-Goals

**Goals:**
- Sichtbarer Austausch-Button unterhalb jeder Portal-Karte bei aktiver Ability und `actionCount === 0`.
- Dialog zur Auswahl der Tauschkarte aus den beiden Auslage-Slots.
- Cancel möglich (Tausch ist freiwillig).

**Non-Goals:**
- Kein Backend-Change.
- Kein Austausch mit Deck oder Hand.
- Der Button erscheint nicht mehr nach der ersten Aktion.

## Decisions

### 1. Swap-Button als neue Canvas-Region `portal-swap-btn`

**Entscheidung:** Eine neue Region `portal-swap-btn` (mit `id: portalSlotIndex`) wird unterhalb jeder belegten Portal-Karte hinzugefügt — aber nur wenn `changeCharacterActions` aktiv und `actionCount === 0`.

**Begründung:** Konsistent mit dem bestehenden Canvas-Region-Muster. Click-Handling ist bereits in `CanvasGameBoard.tsx` zentralisiert.

**Renderingdetails:** Das ⇄-Symbol (Unicode `⇄` oder `⇆`) wird als kleiner Text oder Icon-Box unterhalb des Portal-Slots gezeichnet. Größe: ca. 24×24px, mit leichtem Hover-Glow analog zu anderen Buttons.

**Alternativen verworfen:**
- *HTML-Overlay-Button*: Bräuchte präzise Positionierung über Canvas — aufwändig, inkonsistent mit restlichem UI.

### 2. Dialog `CharacterSwapDialog` angelehnt an `CharacterReplacementDialog`

**Entscheidung:** Neue Komponente `CharacterSwapDialog` mit ähnlicher Struktur:
- Portal-Karte (auszutauschende) oben
- Pfeil ⇄ in der Mitte
- Die zwei `characterSlots`-Karten unten als anklickbare Optionen
- Cancel-Button

**Begründung:** Wiederverwendung des visuellen Patterns. Unterschied: beide Richtungen des Tauschs sind explizit — Portal-Karte wandert in den Slot, Slot-Karte ins Portal.

### 3. Dialog-State im DialogContext

**Entscheidung:** Neuer Typ `swap-portal-character` mit Feldern `{ portalCard: CharacterCard; portalSlotIndex: number; tableCards: CharacterCard[] }`.

**Begründung:** Analog zu bestehenden Dialog-Typen (`replacement`, `activation`, `discard`). Alle nötigen Daten für den Dialog werden beim Öffnen übergeben.

### 4. Button-Sichtbarkeit

**Entscheidung:** `portal-swap-btn`-Regionen werden nur dann in `buildRegions` hinzugefügt, wenn:
1. Spieler hat `changeCharacterActions` in `activeAbilities`
2. `G.actionCount === 0`
3. Der entsprechende Portal-Slot ist belegt

**Begründung:** Keine separate Sichtbarkeits-Logik nötig — die Region existiert schlicht nicht, wenn die Bedingungen nicht erfüllt sind.

## Risks / Trade-offs

- **Überlappung mit portal-slot**: Der Swap-Button wird unterhalb des Portal-Slots gezeichnet, außerhalb seiner Grenzen — keine Überlappung mit der Aktivierungs-Region.
- **Zwei Klick-Ziele nebeneinander**: Portal-Slot (Aktivierung) und Swap-Button (Tausch) sind vertikal getrennt. Positionen müssen klar sein.
