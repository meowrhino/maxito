import { state, SEO, ALLOWED_INLINE_TAGS } from './state.js';
import { stripHTMLTags, truncateText } from './helpers.js';

// === Data loading ===
export async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('error loading data.json');
    state.data = await res.json();
    state.projects = Object.keys(state.data);
    return true;
  } catch (err) {
    console.error('error loading data:', err);
    return false;
  }
}

// Get project title from the first slide's title_cat/title_en field
export function getProjectTitle(slug) {
  const slides = state.data[slug];
  if (!slides || !slides.length) return slug;
  const first = slides[0];
  const key = `title_${state.lang}`;
  return first[key] || first.title_cat || first.title_en || slug;
}

export function getProjectGroup(slug) {
  const slides = state.data[slug];
  if (!slides || !slides.length) return 2;
  const group = Number(slides[0].group);
  return group >= 1 && group <= 3 ? group : 2;
}

// Get text paragraphs (supports string or array)
export function getTextParagraphs(slide) {
  const key = `text_${state.lang}`;
  const val = slide[key] || slide.text_cat || slide.text_en || null;
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// Get link text with fallback
export function getLinkText(link) {
  const key = `text_${state.lang}`;
  return link[key] || link.text_cat || link.text_en || link.text || '';
}

export function getSafeLinkURL(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Allow absolute http(s), mailto and tel as-is
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;

  // If the link already starts with a root slash, keep it
  if (trimmed.startsWith('/')) return trimmed;

  // Otherwise treat it as a site-root relative asset and normalize
  return '/' + trimmed.replace(/^\/+/, '');
}

export function appendSanitizedInlineHTML(target, value) {
  const template = document.createElement('template');
  template.innerHTML = String(value || '');
  const fragment = document.createDocumentFragment();

  function sanitizeNode(node, parent) {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_INLINE_TAGS.has(tag)) {
      node.childNodes.forEach(child => sanitizeNode(child, parent));
      return;
    }

    if (tag === 'a') {
      const safeHref = getSafeLinkURL(node.getAttribute('href') || '');
      if (!safeHref) {
        node.childNodes.forEach(child => sanitizeNode(child, parent));
        return;
      }
      const a = document.createElement('a');
      a.href = safeHref;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const rawOpenTabs = node.getAttribute('data-open-tabs') || '';
      if (rawOpenTabs) {
        const safeExtraTabs = rawOpenTabs
          .split('|')
          .map(url => getSafeLinkURL(url))
          .filter(Boolean);
        if (safeExtraTabs.length) {
          a.dataset.openTabs = safeExtraTabs.join('|');
        }
      }
      node.childNodes.forEach(child => sanitizeNode(child, a));
      parent.appendChild(a);
      return;
    }

    const clean = document.createElement(tag);
    node.childNodes.forEach(child => sanitizeNode(child, clean));
    parent.appendChild(clean);
  }

  template.content.childNodes.forEach(node => sanitizeNode(node, fragment));
  target.appendChild(fragment);
}

export function createLinkElement(link) {
  const text = getLinkText(link);
  const safeURL = getSafeLinkURL(link?.url);
  const prefixKey = `prefix_${state.lang}`;
  const prefix = link?.[prefixKey] || link?.prefix_cat || link?.prefix_en || link?.prefix || '';
  const spacerBefore = Boolean(link?.spacer_before);

  if (!safeURL && !prefix && !text) return null;

  let node;

  if (safeURL) {
    const a = document.createElement('a');
    a.href = safeURL;
    a.textContent = text;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    if (prefix) {
      const wrap = document.createElement('span');
      wrap.className = 'slide-link-compound';
      const prefixSpan = document.createElement('span');
      prefixSpan.className = 'slide-link-prefix';
      prefixSpan.textContent = prefix;
      wrap.appendChild(prefixSpan);
      wrap.appendChild(a);
      node = wrap;
    } else {
      node = a;
    }
  } else {
    const span = document.createElement('span');
    span.textContent = prefix || text;
    node = span;
  }

  if (spacerBefore) {
    node.classList.add('slide-link-spacer-before');
  }

  return node;
}

export function getCurrentSlug() {
  return state.projects[state.currentProjectIndex] || '';
}

export function getProjectDescription(slug) {
  const slides = state.data[slug] || [];
  for (const slide of slides) {
    const [firstParagraph] = getTextParagraphs(slide);
    if (firstParagraph) return truncateText(stripHTMLTags(firstParagraph));
  }
  return SEO.defaultDescription;
}

export function buildPath(slug, lang = state.lang) {
  const safeLang = lang === 'cat' ? 'cat' : 'en';
  if (!slug || slug === 'about') return safeLang === 'en' ? '/' : `/${safeLang}`;
  const safeSlug = encodeURIComponent(slug);
  return `/${safeLang}/${safeSlug}`;
}

export function toAbsoluteURL(path) {
  if (!path) return `${SEO.baseUrl}/${SEO.defaultImage}`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${SEO.baseUrl}/${normalized}`;
}

// Resolve an asset path to an absolute path from the site root so
// relative paths still work when the SPA changes the browser pathname.
export function resolveAsset(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return '/' + String(path).replace(/^\/+/, '');
}

export function getResponsiveImageSources(path) {
  const original = resolveAsset(path);
  if (!original) {
    return { src: '', srcset: '', sizes: '', original: '' };
  }

  const match = original.match(/^(.*)\.webp$/i);
  if (!match) {
    return { src: original, srcset: '', sizes: '', original };
  }

  const base = match[1];
  const small = `${base}-640.webp`;
  const medium = `${base}-1200.webp`;
  return {
    src: original,
    srcset: `${small} 640w, ${medium} 1200w, ${original} 2000w`,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px',
    original
  };
}
