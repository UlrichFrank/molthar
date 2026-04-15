import type { CharacterAbilityType } from '@portale-von-molthar/shared';
import type { TranslationKey } from '../i18n/translations';

export interface AbilityDisplayInfo {
  symbol: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
}

const ABILITY_MAP: Partial<Record<CharacterAbilityType, AbilityDisplayInfo>> = {
  // Red (instant) abilities
  threeExtraActions:          { symbol: '⚡⚡⚡', nameKey: 'ability.threeExtraActions.name',          descriptionKey: 'ability.threeExtraActions.description' },
  nextPlayerOneExtraAction:   { symbol: '⚡+',   nameKey: 'ability.nextPlayerOneExtraAction.name',   descriptionKey: 'ability.nextPlayerOneExtraAction.description' },
  discardOpponentCharacter:   { symbol: '🗑P',   nameKey: 'ability.discardOpponentCharacter.name',   descriptionKey: 'ability.discardOpponentCharacter.description' },
  stealOpponentHandCard:      { symbol: '🤚',    nameKey: 'ability.stealOpponentHandCard.name',      descriptionKey: 'ability.stealOpponentHandCard.description' },
  takeBackPlayedPearl:        { symbol: '↩️',    nameKey: 'ability.takeBackPlayedPearl.name',        descriptionKey: 'ability.takeBackPlayedPearl.description' },
  // Blue (persistent) abilities
  handLimitPlusOne:           { symbol: '✋',    nameKey: 'ability.handLimitPlusOne.name',           descriptionKey: 'ability.handLimitPlusOne.description' },
  oneExtraActionPerTurn:      { symbol: '⚡',    nameKey: 'ability.oneExtraActionPerTurn.name',      descriptionKey: 'ability.oneExtraActionPerTurn.description' },
  onesCanBeEights:            { symbol: '1→8',   nameKey: 'ability.onesCanBeEights.name',            descriptionKey: 'ability.onesCanBeEights.description' },
  threesCanBeAny:             { symbol: '3→?',   nameKey: 'ability.threesCanBeAny.name',             descriptionKey: 'ability.threesCanBeAny.description' },
  decreaseWithPearl:          { symbol: '💎↓',   nameKey: 'ability.decreaseWithPearl.name',          descriptionKey: 'ability.decreaseWithPearl.description' },
  changeCharacterActions:     { symbol: '🔄P',   nameKey: 'ability.changeCharacterActions.name',     descriptionKey: 'ability.changeCharacterActions.description' },
  changeHandActions:          { symbol: '🔄H',   nameKey: 'ability.changeHandActions.name',          descriptionKey: 'ability.changeHandActions.description' },
  previewCharacter:           { symbol: '👁',    nameKey: 'ability.previewCharacter.name',           descriptionKey: 'ability.previewCharacter.description' },
  tradeTwoForDiamond:         { symbol: '2→💎',  nameKey: 'ability.tradeTwoForDiamond.name',         descriptionKey: 'ability.tradeTwoForDiamond.description' },
  numberAdditionalCardActions: { symbol: '🔢',   nameKey: 'ability.numberAdditionalCardActions.name', descriptionKey: 'ability.numberAdditionalCardActions.description' },
  anyAdditionalCardActions:   { symbol: '🃏',    nameKey: 'ability.anyAdditionalCardActions.name',   descriptionKey: 'ability.anyAdditionalCardActions.description' },
  irrlicht:                   { symbol: '👥',    nameKey: 'ability.irrlicht.name',                   descriptionKey: 'ability.irrlicht.description' },
  replacePearlSlotsBeforeFirstAction: { symbol: '⭐⇄', nameKey: 'ability.replacePearlSlotsBeforeFirstAction.name', descriptionKey: 'ability.replacePearlSlotsBeforeFirstAction.description' },
};

const FALLBACK: AbilityDisplayInfo = {
  symbol: '★',
  nameKey: 'ability.threeExtraActions.name', // fallback key — will show a valid string
  descriptionKey: 'ability.threeExtraActions.description',
};

export function getAbilityDisplay(type: CharacterAbilityType): AbilityDisplayInfo {
  return ABILITY_MAP[type] ?? { ...FALLBACK, symbol: '★' };
}
