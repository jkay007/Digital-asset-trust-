#!/usr/bin/env node
/**
 * Renders the default social sharing image (1200x630) to public/og-image.png
 * using the generated skyline artwork and brand fonts. Requires Playwright's
 * Chromium (installed with @playwright/test).
 *
 *   node scripts/generate-og-image.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skyline = readFileSync(resolve(root, 'src/assets/skyline.svg'), 'utf8');
// Fonts are inlined as data URIs because pages created with setContent cannot load file:// URLs.
const font = (file) => `data:font/woff2;base64,${readFileSync(resolve(root, 'node_modules/@fontsource-variable', file)).toString('base64')}`;
const serif = font('source-serif-4/files/source-serif-4-latin-wght-normal.woff2');
const sans = font('inter/files/inter-latin-wght-normal.woff2');

const html = `<!doctype html><html><head><style>
@font-face { font-family: 'BrandSerif'; src: url(${serif}) format('woff2'); font-weight: 200 900; }
@font-face { font-family: 'BrandSans'; src: url(${sans}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; position: relative; overflow: hidden; background: #06121F; font-family: 'BrandSans'; }
.bg { position: absolute; inset: 0; }
.bg svg { width: 100%; height: 100%; }
.fade { position: absolute; inset: 0; background: linear-gradient(90deg, #06121F 0%, rgba(6,18,31,.9) 45%, rgba(6,18,31,.1) 100%); }
.content { position: absolute; left: 72px; top: 0; bottom: 0; width: 720px; display: flex; flex-direction: column; justify-content: center; }
.mark { display: flex; align-items: center; gap: 18px; margin-bottom: 48px; }
.mark .name { color: #fff; font-family: 'BrandSerif'; font-size: 30px; font-weight: 600; }
.mark .tag { color: #D9B36C; font-size: 13px; letter-spacing: .3em; text-transform: uppercase; margin-top: 6px; font-weight: 600; }
h1 { font-family: 'BrandSerif'; color: #fff; font-size: 64px; line-height: 1.05; font-weight: 600; letter-spacing: -0.01em; }
h1 span { color: #E5C78F; }
p { color: rgba(255,255,255,.72); font-size: 24px; line-height: 1.45; margin-top: 26px; }
.rule { height: 2px; width: 120px; background: #D9B36C; margin-top: 36px; }
</style></head><body>
<div class="bg">${skyline}</div><div class="fade"></div>
<div class="content">
  <div class="mark">
    <svg viewBox="0 0 40 40" width="64" height="64"><rect x="1" y="1" width="38" height="38" rx="3" fill="#0B1F35" stroke="#D9B36C" stroke-width="1.5"/><circle cx="20" cy="20" r="11" fill="none" stroke="#D9B36C" stroke-width="1.4"/><ellipse cx="20" cy="20" rx="5" ry="11" fill="none" stroke="#D9B36C" stroke-width="1.1"/><path d="M9 20h22M11.2 14.5h17.6M11.2 25.5h17.6" stroke="#D9B36C" stroke-width="0.9"/></svg>
    <div><div class="name">Global Financial Assets</div><div class="tag">Confidential M&amp;A Marketplace</div></div>
  </div>
  <h1>Acquire regulated financial businesses <span>with clarity.</span></h1>
  <p>Banks, EMIs, crypto, brokerages, investment firms, insurers and financial licences.</p>
  <div class="rule"></div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/og-image.png') });
await browser.close();
console.log('Wrote public/og-image.png');
