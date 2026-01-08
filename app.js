// Estado de la aplicación
const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'es',
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
  aboutBtn: document.getElementById('about-btn'),
  aboutPanel: document.getElementById('about-panel'),
  aboutClose: document.getElementById('about-close'),
  langBtns: document.querySelectorAll('.lang-btn')
};

// Textos multiidioma
const i18n = {
  es: {
    projectNames: {
      'arboles-bailando': 'Árboles Bailando',
      'forest-management-systems': 'Forest Management Systems',
      'horizonte': 'Horizonte',
      'raices-urbanas': 'Raíces Urbanas',
      'memoria-vegetal': 'Memoria Vegetal',
      'especies-invasoras': 'Especies Invasoras'
    }
  },
  en: {
    projectNames: {
      'arboles-bailando': 'Dancing Trees',
      'forest-management-systems': 'Forest Management Systems',
      'horizonte': 'Horizon',
      'raices-urbanas': 'Urban Roots',
      'memoria-vegetal': 'Plant Memory',
      'especies-invasoras': 'Invasive Species'
    }
  }
};

// Cargar datos
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Error loading data.json');
    state.data = await response.json();
    state.projects = Object.keys(state.data);
    console.log('Data loaded:', state.projects);
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
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
  return slide[key] || slide.text_es || slide.text_en || null;
}

// Obtener texto de link según idioma
function getLinkText(link) {
  const key = `text_${state.lang}`;
  return link[key] || link.text_es || link.text_en || link.text || '';
}

// Actualizar indicadores de navegación entre proyectos
function updateProjectIndicators() {
  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];
  const isFirstSlide = state.currentSlideIndex === 0;
  const isLastSlide = state.currentSlideIndex === slides.length - 1;

  // Limpiar indicadores existentes
  const existingIndicators = document.querySelectorAll('.project-indicator');
  existingIndicators.forEach(indicator => indicator.remove());

  // Indicador de proyecto anterior (cuando estamos en la primera slide)
  if (isFirstSlide) {
    const prevProjectIndex = (state.currentProjectIndex - 1 + state.projects.length) % state.projects.length;
    const prevProjectSlug = state.projects[prevProjectIndex];
    const prevProjectName = getProjectName(prevProjectSlug);
    
    const prevIndicator = document.createElement('span');
    prevIndicator.className = 'project-indicator';
    prevIndicator.textContent = prevProjectName;
    elements.prevBtn.appendChild(prevIndicator);
  }

  // Indicador de proyecto siguiente (cuando estamos en la última slide)
  if (isLastSlide) {
    const nextProjectIndex = (state.currentProjectIndex + 1) % state.projects.length;
    const nextProjectSlug = state.projects[nextProjectIndex];
    const nextProjectName = getProjectName(nextProjectSlug);
    
    const nextIndicator = document.createElement('span');
    nextIndicator.className = 'project-indicator';
    nextIndicator.textContent = nextProjectName;
    elements.nextBtn.appendChild(nextIndicator);
  }
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
    await sleep(300); // Duración de la transición
  }

  // Actualizar imagen
  elements.slideImage.src = slide.image;
  elements.slideImage.alt = getProjectName(projectSlug);

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

  // Actualizar contador
  elements.slideCounter.textContent = `${state.currentSlideIndex + 1}/${slides.length}`;

  // Actualizar navegación
  updateActiveProject();

  // Actualizar indicadores de proyectos
  updateProjectIndicators();

  // Finalizar transición
  if (withTransition) {
    elements.slideContent.classList.remove('transitioning');
    state.isTransitioning = false;
  }

  console.log(`Rendering: ${projectSlug} - Slide ${state.currentSlideIndex + 1}/${slides.length}`);
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
    // Slide anterior en el mismo proyecto
    state.currentSlideIndex--;
  } else {
    // Ir al último slide del proyecto anterior
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
    // Siguiente slide en el mismo proyecto
    state.currentSlideIndex++;
  } else {
    // Ir al primer slide del siguiente proyecto
    state.currentProjectIndex = (state.currentProjectIndex + 1) % state.projects.length;
    state.currentSlideIndex = 0;
  }

  renderSlide();
}

// Manejar navegación con teclado
function handleKeyboard(e) {
  if (elements.aboutPanel.classList.contains('open')) {
    // Si el about está abierto, solo ESC funciona
    if (e.key === 'Escape') {
      closeAbout();
    }
    return;
  }

  // Si el modal de imagen está abierto, solo ESC funciona
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
    case 'Escape':
      closeAbout();
      break;
  }
}

// Abrir/cerrar panel About
function toggleAbout() {
  elements.aboutPanel.classList.toggle('open');
  elements.aboutBtn.classList.toggle('active');
}

function closeAbout() {
  elements.aboutPanel.classList.remove('open');
  elements.aboutBtn.classList.remove('active');
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

  console.log('Language changed to:', lang);
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
  
  // Forzar reflow para que la transición funcione
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
    console.log('Starting with project from URL:', slug);
  }
}

// Inicializar aplicación
async function init() {
  const loaded = await loadData();
  if (!loaded) {
    console.error('Failed to load data');
    return;
  }

  parseURL();
  initProjectNav();
  renderSlide(false); // Primera renderización sin transición

  // Event listeners
  elements.prevBtn.addEventListener('click', goPrev);
  elements.nextBtn.addEventListener('click', goNext);
  elements.aboutBtn.addEventListener('click', toggleAbout);
  elements.aboutClose.addEventListener('click', closeAbout);
  
  // Click en imagen para zoom
  elements.slideImage.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(elements.slideImage.src, elements.slideImage.alt);
  });

  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => changeLang(btn.dataset.lang));
  });

  window.addEventListener('keydown', handleKeyboard);

  console.log('App initialized');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
