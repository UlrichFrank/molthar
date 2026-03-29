/**
 * abilityHandlers.ts
 *
 * Reine Hilfsfunktionen für Charakter-Fähigkeiten.
 * Getrennt von index.ts damit sie in Tests ohne boardgame.io/cardDatabaseLoader-Abhängigkeiten importierbar sind.
 */

import type { GameState, PlayerState, CharacterAbility } from './types';

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
      // Eine Portal-Karte eines Gegners entfernen (erste verfügbare)
      // TODO TIER 1: UI-Interaktion für Spielerauswahl ergänzen
      for (const playerId of G.playerOrder) {
        if (playerId === ctx.currentPlayer) continue;
        const opponent = G.players[playerId];
        if (opponent && opponent.portal.length > 0) {
          const removed = opponent.portal.splice(0, 1)[0];
          if (removed) G.characterDiscardPile.push(removed.card);
          break;
        }
      }
      break;
    }

    case 'stealOpponentHandCard': {
      // Perlenkarte aus der Hand eines Gegners stehlen (erste verfügbare)
      // TODO TIER 1: UI-Interaktion für Spielerauswahl ergänzen
      for (const playerId of G.playerOrder) {
        if (playerId === ctx.currentPlayer) continue;
        const opponent = G.players[playerId];
        if (opponent && opponent.hand.length > 0) {
          const stolenCard = opponent.hand.splice(0, 1)[0];
          if (stolenCard) currentPlayer.hand.push(stolenCard);
          break;
        }
      }
      break;
    }

    case 'takeBackPlayedPearl': {
      // Zuletzt gespielte Perlenkarte vom Ablagestapel zurückholen
      if (G.lastPlayedPearlId) {
        const idx = G.pearlDiscardPile.findIndex(c => c.id === G.lastPlayedPearlId);
        if (idx !== -1) {
          const card = G.pearlDiscardPile.splice(idx, 1)[0];
          if (card) currentPlayer.hand.push(card);
        }
        G.lastPlayedPearlId = null;
      }
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
