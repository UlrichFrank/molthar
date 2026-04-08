import { INVALID_MOVE } from 'boardgame.io/core';
import type { GameState, PearlCard, CharacterCard, PlayerState, ActivatedCharacter, PaymentSelection } from './types';
import { calculateHandLimit, getExcessCardCount, validateCostPayment } from './costCalculation';
import { getAllCards as getAllCardDataFromDatabase } from './cardDatabase';
import { applyRedAbility, applyBlueAbility, deriveActiveAbilities } from './abilityHandlers';
// @ts-ignore - cardDatabaseLoader.js is a side-effect module (Node.js backend only)
import './cardDatabaseLoader.js';
// Load cards in browser environments
import './browserCardDatabaseLoader';

/**
 * PortaleVonMolthar - Complete boardgame.io implementation
 * Turn-based card game with 2-5 players
 */
export const PortaleVonMolthar = {
  name: 'portale-von-molthar',
  minPlayers: 2,
  maxPlayers: 5,
  
  /**
   * Setup: Initialize game state
   */
  setup: ({ ctx }: any): GameState => {
    const playerIds = ctx.playOrder;
    const pearlDeck = createPearlDeck();
    const characterDeck = createCharacterDeck();
    
    // Shuffle decks
    shuffleArray(pearlDeck);
    shuffleArray(characterDeck);
    
    // Initialize players
    const players: { [playerId: string]: PlayerState } = {};
    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      players[playerId] = {
        id: playerId,
        name: `Player ${parseInt(playerId) + 1}`,
        hand: [],
        portal: [],
        activatedCharacters: [],
        powerPoints: 0,
        diamonds: 0,
        readyUp: false,
        isAI: false,
        aiDifficulty: undefined,
        handLimitModifier: 0,
        activeAbilities: [],
        peekedCard: null,
        colorIndex: i + 1, // sequential default: 1, 2, 3, ...
      };
    }
    
    // Deal initial pearl cards to players (3 cards each)
    for (const playerId of playerIds) {
      for (let i = 0; i < 3; i++) {
        const card = pearlDeck.pop();
        if (card) players[playerId].hand.push(card);
      }
    }
    
    // Refill character slots
    const characterSlots: CharacterCard[] = [];
    for (let i = 0; i < 2; i++) {
      const card = characterDeck.pop();
      if (card) characterSlots.push(card);
    }
    
    // Refill pearl slots
    const pearlSlots: PearlCard[] = [];
    for (let i = 0; i < 4; i++) {
      const card = pearlDeck.pop();
      if (card) pearlSlots.push(card);
    }
    
    return {
      players,
      pearlDeck,
      characterDeck,
      pearlDiscardPile: [],
      characterDiscardPile: [],
      pearlSlots,
      characterSlots,
      playerOrder: playerIds,
      actionCount: 0,
      maxActions: 3,
      finalRound: false,
      finalRoundStartingPlayer: null,
      requiresHandDiscard: false,
      excessCardCount: 0,
      currentHandLimit: 5,
      startingPlayer: playerIds[Math.floor(Math.random() * playerIds.length)],
      portalEntryCounter: 0,
      nextPlayerExtraAction: false,
      playedRealPearlIds: [],
      pendingTakeBackPlayedPearl: false,
      isReshufflingPearlDeck: false,
      isReshufflingCharacterDeck: false,
      pendingStealOpponentHandCard: false,
      pendingDiscardOpponentCharacter: false,
    };
  },
  
  /**
   * Moves: Player actions
   */
  moves: {
    takePearlCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Get card from slot or deck
      let card: PearlCard | undefined;
      if (slotIndex >= 0 && slotIndex < 4) {
        card = G.pearlSlots[slotIndex];
        G.pearlSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.pearlDeck.pop();
        // Proactively reshuffle if deck is now empty and slots are already full
        // (refillSlots won't call drawCard when slots are at max capacity)
        if (G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0) {
          G.pearlDeck.push(...G.pearlDiscardPile.splice(0));
          shuffleArray(G.pearlDeck);
          G.isReshufflingPearlDeck = true;
        }
      } else {
        return INVALID_MOVE;
      }

      if (!card) return INVALID_MOVE;

      player.hand.push(card);
      G.actionCount++;
      refillSlots(G.pearlSlots, G.pearlDeck, G.pearlDiscardPile, 4, () => { G.isReshufflingPearlDeck = true; });
      return;
    },

    takeCharacterCard({ G, ctx }: { G: GameState; ctx: any }, slotIndex: number, replacedSlotIndex?: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Get card from face-up slot or deck
      let card: CharacterCard | undefined;
      if (slotIndex >= 0 && slotIndex < G.characterSlots.length) {
        card = G.characterSlots[slotIndex];
        G.characterSlots.splice(slotIndex, 1);
      } else if (slotIndex === -1) {
        card = G.characterDeck.pop();
      } else {
        return INVALID_MOVE;
      }
      if (!card) return INVALID_MOVE;

      G.portalEntryCounter += 1;
      const portalEntry: ActivatedCharacter = {
        id: `${player.id}-${G.portalEntryCounter}`,
        card,
        activated: false,
      };

      if (player.portal.length < 2) {
        player.portal.push(portalEntry);
      } else if (replacedSlotIndex !== undefined && replacedSlotIndex >= 0 && replacedSlotIndex < 2) {
        const replaced = player.portal[replacedSlotIndex];
        if (replaced) {
          G.characterDiscardPile.push(replaced.card);
        }
        player.portal[replacedSlotIndex] = portalEntry;
      } else {
        return INVALID_MOVE;
      }

      G.actionCount++;
      refillSlots(G.characterSlots, G.characterDeck, G.characterDiscardPile, 2, () => { G.isReshufflingCharacterDeck = true; });
      return;
    },

    activatePortalCard({ G, ctx }: { G: GameState; ctx: any }, portalSlotIndex: number, selectedCardIndicesOrSelections: number[] | PaymentSelection[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // Validate portal slot index bounds
      if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) {
        return INVALID_MOVE;
      }

      const entry = player.portal[portalSlotIndex];
      if (!entry) return INVALID_MOVE;

      // Einheitliches Format herstellen (Legacy number[] vs neues PaymentSelection[])
      const selections: PaymentSelection[] = (selectedCardIndicesOrSelections.length > 0 && typeof selectedCardIndicesOrSelections[0] === 'number')
        ? (selectedCardIndicesOrSelections as number[]).map(idx => ({
            source: 'hand',
            handCardIndex: idx,
            value: player.hand[idx]?.value as any
          }))
        : (selectedCardIndicesOrSelections as PaymentSelection[]);

      const virtualHand: PearlCard[] = [];
      const handIndicesToRemove = new Set<number>();
      let diamondsToSpend = 0;
      let bonusDiamonds = 0;
      let tradeCount = 0;

      for (let i = 0; i < selections.length; i++) {
        const sel = selections[i];
        if (sel.source === 'hand') {
          const handIdx = sel.handCardIndex;
          if (handIdx === undefined || handIdx < 0 || handIdx >= player.hand.length) return INVALID_MOVE;

          // Jede Handkarte darf nur einmal genutzt werden
          if (handIndicesToRemove.has(handIdx)) return INVALID_MOVE;
          handIndicesToRemove.add(handIdx);

          const realCard = player.hand[handIdx]!;
          let expectedValue = realCard.value;

          if (sel.abilityType) {
            const hasAbility = player.activeAbilities.some(a => a.type === sel.abilityType);
            if (!hasAbility) return INVALID_MOVE;

            if (sel.abilityType === 'decreaseWithPearl') {
              const du = sel.diamondsUsed || 0;
              if (du < 0 || du > 1) return INVALID_MOVE;
              diamondsToSpend += du;
              expectedValue = Math.max(1, realCard.value - du) as PearlCard['value'];
            } else if (sel.abilityType === 'onesCanBeEights') {
              if (realCard.value !== 1) return INVALID_MOVE;
              expectedValue = 8;
            } else if (sel.abilityType === 'threesCanBeAny') {
              if (realCard.value !== 3) return INVALID_MOVE;
              expectedValue = sel.value;
            } else {
              if (sel.value !== expectedValue) return INVALID_MOVE;
            }
          }

          if (sel.value !== expectedValue) return INVALID_MOVE;

          virtualHand.push({
            id: `virtual-${realCard.id}`,
            value: sel.value,
            hasSwapSymbol: realCard.hasSwapSymbol
          });

        } else if (sel.source === 'ability') {
          if (!sel.characterId) return INVALID_MOVE;
          const charCard = player.activatedCharacters.find(c => c.id === sel.characterId);
          if (!charCard) return INVALID_MOVE;

          const isNumberBonus = charCard.card.abilities.some(a => a.type === 'numberAdditionalCardActions');
          const isAnyBonus = charCard.card.abilities.some(a => a.type === 'anyAdditionalCardActions');

          if (!isNumberBonus && !isAnyBonus) return INVALID_MOVE;

          virtualHand.push({
            id: `virtual-bonus-${charCard.id}-${i}`,
            value: sel.value,
            hasSwapSymbol: false
          });

        } else if (sel.source === 'trade') {
          // Max. 1 Trade-Selection pro Move
          if (tradeCount >= 1) return INVALID_MOVE;
          tradeCount++;

          if (!sel.characterId) return INVALID_MOVE;
          const tradeChar = player.activatedCharacters.find(c => c.id === sel.characterId);
          if (!tradeChar) return INVALID_MOVE;
          if (!tradeChar.card.abilities.some(a => a.type === 'tradeTwoForDiamond')) return INVALID_MOVE;

          const handIdx = sel.handCardIndex;
          if (handIdx === undefined || handIdx < 0 || handIdx >= player.hand.length) return INVALID_MOVE;
          if (handIndicesToRemove.has(handIdx)) return INVALID_MOVE;
          if (player.hand[handIdx]!.value !== 2) return INVALID_MOVE;

          handIndicesToRemove.add(handIdx);
          bonusDiamonds++;
          // 2-Perle zählt nicht als Kostenperle → nicht zu virtualHand hinzufügen
        }
      }

      if (player.diamonds + bonusDiamonds < diamondsToSpend) return INVALID_MOVE;
      const remainingDiamondsForValidation = player.diamonds - diamondsToSpend + bonusDiamonds;

      // Reine Kostenvalidierung mit der konstruierten, virtuellen Hand
      const isValid = validateCostPayment(entry.card.cost, virtualHand, remainingDiamondsForValidation);
      if (!isValid) {
        return INVALID_MOVE;
      }

      // Update player state: konsumierte Karten und Diamanten entfernen
      const unconsumedCards: PearlCard[] = [];
      const consumedCards: PearlCard[] = [];
      
      for (let i = 0; i < player.hand.length; i++) {
        if (handIndicesToRemove.has(i)) {
          consumedCards.push(player.hand[i]!);
        } else {
          unconsumedCards.push(player.hand[i]!);
        }
      }

      player.hand = unconsumedCards;
      player.diamonds -= Math.max(0, diamondsToSpend - bonusDiamonds);

      // CostComponents vom Typ 'diamond' wurden in validateCostPayment bestätigt.
      // Wir müssen diese auch abziehen! (Anzahl an diamonds in Cost components ermitteln)
      const diamondCosts = entry.card.cost?.filter(c => c.type === 'diamond').reduce((sum, c) => sum + (c.value || 0), 0) || 0;
      player.diamonds -= diamondCosts;

      // Consumed Karten auf den Ablagestapel (nur echte Handkarten!)
      consumedCards.forEach(card => G.pearlDiscardPile.push(card));
      consumedCards.forEach(card => G.playedRealPearlIds.push(card.id));

      // Belohnungen der Karte gutschreiben
      player.powerPoints += entry.card.powerPoints;
      player.diamonds += entry.card.diamonds;
      G.actionCount++;

      // WICHTIG: Karte vom Portal-Array zu activatedCharacters verschieben
      const activatedCard = player.portal.splice(portalSlotIndex, 1)[0];
      if (activatedCard) {
        activatedCard.activated = true;
        player.activatedCharacters.push(activatedCard);

        // Fähigkeiten anwenden
        if (activatedCard.card.abilities && activatedCard.card.abilities.length > 0) {
          for (const ability of activatedCard.card.abilities) {
            if (ability.persistent) {
              applyBlueAbility(player, ability);
            } else {
              applyRedAbility(G, ctx, ability);
            }
          }
        }
      }

      // Check if player reached 12+ power points to trigger final round
      if (player.powerPoints >= 12 && !G.finalRound) {
        G.finalRound = true;
        G.finalRoundStartingPlayer = ctx.currentPlayer;
      }
      return;
    },

    replacePearlSlots({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;
      
      // Discard all pearl slots, then refill
      G.pearlDiscardPile.push(...G.pearlSlots.splice(0));
      refillSlots(G.pearlSlots, G.pearlDeck, G.pearlDiscardPile, 4, () => { G.isReshufflingPearlDeck = true; });
      G.actionCount++;
      return;
    },

    swapPortalCharacter({ G, ctx }: { G: GameState; ctx: any }, portalSlotIndex: number, tableSlotIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      // Guard: must be used BEFORE the first action
      if (G.actionCount > 0) return INVALID_MOVE;
      
      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'changeCharacterActions');
      if (!hasAbility) return INVALID_MOVE;

      // Validate bounds
      if (portalSlotIndex < 0 || portalSlotIndex >= player.portal.length) return INVALID_MOVE;
      if (tableSlotIndex < 0 || tableSlotIndex >= G.characterSlots.length) return INVALID_MOVE;

      const portalChar = player.portal[portalSlotIndex]!;
      const tableChar = G.characterSlots[tableSlotIndex]!;

      // Swap the character cards (IDs and entries stay the same, just the actual card payload shifts)
      G.characterSlots[tableSlotIndex] = portalChar.card;
      portalChar.card = tableChar;

      // Swap takes no actions per rules / design
      return;
    },

    rehandCards({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;

      // Guard: must be used AFTER the last action (actionCount >= maxActions)
      if (G.actionCount < G.maxActions) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'changeHandActions');
      if (!hasAbility) return INVALID_MOVE;

      const currentHandSize = player.hand.length;
      if (currentHandSize === 0) return; // Nothing to discard/rehand

      // Discard current hand
      const discarded = player.hand.splice(0, currentHandSize);
      G.pearlDiscardPile.push(...discarded);

      // Draw exactly the same amount of cards
      for (let i = 0; i < currentHandSize; i++) {
        const card = drawCard(G.pearlDeck, G.pearlDiscardPile, () => { G.isReshufflingPearlDeck = true; });
        if (card) {
          player.hand.push(card);
        } else {
          break;
        }
      }
      return;
    },
    
    activateSharedCharacter({ G, ctx }: { G: GameState; ctx: any }, ownerPlayerId: string, portalSlotIndex: number, selectionsOrIndices: number[] | PaymentSelection[]) {
      const caller = G.players[ctx.currentPlayer];
      if (!caller) return INVALID_MOVE;
      if (G.actionCount >= G.maxActions) return INVALID_MOVE;

      // The caller must be a neighbor of the owner (immediate predecessor or successor in play order)
      const ownerIdx = G.playerOrder.indexOf(ownerPlayerId);
      if (ownerIdx === -1) return INVALID_MOVE;
      const callerIdx = G.playerOrder.indexOf(ctx.currentPlayer);
      if (callerIdx === -1) return INVALID_MOVE;
      const total = G.playerOrder.length;
      const prevIdx = (ownerIdx - 1 + total) % total;
      const nextIdx = (ownerIdx + 1) % total;
      const isNeighbor = callerIdx === prevIdx || callerIdx === nextIdx;
      if (!isNeighbor) return INVALID_MOVE;

      const owner = G.players[ownerPlayerId];
      if (!owner) return INVALID_MOVE;
      if (portalSlotIndex < 0 || portalSlotIndex >= owner.portal.length) return INVALID_MOVE;

      const entry = owner.portal[portalSlotIndex];
      if (!entry) return INVALID_MOVE;

      // Must be a shared-activation (irrlicht) card
      const isIrrlicht = entry.card.abilities.some(a => a.type === 'irrlicht') || entry.card.sharedActivation;
      if (!isIrrlicht) return INVALID_MOVE;

      // Normalize to PaymentSelection[]
      const selections: PaymentSelection[] = (selectionsOrIndices.length > 0 && typeof selectionsOrIndices[0] === 'number')
        ? (selectionsOrIndices as number[]).map(idx => ({
            source: 'hand' as const,
            handCardIndex: idx,
            value: caller.hand[idx]?.value as any
          }))
        : (selectionsOrIndices as PaymentSelection[]);

      const virtualHand: import('./types').PearlCard[] = [];
      const handIndicesToRemove = new Set<number>();
      let diamondsToSpend = 0;
      let bonusDiamonds = 0;
      let tradeCount = 0;

      for (let i = 0; i < selections.length; i++) {
        const sel = selections[i];
        if (sel.source === 'hand') {
          const handIdx = sel.handCardIndex;
          if (handIdx === undefined || handIdx < 0 || handIdx >= caller.hand.length) return INVALID_MOVE;
          if (handIndicesToRemove.has(handIdx)) return INVALID_MOVE;
          handIndicesToRemove.add(handIdx);

          const realCard = caller.hand[handIdx]!;
          let effectiveValue = realCard.value;

          if (sel.abilityType) {
            const hasAbility = caller.activeAbilities.some(a => a.type === sel.abilityType);
            if (!hasAbility) return INVALID_MOVE;
            if (sel.abilityType === 'decreaseWithPearl') {
              const du = sel.diamondsUsed || 0;
              if (du < 0 || du > 1) return INVALID_MOVE;
              diamondsToSpend += du;
              effectiveValue = Math.max(1, realCard.value - du) as typeof effectiveValue;
            } else if (sel.abilityType === 'onesCanBeEights') {
              if (realCard.value !== 1) return INVALID_MOVE;
              effectiveValue = 8;
            } else if (sel.abilityType === 'threesCanBeAny') {
              if (realCard.value !== 3) return INVALID_MOVE;
              effectiveValue = sel.value;
            }
          }
          if (sel.value !== effectiveValue) return INVALID_MOVE;
          virtualHand.push({ id: `virtual-${realCard.id}`, value: sel.value, hasSwapSymbol: realCard.hasSwapSymbol });

        } else if (sel.source === 'trade') {
          if (tradeCount >= 1) return INVALID_MOVE;
          tradeCount++;

          if (!sel.characterId) return INVALID_MOVE;
          const tradeChar = caller.activatedCharacters.find(c => c.id === sel.characterId);
          if (!tradeChar) return INVALID_MOVE;
          if (!tradeChar.card.abilities.some(a => a.type === 'tradeTwoForDiamond')) return INVALID_MOVE;

          const handIdx = sel.handCardIndex;
          if (handIdx === undefined || handIdx < 0 || handIdx >= caller.hand.length) return INVALID_MOVE;
          if (handIndicesToRemove.has(handIdx)) return INVALID_MOVE;
          if (caller.hand[handIdx]!.value !== 2) return INVALID_MOVE;

          handIndicesToRemove.add(handIdx);
          bonusDiamonds++;
        }
      }

      if (caller.diamonds + bonusDiamonds < diamondsToSpend) return INVALID_MOVE;
      const remainingDiamonds = caller.diamonds - diamondsToSpend + bonusDiamonds;

      const isValid = validateCostPayment(entry.card.cost, virtualHand, remainingDiamonds);
      if (!isValid) return INVALID_MOVE;

      // Consume hand cards
      const consumed: import('./types').PearlCard[] = [];
      const unconsumed: import('./types').PearlCard[] = [];
      for (let i = 0; i < caller.hand.length; i++) {
        if (handIndicesToRemove.has(i)) consumed.push(caller.hand[i]!);
        else unconsumed.push(caller.hand[i]!);
      }
      caller.hand = unconsumed;
      caller.diamonds -= Math.max(0, diamondsToSpend - bonusDiamonds);

      const diamondCosts = entry.card.cost?.filter(c => c.type === 'diamond').reduce((sum, c) => sum + (c.value || 0), 0) || 0;
      caller.diamonds -= diamondCosts;
      consumed.forEach(c => G.pearlDiscardPile.push(c));
      consumed.forEach(c => G.playedRealPearlIds.push(c.id));

      // Power points and diamonds go to the caller
      caller.powerPoints += entry.card.powerPoints;
      caller.diamonds += entry.card.diamonds;
      G.actionCount++;

      // Remove card from owner's portal, add to caller's activatedCharacters
      const activatedEntry = owner.portal.splice(portalSlotIndex, 1)[0];
      if (activatedEntry) {
        activatedEntry.activated = true;
        caller.activatedCharacters.push(activatedEntry);
      }

      if (caller.powerPoints >= 12 && !G.finalRound) {
        G.finalRound = true;
        G.finalRoundStartingPlayer = ctx.currentPlayer;
      }
      return;
    },

    discardCards({ G, ctx }: { G: GameState; ctx: any }, cardIndices?: number[]) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      
      // Discard cards exceeding hand limit
      if (cardIndices) {
        cardIndices.forEach(idx => {
          if (idx >= 0 && idx < player.hand.length) {
            const card = player.hand.splice(idx, 1)[0];
            G.pearlDiscardPile.push(card);
          }
        });
      }
      return;
    },
    
    peekCharacterDeck({ G, ctx }: { G: GameState; ctx: any }) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;
      
      // Guard: must be used BEFORE the first action
      if (G.actionCount > 0) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'previewCharacter');
      if (!hasAbility) return INVALID_MOVE;

      if (G.characterDeck.length > 0) {
        // Deck ist ein Array, pop() entfernt das letzte Element -> also ist characterDeck[length - 1] die oberste Karte
        player.peekedCard = G.characterDeck[G.characterDeck.length - 1];
      }
      return;
    },

    tradeForDiamond({ G, ctx }: { G: GameState; ctx: any }, handCardIndex: number) {
      const player = G.players[ctx.currentPlayer];
      if (!player) return INVALID_MOVE;

      // Guard: must have the ability
      const hasAbility = player.activeAbilities.some(a => a.type === 'tradeTwoForDiamond');
      if (!hasAbility) return INVALID_MOVE;

      if (handCardIndex < 0 || handCardIndex >= player.hand.length) return INVALID_MOVE;
      
      const card = player.hand[handCardIndex];
      // It must be a 2-pearl card
      if (card.value !== 2) return INVALID_MOVE;

      const discardedCard = player.hand.splice(handCardIndex, 1)[0];
      if (discardedCard) {
        G.pearlDiscardPile.push(discardedCard);
      }
      player.diamonds += 1;
      
      // Does not consume an action (free effect)
      return;
    },

    discardCardsForHandLimit({ G, ctx, events }: { G: GameState; ctx: any; events: any }, selectedCardIndices: number[]) {
      const player = G.players[ctx.currentPlayer];

      if (!player || !G.requiresHandDiscard) return INVALID_MOVE;
      if (selectedCardIndices.length !== G.excessCardCount) return INVALID_MOVE;

      const validIndices = selectedCardIndices.filter(idx => idx >= 0 && idx < player.hand.length);
      if (validIndices.length !== selectedCardIndices.length) return INVALID_MOVE;

      const sortedIndices = [...validIndices].sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        const discardedCard = player.hand.splice(idx, 1)[0];
        if (discardedCard) {
          G.pearlDiscardPile.push(discardedCard);
        }
      }

      G.requiresHandDiscard = false;
      G.excessCardCount = 0;
      G.actionCount = 0;
      events.endTurn();
      return;
    },

    endTurn({ G, events }: { G: GameState; events: any }) {
      if (G.requiresHandDiscard) return INVALID_MOVE;
      G.actionCount = 0;
      events.endTurn();
      return;
    },

    acknowledgeReshuffle({ G }: { G: GameState }, deckType: 'pearl' | 'character') {
      if (deckType === 'pearl') {
        G.isReshufflingPearlDeck = false;
      } else if (deckType === 'character') {
        G.isReshufflingCharacterDeck = false;
      }
      return;
    },

    resolveReturnPearl({ G, ctx }: { G: GameState; ctx: any }, pearlId: string): typeof INVALID_MOVE | void {
      if (!G.pendingTakeBackPlayedPearl) return INVALID_MOVE;
      if (!G.playedRealPearlIds.includes(pearlId)) return INVALID_MOVE;
      const discardIdx = G.pearlDiscardPile.findIndex(c => c.id === pearlId);
      if (discardIdx === -1) return INVALID_MOVE;
      const currentPlayer = G.players[ctx.currentPlayer];
      if (!currentPlayer) return INVALID_MOVE;
      const card = G.pearlDiscardPile.splice(discardIdx, 1)[0];
      if (card) currentPlayer.hand.push(card);
      G.playedRealPearlIds = G.playedRealPearlIds.filter(id => id !== pearlId);
      G.pendingTakeBackPlayedPearl = false;
    },

    dismissReturnPearlDialog({ G }: { G: GameState }) {
      G.pendingTakeBackPlayedPearl = false;
    },

    resolveStealOpponentHandCard(
      { G, ctx }: { G: GameState; ctx: any },
      targetPlayerId: string,
      handCardIndex: number,
    ): typeof INVALID_MOVE | void {
      if (!G.pendingStealOpponentHandCard) return INVALID_MOVE;
      if (targetPlayerId === ctx.currentPlayer) return INVALID_MOVE;
      const target = G.players[targetPlayerId];
      if (!target) return INVALID_MOVE;
      if (handCardIndex < 0 || handCardIndex >= target.hand.length) return INVALID_MOVE;
      const currentPlayer = G.players[ctx.currentPlayer];
      if (!currentPlayer) return INVALID_MOVE;
      const stolen = target.hand.splice(handCardIndex, 1)[0];
      if (stolen) currentPlayer.hand.push(stolen);
      G.pendingStealOpponentHandCard = false;
    },

    resolveDiscardOpponentCharacter(
      { G, ctx }: { G: GameState; ctx: any },
      targetPlayerId: string,
      portalEntryId: string,
    ): typeof INVALID_MOVE | void {
      if (!G.pendingDiscardOpponentCharacter) return INVALID_MOVE;
      if (targetPlayerId === ctx.currentPlayer) return INVALID_MOVE;
      const target = G.players[targetPlayerId];
      if (!target) return INVALID_MOVE;
      const entryIndex = target.portal.findIndex(e => e.id === portalEntryId);
      if (entryIndex === -1) return INVALID_MOVE;
      const removed = target.portal.splice(entryIndex, 1)[0];
      if (removed) G.characterDiscardPile.push(removed.card);
      G.pendingDiscardOpponentCharacter = false;
    },

    terminateGame({ G, ctx, events }: { G: GameState; ctx: any; events: any }) {
      if (ctx.currentPlayer !== '0') return INVALID_MOVE;
      const ranking = [...G.playerOrder]
        .sort((a, b) => {
          const pA = G.players[a]!;
          const pB = G.players[b]!;
          if (pB.powerPoints !== pA.powerPoints) return pB.powerPoints - pA.powerPoints;
          return pB.diamonds - pA.diamonds;
        })
        .map(pId => ({
          playerId: pId,
          name: G.players[pId]!.name,
          powerPoints: G.players[pId]!.powerPoints,
          diamonds: G.players[pId]!.diamonds,
        }));
      events.endGame({ reason: 'terminated', ranking });
      return;
    },

  },

  /**
   * Turn Configuration: Reset action count at start of each turn
   */
  turn: {
    onBegin: ({ G, ctx }: { G: GameState; ctx: any }) => {
      G.isReshufflingPearlDeck = false;
      G.isReshufflingCharacterDeck = false;
      G.actionCount = 0;
      // Basisaktionen: 3 + dauerhafte oneExtraActionPerTurn-Fähigkeiten des aktuellen Spielers
      const player = G.players[ctx.currentPlayer];
      if (player) {
        // Aktive Fähigkeiten immer aus activatedCharacters ableiten (verlässlicher als gespeichertes Array)
        syncPlayerAbilities(player);
      }
      const permanentBonus = player
        ? player.activeAbilities.filter(a => a.type === 'oneExtraActionPerTurn').length
        : 0;
      G.maxActions = 3 + permanentBonus;
      // Flag für zusätzliche Aktion des nächsten Spielers auswerten
      if (G.nextPlayerExtraAction) {
        G.maxActions += 1;
        G.nextPlayerExtraAction = false;
      }
    },
    onEnd: ({ G, ctx }: { G: GameState; ctx: any }) => {
      // playedRealPearlIds am Zugende zurücksetzen
      G.playedRealPearlIds = [];
      // peekedCard vom Spieler zurücksetzen, falls verwendet (da der Stapel sich ändern kann)
      const player = G.players[ctx.currentPlayer];
      if (player) {
        player.peekedCard = null;
      }
    },
    onMove: ({ G, ctx }: { G: GameState; ctx: any }) => {
      const player = G.players[ctx.currentPlayer];
      if (!player) return;

      // Clear peekedCard once the first action is taken (actionCount > 0),
      // so the character deck top card is hidden again after the peek phase.
      if (G.actionCount > 0 && player.peekedCard !== null) {
        player.peekedCard = null;
      }

      // Aktive Fähigkeiten nach jedem Move aus activatedCharacters ableiten,
      // damit neu aktivierte Karten sofort wirken
      syncPlayerAbilities(player);

      const handLimit = calculateHandLimit(player.handLimitModifier);
      G.currentHandLimit = handLimit;

      const excess = getExcessCardCount(player.hand, handLimit);
      G.requiresHandDiscard = excess > 0;
      G.excessCardCount = excess;
    },
    stages: {
      discard: {
        moves: {},
      },
    },
  },

  /**
   * End If Condition: Check for game end
   */
  endIf: ({ G, ctx }: { G: GameState; ctx: any }) => {
    if (!G.finalRound) {
      return undefined;
    }
    
    // Count how many players have taken a turn since final round started
    const startingPlayerIdx = G.playerOrder.indexOf(G.finalRoundStartingPlayer || '');
    if (startingPlayerIdx === -1) {
      return undefined;
    }
    
    // Simple check: if current player is back to starting player after full round, game is over
    if (ctx.currentPlayer === G.finalRoundStartingPlayer && ctx.turn > G.playerOrder.length) {
      const ranking = [...G.playerOrder]
        .sort((a, b) => {
          const pA = G.players[a]!;
          const pB = G.players[b]!;
          if (pB.powerPoints !== pA.powerPoints) return pB.powerPoints - pA.powerPoints;
          return pB.diamonds - pA.diamonds;
        })
        .map(pId => ({
          playerId: pId,
          name: G.players[pId]!.name,
          powerPoints: G.players[pId]!.powerPoints,
          diamonds: G.players[pId]!.diamonds,
        }));
      return { ranking };
    }
    
    return undefined;
  },
};



/**
 * Helper Functions
 */

/**
 * Leitet activeAbilities und handLimitModifier eines Spielers aus seinen activatedCharacters ab.
 * Verlässt sich NICHT auf das `persistent`-Flag (kann bei alten Spielzuständen fehlen).
 * Muss in onBegin und onMove aufgerufen werden damit der abgeleitete Zustand immer aktuell ist.
 */
function syncPlayerAbilities(player: import('./types').PlayerState): void {
  player.activeAbilities = deriveActiveAbilities(player.activatedCharacters);
  player.handLimitModifier = player.activeAbilities.filter(a => a.type === 'handLimitPlusOne').length;
}

/**
 * Zieht eine Karte vom Deck. Wenn das Deck leer ist und der Ablagestapel Karten enthält,
 * wird der Ablagestapel gemischt zum neuen Deck und `onReshuffle` aufgerufen.
 * Gibt `undefined` zurück wenn beide Stapel leer sind.
 */
function drawCard<T>(deck: T[], discardPile: T[], onReshuffle?: () => void): T | undefined {
  if (deck.length === 0 && discardPile.length > 0) {
    deck.push(...discardPile.splice(0));
    shuffleArray(deck);
    onReshuffle?.();
  }
  return deck.pop();
}

/**
 * Refill a slot array from a deck, reshuffling the discard pile if the deck runs out.
 * Mutates all three arrays in place (compatible with boardgame.io/Immer).
 * `onReshuffle` wird aufgerufen wenn ein Reshuffle stattfindet.
 */
function refillSlots<T>(slots: T[], deck: T[], discardPile: T[], maxSlots: number, onReshuffle?: () => void): void {
  while (slots.length < maxSlots) {
    const card = drawCard(deck, discardPile, onReshuffle);
    if (card) slots.push(card);
    else break;
  }
}

export function createPearlDeck(): PearlCard[] {
  const deck: PearlCard[] = [];
  
  // Create 7 copies of each value 1-8
  for (let value = 1; value <= 8; value++) {
    for (let i = 0; i < 7; i++) {
      deck.push({
        id: `pearl-${value}-${i}`,
        value: value as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8),
        hasSwapSymbol: i === 0, // First copy has swap symbol
      });
    }
  }
  
  return deck;
}

export function createCharacterDeck(): CharacterCard[] {
  return getAllCardDataFromDatabase();
}

export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Export cost validation for human players and AI assignment for computer players
export { validateCostPayment, findCostAssignment } from './costCalculation';

// Export card database function (public API)
export { getAllCards } from './cardDatabase';

// Export card loader function (public API)
export { waitForCardsLoaded } from './browserCardDatabaseLoader';

// Export ability handlers (public API for testing and AI)
export { applyRedAbility, applyBlueAbility } from './abilityHandlers';

