import type { CharacterAbilityType } from '@portale-von-molthar/shared';

export interface AbilityDisplayInfo {
  symbol: string;
  name: string;
}

const ABILITY_MAP: Partial<Record<CharacterAbilityType, AbilityDisplayInfo>> = {
  handLimitPlusOne:          { symbol: '✋', name: '+1 Handlimit' },
  oneExtraActionPerTurn:     { symbol: '⚡', name: '+1 Aktion/Runde' },
  onesCanBeEights:           { symbol: '1→8', name: '1er zählen als 8' },
  threesCanBeAny:            { symbol: '3→?', name: '3er zählen als beliebig' },
  decreaseWithPearl:         { symbol: '💎↓', name: 'Diamant senkt Perlenwert' },
  changeCharacterActions:    { symbol: '🔄P', name: 'Portal tauschen (vor 1. Aktion)' },
  changeHandActions:         { symbol: '🔄H', name: 'Hand neu aufnehmen (nach letzter Aktion)' },
  previewCharacter:          { symbol: '👁', name: 'Karte vom Stapel ansehen' },
  tradeTwoForDiamond:        { symbol: '2→💎', name: '2-Perle gegen Diamant tauschen' },
  numberAdditionalCardActions: { symbol: '🔢', name: 'Karte mit aufgedrucktem Perlenwert' },
  anyAdditionalCardActions:  { symbol: '🃏', name: 'Karte mit beliebigem Perlenwert' },
  irrlicht:                  { symbol: '👥', name: 'Irrlicht – Nachbarn können mitaktivieren' },
};

export function getAbilityDisplay(type: CharacterAbilityType): AbilityDisplayInfo {
  return ABILITY_MAP[type] ?? { symbol: '★', name: type };
}
