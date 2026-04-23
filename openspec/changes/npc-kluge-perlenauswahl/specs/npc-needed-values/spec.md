## ADDED Requirements

### Requirement: computeNeededValues Basisfunktion
Das System SHALL eine Funktion `computeNeededValues(cards, hand, diamonds, activeAbilities)` in `shared/src/game/botNeededValues.ts` bereitstellen, die ein `Set<PearlCard['value']>` zurückgibt — die Menge aller Perlenwerte (1–8) die noch gebraucht werden um mindestens eine der übergebenen Karten aktivieren zu können.

Die Funktion SHALL alle Portal-Karten als Union betrachten: eine Perle ist nützlich wenn sie für IRGENDEINE der übergebenen Karten den Fortschritt erhöht.

#### Scenario: Keine Karten — leeres Set
- **WHEN** `computeNeededValues` mit leerer Kartenliste aufgerufen wird
- **THEN** gibt die Funktion ein leeres Set zurück

#### Scenario: Bereits zahlbare Karte — leeres Set
- **WHEN** eine Karte mit Kosten [number(5)] übergeben wird und Hand [5] enthält
- **THEN** gibt die Funktion ein leeres Set zurück (Karte ist schon zahlbar)

#### Scenario: Union über mehrere Karten
- **WHEN** zwei Karten übergeben werden: Karte A braucht {3}, Karte B braucht {7}
- **THEN** gibt die Funktion {3, 7} zurück

### Requirement: number-Kostentyp
Das System SHALL für `number(X)` den Wert X als benötigt markieren, wenn X nicht auf der Hand liegt.

#### Scenario: Fehlender Wert wird erkannt
- **WHEN** Karte kostet [number(5)] und Hand enthält keine 5
- **THEN** enthält das Ergebnis-Set den Wert 5

#### Scenario: Vorhandener Wert wird nicht erkannt
- **WHEN** Karte kostet [number(5)] und Hand enthält eine 5
- **THEN** enthält das Ergebnis-Set den Wert 5 nicht

### Requirement: nTuple-Kostentyp
Das System SHALL für `nTuple(n, X)` den Wert X als benötigt markieren, wenn weniger als n Kopien von X auf der Hand liegen.

#### Scenario: Pair fehlt komplett
- **WHEN** Karte kostet [nTuple(2, 4)] und Hand enthält keine 4
- **THEN** enthält das Set den Wert 4

#### Scenario: Pair halb vorhanden
- **WHEN** Karte kostet [nTuple(2, 4)] und Hand enthält genau eine 4
- **THEN** enthält das Set den Wert 4 (noch eine weitere 4 benötigt)

#### Scenario: Pair vollständig — nicht benötigt
- **WHEN** Karte kostet [nTuple(2, 4)] und Hand enthält zwei 4er
- **THEN** enthält das Set den Wert 4 nicht

### Requirement: evenTuple-Kostentyp
Das System SHALL für `evenTuple(n)` alle geraden Werte {2,4,6,8} als benötigt markieren, wenn weniger als n gerade Perlenwerte auf der Hand liegen.

#### Scenario: Gerade Perlen fehlen
- **WHEN** Karte kostet [evenTuple(2)] und Hand enthält keine geraden Werte
- **THEN** enthält das Set {2,4,6,8}

#### Scenario: Genug gerade Perlen vorhanden
- **WHEN** Karte kostet [evenTuple(2)] und Hand enthält zwei oder mehr gerade Werte
- **THEN** enthält das Set keinen der geraden Werte für diese Komponente

### Requirement: oddTuple-Kostentyp
Das System SHALL für `oddTuple(n)` alle ungeraden Werte {1,3,5,7} als benötigt markieren, wenn weniger als n ungerade Perlenwerte auf der Hand liegen.

#### Scenario: Ungerade Perlen fehlen
- **WHEN** Karte kostet [oddTuple(2)] und Hand enthält keine ungeraden Werte
- **THEN** enthält das Set {1,3,5,7}

### Requirement: run-Kostentyp
Das System SHALL für `run(length)` die fehlenden Werte der am weitesten vollständigen Folge der geforderten Länge berechnen.

#### Scenario: Folge fast vollständig
- **WHEN** Karte kostet [run(3)] und Hand enthält [4, 5]
- **THEN** enthält das Set {3} oder {6} (die fehlende Lücke der Folge 3-4-5 bzw. 4-5-6)

#### Scenario: Keine Überlappung
- **WHEN** Karte kostet [run(3)] und Hand ist leer
- **THEN** enthält das Set mindestens einen Wert (irgendeinen Startpunkt)

### Requirement: sumAnyTuple-Kostentyp
Das System SHALL für `sumAnyTuple(sum)` den Wert `sum - partialSum` als benötigt markieren, wenn `partialSum` kleiner als `sum` ist und `sum - partialSum` im Bereich 1–8 liegt, wobei `partialSum` die Summe der aktuell zuweisbaren Handkarten für diese Komponente ist.

#### Scenario: Summe noch nicht erreicht, Rest erreichbar
- **WHEN** Karte kostet [sumAnyTuple(9)] und Hand enthält [3, 2] (Summe 5, Rest 4)
- **THEN** enthält das Set den Wert 4

#### Scenario: Summe bereits erreichbar
- **WHEN** Karte kostet [sumAnyTuple(9)] und Hand enthält [5, 4]
- **THEN** enthält das Set den Wert 9 nicht (Karte ist zahlbar)

### Requirement: diamond-Kostentyp
Das System SHALL für `diamond`-Kostenkomponenten keine Perlenwerte als benötigt markieren (Diamanten sind keine Perlen).

#### Scenario: Diamond-Kosten erzeugen keine Perlenbedürfnisse
- **WHEN** Karte kostet [diamond(1)]
- **THEN** ist das zurückgegebene Set leer (Diamanten müssen separat gesammelt werden)

### Requirement: Ability onesCanBeEights
Das System SHALL bei aktiver Fähigkeit `onesCanBeEights` den Wert 8 aus dem needed-Set entfernen, wenn mindestens eine 1 auf der Hand liegt (weil 1 als 8 zählt).

#### Scenario: 1 auf Hand ersetzt benötigte 8
- **WHEN** Karte kostet [number(8)], Hand enthält [1], Fähigkeit onesCanBeEights aktiv
- **THEN** enthält das Set den Wert 8 nicht (1 deckt den Bedarf)

#### Scenario: Ohne 1 auf Hand bleibt 8 benötigt
- **WHEN** Karte kostet [number(8)], Hand ist leer, Fähigkeit onesCanBeEights aktiv
- **THEN** enthält das Set den Wert 8 (und auch 1, da 1 jetzt auch als 8 gilt)

### Requirement: Ability threesCanBeAny
Das System SHALL bei aktiver Fähigkeit `threesCanBeAny` für jede 3 auf der Hand einen beliebigen benötigten Wert aus dem needed-Set entfernen (3 ist Wildcard).

#### Scenario: 3 auf Hand deckt einen fehlenden Wert
- **WHEN** Karte kostet [number(7)], Hand enthält [3], Fähigkeit threesCanBeAny aktiv
- **THEN** enthält das Set den Wert 7 nicht (3 als Wildcard deckt 7)

### Requirement: Ability decreaseWithPearl
Das System SHALL bei aktiver Fähigkeit `decreaseWithPearl` und vorhandenem Diamant für jeden benötigten Wert X auch X+1 als nützlich markieren (Perle X+1 kann mit Diamant zu X werden).

#### Scenario: X+1 wird als Alternative zu X erkannt
- **WHEN** Karte kostet [number(5)], Hand leer, Diamant vorhanden, Fähigkeit decreaseWithPearl aktiv
- **THEN** enthält das Set sowohl 5 als auch 6 (6 kann per Diamant zu 5 werden)
