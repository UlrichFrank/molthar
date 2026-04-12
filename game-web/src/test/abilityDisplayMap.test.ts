import { describe, it, expect } from 'vitest';
import { getAbilityDisplay } from '../lib/abilityDisplayMap';
import type { CharacterAbilityType } from '@portale-von-molthar/shared';

const KNOWN_BLUE_TYPES: CharacterAbilityType[] = [
  'handLimitPlusOne',
  'oneExtraActionPerTurn',
  'onesCanBeEights',
  'threesCanBeAny',
  'decreaseWithPearl',
  'changeCharacterActions',
  'changeHandActions',
  'previewCharacter',
  'tradeTwoForDiamond',
  'numberAdditionalCardActions',
  'anyAdditionalCardActions',
  'irrlicht',
];

const KNOWN_RED_TYPES: CharacterAbilityType[] = [
  'threeExtraActions',
  'nextPlayerOneExtraAction',
  'discardOpponentCharacter',
  'stealOpponentHandCard',
  'takeBackPlayedPearl',
];

describe('abilityDisplayMap', () => {
  it('provides symbol, name and description for all known blue ability types', () => {
    for (const type of KNOWN_BLUE_TYPES) {
      const display = getAbilityDisplay(type);
      expect(display.symbol, `symbol missing for ${type}`).toBeTruthy();
      expect(display.name, `name missing for ${type}`).toBeTruthy();
      expect(display.symbol).not.toBe('★');
      expect(display.description, `description missing for ${type}`).toBeTruthy();
    }
  });

  it('provides symbol, name and description for all known red ability types', () => {
    for (const type of KNOWN_RED_TYPES) {
      const display = getAbilityDisplay(type);
      expect(display.symbol, `symbol missing for ${type}`).toBeTruthy();
      expect(display.name, `name missing for ${type}`).toBeTruthy();
      expect(display.symbol).not.toBe('★');
      expect(display.description, `description missing for ${type}`).toBeTruthy();
    }
  });

  it('returns fallback symbol ★ for unknown types', () => {
    const display = getAbilityDisplay('none');
    expect(display.symbol).toBe('★');
    expect(display.name).toBe('none');
    expect(display.description).toBe('');
  });

  it('returns the technical type name as fallback name', () => {
    const display = getAbilityDisplay('unknownType' as CharacterAbilityType);
    expect(display.symbol).toBe('★');
    expect(display.name).toBe('unknownType');
    expect(display.description).toBe('');
  });
});
