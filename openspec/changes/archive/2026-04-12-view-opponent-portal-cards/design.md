## Context

Portal-Karten der Gegner (`opponent-portal-card` Regions) werden in `canvasRegions.ts` aktuell **nur** erzeugt wenn:
1. `isActive === true` (eigener Zug)
2. `actionCount < maxActions`
3. Die Karte hat die `irrlicht`-Fähigkeit oder `sharedActivation`

Das bedeutet: außerhalb des eigenen Zuges und für Nicht-Irrlicht-Karten existieren gar keine Regions → kein Hover, kein Klick.

Aktivierte Gegner-Karten (`opponent-activated-character`) dagegen haben immer Regions — daher funktionieren Hover und Klick dort immer.

## Goals / Non-Goals

**Goals:**
- `opponent-portal-card` Regions für ALLE Portal-Karten aller Nachbar-Gegner erzeugen, unabhängig von `isActive` und Fähigkeit
- Klick auf beliebige Gegner-Portal-Karte öffnet immer die read-only Detail-Ansicht
- Irrlicht-Aktivierungsfluss (öffnet Aktivierungsdialog) bleibt erhalten: wenn `isActive` und die Karte irrlicht-fähig ist, wird statt Detail-View der Aktivierungsdialog geöffnet
- Hover-Glow funktioniert immer (folgt automatisch aus immer vorhandenen Regions)

**Non-Goals:**
- Keine Änderung am Irrlicht-Aktivierungsdialog selbst
- Keine Unterstützung für Gegner-Portal-Karten, die nicht in Nachbarzonen liegen (das hängt von der Spielfeld-Darstellung ab, nicht am Klick-Handler)
- Kein separater Hover-Glow-Stil — der bestehende `drawRegionEffects`-Pass reicht

## Decisions

### 1. Region-Erzeugung entkoppeln: immer, für alle Portal-Karten

**Entscheidung:** In `canvasRegions.ts` den `isActive`-Guard für `opponent-portal-card` entfernen. Regions werden für alle belegten Portal-Slots aller `neighborOpponents` erzeugt — unabhängig von Zug und Fähigkeit.

**Warum:** Hover und Klick hängen an der Existenz der Region. Ohne Region keine Interaktion. Die bisherige Einschränkung war nur für Irrlicht-Aktivierung nötig, nicht für das Betrachten.

**Alternative verworfen:** Zwei separate Region-Typen (`opponent-portal-card-irrlicht` vs. `opponent-portal-card-view`) — unnötige Komplexität.

---

### 2. Klick-Handler: zuerst prüfen ob Irrlicht, sonst Detail-View

**Entscheidung:** Der Klick-Handler für `opponent-portal-card` wird (wie `opponent-activated-character`) **außerhalb** des `isActive`-Zweigs platziert:
- Wenn `isActive && isIrrlicht(entry.card)`: Aktivierungsdialog öffnen (bisheriges Verhalten)
- Sonst: Detail-View öffnen (neues Verhalten)

**Warum:** Irrlicht-Aktivierung bleibt ohne Änderung am Dialog-Flow. Die Entscheidung passiert im Click-Handler, nicht im State.

---

### 3. Neuer lokaler State für Portal-Card-Detail-View

**Entscheidung:** Analog zu `activeOpponentCharacter` wird ein neuer State `activeOpponentPortalCard: { playerId: string; slotIndex: number } | null` hinzugefügt. Die `ActivatedCharacterDetailView` wird mit dem entsprechenden Portal-Entry gerendert.

**Warum:** Portal-Einträge sind bereits `ActivatedCharacter`-Objekte (`{ id, card, activated }`). `ActivatedCharacterDetailView` nimmt genau diesen Typ — kein neuer Dialog nötig.

## Risks / Trade-offs

- **[Risiko] Zu viele interaktive Regions bei großem Spielerfeld** → Gering: max. 2 Portal-Slots pro Nachbar, max. 2-3 Nachbarn sichtbar
- **[Risiko] Irrlicht-Bedingung im Click-Handler weicht von Region-Erzeugung ab** → Mitigation: Irrlicht-Check (`entry.card.abilities.some(a => a.type === 'irrlicht') || entry.card.sharedActivation`) wird identisch wie bisher im Handler verwendet
