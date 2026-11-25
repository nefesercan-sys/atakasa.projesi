#!/usr/bin/env node
// Gerçek "son güncelleme" tarihleri: sitemap'teki her sayfanın İÇERİĞİNİ (başlık, açıklama, görünen metin)
// özetler; özet değiştiyse o sayfanın tarihini bugüne çeker. Sonuç src/lib/lastmod.json (sitemap, JSON-LD
// dateModified ve sayfadaki "Son güncelleme" satırı buradan okur).
//
// Kullanım (içerik değiştiren her PR'da, derlenmiş site üzerinde):
//   npm run build && npx next start -p 3100 &
//   node scripts/lastmod.mjs http://localhost:3100 [YYYY-MM-DD]
// İkinci argüman verilmezse bugünün tarihi (Europe/Istanbul) kullanılır.
// Özetler src/lib/lastmod-hashes.json'da tutulur; ikisi de commit edilir.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const base = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '');
const today = process.argv[3] || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
const SITEMAPS = JSON.parse(readFileSync(new URL('./lastmod.config.json', import.meta.url), 'utf8')).sitemaps;
const DATES = new URL('../src/lib/lastmod.json', import.meta.url);
const HASHES = new URL('../src/lib/lastmod-hashes.json', import.meta.url);

const readJson = (u) => (existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : {});
const dates = readJson(DATES);
const hashes = readJson(HASHES);

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
/** Sayfanın tarihle değişmeyen içeriği: başlık + açıklama + görünen metin (script/style/tarih satırı hariç). */
export function contentOf(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [, html])[1]
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<template[\s\S]*?<\/template>/g, ' ')
    .replace(/<p[^>]*data-lastmod[^>]*>[\s\S]*?<\/p>/g, ' ') // "Son güncelleme" satırının kendisi
    .replace(/<[^>]+>/g, ' ');
  return decode(`${title}\n${desc}\n${body}`).replace(/<!-- -->/g, '').replace(/\s+/g, ' ').trim();
}
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url, { redirect: 'manual' }); return { status: r.status, text: await r.text() }; } catch { /* yeniden dene */ }
  }
  return { status: 0, text: '' };
}
async function locs(path) {
  const { text } = await get(`${base}${path}`);
  return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urls = [];
for (const sm of SITEMAPS) for (const u of await locs(sm)) if (!/\.xml$/.test(u)) urls.push(u);
const paths = [...new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/'))].sort();
if (!paths.length) { console.error('Sitemap boş ya da sunucuya ulaşılamadı:', base); process.exit(1); }

let changed = 0, added = 0, failed = 0;
const nextDates = {}, nextHashes = {};
const queue = [...paths];
await Promise.all(Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const p = queue.shift();
    const { status, text } = await get(`${base}${p === '/' ? '' : p}`);
    if (status !== 200) { failed++; console.error('HATA', status, p); if (dates[p]) { nextDates[p] = dates[p]; nextHashes[p] = hashes[p]; } continue; }
    const h = sha(contentOf(text));
    if (!hashes[p]) { added++; nextDates[p] = dates[p] || today; }
    else if (hashes[p] !== h) { changed++; nextDates[p] = today; }
    else nextDates[p] = dates[p] || today;
    nextHashes[p] = h;
  }
}));
const sorted = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
writeFileSync(DATES, JSON.stringify(sorted(nextDates), null, 0).replace(/,"/g, ',\n"') + '\n');
writeFileSync(HASHES, JSON.stringify(sorted(nextHashes), null, 0).replace(/,"/g, ',\n"') + '\n');
console.log(`sayfa: ${paths.length} · değişen: ${changed} · yeni: ${added} · hata: ${failed} · tarih: ${today}`);
if (failed) process.exit(2);
