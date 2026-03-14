import type { AbilityType, AbilityInfo } from './types';

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
  anyAddditionalCardActions: {
    type: 'anyAddditionalCardActions',
    label: 'Beliebige zusätzliche Karte',
    description: 'In jedem Zug hast du eine zusätzliche Karte mit beliebigem Wert (1-8) als Handkarte',
    category: 'blue',
    hasParameters: false,
  },
  numberAddditionalCardActions: {
    type: 'numberAddditionalCardActions',
    label: 'Zusätzliche benannte Karte',
    description: 'In jedem Zug hast du eine zusätzliche Karte mit einem bestimmten Wert (1-8) als Handkarte',
    category: 'blue',
    hasParameters: false,
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
  // Special
  irrlicht: {
    type: 'irrlicht',
    label: 'Irrlicht',
    description: 'Nachbarn können diesen Charakter auch aktivieren',
    category: 'special',
    hasParameters: false,
  },
};

export const COST_TYPES = [
  {
    type: 'identicalValues' as const,
    label: 'Gleiche Werte (Paar/Drilling/...)',
    description: 'N Karten mit gleichem Wert, optional bestimmter Wert',
    fields: ['count', 'specificValue'],
  },
  {
    type: 'multipleIdenticalValues' as const,
    label: 'Mehrere Paare/Drillinge',
    description: 'z.B. 2x 3er + 2x 5er',
    fields: ['counts', 'specificValues'],
  },
  {
    type: 'exactValues' as const,
    label: 'Exakte Werte',
    description: 'Genau diese Werte, z.B. 1,2,3',
    fields: ['expected'],
  },
  {
    type: 'sum' as const,
    label: 'Summe',
    description: 'Karten mit Summe = X (optional mit bestimmter Kartenanzahl)',
    fields: ['target', 'cardCount'],
  },
  {
    type: 'run' as const,
    label: 'Zahlenreihe',
    description: 'Aufeinanderfolgende Werte, z.B. 3-4-5',
    fields: ['length'],
  },
  {
    type: 'allEven' as const,
    label: 'Alle geraden Werte',
    description: 'N gerade Perlenkarten (2,4,6,8)',
    fields: ['count'],
  },
  {
    type: 'allOdd' as const,
    label: 'Alle ungeraden Werte',
    description: 'N ungerade Perlenkarten (1,3,5,7)',
    fields: ['count'],
  },
];
