import React, { useState } from 'react';
import type { GameState, PlayerState } from '@portale-von-molthar/shared';
import { FaceUpCards } from './FaceUpCards';
import { PlayerHand } from './PlayerHand';
import { ActionButtons } from './ActionButtons';
import '../styles/board.css';

interface BoardProps {
  G: GameState;
  ctx: any;
  moves: any;
  events: any;
  playerID: string | null;
  isActive: boolean;
}

function getCharacterCardImage(cardName: string): string {
  const match = cardName.match(/(\d+)/);
  return match ? `/assets/Charakterkarte${match[1]}.jpeg` : '/assets/Charakterkarte Hinten.jpeg';
}

export function Board(props: BoardProps) {
  const { G, ctx, moves, events, playerID } = props;

  const [selectedPearl, setSelectedPearl] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [selectedHandIndices, setSelectedHandIndices] = useState<number[]>([]);

  const myPlayerID = playerID || (G.playerOrder && G.playerOrder[0]) || Object.keys(G.players)[0];
  const me = G.players[myPlayerID];

  const playerIDs = G.playerOrder || Object.keys(G.players);
  const myIndex = playerIDs.indexOf(myPlayerID);
  const rotatedIDs = [...playerIDs.slice(myIndex), ...playerIDs.slice(0, myIndex)];
  // opponents[0] = left (disabled), [1] = top-left, [2] = top-right, [3] = right
  const opponents = rotatedIDs.slice(1).map(id => G.players[id]);

  const phase = ctx.phase || 'takingActions';

  // ---- handlers ----
  const handleSelectPearl = (i: number) => {
    setSelectedPearl(prev => (prev === i ? null : i));
    setSelectedCharacter(null);
  };
  const handleSelectCharacter = (i: number) => {
    setSelectedCharacter(prev => (prev === i ? null : i));
    setSelectedPearl(null);
  };
  const handleSelectHand = (i: number) => {
    setSelectedHandIndices(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const onTakePearl = () => {
    if (selectedPearl !== null) { moves.takePearlCard(selectedPearl); setSelectedPearl(null); }
  };
  const onPlaceCharacter = () => {
    if (selectedCharacter !== null) { moves.takeCharacterCard(selectedCharacter); setSelectedCharacter(null); }
  };
  const onActivateCharacter = (idx: number) => {
    if (selectedHandIndices.length > 0) {
      moves.activatePortalCard(idx, selectedHandIndices);
      setSelectedHandIndices([]);
    }
  };
  const onDiscardCards = () => {
    if (selectedHandIndices.length > 0) { moves.discardCards(selectedHandIndices); setSelectedHandIndices([]); }
  };
  const onEndTurn = () => events?.endTurn?.();

  // ---- opponent renderer ----
  const renderOpponent = (player: PlayerState | undefined, posClass: string, rotation: string) => {
    if (!player) return null;
    const portalMap: Record<string, string> = {
      'opponent-top-left':  '/assets/Gegner Portal3.png',
      'opponent-top-right': '/assets/Gegner Portal4.png',
      'opponent-right':     '/assets/Gegner Portal5.png',
    };
    const img = portalMap[posClass] ?? '/assets/Gegner Portal2.png';
    return (
      <div className={`opponent-slot ${posClass}`} style={{ transform: `rotate(${rotation})` }}>
        <div className="opponent-card-wrapper">
          <img src={img} alt={`Portal ${player.name}`} />
        </div>
        <div className="opponent-name">{player.name}</div>
        <div className="opponent-stats">
          <span>⚡{player.powerPoints}</span>
          <span>💎{player.diamonds}</span>
          <span>🃏{player.hand.length}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="game-board">

      {/* ── Gegner links ── */}
      <div className="zone zone-left">
        {renderOpponent(opponents[3], 'opponent-left', '-90deg')}
      </div>

      {/* ── Gegner oben-links (Zone: 15% – 47.5%) ── */}
      <div className="zone zone-top-left">
        {renderOpponent(opponents[1], 'opponent-top-left', '180deg')}
      </div>

      {/* ── Gegner oben-rechts (Zone: 52.5% – 85%) ── */}
      <div className="zone zone-top-right">
        {renderOpponent(opponents[2], 'opponent-top-right', '180deg')}
      </div>

      {/* ── Gegner rechts ── */}
      <div className="zone zone-right">
        {renderOpponent(opponents[3], 'opponent-right', '-90deg')}
      </div>

      {/* ── Auslage Mitte ── */}
      <div className="zone zone-center">
        <FaceUpCards
          pearlCards={G.pearlSlots}
          characterCards={G.characterSlots}
          selectedPearl={selectedPearl}
          selectedCharacter={selectedCharacter}
          onSelectPearl={handleSelectPearl}
          onSelectCharacter={handleSelectCharacter}
        />
      </div>

      {/* ── Spielerbereich: Kleiderschrank Portal als Bild ── */}
      <div className="zone zone-player">
        {/* Portal-Bild (Weiß = transparent via multiply) */}
        <img
          src="/assets/Kleiderschrank Portal.png"
          className="portal-bg-img"
          alt="Spielerbereich"
        />

        {/* Interaktiver Overlay, der der Bildstruktur folgt */}
        <div className="portal-content">

            {/* Obere Reihe: Diamanten | Portal-Slots | Aktivierte Karten */}
            <div className="portal-main-row">

              {/* Links: Diamanten */}
              <div className="portal-diamonds">
                {me.diamonds > 0
                  ? Array(me.diamonds).fill(null).map((_, i) => <span key={i}>💎</span>)
                  : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>—</span>
                }
              </div>

              {/* Mitte: Portal-Kartenslots (Charakterkarten im Portal) */}
              <div className="portal-slots">
                {[0, 1].map(slotIdx => {
                  const slot = me.portal[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`portal-card-slot ${!slot ? 'empty' : slot.activated ? 'activated' : ''}`}
                      title={slot ? `${slot.card.name} – Klick zum Aktivieren` : 'Leerer Slot'}
                      onClick={() => {
                        if (slot && !slot.activated) onActivateCharacter(slotIdx);
                      }}
                    >
                      {slot
                        ? <img src={getCharacterCardImage(slot.card.name)} alt={slot.card.name} />
                        : <span>Slot {slotIdx + 1}</span>
                      }
                    </div>
                  );
                })}
              </div>

              {/* Rechts: Aktivierte Karten */}
              <div className="portal-activated">
                {me.portal
                  .filter(s => s.activated)
                  .map((s, i) => (
                    <div key={i} className="portal-card-slot activated" title={s.card.name}>
                      <img src={getCharacterCardImage(s.card.name)} alt={s.card.name} />
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Untere Reihe: Hand + Aktions-Buttons */}
            <div className="portal-hand-row">
              <div className="portal-hand">
                <PlayerHand
                  hand={me.hand}
                  selectedIndices={selectedHandIndices}
                  phase={phase}
                  onSelect={handleSelectHand}
                  onClearSelection={() => setSelectedHandIndices([])}
                />
              </div>
              <div className="portal-actions">
                <ActionButtons
                  gamePhase={phase}
                  actionsRemaining={3 - (G.actionCount || 0)}
                  selectedPearl={selectedPearl}
                  selectedCharacter={selectedCharacter}
                  selectedHandCount={selectedHandIndices.length}
                  onTakePearl={onTakePearl}
                  onPlaceCharacter={onPlaceCharacter}
                  onActivateCharacter={onActivateCharacter}
                  onDiscardCards={onDiscardCards}
                  onEndTurn={onEndTurn}
                  currentPlayer={me}
                />
              </div>
            </div>

          </div>{/* /portal-content */}
      </div>{/* /zone-player */}

    </div>
  );
}

export default Board;
