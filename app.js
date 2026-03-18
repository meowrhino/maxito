// === State ===
const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'en',
  isTransitioning: false
};

const SEO = {
  siteName: 'Max Azemar',
  baseUrl: 'https://maxazemar.com',
  defaultDescription: 'Portfolio of Max Azemar: art projects, research, and performative practices between art and life.',
  defaultImage: 'img/1.webp'
};

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const ALLOWED_INLINE_TAGS = new Set(['a', 'em', 'strong', 'b', 'i', 'br']);
const FOC_SHINE_GIF_SRC = 'data/eastereggs/fireworks.gif';
const FOC_BURNED_GIF_SRC = 'data/eastereggs/llama2.gif';
const GDE_PENCIL_CURSOR_SRC = 'data/eastereggs/Recurso 1.svg';
const ABOUT_FLIGHT_IMG_SRC = 'data/eastereggs/flight.jpg';
const ABOUT_METRO_IMG_SRC = 'data/eastereggs/metro.jpg';
const ABOUT_ARBORICULTURE_IMG_SRC = 'data/eastereggs/arboriculture.jpg';
const NCB_TATTOO_IMG_SRC = 'data/eastereggs/sagrada-familia-tattoo.jpg';
const CARAPILS_CURTAIN_IMG_SRC = 'data/eastereggs/cortina-optimized.jpg';
const CARAPILS_TARGET_SLUG = 'carapils';
const CARAPILS_OPEN_STEPS = [6, 12, 20, 30, 42, 56, 72, 88, 100];
const GDE_PAINT_TARGET_SLUG = 'gde';
const GDE_PIXEL_SIZE = 1;
const GOD_TARGET_SLUG = 'god';
const ABOUT_TARGET_SLUG = 'about';
const NCB_TARGET_SLUG = 'ncb';
const carapilsCurtainState = {
  docClickHandler: null
};
const aboutRevealState = {
  active: false
};

const ncbTattooState = {
  active: false
};

const godBlueState = {
  targets: [],
  menuAllTargets: [],
  textTargetCount: 0,
  revealOrder: [],
  revealedCount: 0,
  wordStep: 0,
  phase: 'words',
  imagePhaseTimeoutId: null
};
const burnSpreadState = {
  timeoutIds: []
};
const shineSpreadState = {
  timeoutIds: []
};
const ARBRE_STAMP_SOURCES = [
  'data/svg/trees/Recurso 3.svg',
  'data/svg/trees/Recurso 6.svg',
  'data/svg/trees/Recurso 7.svg',
  'data/svg/trees/Recurso 8.svg',
  'data/svg/trees/Recurso 9.svg',
  'data/svg/trees/Recurso 10.svg',
  'data/svg/trees/Recurso 11.svg',
  'data/svg/trees/Recurso 12.svg',
  'data/svg/trees/Recurso 13.svg',
  'data/svg/trees/Recurso 14.svg',
  'data/svg/trees/Recurso 15.svg',
  'data/svg/trees/Recurso 16.svg',
  'data/svg/trees/Recurso 17.svg',
  'data/svg/trees/Recurso 18.svg',
  'data/svg/trees/Recurso 19.svg',
  'data/svg/trees/Recurso 20.svg',
  'data/svg/trees/Recurso 21.svg',
  'data/svg/trees/Recurso 22.svg',
  'data/svg/trees/Recurso 23.svg',
  'data/svg/trees/Recurso 24.svg',
  'data/svg/trees/Recurso 25.svg',
  'data/svg/trees/Recurso 26.svg',
  'data/svg/trees/Recurso 27.svg',
  'data/svg/trees/Recurso 28.svg',
  'data/svg/trees/Recurso 29.svg'
];
const ARBRE_STAMP_TARGET_SLUG = 'arbre';

const arbreStampState = {
  active: false,
  startedAt: 0,
  timeoutId: null,
  layer: null,
  stampCount: 0,
  sourceIndex: 0
};

const gdePaintState = {
  active: false,
  layer: null,
  cursorEl: null,
  moveHandler: null,
  touchStartHandler: null,
  touchMoveHandler: null,
  autoDrawFrameId: null,
  autoX: null,
  autoY: null,
  autoVX: 0,
  autoVY: 0,
  lastX: null,
  lastY: null,
  drawnKeys: new Set()
};

// === DOM references ===
const el = {
  slideContainer: document.getElementById('slide-container'),
  projectNav: document.getElementById('project-nav'),
  slideImage: document.getElementById('slide-image'),
  slideText: document.getElementById('slide-text'),
  slideLinks: document.getElementById('slide-links'),
  slideThumbs: document.getElementById('slide-thumbs'),
  slideContent: document.querySelector('.slide-content'),
  // Desktop controls (sidebar)
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  langBtns: document.querySelectorAll('.lang-btn'),
  // Sidebar toggle (mobile expand)
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  // Mobile controls (footer)
  prevBtnMobile: document.getElementById('prev-btn-mobile'),
  nextBtnMobile: document.getElementById('next-btn-mobile'),
  langBtnsMobile: document.querySelectorAll('.lang-btn-mobile'),
  metaDescription: document.getElementById('meta-description'),
  metaCanonical: document.getElementById('meta-canonical'),
  altCa: document.getElementById('alt-ca'),
  altEn: document.getElementById('alt-en'),
  altXDefault: document.getElementById('alt-x-default'),
  metaOgLocale: document.getElementById('meta-og-locale'),
  metaOgTitle: document.getElementById('meta-og-title'),
  metaOgDescription: document.getElementById('meta-og-description'),
  metaOgUrl: document.getElementById('meta-og-url'),
  metaOgImage: document.getElementById('meta-og-image'),
  metaOgImageAlt: document.getElementById('meta-og-image-alt'),
  metaTwitterTitle: document.getElementById('meta-twitter-title'),
  metaTwitterDescription: document.getElementById('meta-twitter-description'),
  metaTwitterImage: document.getElementById('meta-twitter-image')
};

// === Data loading ===
async function loadData() {
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

// === Helpers ===
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get project title from the first slide's title_cat/title_en field
function getProjectTitle(slug) {
  const slides = state.data[slug];
  if (!slides || !slides.length) return slug;
  const first = slides[0];
  const key = `title_${state.lang}`;
  return first[key] || first.title_cat || first.title_en || slug;
}

function getProjectGroup(slug) {
  const slides = state.data[slug];
  if (!slides || !slides.length) return 2;
  const group = Number(slides[0].group);
  return group >= 1 && group <= 3 ? group : 2;
}

// Get text paragraphs (supports string or array)
function getTextParagraphs(slide) {
  const key = `text_${state.lang}`;
  const val = slide[key] || slide.text_cat || slide.text_en || null;
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// Get link text with fallback
function getLinkText(link) {
  const key = `text_${state.lang}`;
  return link[key] || link.text_cat || link.text_en || link.text || '';
}

function stripHTMLTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSafeLinkURL(url) {
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

function appendSanitizedInlineHTML(target, value) {
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

function createLinkElement(link) {
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

function getCurrentSlug() {
  return state.projects[state.currentProjectIndex] || '';
}

function enhanceFocShineTriggers(container, slug) {
  if (slug !== 'foc' || !container) return;

  const shinePattern = state.lang === 'cat' ? /\bbrilla\b/gi : /\bshine(?:s)?\b/gi;
  const burnedPattern = state.lang === 'cat' ? /\bcrema\b|\bcremat\b|\bcremada\b/gi : /\bburned\b/gi;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  // First pass: count total occurrences
  let totalBurnedOccurrences = 0;
  let totalShineOccurrences = 0;
  
  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest('a, .shine-trigger, .burned-trigger')) return;
    const original = node.textContent || '';
    if (!shinePattern.test(original) && !burnedPattern.test(original)) {
      shinePattern.lastIndex = 0;
      burnedPattern.lastIndex = 0;
      return;
    }
    shinePattern.lastIndex = 0;
    burnedPattern.lastIndex = 0;

    const combinedPattern = new RegExp(`${shinePattern.source}|${burnedPattern.source}`, 'gi');
    let match = combinedPattern.exec(original);
    while (match) {
      const matchedText = match[0];
      const normalized = matchedText.toLowerCase();
      const isBurnedWord = normalized === 'burned' || normalized === 'crema' || normalized === 'cremat' || normalized === 'cremada';
      const isShineWord = !isBurnedWord && shinePattern.test(matchedText);
      shinePattern.lastIndex = 0;

      if (isBurnedWord) {
        totalBurnedOccurrences += 1;
      } else if (isShineWord) {
        totalShineOccurrences += 1;
      }
      match = combinedPattern.exec(original);
    }
  });

  // Second pass: create triggers on last occurrences
  let burnedOccurrence = 0;
  let shineOccurrence = 0;

  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest('a, .shine-trigger, .burned-trigger')) return;
    const original = node.textContent || '';
    if (!shinePattern.test(original) && !burnedPattern.test(original)) {
      shinePattern.lastIndex = 0;
      burnedPattern.lastIndex = 0;
      return;
    }
    shinePattern.lastIndex = 0;
    burnedPattern.lastIndex = 0;

    const combinedPattern = new RegExp(`${shinePattern.source}|${burnedPattern.source}`, 'gi');

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = combinedPattern.exec(original);
    while (match) {
      const matchedText = match[0];
      const normalized = matchedText.toLowerCase();
      const isBurnedWord = normalized === 'burned' || normalized === 'crema' || normalized === 'cremat' || normalized === 'cremada';
      const isShineWord = !isBurnedWord && shinePattern.test(matchedText);
      shinePattern.lastIndex = 0;

      if (match.index > last) {
        frag.appendChild(document.createTextNode(original.slice(last, match.index)));
      }

      if (isBurnedWord) {
        burnedOccurrence += 1;
        if (burnedOccurrence === totalBurnedOccurrences) {
          const trigger = document.createElement('a');
          trigger.href = '#';
          trigger.className = 'burned-trigger';
          trigger.textContent = matchedText;
          trigger.setAttribute('aria-label', matchedText);
          frag.appendChild(trigger);
        } else {
          frag.appendChild(document.createTextNode(matchedText));
        }
      } else if (isShineWord) {
        shineOccurrence += 1;
        if (shineOccurrence === totalShineOccurrences) {
          const trigger = document.createElement('a');
          trigger.href = '#';
          trigger.className = 'shine-trigger';
          trigger.textContent = matchedText;
          trigger.setAttribute('aria-label', matchedText);
          frag.appendChild(trigger);
        } else {
          frag.appendChild(document.createTextNode(matchedText));
        }
      } else {
        frag.appendChild(document.createTextNode(matchedText));
      }

      last = match.index + match[0].length;
      match = combinedPattern.exec(original);
    }

    if (last < original.length) {
      frag.appendChild(document.createTextNode(original.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function enhanceAboutSpecificContextsTrigger(container, slug) {
  if (slug !== ABOUT_TARGET_SLUG || !container) return;

  const phrase = state.lang === 'cat' ? 'contextos específics' : 'specific contexts';
  const pattern = new RegExp(escapeRegExp(phrase), 'gi');
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach(textNode => {
    if (!textNode.parentElement || textNode.parentElement.closest('a, .about-context-trigger')) return;
    const original = textNode.textContent || '';
    if (!pattern.test(original)) {
      pattern.lastIndex = 0;
      return;
    }
    pattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = pattern.exec(original);

    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      if (start > last) {
        frag.appendChild(document.createTextNode(original.slice(last, start)));
      }

      const trigger = document.createElement('a');
      trigger.href = '#';
      trigger.className = 'about-context-trigger';
      trigger.textContent = match[0];
      trigger.setAttribute('aria-label', match[0]);
      frag.appendChild(trigger);

      last = end;
      match = pattern.exec(original);
    }

    if (last < original.length) {
      frag.appendChild(document.createTextNode(original.slice(last)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  });
}

function getAboutRevealMappings() {
  const lang = state.lang === 'cat' ? 'cat' : 'en';
  const localizedPath = (slug) => buildPath(slug, lang);

  if (lang === 'cat') {
    return [
      { phrase: 'Hola!', type: 'link', url: 'https://youtu.be/Z01MSGmzGSc?si=cK9n341RAZNngKc0&t=14' },
      { phrase: 'El meu currículum complet', type: 'link', url: '/data/CV.pdf' },
      { phrase: 'recerca artística', type: 'link', url: localizedPath('arbre') },
      { phrase: 'conferències performatives', type: 'link', url: localizedPath('foc') },
      { phrase: 'instal·lacions', type: 'link', url: localizedPath('gettingby') },
      { phrase: 'contextos específics', type: 'trigger' },
      { phrase: 'procés d’investigació extens en primera persona', type: 'link', url: 'https://en.wikipedia.org/wiki/Ethnography#Ethics' },
      { phrase: 'situacions anecdòtiques', type: 'link', url: localizedPath('corporate') },
      { phrase: 'l’absurd', type: 'link', url: 'https://open.spotify.com/episode/2uhvXPLjK4cJEdHTT8oifz?si=9EDRGvAQSxqEYfPphFz9mA' },
      { phrase: 'generar debats', type: 'link', url: 'https://www.sternberg-press.com/product/the-nightmare-of-participation-crossbench-praxis-as-a-mode-of-criticality/' },
      { phrase: 'manera entenedora', type: 'link', url: 'https://en.wikipedia.org/wiki/One-line_joke' },
      { phrase: 'l’art i la vida', type: 'link', url: 'https://monoskop.org/images/3/36/Kaprow_Allan_Essays_on_the_Blurring_of_Art_and_Life_with_Impurity_Experimental_Art_The_Meaning_of_Life_missing.pdf' },
      { phrase: 'equip de rem en llagut mediterrani', type: 'link', url: 'https://www.panteresgrogues.org/rem/' },
        { phrase: 'arboricultura urbana', type: 'image', image: 'arboriculture' },
      { phrase: 'auxiliar de vol', type: 'image', image: 'flight' },
      { phrase: 'estudiant d’arts', type: 'link', url: 'https://www.newschool.edu/parsons/mfa-fine-arts/' },
      { phrase: 'conductor de tren', type: 'image', image: 'metro' }
    ];
  }

  return [
    { phrase: 'Hello!', type: 'link', url: 'https://youtu.be/Z01MSGmzGSc?si=cK9n341RAZNngKc0&t=14' },
    { phrase: 'My full CV', type: 'link', url: '/data/CV.pdf' },
    { phrase: 'artistic research', type: 'link', url: localizedPath('arbre') },
    { phrase: 'performative lectures', type: 'link', url: localizedPath('foc') },
    { phrase: 'installations', type: 'link', url: localizedPath('gettingby') },
    { phrase: 'specific contexts', type: 'trigger' },
    { phrase: 'first-person research process', type: 'link', url: 'https://en.wikipedia.org/wiki/Ethnography#Ethics' },
    { phrase: 'anecdotal situations', type: 'link', url: localizedPath('corporate') },
    { phrase: 'absurdity', type: 'link', url: 'https://open.spotify.com/episode/2uhvXPLjK4cJEdHTT8oifz?si=9EDRGvAQSxqEYfPphFz9mA' },
    { phrase: 'generate debate', type: 'link', url: 'https://www.sternberg-press.com/product/the-nightmare-of-participation-crossbench-praxis-as-a-mode-of-criticality/' },
    { phrase: 'easy to understand', type: 'link', url: 'https://en.wikipedia.org/wiki/One-line_joke' },
    { phrase: 'art and life', type: 'link', url: 'https://monoskop.org/images/3/36/Kaprow_Allan_Essays_on_the_Blurring_of_Art_and_Life_with_Impurity_Experimental_Art_The_Meaning_of_Life_missing.pdf' },
    { phrase: 'rowing team', type: 'link', url: 'https://www.panteresgrogues.org/rem/' },
    { phrase: 'urban arboriculture', type: 'image', image: 'arboriculture' },
    { phrase: 'flight attendant', type: 'image', image: 'flight' },
    { phrase: 'arts student', type: 'link', url: 'https://www.newschool.edu/parsons/mfa-fine-arts/' },
    { phrase: 'train driver', type: 'image', image: 'metro' }
  ];
}

function replaceFirstPhraseWithNode(container, phrase, createNode) {
  const escaped = escapeRegExp(phrase);
  const regex = new RegExp(escaped, 'i');
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    if (!textNode.parentElement || textNode.parentElement.closest('a')) continue;
    const original = textNode.textContent || '';
    const match = original.match(regex);
    if (!match || match.index === undefined) continue;

    const start = match.index;
    const end = start + match[0].length;
    const frag = document.createDocumentFragment();

    if (start > 0) frag.appendChild(document.createTextNode(original.slice(0, start)));
    frag.appendChild(createNode(match[0]));
    if (end < original.length) frag.appendChild(document.createTextNode(original.slice(end)));

    textNode.parentNode.replaceChild(frag, textNode);
    return true;
  }

  return false;
}

function applyAboutRevealLinks(container, slug) {
  if (slug !== ABOUT_TARGET_SLUG || !container) return;

  const mappings = getAboutRevealMappings();

  mappings.forEach(mapping => {
    if (mapping.type === 'trigger') return;

    replaceFirstPhraseWithNode(container, mapping.phrase, (matchedText) => {
      const link = document.createElement('a');
      link.textContent = matchedText;

      if (mapping.type === 'image') {
        link.href = '#';
        link.className = 'about-image-trigger';
        link.dataset.aboutImage = mapping.image;
      } else {
        link.href = mapping.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      return link;
    });
  });
}

function spawnAboutPhoto(imageKey) {
  let src;
  if (imageKey === 'metro') {
    src = ABOUT_METRO_IMG_SRC;
  } else if (imageKey === 'arboriculture') {
    src = ABOUT_ARBORICULTURE_IMG_SRC;
  } else {
    src = ABOUT_FLIGHT_IMG_SRC;
  }
  document.querySelectorAll('.about-photo-pop').forEach(node => node.remove());

  const img = document.createElement('img');
  img.className = 'about-photo-pop';
  img.src = resolveAsset(src);
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');

  const pad = 28;
  const x = pad + Math.random() * Math.max(1, window.innerWidth - pad * 2);
  const y = pad + Math.random() * Math.max(1, window.innerHeight - pad * 2);
  const width = 180 + Math.random() * 150;

  img.style.left = `${x.toFixed(1)}px`;
  img.style.top = `${y.toFixed(1)}px`;
  img.style.width = `${width.toFixed(0)}px`;

  document.body.appendChild(img);
  window.setTimeout(() => img.remove(), 1800);
}

function spawnNcbTattooPhoto() {
  document.querySelectorAll('.ncb-tattoo-pop').forEach(node => node.remove());

  const img = document.createElement('img');
  img.className = 'ncb-tattoo-pop';
  img.src = resolveAsset(NCB_TATTOO_IMG_SRC);
  img.alt = 'Sagrada Família tattoo';

  const pad = 28;
  const x = pad + Math.random() * Math.max(1, window.innerWidth - pad * 2);
  const y = pad + Math.random() * Math.max(1, window.innerHeight - pad * 2);
  const width = 180 + Math.random() * 150;

  img.style.left = `${x.toFixed(1)}px`;
  img.style.top = `${y.toFixed(1)}px`;
  img.style.width = `${width.toFixed(0)}px`;

  document.body.appendChild(img);
  window.setTimeout(() => img.remove(), 1800);
}

function enhanceGdePaintTriggers(container, slug) {
  if (slug !== GDE_PAINT_TARGET_SLUG || !container) return;

  const pattern = /Grup d[’']Estudi/gi;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  for (const node of textNodes) {
    if (!node.parentElement || node.parentElement.closest('a, .gde-paint-trigger')) continue;
    const original = node.textContent || '';
    if (!pattern.test(original)) continue;
    pattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    const match = pattern.exec(original);
    if (!match) continue;

    if (match.index > last) {
      frag.appendChild(document.createTextNode(original.slice(last, match.index)));
    }

    const trigger = document.createElement('a');
    trigger.href = '#';
    trigger.className = 'gde-paint-trigger';
    trigger.textContent = match[0];
    trigger.setAttribute('aria-label', match[0]);
    frag.appendChild(trigger);

    last = match.index + match[0].length;

    if (last < original.length) {
      frag.appendChild(document.createTextNode(original.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);
    break;
  }
}

function enhanceNcbTattooTrigger(container, slug) {
  if (slug !== NCB_TARGET_SLUG || !container) return;

  const pattern = state.lang === 'cat' ? /Sagrada Família tatuada/ : /Sagrada Família tattooed/;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (!node.parentElement || node.parentElement.closest('a, .ncb-tattoo-trigger')) {
      node = walker.nextNode();
      continue;
    }

    const original = node.textContent || '';
    const match = original.match(pattern);
    if (!match || match.index === undefined) {
      node = walker.nextNode();
      continue;
    }

    const start = match.index;
    const end = start + match[0].length;
    const frag = document.createDocumentFragment();

    if (start > 0) frag.appendChild(document.createTextNode(original.slice(0, start)));

    const trigger = document.createElement('a');
    trigger.href = '#';
    trigger.className = 'ncb-tattoo-trigger';
    trigger.textContent = match[0];
    trigger.setAttribute('aria-label', match[0]);
    frag.appendChild(trigger);

    if (end < original.length) frag.appendChild(document.createTextNode(original.slice(end)));

    node.parentNode.replaceChild(frag, node);
    return;
  }
}

function enhanceCaraPilsPlayfulTrigger(container, slug) {
  if (slug !== CARAPILS_TARGET_SLUG || !container) return;

  const pattern = state.lang === 'cat' ? /\blúdic\b|\bludic\b/i : /\bplayful\b/i;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (!node.parentElement || node.parentElement.closest('a, .carapils-playful-trigger')) {
      node = walker.nextNode();
      continue;
    }

    const original = node.textContent || '';
    const match = original.match(pattern);
    if (!match || match.index === undefined) {
      node = walker.nextNode();
      continue;
    }

    const frag = document.createDocumentFragment();
    const start = match.index;
    const end = start + match[0].length;

    if (start > 0) frag.appendChild(document.createTextNode(original.slice(0, start)));

    const trigger = document.createElement('a');
    trigger.href = '#';
    trigger.className = 'carapils-playful-trigger';
    trigger.textContent = original.slice(start, end);
    trigger.setAttribute('aria-label', trigger.textContent);
    frag.appendChild(trigger);

    if (end < original.length) frag.appendChild(document.createTextNode(original.slice(end)));

    node.parentNode.replaceChild(frag, node);
    return;
  }
}

function resetGodBlueState() {
  godBlueState.targets.forEach(elm => {
    elm.classList.remove('god-blue-trigger', 'god-blue-menu');
  });
  godBlueState.targets = [];
  godBlueState.menuAllTargets = [];
  godBlueState.textTargetCount = 0;
  godBlueState.revealOrder = [];
  godBlueState.revealedCount = 0;
  godBlueState.wordStep = 0;
  godBlueState.phase = 'words';
  if (godBlueState.imagePhaseTimeoutId) {
    window.clearTimeout(godBlueState.imagePhaseTimeoutId);
    godBlueState.imagePhaseTimeoutId = null;
  }
  document.body.classList.remove('god-blue-complete', 'god-blue-image');
}

function applyGodBlueState() {
  const { targets, revealOrder, revealedCount, textTargetCount } = godBlueState;
  const activeSet = new Set(revealOrder.slice(0, revealedCount));
  targets.slice(0, textTargetCount).forEach((span, i) => {
    const isActive = activeSet.has(i);
    span.classList.toggle('god-blue-trigger', isActive);
  });
}

function revealNextGodBlueWord() {
  if (!godBlueState.targets.length) return;

  // Menu+lang+arrows all go blue at once, then immediately to image phase.
  if (godBlueState.phase === 'menu') {
    godBlueState.menuAllTargets.forEach(elm => elm.classList.add('god-blue-trigger'));
    godBlueState.phase = 'image';
    document.body.classList.add('god-blue-image');
    return;
  }

  if (godBlueState.phase === 'image') {
    godBlueState.phase = 'complete';
    document.body.classList.add('god-blue-complete');
    return;
  }

  if (godBlueState.phase === 'complete') {
    godBlueState.phase = 'words';
    godBlueState.wordStep = 1;
    godBlueState.revealedCount = Math.min(1, godBlueState.textTargetCount);
    document.body.classList.remove('god-blue-complete', 'god-blue-image');
    godBlueState.menuAllTargets.forEach(elm => elm.classList.remove('god-blue-trigger'));
    applyGodBlueState();
    return;
  }

  // phase === 'words' — 4 fixed steps:
  // 0 → first word (ambition/ambició)
  // 1 → second word (aspiration/aspiracionalitat)
  // 2 → half of all text words
  // 3 → all text words → next click triggers menu phase
  const { wordStep, textTargetCount } = godBlueState;
  if (wordStep === 0) {
    godBlueState.revealedCount = Math.min(1, textTargetCount);
  } else if (wordStep === 1) {
    godBlueState.revealedCount = Math.min(2, textTargetCount);
  } else if (wordStep === 2) {
    godBlueState.revealedCount = Math.ceil(textTargetCount / 2);
  } else {
    godBlueState.revealedCount = textTargetCount;
  }
  godBlueState.wordStep += 1;
  applyGodBlueState();

  if (godBlueState.revealedCount >= godBlueState.textTargetCount) {
    godBlueState.phase = 'menu';
  }
}

function enhanceGodBlueWords(container, slug) {
  resetGodBlueState();
  if (slug !== GOD_TARGET_SLUG || !container) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  const textTargets = [];
  const wordRegex = /[A-Za-zÀ-ÖØ-öø-ÿ0-9'’\-]+/g;

  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest('a, .shine-trigger, .gde-paint-trigger, .carapils-playful-trigger')) return;

    const text = node.textContent || '';
    if (!wordRegex.test(text)) {
      wordRegex.lastIndex = 0;
      return;
    }
    wordRegex.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = wordRegex.exec(text);
    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));

      const span = document.createElement('span');
      span.className = 'god-word';
      span.textContent = match[0];
      frag.appendChild(span);
      textTargets.push(span);

      last = end;
      match = wordRegex.exec(text);
    }

    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });

  const menuTargets = Array.from(el.projectNav.querySelectorAll('.project-link'));
  menuTargets.forEach(link => {
    link.classList.add('god-blue-menu');
  });

  const langTargets = [];
  const seenLangs = new Set();
  [...el.langBtns, ...el.langBtnsMobile].forEach(btn => {
    const key = (btn.dataset.lang || btn.textContent || '').toLowerCase();
    if (!key || seenLangs.has(key)) return;
    seenLangs.add(key);
    btn.classList.add('god-blue-menu');
    langTargets.push(btn);
  });

  const navArrowTargets = [el.prevBtn, el.nextBtn, el.prevBtnMobile, el.nextBtnMobile]
    .filter(Boolean);
  navArrowTargets.forEach(btn => {
    btn.classList.add('god-blue-menu');
  });

  const langSepTargets = Array.from(document.querySelectorAll('.lang-sep'));
  const menuAllTargets = [...menuTargets, ...langTargets, ...langSepTargets, ...navArrowTargets];
  const targets = [...textTargets, ...menuAllTargets];

  if (!targets.length) return;

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const normalizeGodStartWord = (value) => normalize(value)
    .replace(/^[a-z][’']/i, '');
  const firstWordCandidates = state.lang === 'cat'
    ? ['ambicio']
    : ['ambition'];
  const secondWordCandidates = state.lang === 'cat'
    ? ['aspiracionalitat']
    : ['aspiration'];

  const findFirstTextIndex = (candidates, excludeIndex = -1) => {
    for (const candidate of candidates) {
      const idx = textTargets.findIndex((span, i) => {
        if (i === excludeIndex) return false;
        return normalizeGodStartWord(span.textContent) === candidate;
      });
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const firstIndex = findFirstTextIndex(firstWordCandidates);
  if (firstIndex < 0) return;

  const secondIndex = findFirstTextIndex(secondWordCandidates, firstIndex);

  const excludedTextIndices = new Set([firstIndex]);
  if (secondIndex >= 0) excludedTextIndices.add(secondIndex);

  const textIndices = textTargets
    .map((_, i) => i)
    .filter(i => !excludedTextIndices.has(i));
  for (let i = textIndices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [textIndices[i], textIndices[j]] = [textIndices[j], textIndices[i]];
  }

  // Menu/lang/arrows reveal all at once — no individual indices needed.
  const revealOrder = secondIndex >= 0
    ? [firstIndex, secondIndex, ...textIndices]
    : [firstIndex, ...textIndices];

  godBlueState.targets = targets;
  godBlueState.menuAllTargets = menuAllTargets;
  godBlueState.textTargetCount = textTargets.length;
  godBlueState.revealOrder = revealOrder;
  godBlueState.revealedCount = 1;
  godBlueState.wordStep = 1;
  godBlueState.phase = 'words';
  applyGodBlueState();
}

function handleProjectNavClick(event) {
  if (getCurrentSlug() !== GOD_TARGET_SLUG) return;
  const trigger = event.target.closest('.project-link.god-blue-trigger');
  if (!trigger) return;
  event.preventDefault();
  event.stopPropagation();
  revealNextGodBlueWord();
}

function handleLangButtonClick(event) {
  const btn = event.currentTarget;
  if (
    getCurrentSlug() === GOD_TARGET_SLUG
    && btn
    && btn.classList.contains('god-blue-trigger')
  ) {
    event.preventDefault();
    event.stopPropagation();
    revealNextGodBlueWord();
    return;
  }

  if (btn) {
    changeLang(btn.dataset.lang);
  }
}

function handleGodCompleteResetClick(event) {
  if (getCurrentSlug() !== GOD_TARGET_SLUG) return;
  if (godBlueState.phase !== 'complete') return;

  event.preventDefault();
  event.stopPropagation();

  if (!state.isTransitioning) {
    renderSlide(false);
  }
}

function showCaraPilsCurtains() {
  const existing = document.getElementById('carapils-curtain-overlay');
  if (existing) {
    closeCaraPilsCurtainsFromCurrent(existing);
    return;
  }

  document.body.classList.add('carapils-curtain-active');

  const overlay = document.createElement('div');
  overlay.id = 'carapils-curtain-overlay';

  const left = document.createElement('div');
  left.className = 'carapils-curtain-panel left';
  left.style.backgroundImage = `url("${resolveAsset(CARAPILS_CURTAIN_IMG_SRC)}")`;

  const right = document.createElement('div');
  right.className = 'carapils-curtain-panel right';
  right.style.backgroundImage = `url("${resolveAsset(CARAPILS_CURTAIN_IMG_SRC)}")`;

  overlay.appendChild(left);
  overlay.appendChild(right);
  overlay.style.setProperty('--carapils-open', '0');
  overlay.dataset.openStep = '0';
  document.body.appendChild(overlay);

  // Restart animation reliably by forcing reflow before adding active class.
  // eslint-disable-next-line no-unused-expressions
  overlay.offsetHeight;
  overlay.classList.add('closing');

  const closeEndHandler = (event) => {
    if (!event.target.classList.contains('carapils-curtain-panel')) return;
    overlay.classList.remove('closing');
    overlay.style.setProperty('--carapils-open', '0');
    overlay.dataset.openStep = '0';
    overlay.removeEventListener('animationend', closeEndHandler);
  };
  overlay.addEventListener('animationend', closeEndHandler);

  if (carapilsCurtainState.docClickHandler) {
    document.removeEventListener('click', carapilsCurtainState.docClickHandler, true);
    carapilsCurtainState.docClickHandler = null;
  }

  carapilsCurtainState.docClickHandler = (event) => {
    const liveOverlay = document.getElementById('carapils-curtain-overlay');
    if (!liveOverlay || liveOverlay !== overlay) return;
    if (event.target.closest('.carapils-playful-trigger')) return;
    if (event.target.closest('#sidebar, #mobile-footer, .project-link, .nav-arrow, .lang-btn, .lang-btn-mobile')) return;
    stepOpenCaraPilsCurtains(liveOverlay);
  };

  // Delay one tick so the click that triggers "playful" does not immediately open a step.
  window.setTimeout(() => {
    if (carapilsCurtainState.docClickHandler) {
      document.addEventListener('click', carapilsCurtainState.docClickHandler, true);
    }
  }, 0);
}

function stepOpenCaraPilsCurtains(overlay) {
  if (!overlay) return;
  if (overlay.classList.contains('closing')) {
    overlay.classList.remove('closing');
    overlay.style.setProperty('--carapils-open', '0');
    overlay.dataset.openStep = '0';
    return;
  }

  const currentStep = Number(overlay.dataset.openStep || '0');
  const stepJump = Math.random() < 0.35 ? 2 : 1;
  const nextStep = Math.min(currentStep + stepJump, CARAPILS_OPEN_STEPS.length);
  overlay.dataset.openStep = String(nextStep);

  const openPct = CARAPILS_OPEN_STEPS[nextStep - 1] || 100;
  const stepMs = 220 + Math.floor(Math.random() * 180);
  overlay.style.setProperty('--carapils-step-ms', `${stepMs}ms`);
  overlay.style.setProperty('--carapils-open', String(openPct));

  if (openPct >= 100) {
    overlay.style.pointerEvents = 'none';
  }
}

function closeCaraPilsCurtainsFromCurrent(overlay) {
  if (!overlay || overlay.classList.contains('closing') || overlay.dataset.reclosing === '1') return;

  overlay.dataset.reclosing = '1';
  overlay.style.pointerEvents = 'auto';

  let openPct = Number(overlay.style.getPropertyValue('--carapils-open') || '0');
  if (!Number.isFinite(openPct)) openPct = 0;

  if (openPct <= 0) {
    overlay.dataset.openStep = '0';
    overlay.dataset.reclosing = '0';
    return;
  }

  const tick = () => {
    if (!document.body.contains(overlay)) return;

    const pull = 3 + Math.floor(Math.random() * 9); // smaller, hand-like pulls
    const pause = 420 + Math.floor(Math.random() * 760); // longer pauses between pulls
    const stepMs = 420 + Math.floor(Math.random() * 420); // slower pull movement

    openPct = Math.max(0, openPct - pull);
    overlay.style.setProperty('--carapils-step-ms', `${stepMs}ms`);
    overlay.style.setProperty('--carapils-open', String(openPct));

    if (openPct <= 0) {
      overlay.dataset.openStep = '0';
      overlay.dataset.reclosing = '0';
      return;
    }

    window.setTimeout(tick, pause);
  };

  const initialPause = 520 + Math.floor(Math.random() * 620);
  window.setTimeout(tick, initialPause);
}

function teardownCaraPilsCurtains() {
  if (carapilsCurtainState.docClickHandler) {
    document.removeEventListener('click', carapilsCurtainState.docClickHandler, true);
    carapilsCurtainState.docClickHandler = null;
  }

  const overlay = document.getElementById('carapils-curtain-overlay');
  if (overlay) overlay.remove();
  document.body.classList.remove('carapils-curtain-active');
}

function syncCaraPilsCurtains(slug) {
  if (slug !== CARAPILS_TARGET_SLUG) {
    teardownCaraPilsCurtains();
  }
}

function ensureGdePaintLayer() {
  if (gdePaintState.layer && document.body.contains(gdePaintState.layer)) {
    return gdePaintState.layer;
  }
  let layer = document.getElementById('gde-paint-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'gde-paint-layer';
    document.body.appendChild(layer);
  }
  gdePaintState.layer = layer;
  return layer;
}

function ensureGdeCursorElement() {
  if (gdePaintState.cursorEl && document.body.contains(gdePaintState.cursorEl)) {
    return gdePaintState.cursorEl;
  }

  let cursor = document.getElementById('gde-pencil-cursor');
  if (!cursor) {
    cursor = document.createElement('img');
    cursor.id = 'gde-pencil-cursor';
    cursor.alt = '';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
  }

  cursor.src = resolveAsset(GDE_PENCIL_CURSOR_SRC);
  gdePaintState.cursorEl = cursor;
  return cursor;
}

function drawGdePixel(clientX, clientY) {
  const layer = ensureGdePaintLayer();
  const gx = Math.floor(clientX / GDE_PIXEL_SIZE) * GDE_PIXEL_SIZE;
  const gy = Math.floor(clientY / GDE_PIXEL_SIZE) * GDE_PIXEL_SIZE;
  const key = `${gx},${gy}`;
  if (gdePaintState.drawnKeys.has(key)) return;

  gdePaintState.drawnKeys.add(key);
  const px = document.createElement('div');
  px.className = 'gde-paint-pixel';
  px.style.left = `${gx}px`;
  px.style.top = `${gy}px`;
  layer.appendChild(px);
}

function drawGdeLine(x0, y0, x1, y1) {
  const gx0 = Math.floor(x0 / GDE_PIXEL_SIZE);
  const gy0 = Math.floor(y0 / GDE_PIXEL_SIZE);
  const gx1 = Math.floor(x1 / GDE_PIXEL_SIZE);
  const gy1 = Math.floor(y1 / GDE_PIXEL_SIZE);

  let x = gx0;
  let y = gy0;
  const dx = Math.abs(gx1 - gx0);
  const dy = Math.abs(gy1 - gy0);
  const sx = gx0 < gx1 ? 1 : -1;
  const sy = gy0 < gy1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    drawGdePixel(x * GDE_PIXEL_SIZE, y * GDE_PIXEL_SIZE);
    if (x === gx1 && y === gy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function clearGdePainting() {
  const layer = ensureGdePaintLayer();
  layer.innerHTML = '';
  gdePaintState.drawnKeys.clear();
  gdePaintState.lastX = null;
  gdePaintState.lastY = null;
}

function updateGdeDrawPoint(clientX, clientY, cursorEl) {
  cursorEl.style.left = `${clientX}px`;
  cursorEl.style.top = `${clientY}px`;
  if (gdePaintState.lastX === null || gdePaintState.lastY === null) {
    drawGdePixel(clientX, clientY);
  } else {
    drawGdeLine(gdePaintState.lastX, gdePaintState.lastY, clientX, clientY);
  }
  gdePaintState.lastX = clientX;
  gdePaintState.lastY = clientY;
}

function startGdePaintMode() {
  if (gdePaintState.active) return;
  gdePaintState.active = true;
  document.body.classList.add('gde-paint-mode');
  ensureGdePaintLayer();
  const cursorEl = ensureGdeCursorElement();
  cursorEl.style.display = 'block';
  gdePaintState.moveHandler = (event) => {
    updateGdeDrawPoint(event.clientX, event.clientY, cursorEl);
  };

  gdePaintState.touchStartHandler = (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    updateGdeDrawPoint(touch.clientX, touch.clientY, cursorEl);
  };

  gdePaintState.touchMoveHandler = (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    updateGdeDrawPoint(touch.clientX, touch.clientY, cursorEl);
  };

  document.addEventListener('mousemove', gdePaintState.moveHandler);
  document.addEventListener('touchstart', gdePaintState.touchStartHandler, { passive: false });
  document.addEventListener('touchmove', gdePaintState.touchMoveHandler, { passive: false });
}

function stopGdePaintMode(clear = true) {
  gdePaintState.active = false;
  if (gdePaintState.moveHandler) {
    document.removeEventListener('mousemove', gdePaintState.moveHandler);
    gdePaintState.moveHandler = null;
  }
  if (gdePaintState.touchStartHandler) {
    document.removeEventListener('touchstart', gdePaintState.touchStartHandler);
    gdePaintState.touchStartHandler = null;
  }
  if (gdePaintState.touchMoveHandler) {
    document.removeEventListener('touchmove', gdePaintState.touchMoveHandler);
    gdePaintState.touchMoveHandler = null;
  }
  if (gdePaintState.autoDrawFrameId) {
    window.cancelAnimationFrame(gdePaintState.autoDrawFrameId);
    gdePaintState.autoDrawFrameId = null;
  }
  gdePaintState.autoX = null;
  gdePaintState.autoY = null;
  gdePaintState.autoVX = 0;
  gdePaintState.autoVY = 0;
  document.body.classList.remove('gde-paint-mode');
  if (gdePaintState.cursorEl) {
    gdePaintState.cursorEl.style.display = 'none';
  }
  if (clear) clearGdePainting();
}

function syncGdePaintMode(slug) {
  if (slug !== GDE_PAINT_TARGET_SLUG) {
    stopGdePaintMode(true);
  }
}

function enhanceGodOthersLink(container, slug) {
  if (slug !== GOD_TARGET_SLUG || !container) return;
  const phrase = state.lang === 'cat' ? 'altres coses' : 'other things';
  const pdfUrl = '/data/top%2010%20slides%20web%20provisional.pdf';

  replaceFirstPhraseWithNode(container, phrase, (matchedText) => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.className = 'god-others-link';
    a.textContent = matchedText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  });
}

function showShineGifNearTrigger(trigger, gifSrc = FOC_SHINE_GIF_SRC) {
  shineSpreadState.timeoutIds.forEach(id => window.clearTimeout(id));
  shineSpreadState.timeoutIds = [];
  document.querySelectorAll('.shine-pop.shine-pop-floating:not(.burned-fire-pop)').forEach(node => node.remove());
  const edgeBleed = 140;

  const spawn = (x, y, size, duration) => {
    const img = document.createElement('img');
    img.className = 'shine-pop shine-pop-floating';
    img.src = resolveAsset(gifSrc);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.left = `${x.toFixed(1)}px`;
    img.style.top = `${y.toFixed(1)}px`;
    img.style.width = `${size.toFixed(0)}px`;
    img.style.height = `${size.toFixed(0)}px`;
    img.style.animationDuration = `${duration}ms`;
    document.body.appendChild(img);
    const removeId = window.setTimeout(() => img.remove(), duration + 40);
    shineSpreadState.timeoutIds.push(removeId);
  };

  const rect = trigger.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Main bigger gif near the clicked word.
  spawn(centerX, centerY - 70, 150, 1300);

  // Spread shine across the viewport — lightweight (3 waves).
  const waveCount = 3;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

  for (let wave = 0; wave < waveCount; wave += 1) {
    const delay = wave * 220;
    const count = Math.min(4 + wave * 3, 12);
    const radiusBase = (maxRadius * (wave + 1)) / waveCount;
    const globalCount = 4 + wave * 2;

    const waveId = window.setTimeout(() => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(0, radiusBase + (Math.random() - 0.5) * 150);
        const x = Math.min(window.innerWidth + edgeBleed, Math.max(-edgeBleed, centerX + Math.cos(angle) * radius));
        const y = Math.min(window.innerHeight + edgeBleed, Math.max(-edgeBleed, centerY + Math.sin(angle) * radius));
        const size = 110 + Math.random() * 60;
        const duration = 1000 + Math.random() * 800;
        spawn(x, y, size, duration);
      }

      for (let i = 0; i < globalCount; i += 1) {
        const x = -edgeBleed + Math.random() * Math.max(1, window.innerWidth + edgeBleed * 2);
        const y = -edgeBleed + Math.random() * Math.max(1, window.innerHeight + edgeBleed * 2);
        const size = 100 + Math.random() * 70;
        const duration = 900 + Math.random() * 800;
        spawn(x, y, size, duration);
      }
    }, delay);
    shineSpreadState.timeoutIds.push(waveId);
  }
}

function showBurnedFireSpread() {
  burnSpreadState.timeoutIds.forEach(id => window.clearTimeout(id));
  burnSpreadState.timeoutIds = [];
  document.querySelectorAll('.burned-fire-pop').forEach(node => node.remove());
  const edgeBleed = 140;

  const spawn = (x, y, size, duration) => {
    const img = document.createElement('img');
    img.className = 'shine-pop shine-pop-floating burned-fire-pop';
    img.src = resolveAsset(FOC_BURNED_GIF_SRC);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.left = `${x.toFixed(1)}px`;
    img.style.top = `${y.toFixed(1)}px`;
    img.style.width = `${size.toFixed(0)}px`;
    img.style.height = `${size.toFixed(0)}px`;
    img.style.animationDuration = `${duration}ms`;
    document.body.appendChild(img);
    const removeId = window.setTimeout(() => img.remove(), duration + 40);
    burnSpreadState.timeoutIds.push(removeId);
  };

  const startX = 64;
  const startY = window.innerHeight - 64;
  const waveCount = 4;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

  for (let wave = 0; wave < waveCount; wave += 1) {
    const delay = wave * 300;
    const count = Math.min(3 + wave * 3, 12);
    const radiusBase = (maxRadius * (wave + 1)) / waveCount;
    const progress = (wave + 1) / waveCount;
    const globalCount = Math.floor(4 + progress * 8);

    const waveId = window.setTimeout(() => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(0, radiusBase + (Math.random() - 0.5) * 160);
        const x = Math.min(window.innerWidth + edgeBleed, Math.max(-edgeBleed, startX + Math.cos(angle) * radius));
        const y = Math.min(window.innerHeight + edgeBleed, Math.max(-edgeBleed, startY + Math.sin(angle) * radius));
        const size = 120 + Math.random() * 80;
        const duration = 1600 + Math.random() * 1200;
        spawn(x, y, size, duration);
      }

      for (let i = 0; i < globalCount; i += 1) {
        const x = -edgeBleed + Math.random() * Math.max(1, window.innerWidth + edgeBleed * 2);
        const y = -edgeBleed + Math.random() * Math.max(1, window.innerHeight + edgeBleed * 2);
        const size = 100 + Math.random() * 95;
        const duration = 1500 + Math.random() * 1300;
        spawn(x, y, size, duration);
      }
    }, delay);
    burnSpreadState.timeoutIds.push(waveId);
  }

}

function handleSlideTextClick(event) {
  const multiTabsAnchor = event.target.closest('a[data-open-tabs]');
  if (multiTabsAnchor) {
    const extraTabs = (multiTabsAnchor.dataset.openTabs || '')
      .split('|')
      .map(url => getSafeLinkURL(url))
      .filter(Boolean);
    if (extraTabs.length) {
      const uniqueExtras = [...new Set(extraTabs)];
      uniqueExtras.forEach(url => window.open(url, '_blank', 'noopener,noreferrer'));
      // Do not prevent default: browser opens href as the primary tab.
      return;
    }
  }

  const aboutContextTrigger = event.target.closest('.about-context-trigger');
  if (aboutContextTrigger) {
    if (getCurrentSlug() !== ABOUT_TARGET_SLUG) return;
    event.preventDefault();
    aboutRevealState.active = !aboutRevealState.active;
    renderSlide(false);
    return;
  }

  const aboutImageTrigger = event.target.closest('.about-image-trigger');
  if (aboutImageTrigger) {
    if (getCurrentSlug() !== ABOUT_TARGET_SLUG) return;
    event.preventDefault();
    spawnAboutPhoto(aboutImageTrigger.dataset.aboutImage || 'flight');
    return;
  }

  const godTrigger = event.target.closest('.god-blue-trigger');
  if (godTrigger) {
    if (getCurrentSlug() !== GOD_TARGET_SLUG) return;
    event.preventDefault();
    revealNextGodBlueWord();
    return;
  }

  const shineTrigger = event.target.closest('.shine-trigger');
  if (shineTrigger) {
    if (getCurrentSlug() !== 'foc') return;
    event.preventDefault();
    showShineGifNearTrigger(shineTrigger);
    return;
  }

  const burnedTrigger = event.target.closest('.burned-trigger');
  if (burnedTrigger) {
    if (getCurrentSlug() !== 'foc') return;
    event.preventDefault();
    showBurnedFireSpread();
    return;
  }

  const paintTrigger = event.target.closest('.gde-paint-trigger');
  if (paintTrigger) {
    if (getCurrentSlug() !== GDE_PAINT_TARGET_SLUG) return;
    event.preventDefault();
    startGdePaintMode();
    return;
  }

  const tattooTrigger = event.target.closest('.ncb-tattoo-trigger');
  if (tattooTrigger) {
    if (getCurrentSlug() !== NCB_TARGET_SLUG) return;
    event.preventDefault();
    spawnNcbTattooPhoto();
    return;
  }

  const playfulTrigger = event.target.closest('.carapils-playful-trigger');
  if (playfulTrigger) {
    if (getCurrentSlug() !== CARAPILS_TARGET_SLUG) return;
    event.preventDefault();
    showCaraPilsCurtains();
  }
}

function truncateText(text, maxLength = 160) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength - 3).trimEnd() + '...';
}

function getProjectDescription(slug) {
  const slides = state.data[slug] || [];
  for (const slide of slides) {
    const [firstParagraph] = getTextParagraphs(slide);
    if (firstParagraph) return truncateText(stripHTMLTags(firstParagraph));
  }
  return SEO.defaultDescription;
}

function buildQueryString(slug, lang = state.lang) {
  const params = new URLSearchParams();
  if (slug && slug !== 'about') params.set('slug', slug);
  if (lang === 'cat') params.set('lang', 'cat');
  return params.toString();
}

function buildPath(slug, lang = state.lang) {
  const safeLang = lang === 'cat' ? 'cat' : 'en';
  if (!slug || slug === 'about') return `/${safeLang}`;
  const safeSlug = encodeURIComponent(slug);
  return `/${safeLang}/${safeSlug}`;
}

function toAbsoluteURL(path) {
  if (!path) return `${SEO.baseUrl}/${SEO.defaultImage}`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${SEO.baseUrl}/${normalized}`;
}

// Resolve an asset path to an absolute path from the site root so
// relative paths still work when the SPA changes the browser pathname.
function resolveAsset(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return '/' + String(path).replace(/^\/+/, '');
}

function getResponsiveImageSources(path) {
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

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function ensureArbreStampLayer() {
  if (arbreStampState.layer && document.body.contains(arbreStampState.layer)) {
    return arbreStampState.layer;
  }
  let layer = document.getElementById('tree-stamp-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'tree-stamp-layer';
    document.body.appendChild(layer);
  }
  arbreStampState.layer = layer;
  return layer;
}

function clearArbreStamps() {
  const layer = ensureArbreStampLayer();
  layer.innerHTML = '';
  arbreStampState.stampCount = 0;
  arbreStampState.sourceIndex = 0;
}

function getArbreStampDelayMs(elapsedMs) {
  const rampMs = 56000;
  const startMs = 3000;
  const endMs = 20;
  const progress = Math.min(1, Math.max(0, elapsedMs / rampMs));
  const expoProgress = (Math.exp(5.8 * progress) - 1) / (Math.exp(5.8) - 1);
  return startMs + (endMs - startMs) * expoProgress;
}

function spawnArbreStamp() {
  const layer = ensureArbreStampLayer();
  const stamp = document.createElement('img');

  stamp.className = 'tree-stamp';
  stamp.src = resolveAsset(ARBRE_STAMP_SOURCES[arbreStampState.sourceIndex % ARBRE_STAMP_SOURCES.length]);
  arbreStampState.sourceIndex += 1;
  stamp.alt = '';
  stamp.setAttribute('aria-hidden', 'true');

  const left = Math.random() * window.innerWidth;
  const top = Math.random() * window.innerHeight;
  const hue = 105;

  stamp.style.left = `${left.toFixed(1)}px`;
  stamp.style.top = `${top.toFixed(1)}px`;
  stamp.style.transform = 'translate(-50%, -50%)';
  stamp.style.setProperty('--stamp-hue', `${hue.toFixed(1)}deg`);
  stamp.style.opacity = '1';

  layer.appendChild(stamp);
  arbreStampState.stampCount += 1;
}

function scheduleNextArbreStamp() {
  if (!arbreStampState.active) return;

  const elapsedMs = performance.now() - arbreStampState.startedAt;
  const delayMs = getArbreStampDelayMs(elapsedMs);

  arbreStampState.timeoutId = window.setTimeout(() => {
    spawnArbreStamp();
    scheduleNextArbreStamp();
  }, delayMs);
}

const FORAT_SHAPE_D = 'M65.5,130.85l-2.4-3.15c-.17-.23-5.11-2.25-5.34-1.52l-.61,1.96-.61,1.95c-.55,1.79,3.95-.57,5.2,6.14-2.28.77-4.39.42-5.52-1.91l-3.12,1.06c-.49.17-1.29,1.2-1.79,1.21-1.46.05-2.52-3.37-2.8-5.62l-4.11.93-4.72-.99.27-3.17-2.78-2.58c-.24-.22-.72-1.13-.94-.98l-1.61,1.1-3.07-5.33c-.26,2.57-.26,3.75-1.77,5.06-.66.57-1.79,1.04-2.84,1.22l-.98-3.62c-.06-.41.27-1.53-.13-1.48l-2.26.24c-1.46.16-3.92-2.31-3.97-4.04-.01-.4,1.21-.94,1.45-.64l1.22,1.59c1.78-1,2-3.27,1.27-5.66l-5.14-.75c-.37-.05-1.58.41-1.69.06-.84-2.75,2.81-.55,3.13-5.13.15-2.08,3-1.72,4.69-1.85-.4-.84-.94-2.19-.56-2.71s2.04-.3,2.65,0c1.57.76,3.36,1.62,2.35,3.6-.76,1.49-2.77,2.34-4.54,2.96-1.24,3.48,4.77,1.36,6.4,3.27.93.17,5.35-4.47,5.27-5.99l-2.67-1.38c-.77-.4-1.75-1.94-1.04-2.34l3.81-2.18c-2.39-1.56-3.61-1.86-6.36-2.8l1.76-1.39-1.83-3.14-3.22,2.73-2.88-1.54,1.23-2.85c-1.78-.86-3.57-2.08-4.15-3.5.32-.61,1.2-1.74.86-2.1s-2.05-1-2.47-.75l-6.34,3.71c-1.67-.97-3.78-1.48-5.07-.67.24,1.06.34,2.27.11,3.08l1.21.84c.25.18.17.96.29,1.27,1.83.65,5.5,3.96,4.06,4.82l-1.47.87c-.74.43-2.38,1.08-2.66.91l-.46-2.68-3.86-.48.58-3.82c-3.3-1.14-1.77,5.2-5.25,2.69-.29-2.72-.43-7.88.11-10.71.11-.56,1.66-1.65,1.28-2.07-.49-.55-1.14-1.24-.96-1.55l1.06-1.87-1.65-1.04v-5.8s2.32,1.49,2.32,1.49c.38-1.72.51-2.9.89-3.49.72-1.1,4.71-1.18,4.85-.58.58,2.54-3.65,2.96-3.33,7.93l-2.58-.63c.11-.2-.79.78-.53.97l1.55,1.13,3.9,2.84.31,2.7,6.78-.73-3.11-4.22.95-1.35c.63-.89-2.11-2.18.05-4.47.74-.78,1.36-1.91,1.29-2.91-.06-.84-1.19-1.8-1.97-2.59l-1.71-1.72-.82,1.61c-.21.41-1.8.58-1.84.12l-.23-2.41c2.96-1.24,8.04,2.03,8.63-2.89.23-1.93,2.03-3.18,2.52-4.53l1.46-4.01c2.02-5.56,1.86-5.64,3.44-10.6l-4.97-.78,1.2-4.22c1.8-.76,1.45-2.11,1.88-3.64,1.18-4.24,3.21-8.43,2.57-13.17l-3.08-.72c-.92-.22-1.38-2.61-1.36-3.51l3.45.15.95,1.43,1.93-1.64c2.87,2.84,5.26,1.3,6.02,2.66.24.42.37,1.75.62,2.28.99,2.11,3.7-.13,5.01-.88,1.12-.64,4.47-.13,4.01-2.61-.18-.97-.7-2.18.17-3.3,1.72-2.21,4.37-3.71,6.3-3.55,1.5.13,3.13,6.38,3.58,8.25.21.9,2.28.76,3.26.23.85-.46,1.32-2.29.81-3.2l-2.11-3.73,4.51-1.76,1.29-3.56c-1.88-3.97-.2-4.69-1.81-6.34l2.17-1.2c3.82.47,7.23-2.32,7.82-.74.81,2.16-1.99,3.69-2.98,4.85-1.14,1.34,2.02,2.56,2.67,5.16l4.61,1.56,1.25-4.58c-2.97-.91-4.58-2.33-4.56-5.34,5.85-1.24,3.7,4.41,8.86-.03.68-.58,2.32.56,2.62,1.44l1.16,3.43c3.13-.45,5.47-.41,8.14.3l-.27,2.99,2.8,2.76,2.72.7,2.16,3.28c.07-2.9,1.35-4.45,3.43-5.22,1.03-.39,2.34,3.06,1.95,5.22,2.35-1.87,5.71.62,6.14,2.56.1.44-.73,1.27-1.02,1.12l-1.86-.97c-1.32.32-1.84,3.84-.44,4.6,1.47.8,3.96.85,5.54.7,1.44,3.39-1.33-.73-2.62,5.42-.23,1.1-3.19,1.25-4.35,1.36.46.8.98,2.3.45,2.74-1.4.3-3.7-.56-4.57-1.57s.26-2.92,1.18-3.43l4.4-2.41c1.5-.45-11.07-2.11-7.29-2.16-.31,0-1.09.44-1.31.67l-2.92,3.05c-.29.3-.66,1.51-.49,1.86.34.69,4.96,2.45,3.33,3.45l-3.5,2.15c1.97,1.62,3.24,2,5.66,2.62l-1.59,1.4,1.82,2.63,2.39-1.71c.57-.41,2.08.37,2.83.74l-.77,3.13c1.22.42,2.46.78,3,1.39.65.74.5,2.31.33,3.63.15.44,2.1.93,2.72.52l5.05-3.3c1.98.63,4.17,1.18,5.16,1.01-.21-1.89-.26-2.41-.23-3.29l-1.16-.74c-.26-.16-.15-.85-.23-1.31-1.28-.68-3.58-1.67-3.92-3.29-.3-1.41,2.72-3.09,3.75-2.48.49.47.81,1.97,1.42,2.05l2.81.37-.18,4.11c.75-.69,2.03-2.21,2.58-2.94.31-.41,2.05-.29,2.08.17.2,2.92.21,7.46-.01,9.93-.03.38-1.46.98-1.33,1.3l.79,1.85c.12.29-.55,1.18-.81,1.4-.7.58,2.68.56,1.4,7.12l-.97-.87c-.24-.21-1.28-.71-1.3-.4l-.15,1.78c-.06.76-1.2,1.96-1.95,2.06-.98.12-2.82-.08-3.43-.35l3-4.83c.21-.34.18-1.69.31-2.04s.96-.41,1.46-.43l1.06.27c.3.07.09-1.24-.23-1.32-1.92-.48-5.15-2.83-4.59-5.47l-6.37.64c1.88,2.38,2.46,3.69,2.52,6.05.14,5.09-.85,1.44-1.69,5.41-.16.75.82,2.62,1.64,2.67l5.73.36c-.58,1.75-2.01,3.04-2.67,4.32l-3.13,6.09c-1.18,2.31-3.45,8.15-4.21,11.35l-.84,3.51c-.05.21-.04,1.06.1.95l.95-.66,3.67,1.3c.04.43-.24,1.92-.47,2.77l-.47,1.73c-.1.37-1.24.37-1.85.5l-.16,4.23c-1.51,2.32-1.98,4.44-2.39,7.02-.34,2.15-1.4,4.2-.2,6.51l3.17-.15,1.81,4.04-2.88-.08c-.38-.01-1.19.28-1.31-.01l-.71-1.69-2.29,1.9c-1.34-1.33-2.75-2.18-4.41-2.08-2.28.14-1.94-1.94-2.61-3.27-.88-1.77-3.71-.8-4.81.82-.41.6-2.29.2-2.83-.16l-2.24,2.93.77,1.71c.82,1.82-7.04,8.11-8.48,4.93-.83-1.84-1.55-3.49-2.07-5.33-.28-.99-.27-3.13-1.41-3.36-2.25-.46-3.54,1.35-4.34,3.24l1.32,1.06,1.27,3.7-4.62,1.68-1.07,3.39,1.31,6.05c.05.25.46.9.59,1.09-.1-.15-2.32,2.29-3.81,1-3.25.16-4.49,2.3-7.09,1.16,1.34-5.77,2.44-2.8,3.21-4.65.31-.75.21-2.15-.24-2.74Z';
const FORAT_VIEWBOX_W = 126.19;
const FORAT_VIEWBOX_H = 138.57;

function makeOrganicHoleMask(cx, cy) {
  const targetSize = 32;
  const scale = targetSize / Math.max(FORAT_VIEWBOX_W, FORAT_VIEWBOX_H);
  const tx = (cx - (FORAT_VIEWBOX_W * scale) / 2).toFixed(2);
  const ty = (cy - (FORAT_VIEWBOX_H * scale) / 2).toFixed(2);

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">',
    '<defs><mask id="m">',
    '<rect width="100" height="100" fill="white"/>',
    '<path d="' + FORAT_SHAPE_D + '" fill="black" transform="translate(' + tx + ' ' + ty + ') scale(' + scale.toFixed(4) + ')"/>',
    '</mask></defs>',
    '<rect width="100" height="100" fill="white" mask="url(#m)"/>',
    '</svg>'
  ].join('');

  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

function clearDigHoles() {
  const layer = ensureArbreStampLayer();
  layer.querySelectorAll('.tree-stamp.dug').forEach(stamp => {
    stamp.classList.remove('dug');
    stamp.style.webkitMaskImage = '';
    stamp.style.maskImage = '';
  });
}

function digTreesAtPointer(clientX, clientY) {
  const layer = ensureArbreStampLayer();
  layer.querySelectorAll('.tree-stamp').forEach(stamp => {
    const rect = stamp.getBoundingClientRect();
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isInside) {
      stamp.classList.remove('dug');
      stamp.style.webkitMaskImage = '';
      stamp.style.maskImage = '';
      return;
    }

    const holeX = ((clientX - rect.left) / rect.width) * 100;
    const holeY = ((clientY - rect.top) / rect.height) * 100;
    const mask = makeOrganicHoleMask(holeX, holeY);
    stamp.style.webkitMaskImage = mask;
    stamp.style.maskImage = mask;
    stamp.classList.add('dug');
  });
}

function startArbreStamping() {
  if (arbreStampState.active) return;
  arbreStampState.active = true;
  document.body.classList.add('arbre-stamp-active');
  arbreStampState.startedAt = performance.now();
  arbreStampState.digHandler = (event) => {
    digTreesAtPointer(event.clientX, event.clientY);
  };
  arbreStampState.digTouchHandler = (event) => {
    const touch = event.touches && event.touches[0];
    if (touch) digTreesAtPointer(touch.clientX, touch.clientY);
  };
  document.addEventListener('mousemove', arbreStampState.digHandler);
  document.addEventListener('touchmove', arbreStampState.digTouchHandler, { passive: true });
  scheduleNextArbreStamp();
}

function stopArbreStamping() {
  arbreStampState.active = false;
  document.body.classList.remove('arbre-stamp-active');
  if (arbreStampState.timeoutId) {
    window.clearTimeout(arbreStampState.timeoutId);
    arbreStampState.timeoutId = null;
  }
  if (arbreStampState.digHandler) {
    document.removeEventListener('mousemove', arbreStampState.digHandler);
    arbreStampState.digHandler = null;
  }
  if (arbreStampState.digTouchHandler) {
    document.removeEventListener('touchmove', arbreStampState.digTouchHandler);
    arbreStampState.digTouchHandler = null;
  }
  clearDigHoles();
  clearArbreStamps();
}

function syncArbreStamping(slug) {
  if (slug === ARBRE_STAMP_TARGET_SLUG) {
    startArbreStamping();
    return;
  }
  stopArbreStamping();
}

function syncURLAndSEO(slug, slide) {
  const relativeURL = buildPath(slug, state.lang);
  const canonicalURL = `${SEO.baseUrl}${buildPath(slug, state.lang)}`;
  const caURL = `${SEO.baseUrl}${buildPath(slug, 'cat')}`;
  const enURL = `${SEO.baseUrl}${buildPath(slug, 'en')}`;
  const projectTitle = getProjectTitle(slug);
  const title = SEO.siteName;
  const description = getProjectDescription(slug);
  const imageURL = toAbsoluteURL(slide?.image || SEO.defaultImage);

  document.documentElement.lang = state.lang === 'en' ? 'en' : 'ca';
  document.title = title;

  if (el.metaDescription) el.metaDescription.content = description;
  if (el.metaCanonical) el.metaCanonical.href = canonicalURL;
  if (el.altCa) el.altCa.href = caURL;
  if (el.altEn) el.altEn.href = enURL;
  if (el.altXDefault) el.altXDefault.href = enURL;
  if (el.metaOgLocale) el.metaOgLocale.content = state.lang === 'en' ? 'en_US' : 'ca_ES';
  if (el.metaOgTitle) el.metaOgTitle.content = title;
  if (el.metaOgDescription) el.metaOgDescription.content = description;
  if (el.metaOgUrl) el.metaOgUrl.content = canonicalURL;
  if (el.metaOgImage) el.metaOgImage.content = imageURL;
  if (el.metaOgImageAlt) el.metaOgImageAlt.content = projectTitle;
  if (el.metaTwitterTitle) el.metaTwitterTitle.content = title;
  if (el.metaTwitterDescription) el.metaTwitterDescription.content = description;
  if (el.metaTwitterImage) el.metaTwitterImage.content = imageURL;

  try {
    const newPath = relativeURL;
    if (window.location.pathname + window.location.search !== newPath) {
      window.history.replaceState({ slug, lang: state.lang }, '', newPath);
    }
  } catch (err) {
    console.warn('could not sync URL', err);
  }
}

// Sync active state on all lang buttons (desktop + mobile)
function syncLangButtons() {
  [...el.langBtns, ...el.langBtnsMobile].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
}

// === Project navigation ===
function initProjectNav() {
  el.projectNav.innerHTML = '';
  let previousGroup = null;
  state.projects.forEach((slug, i) => {
    const currentGroup = getProjectGroup(slug);
    if (previousGroup !== null && currentGroup !== previousGroup) {
      const gap = document.createElement('div');
      gap.className = 'project-group-gap';
      gap.setAttribute('aria-hidden', 'true');
      gap.textContent = ' ';
      el.projectNav.appendChild(gap);
    }

    const btn = document.createElement('button');
    btn.className = 'project-link';
    btn.textContent = getProjectTitle(slug);
    btn.addEventListener('click', () => goToProject(i));
    el.projectNav.appendChild(btn);
    previousGroup = currentGroup;
  });
  updateActiveProject();
}

function updateActiveProject() {
  const links = el.projectNav.querySelectorAll('.project-link');
  links.forEach((link, i) => {
    link.classList.toggle('active', i === state.currentProjectIndex);
  });

  const activeLink = links[state.currentProjectIndex];
  if (activeLink) {
    moveNavIndicator(activeLink);
    const navRect = el.projectNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
      activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
}

function syncNavIndicator() {
  const activeLink = el.projectNav.querySelector('.project-link.active');
  if (activeLink) moveNavIndicator(activeLink);
}

function setSidebarExpanded(expanded) {
  el.sidebar.classList.toggle('expanded', expanded);
  el.sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  el.sidebarToggle.setAttribute('aria-label', expanded ? 'Collapse projects' : 'Expand projects');
}

// Create or move the arrow indicator element
function moveNavIndicator(targetLink) {
  let indicator = el.projectNav.querySelector('.nav-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    el.projectNav.appendChild(indicator);
  }

  // Position relative to projectNav's scroll container
  const navRect = el.projectNav.getBoundingClientRect();
  const linkRect = targetLink.getBoundingClientRect();
  const scrollTop = el.projectNav.scrollTop;
  const top = linkRect.top - navRect.top + scrollTop + linkRect.height / 2 - 4; // 4 = half arrow height

  indicator.style.top = top + 'px';
}

function updateProjectNames() {
  el.projectNav.querySelectorAll('.project-link').forEach((link, i) => {
    link.textContent = getProjectTitle(state.projects[i]);
  });
}

// === Vertical centering ===
function updateVerticalCentering() {
  if (!el.slideContainer) return;
  const fits = el.slideContent.scrollHeight < el.slideContainer.clientHeight;
  el.slideContainer.classList.toggle('centered', fits);
}

// === Render ===
async function renderSlide(withTransition = true) {
  if (state.isTransitioning) return;

  const slug = state.projects[state.currentProjectIndex];
  const slides = state.data[slug];
  const slide = slides[state.currentSlideIndex];

  if (slug !== ABOUT_TARGET_SLUG) {
    aboutRevealState.active = false;
  }

  syncArbreStamping(slug);
  syncGdePaintMode(slug);
  syncCaraPilsCurtains(slug);

  // Fade out
  if (withTransition) {
    state.isTransitioning = true;
    el.slideContent.classList.add('transitioning');
    await sleep(300);
  }

  // Reset scroll to top
  el.slideContainer.scrollTop = 0;
  el.slideContent.classList.toggle('about-layout', slug === 'about');
  el.slideLinks.classList.toggle('about-links', slug === 'about');
  el.slideLinks.classList.toggle('about-reveal-active', slug === ABOUT_TARGET_SLUG && aboutRevealState.active);

  // Image
  el.slideImage.classList.toggle('foc-image-large', slug === 'foc');
  if (slide.image) {
    const responsive = getResponsiveImageSources(slide.image);
    el.slideImage.src = responsive.src;
    el.slideImage.srcset = responsive.srcset;
    el.slideImage.sizes = responsive.sizes;
    el.slideImage.dataset.fullsrc = responsive.original;
    el.slideImage.loading = 'eager';
    el.slideImage.decoding = 'async';
    el.slideImage.alt = getProjectTitle(slug);
    el.slideImage.style.display = 'block';
    el.slideImage.parentElement.style.display = 'flex';
    el.slideImage.onload = updateVerticalCentering;
  } else {
    el.slideImage.src = '';
    el.slideImage.srcset = '';
    el.slideImage.sizes = '';
    delete el.slideImage.dataset.fullsrc;
    el.slideImage.alt = '';
    el.slideImage.style.display = 'none';
    el.slideImage.parentElement.style.display = 'none';
  }

  // Text paragraphs
  const paragraphs = getTextParagraphs(slide);
  if (paragraphs.length) {
    el.slideText.innerHTML = '';
    el.slideText.classList.toggle('about-reveal-active', slug === ABOUT_TARGET_SLUG && aboutRevealState.active);
    paragraphs.forEach(text => {
      const p = document.createElement('p');
      appendSanitizedInlineHTML(p, text);
      el.slideText.appendChild(p);
    });
    enhanceFocShineTriggers(el.slideText, slug);
    enhanceAboutSpecificContextsTrigger(el.slideText, slug);
    enhanceGdePaintTriggers(el.slideText, slug);
    enhanceCaraPilsPlayfulTrigger(el.slideText, slug);
    enhanceNcbTattooTrigger(el.slideText, slug);
    enhanceGodBlueWords(el.slideText, slug);
    enhanceGodOthersLink(el.slideText, slug);
    if (aboutRevealState.active) {
      applyAboutRevealLinks(el.slideText, slug);
    }
    el.slideText.style.display = 'block';
  } else {
    el.slideText.innerHTML = '';
    el.slideText.style.display = 'none';
  }

  // Links
  el.slideLinks.innerHTML = '';
  if (slide.links && slide.links.length) {
    let renderedLinks = 0;
    slide.links.forEach(link => {
      const a = createLinkElement(link);
      if (!a) return;
      el.slideLinks.appendChild(a);
      renderedLinks++;
    });
    el.slideLinks.style.display = renderedLinks ? 'flex' : 'none';
  } else {
    el.slideLinks.style.display = 'none';
  }

  // About thumbnails
  renderThumbs(slug);
  syncURLAndSEO(slug, slide);

  // Update sidebar
  updateActiveProject();
  requestAnimationFrame(updateVerticalCentering);

  // Fade in
  if (withTransition) {
    el.slideContent.classList.remove('transitioning');
    state.isTransitioning = false;
  }
}

// Render project thumbnails (only on About page)
function renderThumbs(currentSlug) {
  if (currentSlug !== 'about') {
    el.slideThumbs.innerHTML = '';
    el.slideThumbs.style.display = 'none';
    return;
  }

  const others = state.projects.filter(s => s !== 'about');
  el.slideThumbs.innerHTML = '';
  el.slideThumbs.style.setProperty('--thumb-columns', Math.max(1, Math.ceil(others.length / 2)));

  others.forEach(slug => {
    const slides = state.data[slug];
    if (!slides || !slides.length || !slides[0].image) return;

    const btn = document.createElement('button');
    btn.className = 'slide-thumb';
    btn.setAttribute('aria-label', getProjectTitle(slug));
    btn.addEventListener('click', () => {
      const idx = state.projects.indexOf(slug);
      if (idx >= 0) goToProject(idx);
    });

    const img = document.createElement('img');
    const responsive = getResponsiveImageSources(slides[0].image);
    img.src = responsive.src;
    img.srcset = responsive.srcset;
    img.sizes = '(max-width: 768px) 44vw, 160px';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = getProjectTitle(slug);
    btn.appendChild(img);
    el.slideThumbs.appendChild(btn);
  });

  el.slideThumbs.style.display = el.slideThumbs.children.length ? 'grid' : 'none';
}

// === Navigation ===
function goToProject(index) {
  if (state.isTransitioning) return;
  state.currentProjectIndex = index;
  state.currentSlideIndex = 0;
  setSidebarExpanded(false);
  renderSlide();
}

function goPrev() {
  if (state.isTransitioning) return;
  const slug = state.projects[state.currentProjectIndex];
  const slides = state.data[slug];

  if (state.currentSlideIndex > 0) {
    state.currentSlideIndex--;
  } else {
    // Wrap to previous project's last slide
    state.currentProjectIndex = (state.currentProjectIndex - 1 + state.projects.length) % state.projects.length;
    const prevSlug = state.projects[state.currentProjectIndex];
    state.currentSlideIndex = state.data[prevSlug].length - 1;
  }
  renderSlide();
}

function goNext() {
  if (state.isTransitioning) return;
  const slug = state.projects[state.currentProjectIndex];
  const slides = state.data[slug];

  if (state.currentSlideIndex < slides.length - 1) {
    state.currentSlideIndex++;
  } else {
    // Wrap to next project's first slide
    state.currentProjectIndex = (state.currentProjectIndex + 1) % state.projects.length;
    state.currentSlideIndex = 0;
  }
  renderSlide();
}

// === Language ===
async function changeLang(lang) {
  if (state.lang === lang || state.isTransitioning) return;
  state.lang = lang;
  aboutRevealState.active = false;
  syncLangButtons();
  updateProjectNames();
  await renderSlide(true);
}

// === Keyboard ===
function handleKeyboard(e) {
  // If image modal is open, only handle Escape
  const modal = document.querySelector('.image-modal');
  if (modal && modal.classList.contains('open')) {
    if (e.key === 'Escape') closeImageModal();
    return;
  }

  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
}

// === Image zoom modal ===
function createImageModal() {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = '<img src="" alt="">';
  document.body.appendChild(modal);
  modal.addEventListener('click', closeImageModal);
  return modal;
}

function openImageModal(src, alt) {
  const modal = document.querySelector('.image-modal') || createImageModal();
  const img = modal.querySelector('img');
  img.src = src;
  img.alt = alt;
  modal.offsetHeight; // force reflow
  modal.classList.add('open');
}

function closeImageModal() {
  const modal = document.querySelector('.image-modal');
  if (modal) modal.classList.remove('open');
}

// === URL parsing ===
function parseURL() {
  const segments = window.location.pathname.split('/').filter(Boolean);

  // Clean URL: /:lang or /:lang/:slug
  if (segments.length >= 1 && (segments[0] === 'en' || segments[0] === 'cat')) {
    state.lang = segments[0] === 'cat' ? 'cat' : 'en';
    if (segments[1] && state.projects.includes(segments[1])) {
      state.currentProjectIndex = state.projects.indexOf(segments[1]);
    }
    return;
  }

  // Fallback to query params for older links
  const params = new URLSearchParams(window.location.search);
  const qslug = params.get('slug');
  const qlang = params.get('lang');
  if (qslug && state.projects.includes(qslug)) {
    state.currentProjectIndex = state.projects.indexOf(qslug);
  }
  if (qlang === 'en' || qlang === 'cat') {
    state.lang = qlang;
  }
}

// === Init ===
async function init() {
  const loaded = await loadData();
  if (!loaded) return;

  parseURL();
  syncLangButtons();
  initProjectNav();
  renderSlide(false);
  preloadEasterEggAssets();

  // Desktop controls
  el.prevBtn.addEventListener('click', goPrev);
  el.nextBtn.addEventListener('click', goNext);
  el.langBtns.forEach(btn => btn.addEventListener('click', handleLangButtonClick));

  // Mobile controls
  el.prevBtnMobile.addEventListener('click', goPrev);
  el.nextBtnMobile.addEventListener('click', goNext);
  el.langBtnsMobile.forEach(btn => btn.addEventListener('click', handleLangButtonClick));

  // Sidebar toggle (mobile expand/collapse)
  setSidebarExpanded(el.sidebar.classList.contains('expanded'));
  const onSidebarToggle = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSidebarExpanded(!el.sidebar.classList.contains('expanded'));
  };
  el.sidebarToggle.addEventListener('click', onSidebarToggle);

  // Image click → zoom
  el.slideImage.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(el.slideImage.dataset.fullsrc || el.slideImage.currentSrc || el.slideImage.src, el.slideImage.alt);
  });

  // Keyboard
  window.addEventListener('keydown', handleKeyboard);
  el.slideText.addEventListener('click', handleSlideTextClick);
  document.addEventListener('click', handleGodCompleteResetClick, true);

  // Keep indicator synced when nav scrolls (mobile)
  el.projectNav.addEventListener('click', handleProjectNavClick, true);
  let navSyncPending = false;
  const throttledSyncNavIndicator = () => {
    if (navSyncPending) return;
    navSyncPending = true;
    requestAnimationFrame(() => {
      syncNavIndicator();
      navSyncPending = false;
    });
  };
  el.projectNav.addEventListener('scroll', throttledSyncNavIndicator);

  // Keep indicator aligned after viewport changes
  window.addEventListener('resize', throttledSyncNavIndicator);
  window.addEventListener('orientationchange', throttledSyncNavIndicator);
}

function preloadEasterEggAssets() {
  const idleCb = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (fn) => setTimeout(fn, 250);
  const sources = [
    FOC_SHINE_GIF_SRC,
    FOC_BURNED_GIF_SRC,
    GDE_PENCIL_CURSOR_SRC,
    ABOUT_FLIGHT_IMG_SRC,
    ABOUT_METRO_IMG_SRC,
    ABOUT_ARBORICULTURE_IMG_SRC,
    NCB_TATTOO_IMG_SRC,
    CARAPILS_CURTAIN_IMG_SRC,
    ...ARBRE_STAMP_SOURCES.slice(0, 6)
  ];
  let i = 0;
  const loadNext = () => {
    if (i >= sources.length) return;
    const img = new Image();
    img.src = resolveAsset(sources[i++]);
    img.onload = img.onerror = () => idleCb(loadNext);
  };
  idleCb(loadNext);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
