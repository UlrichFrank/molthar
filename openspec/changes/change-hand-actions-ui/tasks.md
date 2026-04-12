## 1. CanvasGameBoard — State und Sichtbarkeitslogik

- [ ] 1.1 `rehandDone`-State hinzufügen: `const [rehandDone, setRehandDone] = useState(false)`
- [ ] 1.2 `useEffect` auf `ctx.turn`: `setRehandDone(false)` bei Zugwechsel
- [ ] 1.3 `hasChangeHandAbility`-Berechnung: `me?.activeAbilities.some(a => a.type === 'changeHandActions') ?? false`

## 2. UI — „Hand neu ziehen"-Button rendern

- [ ] 2.1 Im Spieler-UI-Bereich (~L649): Button „Hand neu ziehen" unterhalb von `PlayerStatusBadge` und oberhalb von `EndTurnButton` rendern, sichtbar wenn `isActive && actionCount >= maxActions && hasChangeHandAbility && !rehandDone`
- [ ] 2.2 Klick-Handler: `moves.rehandCards?.(); setRehandDone(true)`
- [ ] 2.3 Styling: analog zu `EndTurnButton` aber blauer Hintergrund (`rgba(99, 102, 241, 0.9)`) zur Unterscheidung von der roten „Zug beenden"-Schaltfläche
