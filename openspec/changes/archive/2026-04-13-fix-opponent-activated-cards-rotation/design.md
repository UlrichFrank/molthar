## Context

**Lokaler Spieler** — `drawActivatedCharactersGrid` (gameRender.ts ~L344):
```
ctx.save();
ctx.translate(cardX + w/2, cardY + h/2);
ctx.rotate(Math.PI);
ctx.translate(-(cardX + w/2), -(cardY + h/2));
drawImageOrFallback(...);
ctx.restore();
```
Jede Karte wird explizit um 180° um ihren Mittelpunkt gedreht.

**Gegner** — `drawOpponentZone` (gameRender.ts ~L596):
```
drawImageOrFallback(ctx, card.card.imageName, actX, actY, OPP_ACT_W, OPP_ACT_H, card.card.name);
```
Kein `save/rotate/restore` — die Karte wird aufrecht innerhalb der bereits rotierten Zone gezeichnet.

## Goals / Non-Goals

**Goals:**
- Gegnerische aktivierte Karten werden um 180° relativ zu ihrer lokalen Position in der Zone gerendert
- Region-Winkel semantisch korrekt

**Non-Goals:**
- Änderungen am Hit-Testing-Verhalten (Glow/Flash sehen bei Rechtecken gleich aus)
- Änderungen an Portal-Karten, Hand-Karten oder anderen Elementen

## Decisions

**Translate-Rotate-Translate-Pattern (wie beim lokalen Spieler)**

In `drawOpponentZone` wird der bestehende `drawImageOrFallback`-Aufruf für aktivierte Karten in einen `ctx.save() / ctx.translate(cx,cy) / ctx.rotate(Math.PI) / ctx.translate(-cx,-cy) / ... / ctx.restore()`-Block eingebettet. `cx = actX + OPP_ACT_W/2`, `cy = actY + OPP_ACT_H/2`.

Dies ist exakt das gleiche Muster wie in `drawActivatedCharactersGrid` und bleibt innerhalb des bereits rotierten Koordinatensystems der Gegnerzone — kein weiterer mathematischer Aufwand.

**`angle: rot + Math.PI` in canvasRegions**

Die Region-Angles steuern die Ausrichtung des Hover/Flash-Rechtecks in `drawRegionEffects`. Für rechteckige Karten macht die 180°-Rotation visuell keinen Unterschied, aber der Wert stimmt nun semantisch überein. Kein Risiko.

## Risks / Trade-offs

- Minimales Risiko: Nur render-seitige Änderung, kein Game State berührt.
- Die `ctx.save/restore`-Klammerung ist bereits im Opponent-Zone-Kontext vorhanden (Zeile 572/626) — der neue innere Block nistet sich sauber ein.
