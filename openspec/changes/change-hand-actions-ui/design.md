## Context

Im Spieler-UI-Bereich (`CanvasGameBoard.tsx` ~L638) werden `PlayerStatusBadge` und `EndTurnButton` gestapelt gerendert. `EndTurnButton` erscheint wenn `isActive && actionCount >= maxActions`.

Die `changeCharacterActions`-Fähigkeit (Portaltausch vor der 1. Aktion) ist als Vergleich relevant: sie wird über `portal-swap-btn`-Canvas-Regionen ausgelöst — also direkt im Canvas, nicht als HTML-Button. `changeHandActions` passt besser als HTML-Button da sie am Ende des Zuges steht, analog zu `EndTurnButton`.

Der Backend-Guard in `rehandCards` prüft bereits: `actionCount >= maxActions` und `hasAbility`. Der Move kann also beliebig oft aufgerufen werden (jeder Aufruf tauscht die Hand) — ist aber natürlich nur sinnvoll einmal pro Zug. Es gibt kein explizites „bereits benutzt"-Flag.

## Goals / Non-Goals

**Goals:**
- Button „Hand neu ziehen" erscheint nach letzter Aktion wenn `changeHandActions` aktiv
- Klick ruft `moves.rehandCards()` auf
- Button verschwindet nach erfolgreichem Aufruf (optimistisch via lokalem State oder da die Hand sich ändert)

**Non-Goals:**
- Kein Backend-Eingriff
- Keine Änderung an `EndTurnButton` selbst
- Kein Tracking ob die Fähigkeit bereits genutzt wurde (Backend lässt Mehrfachnutzung zu, UI bietet sie einmalig an)

## Decisions

**Lokaler `rehandDone`-State im CanvasGameBoard**

Nach dem Klick wird `rehandDone: true` gesetzt. Der Button verschwindet, `EndTurnButton` bleibt sichtbar. State wird in `turn.onBegin` implizit zurückgesetzt da er an den Zug gebunden ist — explizit via `useEffect` auf `ctx.turn`.

Warum nicht Backend-seitig tracken: unnötige Komplexität für eine rein UI-visuelle Optimierung. Der Backend-Guard verhindert Missbrauch bereits.

**Sichtbarkeitsbedingung:**
```
isActive
  && actionCount >= maxActions
  && me.activeAbilities.some(a => a.type === 'changeHandActions')
  && !rehandDone
```

**Styling:** analog zu `EndTurnButton` aber blauer Akzent (blaue Fähigkeit), um ihn vom roten „Zug beenden"-Button zu unterscheiden.
