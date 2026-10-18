/* El build: data/site.json + projects/<slug>/ + index.html (la plantilla)
   -> dist/, la web tal cual se publica. `node build/build.mjs`

   Cada página es una dirección de verdad, con su contenido ya escrito, su
   title, su og:image y su canonical (antes era una sola página y el JS
   cambiaba la dirección; GitHub Pages las servía con su 404):

     /             about, en inglés       /ca/             about, en catalán
     /god/         un proyecto            /ca/god/

   Al cargar, el JS de siempre (app.js) vuelve a pintar lo mismo y la web
   funciona como antes: las flechas, los idiomas y los easter eggs no
   cambian de página, solo de dirección. Las direcciones viejas (/en/god,
   /cat/god, /cat) redirigen a las nuevas.

   Si algo está mal (una coma, un campo mal escrito, una foto que no está),
   para y dice qué, en catalán (lo lee Max).

   Los datos los lee js/core/house.js, el mismo que usa el navegador, y los
   deja en la forma de siempre del JS ({ slug: [slides] }): lo de abajo no cambia. */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listedSlugs, toSlides } from '../js/core/house.js';
import { validar } from '../js/core/validar.js';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const HOME = 'about';   // la portada: el JS la trata aparte (js/core/data.js → sitePath, los efectos)
// 'cat' es como lo llaman data.json y el JS; en la dirección y en hreflang, 'ca'
const LANGS = {
  en: { code: 'en', locale: 'en_US', prefix: '' },
  cat: { code: 'ca', locale: 'ca_ES', prefix: '/ca' },
};
// lo que se copia tal cual a dist/ (los JSON también: el JS los lee al cargar)
const STATIC = ['style.css', 'app.js', 'js', 'data', 'projects'];

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

/* ---------- los datos ---------- */

function read(rel) {
  let text;
  try { text = readFileSync(join(ROOT, rel), 'utf8'); } catch { fail(`no trobo ${rel}`); }
  try { return JSON.parse(text); } catch (err) {
    fail(`${rel} no és un JSON vàlid: ${err.message}\n  Gairebé sempre és una coma de més o de menys, o unes cometes sense tancar, a prop d'aquesta línia.`);
  }
}
// cada JSON, con su esquema (schema/): lo mismo que VS Code subraya en rojo
const schema = (type) => JSON.parse(readFileSync(join(ROOT, 'schema', `${type}.json`), 'utf8'));
const site = read('data/site.json');
const errors = validar(site, schema('site'), 'data/site.json');
const slugs = errors.length ? [] : listedSlugs(site);
const projects = {};
for (const slug of slugs) {
  if (projects[slug]) errors.push(`data/site.json: "${slug}" surt dues vegades a "lists"`);
  if (['ca', 'cat', 'en', 'data', 'js', 'og', 'projects', 'schema'].includes(slug)) errors.push(`data/site.json: "${slug}" no pot ser el nom d'un projecte: és una carpeta de la web.`);
  const rel = `projects/${slug}/project.json`;
  if (!existsSync(join(ROOT, rel))) { errors.push(`data/site.json: "lists" diu "${slug}", i no hi ha cap ${rel}`); continue; }
  const p = projects[slug] = read(rel);
  errors.push(...validar(p, schema('project'), rel));
  for (const n of Array.isArray(p.photos) ? p.photos : []) {
    if (!existsSync(join(ROOT, 'projects', slug, 'img', `${n}.webp`))) errors.push(`${rel}: "photos" diu "${n}", i no hi ha cap img/${n}.webp (passa-la per imgToWeb)`);
  }
}
if (!errors.length && slugs[0] !== HOME) errors.push(`data/site.json: el primer projecte de la primera llista ha de ser "${HOME}": és la portada.`);
if (errors.length) fail(`${errors.join('\n✗ ')}\n\nNo es publica res fins que s'arreglin.`);
const data = toSlides(site, projects);

/* Dónde se publica, según dónde se construye (JAMstack, patrones §5): en la
   Action de GitHub (nuestra copia), meowrhino.github.io/maxito/ y sin indexar;
   en cualquier otro sitio (Cloudflare, en la copia de Max), la raíz y el
   dominio de site.json → "url", y se indexa si lo hay. */
const github = process.env.GITHUB_ACTIONS === 'true';
const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'meowrhino/maxito').split('/');
const BASE = github ? `/${repo}` : '';
const SITE = github ? `https://${owner}.github.io${BASE}` : String(site.url || '').replace(/\/+$/, '');
const INDEX = !github && !!site.url;
const NAME = site.title;
const DEFAULT_IMAGE = Object.values(data).flat().find((s) => s.image)?.image || '';

/* ---------- lo mismo que js/core/data.js, para escribirlo sin navegador ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (obj, key, lang) => obj?.[`${key}_${lang}`] || obj?.[`${key}_cat`] || obj?.[`${key}_en`] || obj?.[key] || '';
const title = (slug, lang) => pick(data[slug][0], 'title', lang) || slug;
const group = (slug) => { const g = Number(data[slug][0].group); return g >= 1 && g <= 3 ? g : 2; };
const paragraphs = (slide, lang) => { const v = pick(slide, 'text', lang); return v ? [].concat(v) : []; };
const path = (slug, lang) => `${LANGS[lang].prefix}/${slug === HOME ? '' : `${slug}/`}`;
const href = (slug, lang) => BASE + path(slug, lang);
const pageTitle = (slug, lang) => slug === HOME ? NAME : `${title(slug, lang)} — ${NAME}`;
const abs = (p) => /^https?:\/\//.test(p) ? p : `${SITE}/${p.replace(/^\/+/, '')}`;
const asset = (p) => /^https?:\/\//.test(p) ? p : `${BASE}/${String(p).replace(/^\/+/, '')}`;

function safeURL(url) {
  const u = typeof url === 'string' ? url.trim() : '';
  if (!u) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(u) || u.startsWith('//')) return u;
  return asset(u);
}

// las de 640 y 1200 las hace sharp (abajo) junto a la foto, como las pide el JS
function responsive(p) {
  const src = asset(p);
  const m = src.match(/^(.*)\.webp$/i);
  return m && made.has(p) ? { src, srcset: `${m[1]}-640.webp 640w, ${m[1]}-1200.webp 1200w, ${src} 2000w` } : { src, srcset: '' };
}

function description(slug, lang) {
  for (const slide of data[slug]) {
    const [first] = paragraphs(slide, lang);
    if (!first) continue;
    const text = first.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length <= 160 ? text : text.slice(0, 157).trimEnd() + '...';
  }
  const d = site.description;
  return (d && typeof d === 'object' ? d[LANGS[lang].code] || d.en : d) || '';
}

/* El HTML de los textos, como lo deja appendSanitizedInlineHTML: solo
   a/em/strong/b/i/br, y los enlaces se abren aparte. */
const INLINE = new Set(['a', 'em', 'strong', 'b', 'i', 'br']);
function inline(html) {
  return String(html || '').replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!INLINE.has(tag)) return '';
    if (close) return `</${tag}>`;
    if (tag !== 'a') return `<${tag}>`;
    const attr = (name) => attrs.match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`))?.slice(1).find((v) => v !== undefined);
    const href = safeURL(attr('href'));
    if (!href) return '';
    const tabs = (attr('data-open-tabs') || '').split('|').map(safeURL).filter(Boolean);
    return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer"${tabs.length ? ` data-open-tabs="${esc(tabs.join('|'))}"` : ''}>`;
  });
}

function link(l, lang) {
  const text = pick(l, 'text', lang);
  const url = safeURL(l?.url);
  const prefix = pick(l, 'prefix', lang);
  if (!url && !prefix && !text) return '';
  const spacer = l?.spacer_before ? ' class="slide-link-spacer-before"' : '';
  if (!url) return `<span${spacer}>${esc(prefix || text)}</span>`;
  const a = `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;
  if (!prefix) return spacer ? a.replace('<a ', `<a${spacer} `) : a;
  return `<span class="slide-link-compound${spacer ? ' slide-link-spacer-before' : ''}"><span class="slide-link-prefix">${esc(prefix)}</span>${a}</span>`;
}

/* ---------- la página: lo que pintan initProjectNav y renderSlide ---------- */

function nav(current, lang) {
  let prev = null;
  return slugs.map((slug) => {
    const gap = prev !== null && group(slug) !== prev ? '<div class="project-group-gap" aria-hidden="true"> </div>' : '';
    prev = group(slug);
    return `${gap}<a class="project-link${slug === current ? ' active' : ''}" href="${href(slug, lang)}">${esc(title(slug, lang))}</a>`;
  }).join('');
}

function thumbs(lang) {
  const others = slugs.filter((s) => s !== HOME);
  return {
    columns: Math.max(1, Math.ceil(others.length / 2)),
    html: others.filter((s) => data[s][0].image).map((slug) => {
      const r = responsive(data[slug][0].image);
      return `<a class="slide-thumb" href="${href(slug, lang)}" aria-label="${esc(title(slug, lang))}"><img src="${esc(r.src)}" srcset="${esc(r.srcset)}" sizes="(max-width: 768px) 44vw, 160px" loading="lazy" decoding="async" alt="${esc(title(slug, lang))}"></a>`;
    }).join(''),
  };
}

function main(slug, lang) {
  const slide = data[slug][0];
  const isHome = slug === HOME;
  const r = slide.image ? responsive(slide.image) : null;
  const img = r
    ? `<img id="slide-image"${slug === 'foc' ? ' class="foc-image-large"' : ''} src="${esc(r.src)}" srcset="${esc(r.srcset)}" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px" data-fullsrc="${esc(r.src)}" loading="eager" decoding="async" alt="${esc(title(slug, lang))}" style="display: block;">`
    : '<img id="slide-image" src="" alt="" style="display: none;">';
  const t = isHome ? thumbs(lang) : null;
  const text = paragraphs(slide, lang).map((p) => `<p>${inline(p)}</p>`).join('');
  const links = (slide.links || []).map((l) => link(l, lang)).filter(Boolean).join('');
  return `<main id="slide-container">
        <div class="slide-content${isHome ? ' about-layout' : ''}">
            <div class="slide-image-wrapper" style="display: ${r ? 'flex' : 'none'};">
                ${img}
            </div>
            <div class="slide-text-wrapper">
                <div id="slide-thumbs" class="slide-thumbs" style="${t ? `--thumb-columns: ${t.columns}; ` : ''}display: ${t?.html ? 'grid' : 'none'};">${t?.html || ''}</div>
                <div id="slide-text" style="display: ${text ? 'block' : 'none'};">${text}</div>
                <div id="slide-links" class="slide-links${isHome ? ' about-links' : ''}" style="display: ${links ? 'flex' : 'none'};">${links}</div>
            </div>
        </div>
    </main>`;
}

/* ---------- las fotos que hace el build, con sharp ---------- */

/* De cada foto: la de compartir (og:image), 1200×630 en JPG, la foto entera
   sobre el fondo de la web con aire (como almarbra); y las de 640 y 1200 de
   ancho para el srcset. En .cache/ (fuera de git), con nombre según la foto:
   solo se rehacen si cambia. Las hace sharp (npm ci; va igual en la Action y
   en Workers Builds); sin sharp se publica igual, se comparte la foto tal cual
   y sin tamaños pequeños, y se avisa. */
const OG_W = 1200;
const OG_H = 630;
const AIR = 48;
const BG = '#f5f5f0';
const SIZES = [640, 1200];
const made = new Set();   // las fotos con su og y sus tamaños en .cache/
// projects/god/img/1.webp → god-1
const nameOf = (src) => src.replace(/^projects\/([^/]+)\/img\/(.+)\.webp$/i, '$1-$2');
const cached = (dir, src, ext) => join(ROOT, '.cache', dir, nameOf(src) + ext);
const fresh = (file, src) => existsSync(file) && statSync(file).mtimeMs >= statSync(join(ROOT, src)).mtimeMs;

let sharp = null;
try { sharp = (await import('sharp')).default; } catch (err) {
  console.warn(`⚠ sense sharp (${err.code || err.message}): en compartir surt la foto tal qual, i sense mides petites. S'arregla amb: npm ci`);
}
for (const src of new Set(Object.values(data).flat().map((s) => s.image).filter(Boolean))) {
  if (!sharp) break;
  try {
    const file = join(ROOT, src);
    const og = cached('og', src, '.jpg');
    if (!fresh(og, src)) {
      mkdirSync(dirname(og), { recursive: true });
      await sharp(file).resize(OG_W - 2 * AIR, OG_H - 2 * AIR, { fit: 'contain', background: BG })
        .extend({ top: AIR, bottom: AIR, left: AIR, right: AIR, background: BG })
        .flatten({ background: BG }).jpeg({ quality: 85, mozjpeg: true }).toFile(og);
    }
    for (const w of SIZES) {
      const out = cached('sizes', src, `-${w}.webp`);
      if (fresh(out, src)) continue;
      mkdirSync(dirname(out), { recursive: true });
      await sharp(file).resize({ width: w, withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
    }
    made.add(src);
  } catch (err) {
    console.warn(`⚠ ${src}: sharp no la pot llegir (${err.message}); en compartir surt tal qual`);
  }
}

/* La og de la foto `src`, copiada a dist/og/; su ruta, o null (se comparte la foto). */
function og(src) {
  if (!made.has(src)) return null;
  const out = `og/${nameOf(src)}.jpg`;
  cpSync(cached('og', src, '.jpg'), join(OUT, out));
  return out;
}

/* ---------- la plantilla ---------- */

const template = readFileSync(join(ROOT, 'index.html'), 'utf8');

// cambia un trozo de la plantilla; si no lo encuentra, para (alguien ha tocado index.html)
function swap(html, find, replace) {
  if (!find.test(html)) fail(`no encuentro ${find} en index.html: el build lo necesita para escribir cada página.`);
  return html.replace(find, replace);
}
const setAttr = (html, id, attr, value) =>
  swap(html, new RegExp(`(<[^>]*\\bid="${id}"[^>]*\\b${attr}=")[^"]*(")`), (_, a, b) => `${a}${esc(value)}${b}`);

function page(slug, lang, { robots } = {}) {
  const L = LANGS[lang];
  const url = SITE + path(slug, lang);
  const desc = description(slug, lang);
  const image = data[slug][0].image || DEFAULT_IMAGE;
  const share = og(image);
  let html = template;
  html = swap(html, /<base href="[^"]*">/, `<base href="${BASE}/">`);
  // data-built: el JS sabe que no es la vista previa (js/core/data.js)
  html = swap(html, /<html lang="[^"]*">/, `<html lang="${L.code}" data-built>`);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(pageTitle(slug, lang))}</title>`);
  // en github.io, o sin dominio en site.json, la web es de pruebas: no se indexa
  robots ||= INDEX ? '' : 'noindex';
  if (robots) html = swap(html, /(<meta name="robots" content=")[^"]*(")/, `$1${robots}$2`);
  html = setAttr(html, 'meta-description', 'content', desc);
  html = setAttr(html, 'meta-canonical', 'href', url);
  html = setAttr(html, 'alt-ca', 'href', SITE + path(slug, 'cat'));
  html = setAttr(html, 'alt-en', 'href', SITE + path(slug, 'en'));
  html = setAttr(html, 'alt-x-default', 'href', SITE + path(slug, 'en'));
  html = setAttr(html, 'meta-og-locale', 'content', L.locale);
  html = swap(html, /(<meta property="og:locale:alternate" content=")[^"]*(")/, `$1${LANGS[lang === 'en' ? 'cat' : 'en'].locale}$2`);
  html = setAttr(html, 'meta-og-title', 'content', pageTitle(slug, lang));
  html = setAttr(html, 'meta-og-description', 'content', desc);
  html = setAttr(html, 'meta-og-url', 'content', url);
  html = setAttr(html, 'meta-og-image', 'content', abs(share || image));
  html = setAttr(html, 'meta-og-image-alt', 'content', slug === HOME ? NAME : title(slug, lang));
  if (share) html = swap(html, /(<meta id="meta-og-image-alt"[^>]*>)/, `<meta property="og:image:width" content="${OG_W}">\n    <meta property="og:image:height" content="${OG_H}">\n    <meta property="og:image:type" content="image/jpeg">\n    $1`);
  html = setAttr(html, 'meta-twitter-title', 'content', pageTitle(slug, lang));
  html = setAttr(html, 'meta-twitter-description', 'content', desc);
  html = setAttr(html, 'meta-twitter-image', 'content', abs(share || image));
  // el idioma activo en los botones
  html = html.replace(/class="(lang-btn(?:-mobile)?)(?: active)?" data-lang="([a-z]+)"/g,
    (_, cls, l) => `class="${cls}${l === lang ? ' active' : ''}" data-lang="${l}"`);
  html = swap(html, /<nav id="project-nav" class="sidebar-nav"><\/nav>/,
    () => `<nav id="project-nav" class="sidebar-nav">${nav(slug, lang)}</nav>`);
  html = swap(html, /<main id="slide-container">[\s\S]*?<\/main>/, () => main(slug, lang));
  return html;
}

function write(p, html) {
  const file = join(OUT, p, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// una dirección vieja que lleva a la nueva (GitHub Pages no hace 301)
const redirect = (to) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${NAME}</title>
<link rel="canonical" href="${SITE}${to}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${BASE}${to}">
</head><body><a href="${BASE}${to}">${SITE}${to}</a></body></html>
`;

/* ---------- escribir dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const f of STATIC) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
// las de 640 y 1200, junto a su foto (projects/god/img/1-640.webp)
for (const src of made) for (const w of SIZES) cpSync(cached('sizes', src, `-${w}.webp`), join(OUT, src.replace(/\.webp$/i, `-${w}.webp`)));

const urls = [];
for (const lang of Object.keys(LANGS)) {
  for (const slug of slugs) {
    write(path(slug, lang), page(slug, lang));
    urls.push(SITE + path(slug, lang));
  }
}
// GitHub Pages la sirve (con 404) en cualquier dirección que no existe; el JS enseña la portada
writeFileSync(join(OUT, '404.html'), page(HOME, 'en', { robots: 'noindex' }));

// las direcciones de antes del 2026-10-16: /en/god, /cat/god, /en, /cat
for (const [old, lang] of [['en', 'en'], ['cat', 'cat']]) {
  for (const slug of slugs) write(`/${old}/${slug === HOME ? '' : `${slug}/`}`, redirect(path(slug, lang)));
}

writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), INDEX ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');

console.log(`✓ dist/: ${urls.length} páginas (${slugs.length} × ${Object.keys(LANGS).length} idiomas)`);
