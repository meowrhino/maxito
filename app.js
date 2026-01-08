// Estado de la aplicación
const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'es'
};

// Elementos del DOM
const elements = {
  projectNav: document.getElementById('project-nav'),
  slideImage: document.getElementById('slide-image'),
  slideText: document.getElementById('slide-text'),
  slideLinks: document.getElementById('slide-links'),
  slideCounter: document.getElementById('slide-counter'),
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
      'horizonte': 'Horizonte'
    }
  },
  en: {
    projectNames: {
      'arboles-bailando': 'Dancing Trees',
      'forest-management-systems': 'Forest Management Systems',
      'horizonte': 'Horizon'
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

// Renderizar slide actual
function renderSlide() {
  const projectSlug = state.projects[state.currentProjectIndex];
  const slides = state.data[projectSlug];
  const slide = slides[state.currentSlideIndex];

  // Actualizar imagen
  elements.slideImage.src = slide.image;
  elements.slideImage.alt = getProjectName(projectSlug);

  // Actualizar texto
  if (slide.text) {
    elements.slideText.textContent = slide.text;
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
      a.textContent = link.text;
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

  console.log(`Rendering: ${projectSlug} - Slide ${state.currentSlideIndex + 1}/${slides.length}`);
}

// Navegar a proyecto específico
function goToProject(projectIndex) {
  state.currentProjectIndex = projectIndex;
  state.currentSlideIndex = 0;
  renderSlide();
}

// Navegar a slide anterior
function goPrev() {
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
  if (state.aboutPanel && elements.aboutPanel.classList.contains('open')) {
    // Si el about está abierto, solo ESC funciona
    if (e.key === 'Escape') {
      closeAbout();
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

// Cambiar idioma
function changeLang(lang) {
  state.lang = lang;
  elements.langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  initProjectNav();
  renderSlide();
  console.log('Language changed to:', lang);
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
  renderSlide();

  // Event listeners
  elements.prevBtn.addEventListener('click', goPrev);
  elements.nextBtn.addEventListener('click', goNext);
  elements.aboutBtn.addEventListener('click', toggleAbout);
  elements.aboutClose.addEventListener('click', closeAbout);
  
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
