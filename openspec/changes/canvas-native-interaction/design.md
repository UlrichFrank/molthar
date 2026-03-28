## Context

Das Spiel rendert das Spielfeld auf einem `<canvas>` Element (Modell-Koordinaten 1200×800, skaliert auf Viewport). Bisher liegt ein unsichtbarer HTML-Button-Layer (`CardButtonOverlay`) als `position:absolute` über dem Canvas. Dieser Layer enthält `CardButton`-Elemente, die Hover- und Click-Events verarbeiten und visuelles Feedback per CSS-Klassen liefern.

Das führt zu doppelter Positionslogik: Drawing-Code und Button-Overlay berechnen Koordinaten unabhängig — verbunden nur durch `cardLayoutConstants.ts`. Hover-Effekte sind auf CSS beschränkt; Canvas-basierte Animationen (Glow, Flash) sind so nicht umsetzbar.

Das Canvas hat bereits `onPointerMove` / `onPointerDown` Handler mit vollständigem Hit-Testing. Die Infrastruktur für reine Canvas-Interaktion ist vorhanden, nur der visuelle Feedback-Teil fehlt.

## Goals / Non-Goals

**Goals:**
- Hover-Glow (golden, smooth) und Click-Flash (weiß, ~200ms) im Canvas selbst zeichnen
- `CardRegion`-Konzept: ein Objekt pro Karte kapselt Position + Hit-Test + Animations-Zustand
- `requestAnimationFrame`-Loop für zeitbasierte Animationen
- Touch-Support: Flash bei Tap, kein Hover
- `CardButtonOverlay` und `CardButton` entfernen

**Non-Goals:**
- Keyboard-Navigation / Accessibility
- Änderungen an Game-Logic, Moves, Backend
- Änderungen an Dialog-Komponenten (CharacterActivationDialog etc.)
- Änderungen an `cardLayoutConstants.ts` oder `gameHitTest.ts`

## Decisions

### CardRegion als Deskriptor-Objekt

Ein `CardRegion`-Interface kapselt alle Informationen einer interaktiven Karte:

```typescript
interface CardRegion {
  type: HitTarget['type']
  id: number | string
  x: number; y: number; w: number; h: number
  angle?: number
  // Animations-Zustand (mutable, direkt auf dem Objekt)
  hoverProgress: number   // 0–1, smooth Hover-Übergang
  flashProgress: number   // 0–1, Click/Tap-Flash, zerfällt nach Trigger
}
```

**Warum mutable state auf dem Objekt statt React-State?**
Der rAF-Loop läuft außerhalb des React-Render-Zyklus. React-State würde bei jedem Frame ein Re-Render triggern. Animations-State lebt daher als `useRef`-Array, nicht als `useState`.

**Warum nicht Klasse?**
Plain objects reichen; Hit-Testing und Drawing sind standalone-Funktionen, kein OOP nötig.

---

### buildCardRegions(G) als Single Source of Truth

Eine Funktion `buildCardRegions(G, playerID)` baut das `CardRegion[]`-Array aus dem Game-State. Sie wird bei jedem Game-State-Update aufgerufen und schreibt Positionen in das bestehende `regionsRef`-Array (Update in-place um Animations-Zustand zu erhalten).

**Warum in-place Update statt neu erstellen?**
Bei Neu-Erstellung würden `hoverProgress` / `flashProgress` zurückgesetzt. In-place Update behält laufende Animationen.

---

### requestAnimationFrame-Loop

Der rAF-Loop läuft kontinuierlich solange die Komponente gemountet ist. Er:
1. Berechnet `Δt` seit letztem Frame
2. Interpoliert `hoverProgress` für jede Region (→ target, Geschwindigkeit ~5/s)
3. Zerfällt `flashProgress` (~5/s)
4. Zeichnet Canvas neu

**Warum immer laufen lassen?**
Einfacher als Start/Stop-Logik; Canvas-Rendering bei 60fps ist für diese Spielgröße unkritisch.

---

### Hover-Effekt: Canvas shadowBlur

```javascript
ctx.save()
ctx.shadowColor = `rgba(255, 215, 0, ${region.hoverProgress * 0.8})`
ctx.shadowBlur = region.hoverProgress * 20
ctx.drawImage(image, x, y, w, h)
ctx.restore()
```

**Warum shadowBlur?**
Nativ in Canvas, keine zusätzliche Render-Logik. Einfach und ausreichend.

---

### Click-Flash: Semitransparentes weißes Rect

Nach dem Zeichnen der Karte (also darüber):
```javascript
if (region.flashProgress > 0) {
  ctx.save()
  ctx.globalAlpha = region.flashProgress * 0.6
  ctx.fillStyle = 'white'
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}
```

**Warum nach der Karte?**
Flash soll über dem Kartenbild liegen.

---

### Touch-Verhalten

`pointerType === 'touch'` → kein `hoverProgress` setzen, aber `flashProgress = 1.0` bei `pointerDown` setzen (gleichzeitig mit Aktion). Kein separates "Hover dann Click" auf Touch.

---

### Cursor-Management

```javascript
canvas.style.cursor = hoveredRegion ? 'pointer' : 'default'
```

Gesetzt im `onPointerMove`-Handler, zurückgesetzt in `onPointerLeave`.

## Risks / Trade-offs

- **shadowBlur Performance auf Low-End-Devices** → shadowBlur ist GPU-intensiv bei vielen Karten gleichzeitig. Mitigation: nur für gehovertes Element, nicht alle Karten.
- **in-place Update Komplexität** → buildCardRegions muss Regions nach type+id matchen. Mitigation: sorgfältige Match-Logik, Tests.
- **Touch Flash Timing** → Flash und Aktion passieren gleichzeitig; wenn Dialog sofort öffnet, ist Flash kaum sichtbar. Mitigation: Flash wird gezeichnet, Dialog öffnet im nächsten Frame — kein künstliches Delay nötig.
