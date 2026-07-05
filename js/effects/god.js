import { state, el } from '../core/state.js';
import { getCurrentSlug } from '../core/data.js';
import { replaceFirstPhraseWithNode } from '../core/helpers.js';
import { renderSlide } from '../core/render.js';

export const GOD_TARGET_SLUG = 'god';

const godBlueState = {
  targets: [],
  menuAllTargets: [],
  textTargetCount: 0,
  revealOrder: [],
  revealedCount: 0,
  wordStep: 0,
  phase: 'words',
  imagePhaseTimeoutId: null
};

function resetGodBlueState() {
  godBlueState.targets.forEach(elm => {
    elm.classList.remove('god-blue-trigger', 'god-blue-menu');
  });
  godBlueState.targets = [];
  godBlueState.menuAllTargets = [];
  godBlueState.textTargetCount = 0;
  godBlueState.revealOrder = [];
  godBlueState.revealedCount = 0;
  godBlueState.wordStep = 0;
  godBlueState.phase = 'words';
  if (godBlueState.imagePhaseTimeoutId) {
    window.clearTimeout(godBlueState.imagePhaseTimeoutId);
    godBlueState.imagePhaseTimeoutId = null;
  }
  document.body.classList.remove('god-blue-complete', 'god-blue-image');
}

function applyGodBlueState() {
  const { targets, revealOrder, revealedCount, textTargetCount } = godBlueState;
  const activeSet = new Set(revealOrder.slice(0, revealedCount));
  targets.slice(0, textTargetCount).forEach((span, i) => {
    const isActive = activeSet.has(i);
    span.classList.toggle('god-blue-trigger', isActive);
  });
}

function revealNextGodBlueWord() {
  if (!godBlueState.targets.length) return;

  // Menu+lang+arrows all go blue at once, then immediately to image phase.
  if (godBlueState.phase === 'menu') {
    godBlueState.menuAllTargets.forEach(elm => elm.classList.add('god-blue-trigger'));
    godBlueState.phase = 'image';
    document.body.classList.add('god-blue-image');
    return;
  }

  if (godBlueState.phase === 'image') {
    godBlueState.phase = 'complete';
    document.body.classList.add('god-blue-complete');
    return;
  }

  if (godBlueState.phase === 'complete') {
    godBlueState.phase = 'words';
    godBlueState.wordStep = 1;
    godBlueState.revealedCount = Math.min(1, godBlueState.textTargetCount);
    document.body.classList.remove('god-blue-complete', 'god-blue-image');
    godBlueState.menuAllTargets.forEach(elm => elm.classList.remove('god-blue-trigger'));
    applyGodBlueState();
    return;
  }

  // phase === 'words' — 4 fixed steps:
  // 0 → first word (ambition/ambició)
  // 1 → second word (aspiration/aspiracionalitat)
  // 2 → half of all text words
  // 3 → all text words → next click triggers menu phase
  const { wordStep, textTargetCount } = godBlueState;
  if (wordStep === 0) {
    godBlueState.revealedCount = Math.min(1, textTargetCount);
  } else if (wordStep === 1) {
    godBlueState.revealedCount = Math.min(2, textTargetCount);
  } else if (wordStep === 2) {
    godBlueState.revealedCount = Math.ceil(textTargetCount / 2);
  } else {
    godBlueState.revealedCount = textTargetCount;
  }
  godBlueState.wordStep += 1;
  applyGodBlueState();

  if (godBlueState.revealedCount >= godBlueState.textTargetCount) {
    godBlueState.phase = 'menu';
  }
}

export function enhanceGodBlueWords(container, slug) {
  resetGodBlueState();
  if (slug !== GOD_TARGET_SLUG || !container) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  const textTargets = [];
  const wordRegex = /[A-Za-zÀ-ÖØ-öø-ÿ0-9'’\-]+/g;

  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest('a, .shine-trigger, .gde-paint-trigger, .carapils-playful-trigger')) return;

    const text = node.textContent || '';
    if (!wordRegex.test(text)) {
      wordRegex.lastIndex = 0;
      return;
    }
    wordRegex.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = wordRegex.exec(text);
    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));

      const span = document.createElement('span');
      span.className = 'god-word';
      span.textContent = match[0];
      frag.appendChild(span);
      textTargets.push(span);

      last = end;
      match = wordRegex.exec(text);
    }

    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });

  const menuTargets = Array.from(el.projectNav.querySelectorAll('.project-link'));
  menuTargets.forEach(link => {
    link.classList.add('god-blue-menu');
  });

  const langTargets = [];
  const seenLangs = new Set();
  [...el.langBtns, ...el.langBtnsMobile].forEach(btn => {
    const key = (btn.dataset.lang || btn.textContent || '').toLowerCase();
    if (!key || seenLangs.has(key)) return;
    seenLangs.add(key);
    btn.classList.add('god-blue-menu');
    langTargets.push(btn);
  });

  const navArrowTargets = [el.prevBtn, el.nextBtn, el.prevBtnMobile, el.nextBtnMobile]
    .filter(Boolean);
  navArrowTargets.forEach(btn => {
    btn.classList.add('god-blue-menu');
  });

  const langSepTargets = Array.from(document.querySelectorAll('.lang-sep'));
  const menuAllTargets = [...menuTargets, ...langTargets, ...langSepTargets, ...navArrowTargets];
  const targets = [...textTargets, ...menuAllTargets];

  if (!targets.length) return;

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const normalizeGodStartWord = (value) => normalize(value)
    .replace(/^[a-z][’']/i, '');
  const firstWordCandidates = state.lang === 'cat'
    ? ['ambicio']
    : ['ambition'];
  const secondWordCandidates = state.lang === 'cat'
    ? ['aspiracionalitat']
    : ['aspiration'];

  const findFirstTextIndex = (candidates, excludeIndex = -1) => {
    for (const candidate of candidates) {
      const idx = textTargets.findIndex((span, i) => {
        if (i === excludeIndex) return false;
        return normalizeGodStartWord(span.textContent) === candidate;
      });
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const firstIndex = findFirstTextIndex(firstWordCandidates);
  if (firstIndex < 0) return;

  const secondIndex = findFirstTextIndex(secondWordCandidates, firstIndex);

  const excludedTextIndices = new Set([firstIndex]);
  if (secondIndex >= 0) excludedTextIndices.add(secondIndex);

  const textIndices = textTargets
    .map((_, i) => i)
    .filter(i => !excludedTextIndices.has(i));
  for (let i = textIndices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [textIndices[i], textIndices[j]] = [textIndices[j], textIndices[i]];
  }

  // Menu/lang/arrows reveal all at once — no individual indices needed.
  const revealOrder = secondIndex >= 0
    ? [firstIndex, secondIndex, ...textIndices]
    : [firstIndex, ...textIndices];

  godBlueState.targets = targets;
  godBlueState.menuAllTargets = menuAllTargets;
  godBlueState.textTargetCount = textTargets.length;
  godBlueState.revealOrder = revealOrder;
  godBlueState.revealedCount = 1;
  godBlueState.wordStep = 1;
  godBlueState.phase = 'words';
  applyGodBlueState();
}

export function enhanceGodOthersLink(container, slug) {
  if (slug !== GOD_TARGET_SLUG || !container) return;
  const phrase = state.lang === 'cat' ? 'altres coses' : 'other things';
  const pdfUrl = '/data/top%2010%20slides%20web%20provisional.pdf';

  replaceFirstPhraseWithNode(container, phrase, (matchedText) => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.className = 'god-others-link';
    a.textContent = matchedText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  });
}

// Consumed by the general #project-nav click handler in render.js; only acts
// when the god easter egg is mid-reveal on the god slug.
export function handleGodProjectNavClick(event) {
  if (getCurrentSlug() !== GOD_TARGET_SLUG) return false;
  const trigger = event.target.closest('.project-link.god-blue-trigger');
  if (!trigger) return false;
  event.preventDefault();
  event.stopPropagation();
  revealNextGodBlueWord();
  return true;
}

// Consumed by the general lang-button click handler in render.js; only acts
// when the god easter egg has turned the lang button blue.
export function handleGodLangButtonClick(event) {
  const btn = event.currentTarget;
  if (
    getCurrentSlug() === GOD_TARGET_SLUG
    && btn
    && btn.classList.contains('god-blue-trigger')
  ) {
    event.preventDefault();
    event.stopPropagation();
    revealNextGodBlueWord();
    return true;
  }
  return false;
}

export function handleGodCompleteResetClick(event) {
  if (getCurrentSlug() !== GOD_TARGET_SLUG) return;
  if (godBlueState.phase !== 'complete') return;

  event.preventDefault();
  event.stopPropagation();

  if (!state.isTransitioning) {
    renderSlide(false);
  }
}

export function handleGodClick(event) {
  const godTrigger = event.target.closest('.god-blue-trigger');
  if (godTrigger) {
    if (getCurrentSlug() !== GOD_TARGET_SLUG) return true;
    event.preventDefault();
    revealNextGodBlueWord();
    return true;
  }

  return false;
}
