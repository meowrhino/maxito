import { el } from './js/core/state.js';
import { loadData, resolveAsset } from './js/core/data.js';
import {
  renderSlide,
  syncLangButtons,
  initProjectNav,
  syncNavIndicator,
  setSidebarExpanded,
  goPrev,
  goNext,
  handleKeyboard,
  handleSlideTextClick,
  handleProjectNavClick,
  handleLangButtonClick,
  openImageModal,
  parseURL
} from './js/core/render.js';
import { handleGodCompleteResetClick } from './js/effects/god.js';
import { FOC_PRELOAD_SOURCES } from './js/effects/foc.js';
import { ABOUT_PRELOAD_SOURCES } from './js/effects/about.js';
import { GDE_PRELOAD_SOURCES } from './js/effects/gde.js';
import { NCB_PRELOAD_SOURCES } from './js/effects/ncb.js';
import { CARAPILS_PRELOAD_SOURCES } from './js/effects/carapils.js';
import { ARBRE_PRELOAD_SOURCES } from './js/effects/arbre.js';

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
    ...FOC_PRELOAD_SOURCES,
    ...GDE_PRELOAD_SOURCES,
    ...ABOUT_PRELOAD_SOURCES,
    ...NCB_PRELOAD_SOURCES,
    ...CARAPILS_PRELOAD_SOURCES,
    ...ARBRE_PRELOAD_SOURCES
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
