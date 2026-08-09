import type { GameState, PlayerState, PearlCard } from '@portale-von-molthar/shared';
import type { GameBoardCore } from '../hooks/useGameBoardCore';
import { CharacterReplacementDialog } from './CharacterReplacementDialog';
import { CharacterTakePreviewDialog } from './CharacterTakePreviewDialog';
import { CharacterActivationDialog } from './CharacterActivationDialog';
import { DiscardCardsDialog } from './DiscardCardsDialog';
import { StealOpponentHandCardDialog } from './StealOpponentHandCardDialog';
import { CharacterSwapDialog } from './CharacterSwapDialog';
import { TakeBackPlayedPearlDialog } from './TakeBackPlayedPearlDialog';
import { DiscardOpponentCharacterDialog } from './DiscardOpponentCharacterDialog';
import { ActivatedCharacterDetailView } from './ActivatedCharacterDetailView';
import { EndgameResultsDialog } from './EndgameResultsDialog';
import { PlayerDisconnectDialog } from './PlayerDisconnectDialog';

interface SharedGameDialogsProps {
  G: GameState;
  moves: Record<string, (...args: unknown[]) => void>;
  core: GameBoardCore;
}

/**
 * Task 2.3/D5: every dialog reachable from either board view, rendered once
 * and driven purely by `useGameBoardCore` + `DialogContext` state so the
 * mobile and desktop boards never diverge in game-logic wiring.
 */
export function SharedGameDialogs({ G, moves, core }: SharedGameDialogsProps) {
  const { dialog, me, myPlayerID, resolvePlayerName } = core;

  return (
    <>
      {/* Preview dialogs for taking character cards */}
      {core.pendingTakeCardFromDisplay && (
        <CharacterTakePreviewDialog
          card={core.pendingTakeCardFromDisplay.card}
          faceDown={false}
          onConfirm={() => {
            moves.takeCharacterCard(core.pendingTakeCardFromDisplay!.slotIndex);
            core.setPendingTakeCardFromDisplay(null);
          }}
          onCancel={() => core.setPendingTakeCardFromDisplay(null)}
        />
      )}
      {core.pendingTakeCardFromDeck && (
        <CharacterTakePreviewDialog
          card={core.pendingTakeCardFromDeck.card}
          faceDown={core.pendingTakeCardFromDeck.faceDown}
          onConfirm={() => {
            moves.takeCharacterCard(-1);
            core.setPendingTakeCardFromDeck(null);
          }}
          onCancel={() => core.setPendingTakeCardFromDeck(null)}
        />
      )}

      {/* Dialog Modals */}
      {dialog.dialog.type === 'replacement' && (
        <CharacterReplacementDialog
          newCard={dialog.dialog.newCharacter}
          portalCards={dialog.dialog.portalCharacters}
          canDiscard={dialog.dialog.canDiscard}
          canCancel={dialog.dialog.canCancel}
          onCancel={dialog.closeDialog}
          onSelect={(replacedSlotIndex) => {
            if (dialog.dialog.type === 'replacement') {
              const characterIndex = (G.characterSlots || []).findIndex(
                card => card?.id === dialog.dialog.newCharacter.id
              );
              if (characterIndex === -1 && me && me.portal.length < 2) {
                moves.takeCharacterCard(-1);
              } else {
                moves.takeCharacterCard(characterIndex, replacedSlotIndex);
              }
            }
            dialog.closeDialog();
          }}
          onDiscard={() => {
            if (dialog.dialog.type === 'replacement') {
              const characterIndex = (G.characterSlots || []).findIndex(
                card => card?.id === dialog.dialog.newCharacter.id
              );
              moves.discardPickedCharacterCard(characterIndex);
            }
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'activation' && me && (
        <CharacterActivationDialog
          availableCharacters={[{
            card: dialog.dialog.character,
            slotIndex: dialog.dialog.portalSlotIndex,
          }]}
          hand={me.hand}
          diamonds={me.diamondCards?.length ?? 0}
          activeAbilities={me.activeAbilities}
          activatedCharacters={me.activatedCharacters}
          usedPaymentAbilityTypes={G.usedPaymentAbilityTypes ?? []}
          usedAbilitySourceCharacterIds={G.usedAbilitySourceCharacterIds ?? []}
          onActivate={(portalSlotIndex, selections) => {
            const ownerPlayerId = dialog.dialog.type === 'activation' ? dialog.dialog.ownerPlayerId : undefined;
            if (ownerPlayerId) {
              moves.activateSharedCharacter(ownerPlayerId, portalSlotIndex, selections);
            } else {
              moves.activatePortalCard(portalSlotIndex, selections);
            }
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {dialog.dialog.type === 'discard' && (
        <DiscardCardsDialog
          hand={dialog.dialog.hand}
          excessCardCount={dialog.dialog.excessCardCount}
          currentHandLimit={dialog.dialog.currentHandLimit}
          onDiscard={(selectedCardIndices) => {
            moves.discardCardsForHandLimit(selectedCardIndices);
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {dialog.dialog.type === 'steal-opponent-hand-card' && me && (
        <StealOpponentHandCardDialog
          opponents={(G.playerOrder || [])
            .filter(id => id !== myPlayerID)
            .map(id => { const p = G.players?.[id]; return p ? { ...p, name: resolvePlayerName(id, p.name) } : undefined; })
            .filter((p): p is PlayerState => p !== undefined && p.hand.length > 0)}
          onSteal={(targetPlayerId, handCardIndex) => {
            moves.resolveStealOpponentHandCard(targetPlayerId, handCardIndex);
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'discard-opponent-character' && (
        <DiscardOpponentCharacterDialog
          opponents={(() => {
            const order = G.playerOrder || [];
            const myIdx = order.indexOf(myPlayerID ?? '');
            const rotated = myIdx >= 0
              ? [...order.slice(myIdx + 1), ...order.slice(0, myIdx)]
              : order;
            return rotated
              .filter(id => id !== myPlayerID)
              .map(id => { const p = G.players?.[id]; return p ? { ...p, name: resolvePlayerName(id, p.name) } : undefined; })
              .filter((p): p is PlayerState => p !== undefined && p.portal.length > 0);
          })()}
          onDiscard={(targetPlayerId, portalEntryId) => {
            moves.resolveDiscardOpponentCharacter(targetPlayerId, portalEntryId);
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'take-back-played-pearl' && (
        <TakeBackPlayedPearlDialog
          playedCards={(G.playedRealPearlIds ?? [])
            .map(id => (G.pearlDiscardPile ?? []).find(c => c.id === id))
            .filter((c): c is PearlCard => c !== undefined)}
          onTakeBack={(pearlId) => {
            moves.resolveReturnPearl(pearlId);
            dialog.closeDialog();
          }}
          onDismiss={() => {
            moves.dismissReturnPearlDialog();
            dialog.closeDialog();
          }}
        />
      )}

      {dialog.dialog.type === 'swap-portal-character' && (
        <CharacterSwapDialog
          portalCard={dialog.dialog.portalCard}
          portalSlotIndex={dialog.dialog.portalSlotIndex}
          tableCards={dialog.dialog.tableCards}
          onSwap={(tableSlotIndex) => {
            if (dialog.dialog.type === 'swap-portal-character') {
              moves.swapPortalCharacter(dialog.dialog.portalSlotIndex, tableSlotIndex);
            }
            dialog.closeDialog();
          }}
          onCancel={() => dialog.closeDialog()}
        />
      )}

      {/* Activated Character Detail View Modal */}
      <ActivatedCharacterDetailView
        character={core.activeCharacter || null}
        onClose={() => core.setActiveCharacterIndex(null)}
      />
      <ActivatedCharacterDetailView
        character={core.activeOwnPortalSlot !== null ? (me?.portal[core.activeOwnPortalSlot] ?? null) : null}
        onClose={() => core.setActiveOwnPortalSlot(null)}
        rotated={false}
      />
      <ActivatedCharacterDetailView
        character={core.activeOpponentCharacterData}
        onClose={() => core.setActiveOpponentCharacter(null)}
      />
      <ActivatedCharacterDetailView
        character={core.activeOpponentPortalCardData}
        onClose={() => core.setActiveOpponentPortalCard(null)}
        rotated={false}
      />
      {core.previewAuslageCard && (
        <CharacterTakePreviewDialog
          card={core.previewAuslageCard}
          onCancel={() => core.setPreviewAuslageCard(null)}
        />
      )}

      {/* Endgame Results Dialog */}
      {core.gameover !== undefined && core.gameover.ranking && (
        <EndgameResultsDialog
          ranking={core.gameover.ranking.map(entry => ({
            ...entry,
            name: resolvePlayerName(entry.playerId, entry.name),
          }))}
          myPlayerId={myPlayerID}
          reason={core.gameover.reason}
        />
      )}

      {/* Disconnect Dialog */}
      {core.disconnectedPlayerName !== null && (
        <PlayerDisconnectDialog playerName={core.disconnectedPlayerName} />
      )}
    </>
  );
}
