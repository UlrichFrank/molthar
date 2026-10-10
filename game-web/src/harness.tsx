/* Dev-only: renders the mobile board / activation dialog with a fixture state
   so layouts can be checked at any viewport. ?view=board|dialog&n=3&act=8&hand=7 */
import { createRoot } from 'react-dom/client';
import './index.css';
import { PortaleVonMolthar, getAllCards, waitForCardsLoaded } from '@portale-von-molthar/shared';
import { MobileGameBoard } from './components/mobile/MobileGameBoard';
import { CharacterActivationDialog } from './components/CharacterActivationDialog';
import { LanguageProvider } from './i18n/LanguageContext';
import { DialogProvider } from './contexts/DialogContext';
import './styles/dialogs.css';

const q = new URLSearchParams(location.search);
const n = Number(q.get('n') ?? 3);
const act = Number(q.get('act') ?? 8);
const handN = Number(q.get('hand') ?? 7);
const view = q.get('view') ?? 'board';

await waitForCardsLoaded();
const cards = getAllCards().filter(c => !c.isSpecial);
const pick = (from: number, count: number) => Array.from({ length: count }, (_, j) => cards[(from + j) % cards.length]!);
const playOrder = Array.from({ length: n }, (_, i) => String(i));
const G = PortaleVonMolthar.setup({ ctx: { playOrder } } as never) as any;
const pearls = [...G.pearlDeck].filter((c: any) => !c.isSpecial);
let k = 0;
const entry = (card: any) => ({ id: card.id + '-' + k++, card, portalEntryOrder: k }) as never;
playOrder.forEach((pid, i) => {
  const p = G.players[pid];
  p.name = ['Ulrich Frank', 'Weiser Wendelin', 'Raubritter Ralf', 'Edelsteinsammlerin Erda', 'Irrnis'][i];
  p.hand = pearls.slice(i * 9, i * 9 + (i === 0 ? handN : 4));
  p.portal = pick(i * 7, 2).map(entry);
  p.activatedCharacters = pick(20 + i * 11, i === 0 ? act : Math.max(1, act - 2)).map(entry);
  p.diamondCards = cards.slice(0, 2);
  p.powerPoints = 12 + i;
});
const noop = () => {};
const moves = new Proxy({}, { get: () => noop }) as never;
const board = (
  <MobileGameBoard
    G={G}
    ctx={{ phase: 'takingActions', currentPlayer: '0' } as never}
    moves={moves}
    playerID="0"
    isActive
    matchData={playOrder.map((id) => ({ id: Number(id), name: G.players[id].name, isConnected: true }))}
  />
);

const mine = G.players['0'];
// A demanding card: blue ability + payment abilities on the table
const target = cards.find(c => c.abilities.length && c.cost.length >= 2) ?? cards[0]!;
const withAbilities = cards.filter(c => c.abilities.some((a: any) => ['tradeTwoForDiamond', 'onesCanBeEights', 'numberAdditionalCardActions'].includes(a.type))).slice(0, 2);
const dialog = (
  <DialogProvider>
    <CharacterActivationDialog
      availableCharacters={[{ card: target, slotIndex: 0 }]}
      hand={mine.hand}
      diamonds={2}
      activeAbilities={[]}
      activatedCharacters={withAbilities.map(entry)}
      onActivate={noop}
      onCancel={noop}
    />
  </DialogProvider>
);

createRoot(document.getElementById('root')!).render(<LanguageProvider>{view === 'dialog' ? dialog : board}</LanguageProvider>);
