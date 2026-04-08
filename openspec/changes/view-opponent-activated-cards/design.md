## Context

Aktivierte Charakterkarten des eigenen Spielers sind bereits anklickbar (Region-Typ `activated-character`) und öffnen die `ActivatedCharacterDetailView`. Gegnerische aktivierte Karten werden im Canvas gezeichnet (via `drawOpponentPortals`), haben aber keine Hit-Regions in `canvasRegions.ts` und lösen keinen Click-Handler aus.

Die `ActivatedCharacterDetailView` zeigt eine Karte read-only an — sie hat keine Aktionsbuttons die nur für den eigenen Spieler relevant wären. Sie kann direkt für Gegner-Karten wiederverwendet werden.

## Goals / Non-Goals

**Goals:**
- Klick auf aktivierte Karte eines Gegners öffnet `ActivatedCharacterDetailView` mit der Karte
- Funktioniert zu jeder Zeit (eigener Zug, nicht eigener Zug, keine Aktionen mehr)
- Hover-Glow und Click-Flash wie bei eigenen aktivierten Karten

**Non-Goals:**
- Keine Aktionen über die Detailansicht des Gegners auslösen
- Keine Änderung der Darstellung oder Größe der gegnerischen Karten im Canvas

## Decisions

**Entscheidung: Neuer Region-Typ `opponent-activated-character`**

Statt den bestehenden Typ `activated-character` zu erweitern, wird ein neuer Typ eingeführt. Die ID enthält `playerId:cardIndex` (analog zu `opponent-portal-card`), damit im Click-Handler klar ist, welchem Spieler die Karte gehört.

Alternativen:
- Typ `activated-character` mit Präfix: unübersichtlich, bricht Typ-Safety
- Direkte Suche über Spieler-ID im generischen Handler: Funktioniert, aber verschleiert die Absicht

**Entscheidung: Hit-Region-Berechnung nutzt bestehende OPP_ACT_* Konstanten**

`cardLayoutConstants.ts` enthält bereits `OPP_ACT_REL_X`, `OPP_ACT_REL_Y`, `OPP_ACT_W`, `OPP_ACT_H`, `OPP_ACT_GAP` die genau den Zeichenpositionen entsprechen. Diese werden direkt für die Hit-Regions verwendet — kein Versatz-Bug wie bei den Portal-Slots möglich.

**Entscheidung: State für aktive gegnerische Karte als `{ playerId, index } | null`**

Der bestehende State `activeCharacterIndex: number | null` für eigene Karten bleibt unverändert. Ein separater State `activeOpponentCharacter: { playerId: string; index: number } | null` hält die Auswahl für Gegner-Karten. Die `ActivatedCharacterDetailView` wird mit dem aufgelösten `CharacterActivationState`-Objekt aufgerufen.

## Risks / Trade-offs

- **Opponent-Zone-Koordinatensystem** (rotiert + verschoben): Die Gegner-Zonen werden mit `ctx.save/translate/rotate` gezeichnet. Die Hit-Regions müssen im Weltkoordinatensystem liegen. Die bestehende Logik in `canvasRegions.ts` für `opponent-portal-card` zeigt das Pattern — dieses wird für aktivierte Karten repliziert. → Sorgfältig gegen die Render-Funktion prüfen.
- **Spalten/Zeilen-Anzahl**: Gegner zeigen ggf. mehr als 8 aktivierte Karten (theoretisch). `ACTIVATED_MAX = 8` wird auch für Gegner angewandt, identisch zum eigenen Grid. → Akzeptiert.
