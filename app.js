// Estado de la aplicación
const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'cat',
  isTransitioning: false
};

// Elementos del DOM
const elements = {
  projectNav: document.getElementById('project-nav'),
  slideImage: document.getElementById('slide-image'),
  slideText: document.getElementById('slide-text'),
  slideLinks: document.getElementById('slide-links'),
  slideCounter: document.getElementById('slide-counter'),
  slideContent: document.querySelector('.slide-content'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  langBtns: document.querySelectorAll('.lang-btn')
};

// Textos multiidioma
const i18n = {
  cat: {
    projectNames: {
      'about': 'about',
      'arboles-bailando': 'arbres ballant',
      'forest-management-systems': 'sistemes de gestió forestal',
      'horizonte': 'horitzó',
      'raices-urbanas': 'arrels urbanes',
      'memoria-vegetal': 'memòria vegetal',
      'especies-invasoras': 'espècies invasores'
    }
  },
  en: {
    projectNames: {
      'about': 'about',
      'arboles-bailando': 'dancing trees',
      'forest-management-systems': 'forest management systems',
      'horizonte': 'horizon',
      'raices-urbanas': 'urban roots',
      'memoria-vegetal': 'plant memory',
      'especies-invasoras': 'invasive species'
    }
  }
};

// Cargar datos
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('error loading data.json');
    state.data = await response.json();
    state.projects = Object.keys(state.data);
    console.log('data loaded:', state.projects);
    return true;
  } catch (error) {
    console.error('error loading data:', error);
    return false;
  }
}

// Inicializar navegación de proyectos
function initProjectNav() {
  elements.projectNav.innerHTML = '';
  state.projects.forEach((projectSlug, index) => {
    const button = document.createElement('button');
    button.className = 'project-link';
    button.textContent = getProjectName(projectSlug);
    button.dataset.index = index;
    button.addEventListener('click', () => goToProject(index));
    elements.projectNav.appendChild(button);
  });
  updateActiveProject();
}

// Obtener nombre del proyecto según idioma
function getProjectName(slug) {
  return i18n[state.lang].projectNames[slug] || slug;
}

// Actualizar proyecto activo en navegación
function updateActiveProject() {
  const links = elements.projectNav.querySelectorAll('.project-link');
  links.forEach((link, index) => {
    link.classList.toggle('active', index === state.currentProjectIndex);
  });
}

// Obtener texto según idioma
function getText(slide) {
  const key = `text_${state.lang}`;
  return slide[key] || slide.text_cat || slide.text_en || null;
}

// Obtener texto de link según idioma
function getLinkText(link) {
  const key = `text_${state.lang}`;
  return link[key] || link.text_cat || link.text_en || link.text || '';
}

// Actualizar contador de slides
function updateSlideCounter() {
  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];
  
  elements.slideCounter.innerHTML = `
    <span class="current">${state.currentSlideIndex + 1}</span>
    <span class="separator">/</span>
    <span class="total">${slides.length}</span>
  `;
}

// Renderizar slide actual con transición
async function renderSlide(withTransition = true) {
  if (state.isTransitioning) return;

  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];
  const slide = slides[state.currentSlideIndex];

  // Iniciar transición
  if (withTransition) {
    state.isTransitioning = true;
    elements.slideContent.classList.add('transitioning');
    await sleep(300);
  }

  // Actualizar imagen
  if (slide.image) {
    elements.slideImage.src = slide.image;
    elements.slideImage.alt = getProjectName(projectSlug);
    elements.slideImage.style.display = 'block';
    elements.slideImage.parentElement.style.display = 'flex';
  } else {
    elements.slideImage.src = '';
    elements.slideImage.alt = '';
    elements.slideImage.style.display = 'none';
    elements.slideImage.parentElement.style.display = 'none';
  }

  // Actualizar texto
  const text = getText(slide);
  if (text) {
    elements.slideText.textContent = text;
    elements.slideText.style.display = 'block';
  } else {
    elements.slideText.textContent = '';
    elements.slideText.style.display = 'none';
  }

  // Actualizar links
  elements.slideLinks.innerHTML = '';
  if (slide.links && slide.links.length > 0) {
    slide.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = getLinkText(link);
      a.target = link.url.startsWith('http') ? '_blank' : '_self';
      elements.slideLinks.appendChild(a);
    });
    elements.slideLinks.style.display = 'flex';
  } else {
    elements.slideLinks.style.display = 'none';
  }

  // Actualizar contador y navegación
  updateSlideCounter();
  updateActiveProject();

  // Finalizar transición
  if (withTransition) {
    elements.slideContent.classList.remove('transitioning');
    state.isTransitioning = false;
  }

  console.log(`rendering: ${projectSlug} - slide ${state.currentSlideIndex + 1}/${slides.length}`);
}

// Función auxiliar para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Navegar a proyecto específico
function goToProject(projectIndex) {
  state.currentProjectIndex = projectIndex;
  state.currentSlideIndex = 0;
  renderSlide();
}

// Navegar a slide anterior
function goPrev() {
  if (state.isTransitioning) return;

  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];

  if (state.currentSlideIndex > 0) {
    state.currentSlideIndex--;
  } else {
    state.currentProjectIndex = (state.currentProjectIndex - 1 + state.projects.length) % state.projects.length;
    const prevProjectSlug = state.projects[state.currentProjectIndex];
    state.currentSlideIndex = state.data[prevProjectSlug].length - 1;
  }

  renderSlide();
}

// Navegar a slide siguiente
function goNext() {
  if (state.isTransitioning) return;

  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];

  if (state.currentSlideIndex < slides.length - 1) {
    state.currentSlideIndex++;
  } else {
    state.currentProjectIndex = (state.currentProjectIndex + 1) % state.projects.length;
    state.currentSlideIndex = 0;
  }

  renderSlide();
}

// Manejar navegación con teclado
function handleKeyboard(e) {
  const imageModal = document.querySelector('.image-modal');
  if (imageModal && imageModal.classList.contains('open')) {
    if (e.key === 'Escape') {
      closeImageModal();
    }
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      goPrev();
      break;
    case 'ArrowRight':
      goNext();
      break;
  }
}

// Cambiar idioma con transición
async function changeLang(lang) {
  if (state.lang === lang || state.isTransitioning) return;

  state.lang = lang;
  elements.langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Actualizar nombres de proyectos en navegación
  const links = elements.projectNav.querySelectorAll('.project-link');
  links.forEach((link, index) => {
    const projectSlug = state.projects[index];
    link.textContent = getProjectName(projectSlug);
  });

  // Re-renderizar slide actual con transición
  await renderSlide(true);

  console.log('language changed to:', lang);
}

// Modal de zoom de imagen
function createImageModal() {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = '<img src="" alt="">';
  document.body.appendChild(modal);
  modal.addEventListener('click', closeImageModal);
  return modal;
}

function openImageModal(imageSrc, imageAlt) {
  const modal = document.querySelector('.image-modal') || createImageModal();
  const img = modal.querySelector('img');
  img.src = imageSrc;
  img.alt = imageAlt;
  modal.offsetHeight;
  modal.classList.add('open');
}

function closeImageModal() {
  const modal = document.querySelector('.image-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Parsear URL para slug inicial
function parseURL() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  
  if (slug && state.projects.includes(slug)) {
    const index = state.projects.indexOf(slug);
    state.currentProjectIndex = index;
    console.log('starting with project from URL:', slug);
  }
}

// Inicializar aplicación
async function init() {
  const loaded = await loadData();
  if (!loaded) {
    console.error('failed to load data');
    return;
  }

  parseURL();
  initProjectNav();
  renderSlide(false);

  // Event listeners
  elements.prevBtn.addEventListener('click', goPrev);
  elements.nextBtn.addEventListener('click', goNext);

  elements.slideImage.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(elements.slideImage.src, elements.slideImage.alt);
  });

  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => changeLang(btn.dataset.lang));
  });

  window.addEventListener('keydown', handleKeyboard);

  console.log('app initialized');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
