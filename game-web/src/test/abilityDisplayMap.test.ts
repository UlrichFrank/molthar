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

describe('abilityDisplayMap', () => {
  it('provides symbol and name for all known blue ability types', () => {
    for (const type of KNOWN_BLUE_TYPES) {
      const display = getAbilityDisplay(type);
      expect(display.symbol, `symbol missing for ${type}`).toBeTruthy();
      expect(display.name, `name missing for ${type}`).toBeTruthy();
      expect(display.symbol).not.toBe('★');
    }
  });

  it('returns fallback symbol ★ for unknown types', () => {
    const display = getAbilityDisplay('none');
    expect(display.symbol).toBe('★');
    expect(display.name).toBe('none');
  });

  it('returns the technical type name as fallback name', () => {
    const display = getAbilityDisplay('threeExtraActions' as CharacterAbilityType);
    expect(display.symbol).toBe('★');
    expect(display.name).toBe('threeExtraActions');
  });
});
