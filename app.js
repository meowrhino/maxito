// === State ===
const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'cat',
  isTransitioning: false
};

// === DOM references ===
const el = {
  slideContainer: document.getElementById('slide-container'),
  projectNav: document.getElementById('project-nav'),
  slideImage: document.getElementById('slide-image'),
  slideText: document.getElementById('slide-text'),
  slideLinks: document.getElementById('slide-links'),
  slideFooter: document.getElementById('slide-footer'),
  slideThumbs: document.getElementById('slide-thumbs'),
  slideContent: document.querySelector('.slide-content'),
  // Desktop controls (sidebar)
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  langBtns: document.querySelectorAll('.lang-btn'),
  // Mobile controls (footer)
  prevBtnMobile: document.getElementById('prev-btn-mobile'),
  nextBtnMobile: document.getElementById('next-btn-mobile'),
  langBtnsMobile: document.querySelectorAll('.lang-btn-mobile')
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

// Sync active state on all lang buttons (desktop + mobile)
function syncLangButtons() {
  [...el.langBtns, ...el.langBtnsMobile].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });
}

// === Project navigation ===
function initProjectNav() {
  el.projectNav.innerHTML = '';
  state.projects.forEach((slug, i) => {
    const btn = document.createElement('button');
    btn.className = 'project-link';
    btn.textContent = getProjectTitle(slug);
    btn.addEventListener('click', () => goToProject(i));
    el.projectNav.appendChild(btn);
  });
  updateActiveProject();
}

function updateActiveProject() {
  const links = el.projectNav.querySelectorAll('.project-link');
  links.forEach((link, i) => {
    link.classList.toggle('active', i === state.currentProjectIndex);
  });

  // Move arrow indicator to active project
  const activeLink = links[state.currentProjectIndex];
  if (activeLink) {
    moveNavIndicator(activeLink);
    activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
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
      p.textContent = text;
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
    slide.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = getLinkText(link);
      if (link.url.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      el.slideLinks.appendChild(a);
    });
    el.slideLinks.style.display = 'flex';
  } else {
    el.slideLinks.style.display = 'none';
  }

  // Slide footer (e.g. meowrhino link on about)
  el.slideFooter.innerHTML = '';
  if (slide.footer) {
    const a = document.createElement('a');
    a.href = slide.footer.url;
    a.textContent = slide.footer.text;
    if (slide.footer.url.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    el.slideFooter.appendChild(a);
    el.slideFooter.style.display = 'block';
  } else {
    el.slideFooter.style.display = 'none';
  }

  // About thumbnails
  renderThumbs(slug);

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
  state.currentProjectIndex = index;
  state.currentSlideIndex = 0;
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
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (slug && state.projects.includes(slug)) {
    state.currentProjectIndex = state.projects.indexOf(slug);
  }
}

// === Init ===
async function init() {
  const loaded = await loadData();
  if (!loaded) return;

  parseURL();
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

  // Image click → zoom
  el.slideImage.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(el.slideImage.src, el.slideImage.alt);
  });

  // Keyboard
  window.addEventListener('keydown', handleKeyboard);

  // Keep indicator synced when nav scrolls (mobile)
  el.projectNav.addEventListener('scroll', () => {
    const activeLink = el.projectNav.querySelector('.project-link.active');
    if (activeLink) moveNavIndicator(activeLink);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
