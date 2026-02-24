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
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol) ? trimmed : null;
  } catch (err) {
    return null;
  }
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
  const safeURL = getSafeLinkURL(link?.url);
  if (!safeURL) {
    console.warn('blocked unsafe link URL:', link?.url);
    return null;
  }
  const a = document.createElement('a');
  a.href = safeURL;
  a.textContent = getLinkText(link);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
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

function toAbsoluteURL(path) {
  if (!path) return `${SEO.baseUrl}/${SEO.defaultImage}`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${SEO.baseUrl}/${normalized}`;
}

function syncURLAndSEO(slug, slide) {
  const query = buildQueryString(slug);
  const caQuery = buildQueryString(slug, 'cat');
  const enQuery = buildQueryString(slug, 'en');
  const relativeURL = `${window.location.pathname}${query ? `?${query}` : ''}`;
  const canonicalURL = `${SEO.baseUrl}/${query ? `?${query}` : ''}`;
  const caURL = `${SEO.baseUrl}/${caQuery ? `?${caQuery}` : ''}`;
  const enURL = `${SEO.baseUrl}/${enQuery ? `?${enQuery}` : ''}`;
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
    if (window.location.search !== (query ? `?${query}` : '')) {
      window.history.replaceState({ slug, lang: state.lang }, '', relativeURL);
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
    activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
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

  // Fade out
  if (withTransition) {
    state.isTransitioning = true;
    el.slideContent.classList.add('transitioning');
    await sleep(300);
  }

  // Reset scroll to top
  el.slideContainer.scrollTop = 0;

  // Image
  if (slide.image) {
    el.slideImage.src = slide.image;
    el.slideImage.alt = getProjectTitle(slug);
    el.slideImage.style.display = 'block';
    el.slideImage.parentElement.style.display = 'flex';
    el.slideImage.onload = updateVerticalCentering;
  } else {
    el.slideImage.src = '';
    el.slideImage.alt = '';
    el.slideImage.style.display = 'none';
    el.slideImage.parentElement.style.display = 'none';
  }

  // Text paragraphs
  const paragraphs = getTextParagraphs(slide);
  if (paragraphs.length) {
    el.slideText.innerHTML = '';
    paragraphs.forEach(text => {
      const p = document.createElement('p');
      appendSanitizedInlineHTML(p, text);
      el.slideText.appendChild(p);
    });
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
    img.src = slides[0].image;
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
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const lang = params.get('lang');
  if (slug && state.projects.includes(slug)) {
    state.currentProjectIndex = state.projects.indexOf(slug);
  }
  if (lang === 'en' || lang === 'cat') {
    state.lang = lang;
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

  // Desktop controls
  el.prevBtn.addEventListener('click', goPrev);
  el.nextBtn.addEventListener('click', goNext);
  el.langBtns.forEach(btn => btn.addEventListener('click', () => changeLang(btn.dataset.lang)));

  // Mobile controls
  el.prevBtnMobile.addEventListener('click', goPrev);
  el.nextBtnMobile.addEventListener('click', goNext);
  el.langBtnsMobile.forEach(btn => btn.addEventListener('click', () => changeLang(btn.dataset.lang)));

  // Sidebar toggle (mobile expand/collapse)
  setSidebarExpanded(el.sidebar.classList.contains('expanded'));
  el.sidebarToggle.addEventListener('click', () => {
    setSidebarExpanded(!el.sidebar.classList.contains('expanded'));
  });

  // Image click → zoom
  el.slideImage.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(el.slideImage.src, el.slideImage.alt);
  });

  // Keyboard
  window.addEventListener('keydown', handleKeyboard);

  // Keep indicator synced when nav scrolls (mobile)
  el.projectNav.addEventListener('scroll', () => {
    syncNavIndicator();
  });

  // Keep indicator aligned after viewport changes
  window.addEventListener('resize', syncNavIndicator);
  window.addEventListener('orientationchange', syncNavIndicator);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
