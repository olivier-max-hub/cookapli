/* Cookapli — mise à jour mensuelle des prix moyens (prix.json)
   Source : Open Prices (Open Food Facts), licence ODbL — https://prices.openfoodfacts.org
   Pour chaque ingrédient du référentiel ING (friscan/data.js), on récupère les prix relevés
   ces 12 derniers mois pour ses catégories Open Food Facts, on garde ceux relevés en France,
   on les ramène en euros par kilo (ou par litre), puis on prend la médiane après avoir écarté
   les 10 % les plus bas et les 10 % les plus hauts. S'il y a moins de 5 relevés, on garde la
   valeur précédente.
   Lancement : node scripts/maj-prix.mjs (Node 20 ou plus, aucune dépendance). */
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const API = 'https://prices.openfoodfacts.org/api/v1/prices';
const DATA_URL = 'https://raw.githubusercontent.com/olivier-max-hub/friscan/main/data.js';
const FICHIER = new URL('../prix.json', import.meta.url);
const MIN_RELEVES = 5;
const PAGES_MAX = 3;
const UA = 'Cookapli/1.0 (+https://github.com/olivier-max-hub/cookapli)';

const pause = ms => new Promise(r => setTimeout(r, ms));

async function lireING() {
  const src = await (await fetch(DATA_URL)).text();
  const ctx = {};
  vm.runInNewContext(src + ';this.ING = ING;', ctx);
  return ctx.ING;
}

async function appel(params) {
  const url = API + '?' + new URLSearchParams(params);
  for (let essai = 0; essai < 3; essai++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await pause(5000 * (essai + 1)); continue; }
    if (!r.ok) return null;
    return r.json();
  }
  return null;
}

function enFrance(item) {
  const l = item.location || {};
  return /france/i.test(l.osm_address_country || '') || /^fr$/i.test(l.osm_address_country_code || '');
}

/* prix ramené au kilo (ou au litre) ; null si impossible */
function prixKg(item, d) {
  if (item.currency && item.currency !== 'EUR') return null;
  const p = Number(item.price);
  if (!(p > 0)) return null;
  if (item.price_per === 'KILOGRAM') return p;
  if (item.price_per === 'UNIT' && !item.product_code) return d.pu ? p / (d.pu / 1000) : null;
  const pr = item.product || {};
  const q = Number(pr.product_quantity), u = String(pr.product_quantity_unit || 'g').toLowerCase();
  if (q > 0 && (u === 'g' || u === 'ml')) return p / (q / 1000);
  return null;
}

function mediane(v) {
  const s = [...v].sort((a, b) => a - b);
  const cut = Math.floor(s.length * 0.1);
  const t = s.slice(cut, s.length - cut);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
}

async function relevesPour(d, depuis) {
  const vus = new Set(), out = [];
  for (const tag of d.t || []) {
    for (const cle of ['category_tag', 'product__categories_tags__contains']) {
      for (let page = 1; page <= PAGES_MAX; page++) {
        const j = await appel({ [cle]: tag, date__gte: depuis, size: 100, page });
        await pause(400);
        if (!j || !Array.isArray(j.items)) break;
        for (const it of j.items) {
          if (vus.has(it.id) || !enFrance(it)) continue;
          vus.add(it.id);
          const v = prixKg(it, d);
          if (v != null && v > 0.05 && v < 500) out.push(v);
        }
        if (page >= (j.pages || 1)) break;
      }
    }
  }
  return out;
}

const ING = await lireING();
const ancien = JSON.parse(await readFile(FICHIER, 'utf8'));
const depuis = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
let maj = 0;
for (const [id, d] of Object.entries(ING)) {
  if (d.old) continue;
  const avant = ancien.p[id] || { e: null, src: 'ref', n: 0 };
  let releves = [];
  try { releves = await relevesPour(d, depuis); } catch (e) { console.log(id, 'erreur', e.message); }
  if (releves.length >= MIN_RELEVES) {
    const e = Math.round(mediane(releves) * 100) / 100;
    ancien.p[id] = { e, src: 'op', n: releves.length };
    maj++;
  } else {
    ancien.p[id] = { ...avant, n: releves.length };
  }
  console.log(id.padEnd(20), String(releves.length).padStart(4), 'relevés →', ancien.p[id].e, '€/kg', ancien.p[id].src);
}
ancien.maj = new Date().toISOString().slice(0, 10);
await writeFile(FICHIER, JSON.stringify(ancien, null, 1) + '\n', 'utf8');
console.log(`${maj} ingrédients mis à jour avec Open Prices.`);
