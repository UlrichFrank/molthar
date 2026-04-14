## Context

`drawPlayerPortal` erhält `portal.diamonds: number` (Anzahl) und zeichnet pro Diamant ein `💎`-Emoji. Das Emoji wurde nie durch echte Kartenbilder ersetzt, nachdem `diamonds-as-character-cards` die Daten auf `diamondCards: CharacterCard[]` umgestellt hat. Das Canvas-System hat allerdings bereits `drawImageOrFallback` und kennt das Bild `'Charakterkarte Hinten.png'` (für den Charakterstapel).

```
Ist:  💎 💎 💎   (Emoji, kein Kartenbezug)
Soll: [█][█][█]  (kleine Charakterkarten-Rückseiten, gestapelt/nebeneinander)
```

## Goals / Non-Goals

**Goals:**
- Diamanten als Charakterkarten-Rückseiten (`Charakterkarte Hinten.png`) rendern
- Darstellungsgröße und -position bleibt im linken Bereich des Player-Portals (wie bisher)
- Anzahl der angezeigten Karten = `portal.diamonds`

**Non-Goals:**
- Anzeige der eigentlichen Vorderseite der Diamantkarten (Spieler müssten Karte anklicken können für Details — eigenes Feature)
- Gegner-Diamanten einblenden (OpponentZoneData hat kein `diamonds`-Feld; separates Feature)
- Interaktivität der Diamantkarten im Canvas (kein Click-Handler nötig)

## Decisions

### 1. Interface-Änderung minimal halten

`PlayerPortalData.diamonds: number` bleibt unverändert. Nur die Render-Logik in `drawPlayerPortal` wird angepasst. Die Caller übergeben bereits `me.diamondCards.length` — das ist korrekt und muss nicht geändert werden.

### 2. Kleine Karten-Rückseiten nebeneinander

```typescript
// Alt:
ctx.fillText('💎', diamondX + i * 30, diamondY);

// Neu:
const DIAMOND_CARD_W = 28;
const DIAMOND_CARD_H = 36;
const DIAMOND_CARD_GAP = 4;
for (let i = 0; i < portal.diamonds; i++) {
  const x = diamondX + i * (DIAMOND_CARD_W + DIAMOND_CARD_GAP);
  drawImageOrFallback(ctx, 'Charakterkarte Hinten.png', x, diamondY, DIAMOND_CARD_W, DIAMOND_CARD_H);
}
```

Größe 28×36 px ist proportional zur Originalkarte (Verhältnis ~1:1.29) und passt in den Portal-Bereich. Bei vielen Diamanten (6+) wird der Abstand reduziert oder die Karten leicht überlappend dargestellt (Gap = 4 → 2).

### 3. Fallback bei fehlendem Bild

`drawImageOrFallback` zeigt automatisch einen Fallback-Text an — kein zusätzlicher Fallback nötig.

## Risks / Trade-offs

- **Platzbedarf bei vielen Diamanten**: Bei 6 Diamanten á 28+4 px = 192 px. Der Portal-Bereich links hat ca. 200 px Breite. Bei mehr als 6 müsste man überlappen. Mitigierung: Karten leicht überlappen wenn `diamonds > 6` (anpassen der X-Berechnung).
- **Bild-Ladezeit**: `'Charakterkarte Hinten.png'` wird bereits für den Deck-Stack verwendet — ist im Cache.
