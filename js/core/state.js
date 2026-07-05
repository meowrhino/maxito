// === State ===
export const state = {
  data: {},
  projects: [],
  currentProjectIndex: 0,
  currentSlideIndex: 0,
  lang: 'en',
  isTransitioning: false
};

export const SEO = {
  siteName: 'Max Azemar',
  baseUrl: 'https://maxazemar.com',
  defaultDescription: 'Portfolio of Max Azemar: art projects, research, and performative practices between art and life.',
  defaultImage: 'img/1.webp'
};

export const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
export const ALLOWED_INLINE_TAGS = new Set(['a', 'em', 'strong', 'b', 'i', 'br']);
// Max time to wait for a new slide image to decode before fading back in.
// Prevents the <img> from briefly painting the previous project's bitmap
// during the fade-in, while still capping the wait for slow/broken images.
export const IMAGE_DECODE_TIMEOUT_MS = 1000;

// === DOM references ===
export const el = {
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
