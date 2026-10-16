/* El build: data.json + index.html (la plantilla) -> dist/, la web tal cual
   se publica. `node build/build.mjs`

   Cada página es una dirección de verdad, con su contenido ya escrito, su
   title, su og:image y su canonical (antes era una sola página y el JS
   cambiaba la dirección; GitHub Pages las servía con su 404):

     /             about, en inglés       /ca/             about, en catalán
     /god/         un proyecto            /ca/god/

   Al cargar, el JS de siempre (app.js) vuelve a pintar lo mismo y la web
   funciona como antes: las flechas, los idiomas y los easter eggs no
   cambian de página, solo de dirección. Las direcciones viejas (/en/god,
   /cat/god, /cat) redirigen a las nuevas.

   Si algo está mal (una coma, una foto que no está), para y dice qué. */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'dist');
const SITE = 'https://maxazemar.com';
const NAME = 'Max Azemar';
const DEFAULT_DESCRIPTION = 'Portfolio of Max Azemar: art projects, research, and performative practices between art and life.';
const DEFAULT_IMAGE = 'img/1.webp';
const HOME = 'about';
// 'cat' es como lo llaman data.json y el JS; en la dirección y en hreflang, 'ca'
const LANGS = {
  en: { code: 'en', locale: 'en_US', prefix: '' },
  cat: { code: 'ca', locale: 'ca_ES', prefix: '/ca' },
};
// lo que se copia tal cual a dist/
const STATIC = ['style.css', 'app.js', 'js', 'data.json', 'data', 'img', 'CNAME', 'robots.txt'];

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

/* ---------- los datos ---------- */

let data;
try {
  data = JSON.parse(readFileSync(join(ROOT, 'data.json'), 'utf8'));
} catch (err) {
  fail(`data.json no se puede leer: ${err.message}\n  Casi siempre es una coma que falta o que sobra justo antes de esa línea.`);
}
const slugs = Object.keys(data);
if (slugs[0] !== HOME) fail(`el primer bloque de data.json tiene que ser "${HOME}": es la portada.`);
for (const slug of slugs) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`"${slug}": el nombre de un proyecto solo puede llevar minúsculas, números y guiones (sale en la dirección).`);
  if (['ca', 'cat', 'en', 'data', 'img', 'js', 'og'].includes(slug)) fail(`"${slug}" no puede ser el nombre de un proyecto: es una carpeta de la web.`);
  const slides = data[slug];
  if (!Array.isArray(slides) || !slides.length) fail(`"${slug}" tiene que ser una lista con al menos un bloque [ { … } ].`);
  if (!slides[0].title_en && !slides[0].title_cat) fail(`"${slug}" no tiene título (title_en o title_cat).`);
  for (const slide of slides) {
    if (slide.image && !existsSync(join(ROOT, slide.image))) fail(`"${slug}": la foto ${slide.image} no está.`);
  }
}

/* ---------- lo mismo que js/core/data.js, para escribirlo sin navegador ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (obj, key, lang) => obj?.[`${key}_${lang}`] || obj?.[`${key}_cat`] || obj?.[`${key}_en`] || obj?.[key] || '';
const title = (slug, lang) => pick(data[slug][0], 'title', lang) || slug;
const group = (slug) => { const g = Number(data[slug][0].group); return g >= 1 && g <= 3 ? g : 2; };
const paragraphs = (slide, lang) => { const v = pick(slide, 'text', lang); return v ? [].concat(v) : []; };
const path = (slug, lang) => `${LANGS[lang].prefix}/${slug === HOME ? '' : `${slug}/`}`;
const pageTitle = (slug, lang) => slug === HOME ? NAME : `${title(slug, lang)} — ${NAME}`;
const abs = (p) => /^https?:\/\//.test(p) ? p : `${SITE}/${p.replace(/^\/+/, '')}`;
const asset = (p) => /^https?:\/\//.test(p) ? p : `/${String(p).replace(/^\/+/, '')}`;

function safeURL(url) {
  const u = typeof url === 'string' ? url.trim() : '';
  if (!u) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(u) || u.startsWith('/')) return u;
  return asset(u);
}

function responsive(p) {
  const src = asset(p);
  const m = src.match(/^(.*)\.webp$/i);
  return m ? { src, srcset: `${m[1]}-640.webp 640w, ${m[1]}-1200.webp 1200w, ${src} 2000w` } : { src, srcset: '' };
}

function description(slug, lang) {
  for (const slide of data[slug]) {
    const [first] = paragraphs(slide, lang);
    if (!first) continue;
    const text = first.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length <= 160 ? text : text.slice(0, 157).trimEnd() + '...';
  }
  return DEFAULT_DESCRIPTION;
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
    return `${gap}<a class="project-link${slug === current ? ' active' : ''}" href="${path(slug, lang)}">${esc(title(slug, lang))}</a>`;
  }).join('');
}

function thumbs(lang) {
  const others = slugs.filter((s) => s !== HOME);
  return {
    columns: Math.max(1, Math.ceil(others.length / 2)),
    html: others.filter((s) => data[s][0].image).map((slug) => {
      const r = responsive(data[slug][0].image);
      return `<a class="slide-thumb" href="${path(slug, lang)}" aria-label="${esc(title(slug, lang))}"><img src="${esc(r.src)}" srcset="${esc(r.srcset)}" sizes="(max-width: 768px) 44vw, 160px" loading="lazy" decoding="async" alt="${esc(title(slug, lang))}"></a>`;
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

/* ---------- la imagen al compartir: 1200×630 en JPG (como almarbra) ---------- */

const OG_W = 1200;
const OG_H = 630;
const AIR = 48;
const FIT = `scale=${OG_W - 2 * AIR}:${OG_H - 2 * AIR}:force_original_aspect_ratio=decrease,pad=${OG_W}:${OG_H}:(ow-iw)/2:(oh-ih)/2:0xf5f5f0`;
let ffmpeg = true;

/* Hace (o saca de .cache/og/) la og:image de la foto `src` y la copia a
   dist/og/; devuelve su ruta, o null si no hay ffmpeg (se comparte la foto). */
function og(src) {
  const name = src.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
  const cached = join(ROOT, '.cache', 'og', `${name}.jpg`);
  let ok = existsSync(cached) && statSync(cached).mtimeMs >= statSync(join(ROOT, src)).mtimeMs;
  if (!ok && ffmpeg) {
    try {
      mkdirSync(dirname(cached), { recursive: true });
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(ROOT, src), '-vf', FIT, '-q:v', '3', cached]);
      ok = true;
    } catch {
      ffmpeg = false;
      console.warn('⚠ sin ffmpeg (brew install ffmpeg): al compartir sale la foto tal cual');
    }
  }
  if (!ok) return null;
  const out = `og/${name}.jpg`;
  cpSync(cached, join(OUT, out));
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
  html = swap(html, /<html lang="[^"]*">/, `<html lang="${L.code}">`);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(pageTitle(slug, lang))}</title>`);
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
<meta http-equiv="refresh" content="0; url=${to}">
</head><body><a href="${to}">${SITE}${to}</a></body></html>
`;

/* ---------- escribir dist/ ---------- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const f of STATIC) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });

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

console.log(`✓ dist/: ${urls.length} páginas (${slugs.length} × ${Object.keys(LANGS).length} idiomas)`);
