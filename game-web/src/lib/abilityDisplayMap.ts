import type { CharacterAbilityType } from '@portale-von-molthar/shared';

export interface AbilityDisplayInfo {
  symbol: string;
  name: string;
  description?: string;
}

const ABILITY_MAP: Partial<Record<CharacterAbilityType, AbilityDisplayInfo>> = {
  // Red (instant) abilities
  threeExtraActions:          { symbol: '⚡⚡⚡', name: '+3 Aktionen', description: 'Sofort: +3 Aktionen in diesem Zug' },
  nextPlayerOneExtraAction:   { symbol: '⚡+', name: '+1 Aktion für nächsten Spieler', description: 'Der nächste Spieler erhält +1 Aktion in seinem Zug' },
  discardOpponentCharacter:   { symbol: '🗑P', name: 'Portalkarte entfernen', description: 'Sofort: Entferne eine Portalkarte eines Gegners' },
  stealOpponentHandCard:      { symbol: '🤚', name: 'Handkarte stehlen', description: 'Sofort: Nimm eine Handkarte eines Gegners' },
  takeBackPlayedPearl:        { symbol: '↩️', name: 'Perlenkarte zurücknehmen', description: 'Sofort: Nimm deine zuletzt gespielte Perlenkarte zurück auf die Hand' },
  // Blue (persistent) abilities
  handLimitPlusOne:           { symbol: '✋', name: '+1 Handlimit', description: 'Dauerhaft: Dein Handlimit erhöht sich um 1' },
  oneExtraActionPerTurn:      { symbol: '⚡', name: '+1 Aktion/Runde', description: 'Dauerhaft: Du erhältst jede Runde +1 Aktion' },
  onesCanBeEights:            { symbol: '1→8', name: '1er zählen als 8', description: 'Dauerhaft: 1er-Perlenkarten zählen bei Kosten als 8' },
  threesCanBeAny:             { symbol: '3→?', name: '3er zählen als beliebig', description: 'Dauerhaft: 3er-Perlenkarten zählen bei Kosten als beliebiger Wert' },
  decreaseWithPearl:          { symbol: '💎↓', name: 'Diamant senkt Perlenwert', description: 'Dauerhaft: Gib 1 Diamant aus um den Wert einer Perlenkarte um 1 zu senken' },
  changeCharacterActions:     { symbol: '🔄P', name: 'Portal tauschen (vor 1. Aktion)', description: 'Dauerhaft: Tausche vor deiner 1. Aktion eine Portalkarte aus' },
  changeHandActions:          { symbol: '🔄H', name: 'Hand neu aufnehmen (nach letzter Aktion)', description: 'Dauerhaft: Nimm nach deiner letzten Aktion deine Hand neu auf' },
  previewCharacter:           { symbol: '👁', name: 'Karte vom Stapel ansehen', description: 'Dauerhaft: Sieh vor deiner 1. Aktion die oberste Karte des Charakterstapels an' },
  tradeTwoForDiamond:         { symbol: '2→💎', name: '2-Perle gegen Diamant tauschen', description: 'Dauerhaft: Tausche bei der Aktivierung eine 2er-Perle gegen 1 Diamant' },
  numberAdditionalCardActions: { symbol: '🔢', name: 'Karte mit aufgedrucktem Perlenwert', description: 'Dauerhaft: Diese Karte hat einen aufgedruckten Perlenwert der bei Kosten mitgezählt wird' },
  anyAdditionalCardActions:   { symbol: '🃏', name: 'Karte mit beliebigem Perlenwert', description: 'Dauerhaft: Diese Karte hat einen aufgedruckten Wildcard-Perlenwert' },
  irrlicht:                   { symbol: '👥', name: 'Irrlicht – Nachbarn können mitaktivieren', description: 'Dauerhaft: Direkte Nachbarn können diese Karte mitaktivieren' },
};

export function getAbilityDisplay(type: CharacterAbilityType): AbilityDisplayInfo {
  return ABILITY_MAP[type] ?? { symbol: '★', name: type, description: '' };
}
