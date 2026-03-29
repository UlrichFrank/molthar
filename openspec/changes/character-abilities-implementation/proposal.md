## Warum

Das Spiel definiert 18 verschiedene Charakter-Fähigkeitstypen in `assets/cards.json` und `assets/Anleitung.md`, jedoch ist davon im Moment nur 1 Typ implementiert (`handLimitPlusOne`). Das bedeutet, dass 17/18 Fähigkeitstypen rein kosmetisch sind – Charaktere können aktiviert werden, aber ihre Fähigkeiten haben keinerlei Auswirkung auf das Spielgeschehen. Das blockiert zentrale Spielmechaniken und macht viele Charakterkarten strategisch bedeutungslos.

## Was sich ändert

- **Alle 18 Charakter-Fähigkeitstypen implementieren** (rote und blaue) in der Spielzustands-Maschine und der Kostenvalidierung
- **Fähigkeits-Ausführungsmodell einführen** mit deklarativem State: `PlayerState.activeAbilities`, `PlayerState.handLimitModifier`, `GameState.nextPlayerExtraAction`, `GameState.lastPlayedPearlId`
- **CharacterAbility-Typsystem erweitern** in `types.ts` auf alle 18 Typen (aktuell nur `handLimitPlusOne` bekannt)
- **Kostenvalidierung anpassen** (`costCalculation.ts`) für Fähigkeits-Modifikatoren: Wildcard-Substitutionen (`onesCanBeEights`, `threesCanBeAny`), Diamant-Modulation (`decreaseWithPearl`), gedruckte Perlenwerte (`numberAdditionalCardActions`, `anyAdditionalCardActions`)
- **Manuelle Spielerauswahl bei Cost-Abilities**: Der Spieler wählt explizit, welche aufgedruckten Perlenwerte er zur Kostenerfüllung einsetzt – das Spiel prüft, ob eine gültige Kombination aus Handkarten und ausgewählten gedruckten Perlen existiert
- **Fähigkeits-Trigger zum richtigen Zeitpunkt einbauen**: vor der ersten Aktion, während einer Aktion (Kostenvalidierung), nach der letzten Aktion, Zugende
- **Rote Fähigkeits-Nebeneffekte behandeln**: zusätzliche Aktionen für aktuellen Spieler, zusätzliche Aktionen für nächsten Spieler, Gegner-Karte entfernen, Handkarte stehlen, Perlenkarte zurückholen

## Fähigkeiten

### Neue Fähigkeiten
- `character-ability-system`: Kern-Framework für Fähigkeitsausführung – Typen, Zustand, Handler und Timing-Punkte für rote und blaue Fähigkeitseffekte
- `ability-cost-modifiers`: Erweiterungen der Kostenvalidierung für Wildcard-Substitutionen, Diamant-Wertanpassung und manuelle Auswahl aufgedruckter Perlenwerte

### Geänderte Fähigkeiten
- `game-web-spec`: Kostenvalidierung unterstützt jetzt Fähigkeits-Modifikatoren (Wildcards substituieren Perlenwerte, Diamanten reduzieren Werte, gedruckte Perlen ergänzen Handkarten durch Spielerauswahl)

## Auswirkungen

- **shared/src/game/types.ts**: Erweiterung des CharacterAbility-Typs (18 Typen)
- **shared/src/game/index.ts**: Spielzustands-Maschine (Fähigkeitsausführung in Moves, State-Updates, `turn.onBegin`/`turn.onEnd`-Hooks)
- **shared/src/game/costCalculation.ts**: Wildcard- und Reduktionslogik für Fähigkeits-Modifikatoren, Unterstützung für gedruckte Perlenwerte via Spielerauswahl
- **Spielbalance**: 17 bisher inaktive Charakterkarten werden strategisch relevant
- **Spieler-API**: Keine Breaking Changes an der Client/Server-Schnittstelle (Fähigkeiten sind interne State-Effekte)
