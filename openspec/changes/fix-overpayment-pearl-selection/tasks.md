## 1. Shared — Hilfsfunktion

- [x] 1.1 `shared/src/game/costCalculation.ts`: Neue Funktion `hasUnnecessarySelection(cost, hand, diamonds)` exportieren — Leave-one-out-Check über alle Hand-Karten
- [x] 1.2 `shared/src/game/costCalculation.test.ts`: Tests für `hasUnnecessarySelection` — exakte Zahlung (false), Überzahlung (true), Edge Cases (leere Hand, 1 Karte)

## 2. Backend — Move-Absicherung

- [x] 2.1 `shared/src/game/index.ts`: `activatePortalCard` — nach `validateCostPayment`-Check zusätzlich `hasUnnecessarySelection` prüfen → `INVALID_MOVE` bei Überzahlung
- [x] 2.2 `shared/src/game/index.ts`: `activateSharedCharacter` — gleiche Absicherung ergänzen

## 3. Frontend — Dialog

- [x] 3.1 `game-web/src/components/CharacterActivationDialog.tsx`: `isValidPayment`-useMemo um `hasUnnecessarySelection`-Check erweitern (nach bestehendem `validateCostPayment`-Call)
- [x] 3.2 `game-web/src/components/CharacterActivationDialog.tsx`: Separaten `isOverpaying`-State ableiten und im JSX einen Hinweis "Zu viele Karten ausgewählt" anzeigen, wenn `validateCostPayment` true aber `hasUnnecessarySelection` true
- [x] 3.3 `game-web/src/i18n/translations.ts`: Übersetzungsschlüssel `activation.overpayment` hinzufügen (DE/EN/FR)

## 4. Verifikation

- [x] 4.1 `make test-shared` — alle Tests grün
- [ ] 4.2 Manuelle Prüfung: Karte mit Kosten `[{type:'number', value:3}]` — 3er + 5er auswählen → Button deaktiviert, Hinweis sichtbar
- [ ] 4.3 Manuelle Prüfung: Nur 3er auswählen → Button aktiv, Aktivierung möglich
- [ ] 4.4 Manuelle Prüfung: Komplexe Kosten (Tuple, Run) — Überzahlung wird korrekt erkannt
