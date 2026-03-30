## Warum

Das Spiel definiert 18 verschiedene Charakter-Fähigkeitstypen in `assets/cards.json` und `assets/Anleitung.md`, jedoch ist davon im Moment nur 1 Typ implementiert (`handLimitPlusOne`). Das bedeutet, dass 17/18 Fähigkeitstypen rein kosmetisch sind – Charaktere können aktiviert werden, aber ihre Fähigkeiten haben keinerlei Auswirkung auf das Spielgeschehen. Das blockiert zentrale Spielmechaniken und macht viele Charakterkarten strategisch bedeutungslos.

## Aktueller Stand (Stand 2026-03-29)

TIER 0–8 sind vollständig implementiert und getestet (215 Tests bestehen). Die Backend-Logik für alle 18 Fähigkeitstypen inklusive `PaymentSelection`-Flow, `activateSharedCharacter` (irrlicht) und Turn-Lifecycle-Hooks ist fertig. Ausstehend sind:

- **Datenladen**: `mapRawCard` in `cardDatabase.ts` befüllt `printedPearls` noch nicht aus `ability.value` (für `numberAdditionalCardActions`) bzw. setzt kein `[{ wildcard: true }]` (für `anyAdditionalCardActions`). Dadurch erscheinen diese Karten im Dialog ohne nutzbare Perlen.
- **Dialog-UI**: Der `CharacterActivationDialog` zeigt Fähigkeits-Modifier derzeit nur als unsichtbare Text-Buttons nach Kartenauswahl. Aktivierte Charaktere mit Bezahl-Fähigkeiten müssen als eigenständige visuelle Sektion mit Kartenbild erscheinen.

## Was sich ändert

- **Alle 18 Charakter-Fähigkeitstypen implementieren** (rote und blaue) in der Spielzustands-Maschine ✅
- **Fähigkeits-Ausführungsmodell einführen** mit deklarativem State: `PlayerState.activeAbilities`, `PlayerState.handLimitModifier`, `GameState.nextPlayerExtraAction`, `GameState.lastPlayedPearlId` ✅
- **CharacterAbility-Typsystem erweitern** in `types.ts` auf alle 18 Typen ✅
- **Kostenvalidierung bleibt unverändert**: Die bestehende Logik (`costCalculation.ts`) wird nicht angetastet. Stattdessen wird die "Bezahl-Hand" (Karten) vom Frontend zusammengestellt und validiert an die Kernfunktion übergeben. ✅
- **Manuelle Spielerauswahl bei Cost-Abilities**: Der Spieler wählt im `CharacterActivationDialog` explizit aus, welche echten Handkarten er für welchen Wert nutzt (unter Anwendung von z. B. `onesCanBeEights` oder `decreaseWithPearl`) und welche zusätzlichen virtuellen Perlenkarten durch aktivierte Charaktere bereitgestellt werden. Diese Auswahl wird als angewendete "virtuelle Hand" an das Backend gesendet. ✅ Backend, ⏳ Dialog-UI
- **Fähigkeits-Trigger zum richtigen Zeitpunkt einbauen**: vor der ersten Aktion, während einer Aktion, nach der letzten Aktion, Zugende ✅
- **Rote Fähigkeits-Nebeneffekte behandeln**: zusätzliche Aktionen für aktuellen Spieler, zusätzliche Aktionen für nächsten Spieler, Gegner-Karte entfernen, Handkarte stehlen, Perlenkarte zurückholen ✅
- **CharacterActivationDialog UI-Redesign**: Bezahl-Fähigkeiten erscheinen als separater Abschnitt neben den Handkarten – mit Kartenbild, Typ-spezifischen Buttons und `decreaseWithPearl`-Badge ⏳
- **printedPearls-Datenladen**: `mapRawCard` befüllt `CharacterCard.printedPearls` korrekt aus den JSON-Rohdaten ⏳

## Fähigkeiten

### Neue Fähigkeiten
- `character-ability-system`: Kern-Framework für Fähigkeitsausführung – Typen, Zustand, Handler und Timing-Punkte für rote und blaue Fähigkeitseffekte
- `ability-cost-modifiers`: Erweiterungen der Kostenvalidierung für Wildcard-Substitutionen, Diamant-Wertanpassung und manuelle Auswahl aufgedruckter Perlenwerte

### Geänderte Fähigkeiten
- `game-web-spec`: Im UI können Spieler nun ihre Fähigkeiten auf Handkarten anwenden (Werte überschreiben, Diamanten opfern) und virtuelle Bonuskarten zu ihrer kombinierten Bezahlhand hinzufügen.

## Auswirkungen

- **shared/src/game/types.ts**: Erweiterung des CharacterAbility-Typs (18 Typen) sowie Definition vom neuen Interface `PaymentSelection`.
- **shared/src/game/index.ts**: Spielzustands-Maschine (Fähigkeitsausführung in Moves, State-Updates, Move `activatePortalCard` erhält modifizierte Karten).
- **shared/src/game/costCalculation.ts**: Bleibt in ihrer Kern-Validierungslogik völlig unangetastet, da transformierte Werte übergeben werden.
- **Spielbalance**: 17 bisher inaktive Charakterkarten werden strategisch relevant
- **Spieler-API**: `activatePortalCard` empfängt nun ein Array von `PaymentSelection` anstelle von simplen Kartenindizes.
