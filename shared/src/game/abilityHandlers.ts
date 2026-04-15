/**
 * abilityHandlers.ts
 *
 * Reine Hilfsfunktionen für Charakter-Fähigkeiten.
 * Getrennt von index.ts damit sie in Tests ohne boardgame.io/cardDatabaseLoader-Abhängigkeiten importierbar sind.
 */

import type { GameState, PlayerState, CharacterAbility, CharacterAbilityType, ActivatedCharacter } from './types';

/**
 * Blaue (persistente) Fähigkeitstypen.
 * Alle anderen sind rote Einmal-Fähigkeiten.
 */
export const PERSISTENT_ABILITY_TYPES: ReadonlySet<CharacterAbilityType> = new Set([
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
  'replacePearlSlotsBeforeFirstAction',
]);

/**
 * Leitet die aktiven blauen Fähigkeiten aus den aktivierten Charakteren ab.
 * Verlässt sich NICHT auf das `persistent`-Flag der Fähigkeit (kann bei alten
 * Spielzuständen fehlen), sondern prüft den Typ direkt.
 */
export function deriveActiveAbilities(activatedCharacters: ActivatedCharacter[]): CharacterAbility[] {
  return activatedCharacters.flatMap(ac => ac.card.abilities).filter(a => PERSISTENT_ABILITY_TYPES.has(a.type));
}

/**
 * Rote Fähigkeit sofort auf den Spielzustand anwenden.
 * Reine Funktion, die G via Immer mutiert (kein Rückgabewert).
 * Wird in `activatePortalCard` aufgerufen, nachdem eine Karte aktiviert wurde.
 */
export function applyRedAbility(G: GameState, ctx: { currentPlayer: string }, ability: CharacterAbility): void {
  const currentPlayer = G.players[ctx.currentPlayer];
  if (!currentPlayer) return;

  switch (ability.type) {
    case 'threeExtraActions':
      // +3 Aktionen im aktuellen Zug
      G.maxActions += 3;
      break;

    case 'nextPlayerOneExtraAction':
      // Nächster Spieler erhält +1 Aktion (wird in turn.onBegin verarbeitet)
      G.nextPlayerExtraAction = true;
      break;

    case 'discardOpponentCharacter': {
      // Prüfen ob mindestens ein Gegner eine Portal-Karte hat
      const anyOpponentHasPortalCard = G.playerOrder.some(playerId => {
        if (playerId === ctx.currentPlayer) return false;
        const opponent = G.players[playerId];
        return opponent && opponent.portal.length > 0;
      });
      if (anyOpponentHasPortalCard) {
        G.pendingDiscardOpponentCharacter = true;
      }
      break;
    }

    case 'stealOpponentHandCard': {
      // Prüfen ob mindestens ein Gegner Handkarten hat
      const anyOpponentHasCards = G.playerOrder.some(playerId => {
        if (playerId === ctx.currentPlayer) return false;
        const opponent = G.players[playerId];
        return opponent && opponent.hand.length > 0;
      });
      if (anyOpponentHasCards) {
        G.pendingStealOpponentHandCard = true;
      }
      break;
    }

    case 'takeBackPlayedPearl': {
      // Öffnet den Dialog zur Auswahl einer zurückzuholenden Perlenkarte
      G.pendingTakeBackPlayedPearl = true;
      break;
    }

    default:
      // Unbekannte rote Fähigkeitstypen ignorieren
      break;
  }
}

/**
 * Blaue Fähigkeit dauerhaft auf den Spieler anwenden.
 * Speichert die Fähigkeit in activeAbilities und aktualisiert direkte State-Felder.
 */
export function applyBlueAbility(player: PlayerState, ability: CharacterAbility): void {
  // Fähigkeit zu activeAbilities hinzufügen (für Kostenvalidierung + Aktionszähler)
  player.activeAbilities.push(ability);

  // Direkte State-Updates für sofort wirksame blaue Fähigkeiten
  switch (ability.type) {
    case 'handLimitPlusOne':
      player.handLimitModifier += 1;
      break;
    // oneExtraActionPerTurn: wird in turn.onBegin ausgewertet
    // onesCanBeEights, threesCanBeAny, decreaseWithPearl: werden in costCalculation ausgewertet
    default:
      break;
  }
}
