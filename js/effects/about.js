import { state } from '../core/state.js';
import { buildPath, resolveAsset, getCurrentSlug } from '../core/data.js';
import { escapeRegExp, wrapPatternMatches, replaceFirstPhraseWithNode } from '../core/helpers.js';
import { renderSlide } from '../core/render.js';

export const ABOUT_TARGET_SLUG = 'about';
const ABOUT_FLIGHT_IMG_SRC = 'data/eastereggs/flight.jpg';
const ABOUT_METRO_IMG_SRC = 'data/eastereggs/metro.jpg';
const ABOUT_ARBORICULTURE_IMG_SRC = 'data/eastereggs/arboriculture.jpg';

export const ABOUT_PRELOAD_SOURCES = [
  ABOUT_FLIGHT_IMG_SRC,
  ABOUT_METRO_IMG_SRC,
  ABOUT_ARBORICULTURE_IMG_SRC
];

export const aboutRevealState = {
  active: false
};

export function enhanceAboutSpecificContextsTrigger(container, slug) {
  if (slug !== ABOUT_TARGET_SLUG || !container) return;

  const phrase = state.lang === 'cat' ? 'contextos específics' : 'specific contexts';
  const pattern = new RegExp(escapeRegExp(phrase), 'gi');

  wrapPatternMatches(container, {
    pattern,
    className: 'about-context-trigger',
    mode: 'all',
    excludeSelector: 'a, .about-context-trigger'
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

export function applyAboutRevealLinks(container, slug) {
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

export function handleAboutClick(event) {
  const aboutContextTrigger = event.target.closest('.about-context-trigger');
  if (aboutContextTrigger) {
    if (getCurrentSlug() !== ABOUT_TARGET_SLUG) return true;
    event.preventDefault();
    aboutRevealState.active = !aboutRevealState.active;
    renderSlide(false);
    return true;
  }

  const aboutImageTrigger = event.target.closest('.about-image-trigger');
  if (aboutImageTrigger) {
    if (getCurrentSlug() !== ABOUT_TARGET_SLUG) return true;
    event.preventDefault();
    spawnAboutPhoto(aboutImageTrigger.dataset.aboutImage || 'flight');
    return true;
  }

  return false;
}
