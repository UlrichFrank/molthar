## 1. CharacterActivationDialog — Auto-Apply entfernen

- [ ] 1.1 In `toggleHandCard` (~Zeile 114–119): den Block `let abilityType … if (hasOnesCanBeEights && card.value === 1) { initialValue = 8; abilityType = 'onesCanBeEights'; }` entfernen; `next.set(idx, { handCardIndex: idx, value: card.value })` ohne `abilityType`
