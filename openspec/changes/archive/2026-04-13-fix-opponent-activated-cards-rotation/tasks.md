## 1. gameRender.ts — 180°-Rotation für Gegner-Aktivierte-Karten

- [x] 1.1 In `drawOpponentZone`: den `drawImageOrFallback`-Aufruf für aktivierte Charakterkarten (Loop ~L596) in einen `ctx.save() / translate(actX + OPP_ACT_W/2, actY + OPP_ACT_H/2) / rotate(Math.PI) / translate(-(actX + OPP_ACT_W/2), -(actY + OPP_ACT_H/2)) / ... / ctx.restore()`-Block einbetten

## 2. canvasRegions.ts — Region-Winkel korrigieren

- [x] 2.1 In der `opponent-activated-character`-Region-Erzeugung (~L374): `angle: rot` auf `angle: rot + Math.PI` ändern
