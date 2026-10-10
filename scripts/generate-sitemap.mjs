#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from live data and appends the absolute sitemap
 * URL to public/robots.txt. Run before `vite build` in your deployment:
 *
 *   npm run generate:sitemap            # uses .env / .env.production
 *   npm run generate:sitemap -- localstack
 *
 * Uses only the public anon key and the public listing view. DEMO listings and
 * paths marked noindex in page_metadata are excluded.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const mode = process.argv[2] ?? 'production';
const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
const site = env.VITE_SITE_URL?.replace(/\/$/, '');
const api = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const key = env.VITE_SUPABASE_ANON_KEY;
if (!site || !api || !key) {
  console.error('VITE_SITE_URL, VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

async function rest(path) {
  const res = await fetch(`${api}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const [categories, jurisdictions, listings, metadata] = await Promise.all([
  rest('categories?select=slug,updated_at'),
  rest('jurisdictions?select=slug,updated_at'),
  rest('marketplace_listings?select=slug,published_at&status=eq.published&is_demo=eq.false'),
  rest('page_metadata?select=path,noindex'),
]);
const noindex = new Set(metadata.filter((m) => m.noindex).map((m) => m.path));

const staticPaths = [
  '/', '/marketplace', '/categories', '/jurisdictions', '/verification', '/sell', '/buyers', '/insights', '/about',
  '/contact', '/legal/disclaimer', '/legal/terms', '/legal/privacy',
];
const insightSlugs = [...readFileSync(resolve('src/content/insights.ts'), 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);

const urls = [
  ...staticPaths.map((p) => ({ loc: p })),
  ...insightSlugs.map((s) => ({ loc: `/insights/${s}` })),
  ...categories.map((c) => ({ loc: `/categories/${c.slug}`, lastmod: c.updated_at })),
  ...jurisdictions.map((j) => ({ loc: `/jurisdictions/${j.slug}`, lastmod: j.updated_at })),
  ...listings.map((l) => ({ loc: `/listings/${l.slug}`, lastmod: l.published_at })),
].filter((u) => !noindex.has(u.loc));

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${escape(site + (u.loc === '/' ? '/' : u.loc))}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(resolve('public/sitemap.xml'), xml);

const robotsPath = resolve('public/robots.txt');
const robots = readFileSync(robotsPath, 'utf8').replace(/\nSitemap: .*\n?/g, '\n').trimEnd();
writeFileSync(robotsPath, `${robots}\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
