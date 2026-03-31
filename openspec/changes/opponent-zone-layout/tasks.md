## 1. cardLayoutConstants.ts — OPP_SCALE einführen

- [x] 1.1 `OPP_SCALE` als Konstante berechnen und exportieren: `min(ZONE_CENTER_H / PORTAL_W, MARGIN_H / ZONE_PLAYER_H)`
- [x] 1.2 `OPP_SLOT_W/H`, `OPP_SLOT_GAP`, `OPP_ACT_W/H`, `OPP_ACT_GAP`, `OPP_HAND_W/H` auf Basis von `OPP_SCALE` und den jeweiligen Spieler-Dimensionen neu berechnen (ersetzen statt ergänzen)
- [x] 1.3 Relative Offsets für die drei Layout-Bereiche als exportierte Konstanten ableiten:
  - `OPP_HAND_REL_X` = `(HAND_AREA_X - PORTAL_X) * OPP_SCALE` → X-Offset des Hand-Stapels ab Portal-Links
  - `OPP_HAND_REL_Y` = `(HAND_CENTER_Y - PORTAL_Y) * OPP_SCALE` → Y-Mitte des Hand-Stapels ab Portal-Oben
  - `OPP_SLOT_REL_X` = `(SLOT_AREA_X - PORTAL_X) * OPP_SCALE`
  - `OPP_SLOT_REL_Y` = `(SLOT_AREA_Y - PORTAL_Y) * OPP_SCALE`
  - `OPP_ACT_REL_X` = `(ACTIVATED_GRID_X - PORTAL_X) * OPP_SCALE`
  - `OPP_ACT_REL_Y` = `(ACTIVATED_GRID_Y - PORTAL_Y) * OPP_SCALE`
- [x] 1.4 `OPP_SCALED_W` = `PORTAL_W * OPP_SCALE` und `OPP_SCALED_H` = `ZONE_PLAYER_H * OPP_SCALE` exportieren

## 2. gameRender.ts — drawOpponentZone neu implementieren

- [x] 2.1 Portal-Hintergrund auf `OPP_SCALED_W × OPP_SCALED_H` setzen, zentriert bei `(-OPP_SCALED_W/2, -OPP_SCALED_H/2)` im lokalen Koordinatensystem
- [x] 2.2 Hand-Stapel positionieren: X = `-OPP_SCALED_W/2 + OPP_HAND_REL_X`, Y = `-OPP_SCALED_H/2 + OPP_HAND_REL_Y - OPP_HAND_H/2`; Bild `'Perlenkarte Hinten.png'` (nicht `Perlenkarte_Rueckseite.png`)
- [x] 2.3 Portal-Slots positionieren: Startpunkt X = `-OPP_SCALED_W/2 + OPP_SLOT_REL_X`, Y = `-OPP_SCALED_H/2 + OPP_SLOT_REL_Y`; zwei Slots mit `OPP_SLOT_W/H` und `OPP_SLOT_GAP`
- [x] 2.4 Aktivierte Charaktere positionieren: Startpunkt X = `-OPP_SCALED_W/2 + OPP_ACT_REL_X`, Y = `-OPP_SCALED_H/2 + OPP_ACT_REL_Y`; Grid analog zu `drawActivatedCharactersGrid`, skaliert mit `OPP_ACT_W/H/GAP`
- [x] 2.5 Anzahl-Badge für Handkarten-Stapel korrekt relativ zum Stapel-Bild positionieren

## 3. Verifikation

- [ ] 3.1 Manuell (2 Spieler): Gegner-Zone links zeigt Portal-Bild, Hand-Stapel unten (= links aus Mitspielersicht), Portal-Slots rechts (= oben aus Mitspielersicht)
- [ ] 3.2 Manuell (3 Spieler): Beide oberen Gegner-Zonen zeigen korrektes 180°-Layout
- [ ] 3.3 Manuell (5 Spieler): Alle 4 Zonen, Karten gleich groß
- [ ] 3.4 Manuell: Handkarten-Stapel zeigt `Perlenkarte Hinten.png` (kein kaputtes Bild)
- [ ] 3.5 Manuell: Startspieler-Portal-Bild erscheint korrekt in Gegner-Zone

