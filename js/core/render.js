import { state, SEO, el, IMAGE_DECODE_TIMEOUT_MS } from './state.js';
import { sleep } from './helpers.js';
import {
  getProjectTitle,
  getProjectGroup,
  getTextParagraphs,
  getSafeLinkURL,
  appendSanitizedInlineHTML,
  createLinkElement,
  getProjectDescription,
  buildPath,
  toAbsoluteURL,
  getResponsiveImageSources
} from './data.js';
import {
  ABOUT_TARGET_SLUG,
  aboutRevealState,
  enhanceAboutSpecificContextsTrigger,
  applyAboutRevealLinks,
  handleAboutClick
} from '../effects/about.js';
import { enhanceFocShineTriggers, handleFocClick } from '../effects/foc.js';
import { enhanceGdePaintTriggers, syncGdePaintMode, handleGdeClick } from '../effects/gde.js';
import { enhanceNcbTattooTrigger, handleNcbClick } from '../effects/ncb.js';
import {
  enhanceCaraPilsPlayfulTrigger,
  syncCaraPilsCurtains,
  handleCaraPilsClick
} from '../effects/carapils.js';
import {
  enhanceGodBlueWords,
  enhanceGodOthersLink,
  handleGodClick,
  handleGodProjectNavClick,
  handleGodLangButtonClick
} from '../effects/god.js';
import { syncArbreStamping } from '../effects/arbre.js';

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

  if (handleAboutClick(event)) return;
  if (handleGodClick(event)) return;
  if (handleFocClick(event)) return;
  if (handleGdeClick(event)) return;
  if (handleNcbClick(event)) return;
  handleCaraPilsClick(event);
}

export function syncURLAndSEO(slug, slide) {
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
export function syncLangButtons() {
  [...el.langBtns, ...el.langBtnsMobile].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
}

// === Project navigation ===
export function initProjectNav() {
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

export function updateActiveProject() {
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

export function syncNavIndicator() {
  const activeLink = el.projectNav.querySelector('.project-link.active');
  if (activeLink) moveNavIndicator(activeLink);
}

export function setSidebarExpanded(expanded) {
  el.sidebar.classList.toggle('expanded', expanded);
  el.sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  el.sidebarToggle.setAttribute('aria-label', expanded ? 'Collapse projects' : 'Expand projects');
}

// Create or move the arrow indicator element
export function moveNavIndicator(targetLink) {
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

export function updateProjectNames() {
  el.projectNav.querySelectorAll('.project-link').forEach((link, i) => {
    link.textContent = getProjectTitle(state.projects[i]);
  });
}

// === Vertical centering ===
export function updateVerticalCentering() {
  if (!el.slideContainer) return;
  const fits = el.slideContent.scrollHeight < el.slideContainer.clientHeight;
  el.slideContainer.classList.toggle('centered', fits);
}

// === Render ===
export async function renderSlide(withTransition = true) {
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
  let imageReady = null;
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
    // Start decoding the new bitmap now so we can wait for it before the
    // fade-in (see below). Without this, the <img> keeps showing the
    // previous project's image until the new one decodes.
    if (typeof el.slideImage.decode === 'function') {
      imageReady = el.slideImage.decode().catch(() => {});
    }
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

  // Fade in — wait for the new image to actually decode first, otherwise the
  // <img> keeps painting the previous project's bitmap during the fade-in
  // (looks like it briefly returns to the previous project before showing the
  // right one). Capped by IMAGE_DECODE_TIMEOUT_MS so a slow/broken image can
  // never freeze navigation.
  if (withTransition) {
    if (imageReady) {
      await Promise.race([imageReady, sleep(IMAGE_DECODE_TIMEOUT_MS)]);
    }
    el.slideContent.classList.remove('transitioning');
    state.isTransitioning = false;
  }
}

// Render project thumbnails (only on About page)
export function renderThumbs(currentSlug) {
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
export function goToProject(index) {
  if (state.isTransitioning) return;
  state.currentProjectIndex = index;
  state.currentSlideIndex = 0;
  setSidebarExpanded(false);
  renderSlide();
}

export function goPrev() {
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

export function goNext() {
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
export async function changeLang(lang) {
  if (state.lang === lang || state.isTransitioning) return;
  state.lang = lang;
  aboutRevealState.active = false;
  syncLangButtons();
  updateProjectNames();
  await renderSlide(true);
}

// General #project-nav click handler; delegates the god-blue special case.
export function handleProjectNavClick(event) {
  handleGodProjectNavClick(event);
}

// General lang-button click handler; the god-blue special case short-circuits
// the normal language switch.
export function handleLangButtonClick(event) {
  if (handleGodLangButtonClick(event)) return;
  const btn = event.currentTarget;
  if (btn) {
    changeLang(btn.dataset.lang);
  }
}

// === Keyboard ===
export function handleKeyboard(e) {
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
export function createImageModal() {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = '<img src="" alt="">';
  document.body.appendChild(modal);
  modal.addEventListener('click', closeImageModal);
  return modal;
}

export function openImageModal(src, alt) {
  const modal = document.querySelector('.image-modal') || createImageModal();
  const img = modal.querySelector('img');
  img.src = src;
  img.alt = alt;
  modal.offsetHeight; // force reflow
  modal.classList.add('open');
}

export function closeImageModal() {
  const modal = document.querySelector('.image-modal');
  if (modal) modal.classList.remove('open');
}

// === URL parsing ===
export function parseURL() {
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

export { handleSlideTextClick };
