import type { AbilityType, AbilityInfo, AbilityTiming } from './types';

export const ABILITY_TIMING_INFO: Record<AbilityTiming, { label: string; description: string }> = {
  beforeAction: {
    label: 'Vor der ersten Aktion',
    description: 'Die Fähigkeit muss vor der ersten Aktion im Zug aktiviert werden',
  },
  duringTurn: {
    label: 'Während des Zuges',
    description: 'Die Fähigkeit kann zu jedem beliebigen Zeitpunkt während des Zuges aktiviert werden',
  },
  afterAction: {
    label: 'Nach der letzten Aktion',
    description: 'Die Fähigkeit wird nach der letzten Aktion im Zug aktiviert',
  },
};

export const ABILITY_INFO: Record<AbilityType, AbilityInfo> = {
  none: {
    type: 'none',
    label: 'Keine',
    description: 'Kein besondere Fähigkeit',
    category: 'none',
    hasParameters: false,
  },
  // Red abilities (instant, once per card)
  threeExtraActions: {
    type: 'threeExtraActions',
    label: '3 zusätzliche Aktionen',
    description: 'Gewähre dir 3 zusätzliche Aktionen diesen Zug',
    category: 'red',
    hasParameters: true,
  },
  changeHandActions: {
    type: 'changeHandActions',
    label: 'Handkarten tauschen',
    description: 'Lege einmalig am Ende deines Zuges deine Handkarten ab und ziehe gleiche viele neue nach',
    category: 'blue',
    hasParameters: false,
  },
  changeCharacterActions: {
    type: 'changeCharacterActions',
    label: 'Charakter wechseln',
    description: 'Tausche vor Deiner ersten Aktion einen Charakter aus Deinem Portal gegen einen offen ausliegenden Charakter',
    category: 'blue',
    hasParameters: false,
  },
  anyAdditionalCardActions: {
    type: 'anyAdditionalCardActions',
    label: 'Beliebige zusätzliche Karte',
    description: 'In jedem Zug hast du eine zusätzliche Karte mit beliebigem Wert (1-8) als Handkarte',
    category: 'blue',
    hasParameters: false,
  },
  numberAdditionalCardActions: {
    type: 'numberAdditionalCardActions',
    label: 'Zusätzliche benannte Karte',
    description: 'In jedem Zug hast du eine zusätzliche Karte mit einem bestimmten Wert (1-8) als Handkarte',
    category: 'blue',
    hasParameters: true,
  },
  nextPlayerOneExtraAction: {
    type: 'nextPlayerOneExtraAction',
    label: 'Nächster Spieler +1 Aktion',
    description: 'Der nächste Spieler erhält 1 zusätzliche Aktion',
    category: 'red',
    hasParameters: false,
  },
  discardOpponentCharacter: {
    type: 'discardOpponentCharacter',
    label: 'Gegner-Charakter abwerfen',
    description: 'Wähle einen aktivierten Charakter eines Gegners und wirf ihn ab',
    category: 'red',
    hasParameters: false,
  },
  stealOpponentHandCard: {
    type: 'stealOpponentHandCard',
    label: 'Gegner-Handkarte stehlen',
    description: 'Stehle eine zufällige Handkarte von einem Gegner',
    category: 'red',
    hasParameters: false,
  },
  takeBackPlayedPearl: {
    type: 'takeBackPlayedPearl',
    label: 'Perle zurücknehmen',
    description: 'Hole eine dieser Runde gespielte Perlenkarte zurück in deine Hand',
    category: 'red',
    hasParameters: false,
  },
  // Blue abilities (persistent, triggered multiple times)
  onesCanBeEights: {
    type: 'onesCanBeEights',
    label: '1er können 8er sein',
    description: '1er Perlenkarten zählen als 8er',
    category: 'blue',
    hasParameters: false,
  },
  threesCanBeAny: {
    type: 'threesCanBeAny',
    label: '3er sind Joker (1-8)',
    description: '3er Perlenkarten können als beliebiger Wert (1-8) zählen',
    category: 'blue',
    hasParameters: false,
  },
  tradeTwoForDiamond: {
    type: 'tradeTwoForDiamond',
    label: '2er gegen Diamanten tauschen',
    description: 'Tausche bis zu 2 Perlenkarten gegen einen Diamanten pro Zug',
    category: 'blue',
    hasParameters: false,
  },
  handLimitPlusOne: {
    type: 'handLimitPlusOne',
    label: 'Handkartenlimit +1',
    description: 'Dein Handkartenlimit erhöht sich um 1 (von 5 auf 6)',
    category: 'blue',
    hasParameters: false,
  },
  oneExtraActionPerTurn: {
    type: 'oneExtraActionPerTurn',
    label: 'Aktion pro Zug +1',
    description: 'Du erhältst 1 zusätzliche Aktion pro Zug (von 3 auf 4)',
    category: 'blue',
    hasParameters: false,
  },
  providesVirtualPearl: {
    type: 'providesVirtualPearl',
    label: 'Virtuelle Perle',
    description: 'Behandle diesen Charakter als Perlenkarte mit optionalem Wert',
    category: 'blue',
    hasParameters: true,
  },
  decreaseWithPearl: {
    type: 'decreaseWithPearl',
    label: 'Kartenwert -1',
    description: 'Verringere unter Einsatz einer Perle den Wert einer Karte um 1',
    category: 'blue',
    hasParameters: false,
  },
  previewCharacter: {
    type: 'previewCharacter',
    label: 'Oberste Charakterkarte ansehen',
    description: 'Sieh dir die oberste Charakterkarte des Nachziehstapels an',
    category: 'blue',
    hasParameters: false,
  },
  // Special
  irrlicht: {
    type: 'irrlicht',
    label: 'Irrlicht',
    description: 'Nachbarn können diesen Charakter auch aktivieren',
    category: 'red',
    hasParameters: false,
  },
};