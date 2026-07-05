import { state } from '../core/state.js';
import { resolveAsset, getCurrentSlug } from '../core/data.js';
import { wrapPatternMatches } from '../core/helpers.js';

export const CARAPILS_TARGET_SLUG = 'carapils';
const CARAPILS_OPEN_STEPS = [6, 12, 20, 30, 42, 56, 72, 88, 100];
const CARAPILS_CURTAIN_IMG_SRC = 'data/eastereggs/cortina-optimized.jpg';

export const CARAPILS_PRELOAD_SOURCES = [CARAPILS_CURTAIN_IMG_SRC];

const carapilsCurtainState = {
  docClickHandler: null
};

export function enhanceCaraPilsPlayfulTrigger(container, slug) {
  if (slug !== CARAPILS_TARGET_SLUG || !container) return;

  const pattern = state.lang === 'cat' ? /\blúdic\b|\bludic\b/i : /\bplayful\b/i;

  wrapPatternMatches(container, {
    pattern,
    className: 'carapils-playful-trigger',
    mode: 'first',
    excludeSelector: 'a, .carapils-playful-trigger'
  });
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

export function syncCaraPilsCurtains(slug) {
  if (slug !== CARAPILS_TARGET_SLUG) {
    teardownCaraPilsCurtains();
  }
}

export function handleCaraPilsClick(event) {
  const playfulTrigger = event.target.closest('.carapils-playful-trigger');
  if (playfulTrigger) {
    if (getCurrentSlug() !== CARAPILS_TARGET_SLUG) return true;
    event.preventDefault();
    showCaraPilsCurtains();
    return true;
  }

  return false;
}
