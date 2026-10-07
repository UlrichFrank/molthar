import { runGame } from './engine';
import { BOTS } from './bench';
const name = process.argv[2]!; const seed = process.argv[3] ?? 'solo:0';
import { makePlannerBot } from '../bots/personas';
import { DEFAULT_PARAMS } from '../bots/planner';
const bot = name.startsWith('{') ? { fn: makePlannerBot('efficient', { ...DEFAULT_PARAMS, ...JSON.parse(name) }) } : BOTS[name]!;
const wrapped = (G: any, ctx: any, pid: string) => {
  const a = bot.fn(G, ctx, pid);
  const p = G.players[pid];
  const cards = p.portal.map((e: any) => `${e.card.powerPoints}p:${e.card.cost.map((c: any) => c.type === 'number' ? c.value : c.type + (c.n ?? '') + (c.sum ? 's' + c.sum : '') + (c.length ?? '')).join(',')}`);
  const disp = G.characterSlots.map((c: any) => `${c.powerPoints}p:${c.cost.map((c: any) => c.type === 'number' ? c.value : c.type + (c.n ?? '') + (c.sum ? 's' + c.sum : '') + (c.length ?? '')).join(',')}`);
  console.log(`R${G.roundNumber} a${G.actionCount}/${G.maxActions} pts=${p.powerPoints} hand=[${p.hand.map((c: any) => c.value)}] vis=[${G.pearlSlots.map((c: any) => c?.value)}] portal=${JSON.stringify(cards)} disp=${JSON.stringify(disp)} -> ${'move' in a ? a.move + JSON.stringify(a.args?.slice(0, 2)) : a.event}`);
  return a;
};
const r = runGame({ gameId: 't', strategies: { '0': 'efficient', '1': 'random' }, seed, botsByPlayer: { '0': wrapped, '1': () => ({ event: 'endTurn' }) } });
console.log('threshold', r.thresholdRound, 'aborted', r.aborted);
