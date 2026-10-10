#!/usr/bin/env node
/**
 * Generates the hero "financial district at dusk" artwork as an optimised SVG.
 * Deterministic (seeded) so the output is stable between runs.
 *
 *   node scripts/generate-skyline.mjs
 *
 * Output: src/assets/skyline.svg
 * To use licensed photography instead, set `hero.imageUrl` in src/config/site.ts.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1600;
const H = 900;
const GROUND = 790; // waterline

// Mulberry32 PRNG for deterministic output.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = prng(20261010);
const between = (min, max) => min + rand() * (max - min);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const r1 = (n) => Math.round(n * 10) / 10;

const out = [];
const lit = [];

function building(x, w, h, fill, opts = {}) {
  const top = GROUND - h;
  const shape = opts.shape ?? 'flat';
  const parts = [];
  if (shape === 'flat') {
    parts.push(`<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}"/>`);
  } else if (shape === 'stepped') {
    const s = Math.min(w * 0.18, 14);
    parts.push(`<rect x="${r1(x)}" y="${r1(top + 26)}" width="${r1(w)}" height="${r1(h - 26)}"/>`);
    parts.push(`<rect x="${r1(x + s)}" y="${r1(top + 10)}" width="${r1(w - 2 * s)}" height="18"/>`);
    parts.push(`<rect x="${r1(x + 2 * s)}" y="${r1(top)}" width="${r1(w - 4 * s)}" height="12"/>`);
  } else if (shape === 'slant') {
    const d = w * 0.55;
    parts.push(
      `<polygon points="${r1(x)},${r1(top + d)} ${r1(x + w)},${r1(top)} ${r1(x + w)},${GROUND} ${r1(x)},${GROUND}"/>`,
    );
  } else if (shape === 'spire') {
    parts.push(`<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}"/>`);
    parts.push(
      `<polygon points="${r1(x + w * 0.2)},${r1(top)} ${r1(x + w / 2)},${r1(top - h * 0.16)} ${r1(x + w * 0.8)},${r1(top)}"/>`,
    );
    parts.push(
      `<rect x="${r1(x + w / 2 - 1)}" y="${r1(top - h * 0.16 - 46)}" width="2" height="48"/>`,
    );
  } else if (shape === 'dome') {
    parts.push(`<rect x="${r1(x)}" y="${r1(top + w / 2)}" width="${r1(w)}" height="${r1(h - w / 2)}"/>`);
    parts.push(
      `<path d="M${r1(x)} ${r1(top + w / 2)} A ${r1(w / 2)} ${r1(w / 2)} 0 0 1 ${r1(x + w)} ${r1(top + w / 2)} Z"/>`,
    );
  } else if (shape === 'antenna') {
    parts.push(`<rect x="${r1(x)}" y="${r1(top)}" width="${r1(w)}" height="${r1(h)}"/>`);
    parts.push(`<rect x="${r1(x + w * 0.3)}" y="${r1(top - 34)}" width="2" height="34"/>`);
    parts.push(`<rect x="${r1(x + w * 0.65)}" y="${r1(top - 20)}" width="2" height="20"/>`);
  }
  out.push(`<g fill="${fill}">${parts.join('')}</g>`);
  if (opts.rim) {
    // Rim light on the edge facing the horizon glow.
    out.push(
      `<rect x="${r1(x + w - 2)}" y="${r1(top + (shape === 'slant' ? 4 : 0))}" width="2" height="${r1(h)}" fill="#D9B36C" opacity="${opts.rim}"/>`,
    );
  }

  if (opts.windows) {
    const cols = Math.max(2, Math.floor((w - 8) / 9));
    const rows = Math.floor((h - 40) / 13);
    const startY = shape === 'dome' ? top + w / 2 + 14 : shape === 'stepped' ? top + 40 : top + 16;
    const density = opts.density ?? 0.12;
    for (let r = 0; r < rows; r++) {
      const y = startY + r * 13;
      if (y > GROUND - 12) break;
      for (let c = 0; c < cols; c++) {
        if (rand() < density) {
          const wx = x + 6 + c * 9;
          if (wx + 4 > x + w - 4) continue;
          if (shape === 'slant') {
            const roof = top + w * 0.55 * (1 - (wx - x) / w);
            if (y < roof + 8) continue;
          }
          lit.push({ x: wx, y, o: between(0.35, 0.95) });
        }
      }
    }
  }
  if (opts.stripes) {
    const n = Math.floor(w / 7);
    const lines = [];
    for (let i = 1; i < n; i++) {
      const lx = x + i * 7;
      lines.push(`M${r1(lx)} ${r1(GROUND - h + 18)}V${GROUND}`);
    }
    out.push(`<path d="${lines.join('')}" stroke="${opts.stripes}" stroke-width="0.8" opacity="0.55"/>`);
  }
}

function layer({ fill, minH, maxH, minW, maxW, gap, shapes, windows, density, stripes, startX = -20 }) {
  let x = startX;
  while (x < W + 20) {
    const w = between(minW, maxW);
    // Skyline rises towards the right, leaving calmer space behind hero copy.
    const bias = 0.55 + 0.75 * (x / W);
    const h = between(minH, maxH) * bias;
    building(x, w, h, fill, { shape: pick(shapes), windows, density, stripes });
    x += w + between(gap[0], gap[1]);
  }
}

// Far layer: hazy silhouettes.
layer({ fill: '#1E3C62', minH: 120, maxH: 330, minW: 34, maxW: 80, gap: [-6, 6], shapes: ['flat', 'flat', 'stepped', 'antenna'] });
// Middle layer: city mass with scattered lights.
layer({ fill: '#122B47', minH: 150, maxH: 420, minW: 40, maxW: 92, gap: [2, 16], shapes: ['flat', 'stepped', 'slant', 'antenna', 'dome'], windows: true, density: 0.09, startX: 10 });
// Foreground towers: tall glass towers concentrated to the right.
const towers = [
  { x: 820, w: 70, h: 420, shape: 'stepped' },
  { x: 905, w: 92, h: 560, shape: 'spire' },
  { x: 1010, w: 64, h: 470, shape: 'slant' },
  { x: 1088, w: 110, h: 640, shape: 'spire' },
  { x: 1214, w: 76, h: 500, shape: 'dome' },
  { x: 1302, w: 96, h: 590, shape: 'antenna' },
  { x: 1412, w: 72, h: 455, shape: 'slant' },
  { x: 1496, w: 120, h: 530, shape: 'stepped' },
  { x: 610, w: 66, h: 330, shape: 'flat' },
  { x: 690, w: 84, h: 380, shape: 'antenna' },
  { x: 420, w: 60, h: 250, shape: 'stepped' },
  { x: 500, w: 74, h: 290, shape: 'flat' },
];
for (const t of towers) {
  building(t.x, t.w, t.h, 'url(#tower)', {
    shape: t.shape,
    windows: true,
    density: 0.16,
    stripes: '#1A3758',
    rim: t.x > 800 ? 0.32 : 0.18,
  });
}

const windowRects = lit
  .map((p) => `<rect x="${r1(p.x)}" y="${r1(p.y)}" width="3.6" height="5.4" opacity="${p.o.toFixed(2)}"/>`)
  .join('');

// Reflections on the water.
const ripples = [];
for (let i = 0; i < 140; i++) {
  const x = between(380, 1600);
  const y = between(GROUND + 8, H - 6);
  const len = between(10, 70) * (1 - (y - GROUND) / (H - GROUND)) + 6;
  ripples.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(len)}" height="1.4" opacity="${between(0.12, 0.5).toFixed(2)}"/>`);
}

// Faint ascending chart line across the sky (financial motif).
const chart = [];
let cy = 520;
for (let x = 0; x <= W; x += 40) {
  cy += between(-26, 12);
  cy = Math.max(150, Math.min(560, cy));
  chart.push(`${x},${r1(cy)}`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustration of a financial district skyline at dusk">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050F1B"/><stop offset="0.55" stop-color="#0B1F35"/><stop offset="0.86" stop-color="#1A3557"/><stop offset="1" stop-color="#22436A"/></linearGradient>
<radialGradient id="glow" cx="0.7" cy="0.78" r="0.62"><stop offset="0" stop-color="#D9B36C" stop-opacity="0.5"/><stop offset="0.4" stop-color="#D9B36C" stop-opacity="0.16"/><stop offset="1" stop-color="#D9B36C" stop-opacity="0"/></radialGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D243D"/><stop offset="1" stop-color="#050F1B"/></linearGradient>
<linearGradient id="tower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#081829"/><stop offset="0.7" stop-color="#0C2138"/><stop offset="1" stop-color="#173252"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1F35" stop-opacity="0"/><stop offset="1" stop-color="#0B1F35" stop-opacity="0.55"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g stroke="#D9B36C" stroke-opacity="0.06" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${100 + i * 70}H${W}"/>`).join('')}</g>
<polyline points="${chart.join(' ')}" fill="none" stroke="#D9B36C" stroke-opacity="0.22" stroke-width="1.6"/>
${out.join('\n')}
<g fill="#E9C985">${windowRects}</g>
<rect y="${GROUND - 160}" width="${W}" height="160" fill="url(#haze)"/>
<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="url(#water)"/>
<rect y="${GROUND}" width="${W}" height="1.5" fill="#D9B36C" opacity="0.35"/>
<g fill="#D9B36C">${ripples.join('')}</g>
</svg>
`;

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../src/assets/skyline.svg');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, svg);
console.log(`Wrote ${target} (${(svg.length / 1024).toFixed(1)} KB, ${lit.length} lit windows)`);
