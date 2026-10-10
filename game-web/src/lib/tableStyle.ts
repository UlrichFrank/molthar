/**
 * Table styling helpers for the canvas board: seeded "hand-placed" jitter for cards,
 * soft drop shadows, and the table / felt background.
 * Everything is deterministic per key so cards do not wobble between frames.
 */
import { getImage } from './imageLoaderV2';
import { BASE_W, BASE_H } from './cardLayoutConstants';

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pseudo-random generator (mulberry32) seeded from a string key. */
export function seededRandom(key: string): () => number {
  let a = hashString(key);
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PlaceOptions {
  /** Max rotation in degrees (± range). */
  rotDeg?: number;
  /** Max offset in px (± range). */
  offset?: number;
  /** Shadow strength, 0 = none. */
  shadow?: number;
  /** Corner radius for the shadow/clip shape. */
  radius?: number;
}

/** Stable jitter for a key: rotation in radians and x/y offset in px. */
export function jitterFor(key: string, rotDeg = 2, offset = 3): { rot: number; dx: number; dy: number } {
  const rnd = seededRandom(key);
  return {
    rot: ((rnd() * 2 - 1) * rotDeg * Math.PI) / 180,
    dx: (rnd() * 2 - 1) * offset,
    dy: (rnd() * 2 - 1) * offset,
  };
}

/**
 * Draw something "lying on the table": slightly rotated/shifted (seeded by `key`) with a soft shadow.
 * `draw` receives the top-left of the (w × h) card in the local, already transformed space.
 */
export function placeOnTable(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  key: string,
  draw: (lx: number, ly: number) => void,
  opts: PlaceOptions = {},
) {
  const { rotDeg = 2, offset = 3, shadow = 1, radius = 6 } = opts;
  const j = jitterFor(key, rotDeg, offset);
  ctx.save();
  ctx.translate(x + w / 2 + j.dx, y + h / 2 + j.dy);
  ctx.rotate(j.rot);
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${0.45 * shadow})`;
    ctx.shadowBlur = 10 * shadow;
    ctx.shadowOffsetX = 3 * shadow;
    ctx.shadowOffsetY = 4 * shadow;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, radius);
    ctx.fill();
    ctx.restore();
  }
  draw(-w / 2, -h / 2);
  ctx.restore();
}

// ── Table background ─────────────────────────────────────────────────────────

const FRAME = 34; // visible wood frame around the felt

let tableCache: HTMLCanvasElement | null = null;
let tableCacheKey = '';

function buildTable(width: number, height: number, withImage: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const S = 2; // render at 2× so the cached table stays sharp on HiDPI screens
  c.width = width * S;
  c.height = height * S;
  const g = c.getContext('2d')!;
  g.scale(S, S);
  const rnd = seededRandom('table');

  // Wood: warm dark base + long grain lines
  const wood = g.createLinearGradient(0, 0, 0, height);
  wood.addColorStop(0, '#3a2616');
  wood.addColorStop(0.5, '#2c1c10');
  wood.addColorStop(1, '#35230f');
  g.fillStyle = wood;
  g.fillRect(0, 0, width, height);
  for (let i = 0; i < 260; i++) {
    const y = rnd() * height;
    g.strokeStyle = `rgba(${rnd() > 0.5 ? '90,60,32' : '10,6,2'}, ${0.05 + rnd() * 0.08})`;
    g.lineWidth = 0.6 + rnd() * 1.6;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(width * 0.3, y + (rnd() - 0.5) * 8, width * 0.7, y + (rnd() - 0.5) * 8, width, y + (rnd() - 0.5) * 6);
    g.stroke();
  }

  // Felt inset with soft shadow onto the wood
  const fx = FRAME, fy = FRAME, fw = width - 2 * FRAME, fh = height - 2 * FRAME;
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.65)';
  g.shadowBlur = 24;
  g.shadowOffsetY = 4;
  g.fillStyle = '#1a5a3b';
  g.beginPath();
  g.roundRect(fx, fy, fw, fh, 18);
  g.fill();
  g.restore();

  g.save();
  g.beginPath();
  g.roundRect(fx, fy, fw, fh, 18);
  g.clip();

  // Felt colour + fibre noise
  const felt = g.createRadialGradient(width / 2, height / 2, height * 0.1, width / 2, height / 2, width * 0.62);
  felt.addColorStop(0, '#217049');
  felt.addColorStop(1, '#134a30');
  g.fillStyle = felt;
  g.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < 9000; i++) {
    const x = fx + rnd() * fw;
    const y = fy + rnd() * fh;
    g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
    g.fillRect(x, y, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
  }

  // Decor from the original table image, kept in proportion and faded into the felt at its sides
  const img = withImage ? getImage('Spielflaeche.png') : null;
  if (img && img.width > 0) {
    const scale = fh / img.height;
    const iw = img.width * scale;
    const layer = document.createElement('canvas');
    layer.width = Math.ceil(iw * S);
    layer.height = Math.ceil(fh * S);
    const lg = layer.getContext('2d')!;
    lg.drawImage(img, 0, 0, layer.width, layer.height);
    lg.globalCompositeOperation = 'destination-in';
    const mask = lg.createLinearGradient(0, 0, layer.width, 0);
    mask.addColorStop(0, 'rgba(0,0,0,0)');
    mask.addColorStop(0.08, 'rgba(0,0,0,1)');
    mask.addColorStop(0.92, 'rgba(0,0,0,1)');
    mask.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = mask;
    lg.fillRect(0, 0, layer.width, layer.height);
    const centerX = fx + (fw - iw) / 2;
    g.globalAlpha = 0.92;
    g.drawImage(layer, centerX, fy, iw, fh);
    g.globalAlpha = 1;
  }

  // Vignette + lamp light from the top
  const vig = g.createRadialGradient(width / 2, height * 0.42, height * 0.3, width / 2, height / 2, width * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vig;
  g.fillRect(fx, fy, fw, fh);
  const lamp = g.createRadialGradient(width / 2, height * 0.38, 0, width / 2, height * 0.38, height * 0.7);
  lamp.addColorStop(0, 'rgba(255, 238, 190, 0.10)');
  lamp.addColorStop(1, 'rgba(255, 238, 190, 0)');
  g.fillStyle = lamp;
  g.fillRect(fx, fy, fw, fh);
  g.restore();

  // Felt edge (stitched piping) and inner wood bevel
  g.strokeStyle = 'rgba(0,0,0,0.55)';
  g.lineWidth = 2;
  g.beginPath();
  g.roundRect(fx, fy, fw, fh, 18);
  g.stroke();
  g.strokeStyle = 'rgba(255, 220, 160, 0.12)';
  g.lineWidth = 1;
  g.beginPath();
  g.roundRect(fx - 3, fy - 3, fw + 6, fh + 6, 21);
  g.stroke();

  return c;
}

/** Draws the table (wood frame, felt, decor, vignette) into the BASE_W × BASE_H model space. */
export function drawTable(ctx: CanvasRenderingContext2D) {
  const hasImage = !!getImage('Spielflaeche.png');
  const key = `${BASE_W}x${BASE_H}:${hasImage ? 'img' : 'noimg'}`;
  if (!tableCache || tableCacheKey !== key) {
    tableCache = buildTable(BASE_W, BASE_H, hasImage);
    tableCacheKey = key;
  }
  ctx.drawImage(tableCache, 0, 0, BASE_W, BASE_H);
}
