import { state } from '../core/state.js';
import { resolveAsset, getCurrentSlug } from '../core/data.js';
import { wrapLastMatchPerRule } from '../core/helpers.js';

const FOC_SHINE_GIF_SRC = 'data/eastereggs/fireworks.gif';
const FOC_BURNED_GIF_SRC = 'data/eastereggs/llama2.gif';

const shineSpreadState = {
  timeoutIds: []
};
const burnSpreadState = {
  timeoutIds: []
};

export const FOC_PRELOAD_SOURCES = [FOC_SHINE_GIF_SRC, FOC_BURNED_GIF_SRC];

export function enhanceFocShineTriggers(container, slug) {
  if (slug !== 'foc' || !container) return;

  const shinePattern = state.lang === 'cat' ? /\bbrilla\b/gi : /\bshine(?:s)?\b/gi;
  const burnedPattern = state.lang === 'cat' ? /\bcrema\b|\bcremat\b|\bcremada\b/gi : /\bburned\b/gi;

  wrapLastMatchPerRule(container, [
    { pattern: shinePattern, className: 'shine-trigger' },
    { pattern: burnedPattern, className: 'burned-trigger' }
  ], 'a, .shine-trigger, .burned-trigger');
}

function showShineGifNearTrigger(trigger, gifSrc = FOC_SHINE_GIF_SRC) {
  shineSpreadState.timeoutIds.forEach(id => window.clearTimeout(id));
  shineSpreadState.timeoutIds = [];
  document.querySelectorAll('.shine-pop.shine-pop-floating:not(.burned-fire-pop)').forEach(node => node.remove());
  const edgeBleed = 140;

  const spawn = (x, y, size, duration) => {
    const img = document.createElement('img');
    img.className = 'shine-pop shine-pop-floating';
    img.src = resolveAsset(gifSrc);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.left = `${x.toFixed(1)}px`;
    img.style.top = `${y.toFixed(1)}px`;
    img.style.width = `${size.toFixed(0)}px`;
    img.style.height = `${size.toFixed(0)}px`;
    img.style.animationDuration = `${duration}ms`;
    document.body.appendChild(img);
    const removeId = window.setTimeout(() => img.remove(), duration + 40);
    shineSpreadState.timeoutIds.push(removeId);
  };

  const rect = trigger.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Main bigger gif near the clicked word.
  spawn(centerX, centerY - 70, 150, 1300);

  // Spread shine across the viewport — lightweight (3 waves).
  const waveCount = 3;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

  for (let wave = 0; wave < waveCount; wave += 1) {
    const delay = wave * 220;
    const count = Math.min(4 + wave * 3, 12);
    const radiusBase = (maxRadius * (wave + 1)) / waveCount;
    const globalCount = 4 + wave * 2;

    const waveId = window.setTimeout(() => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(0, radiusBase + (Math.random() - 0.5) * 150);
        const x = Math.min(window.innerWidth + edgeBleed, Math.max(-edgeBleed, centerX + Math.cos(angle) * radius));
        const y = Math.min(window.innerHeight + edgeBleed, Math.max(-edgeBleed, centerY + Math.sin(angle) * radius));
        const size = 110 + Math.random() * 60;
        const duration = 1000 + Math.random() * 800;
        spawn(x, y, size, duration);
      }

      for (let i = 0; i < globalCount; i += 1) {
        const x = -edgeBleed + Math.random() * Math.max(1, window.innerWidth + edgeBleed * 2);
        const y = -edgeBleed + Math.random() * Math.max(1, window.innerHeight + edgeBleed * 2);
        const size = 100 + Math.random() * 70;
        const duration = 900 + Math.random() * 800;
        spawn(x, y, size, duration);
      }
    }, delay);
    shineSpreadState.timeoutIds.push(waveId);
  }
}

function showBurnedFireSpread() {
  burnSpreadState.timeoutIds.forEach(id => window.clearTimeout(id));
  burnSpreadState.timeoutIds = [];
  document.querySelectorAll('.burned-fire-pop').forEach(node => node.remove());
  const edgeBleed = 140;

  const spawn = (x, y, size, duration) => {
    const img = document.createElement('img');
    img.className = 'shine-pop shine-pop-floating burned-fire-pop';
    img.src = resolveAsset(FOC_BURNED_GIF_SRC);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.left = `${x.toFixed(1)}px`;
    img.style.top = `${y.toFixed(1)}px`;
    img.style.width = `${size.toFixed(0)}px`;
    img.style.height = `${size.toFixed(0)}px`;
    img.style.animationDuration = `${duration}ms`;
    document.body.appendChild(img);
    const removeId = window.setTimeout(() => img.remove(), duration + 40);
    burnSpreadState.timeoutIds.push(removeId);
  };

  const startX = 64;
  const startY = window.innerHeight - 64;
  const waveCount = 4;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

  for (let wave = 0; wave < waveCount; wave += 1) {
    const delay = wave * 300;
    const count = Math.min(3 + wave * 3, 12);
    const radiusBase = (maxRadius * (wave + 1)) / waveCount;
    const progress = (wave + 1) / waveCount;
    const globalCount = Math.floor(4 + progress * 8);

    const waveId = window.setTimeout(() => {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(0, radiusBase + (Math.random() - 0.5) * 160);
        const x = Math.min(window.innerWidth + edgeBleed, Math.max(-edgeBleed, startX + Math.cos(angle) * radius));
        const y = Math.min(window.innerHeight + edgeBleed, Math.max(-edgeBleed, startY + Math.sin(angle) * radius));
        const size = 120 + Math.random() * 80;
        const duration = 1600 + Math.random() * 1200;
        spawn(x, y, size, duration);
      }

      for (let i = 0; i < globalCount; i += 1) {
        const x = -edgeBleed + Math.random() * Math.max(1, window.innerWidth + edgeBleed * 2);
        const y = -edgeBleed + Math.random() * Math.max(1, window.innerHeight + edgeBleed * 2);
        const size = 100 + Math.random() * 95;
        const duration = 1500 + Math.random() * 1300;
        spawn(x, y, size, duration);
      }
    }, delay);
    burnSpreadState.timeoutIds.push(waveId);
  }

}

export function handleFocClick(event) {
  const shineTrigger = event.target.closest('.shine-trigger');
  if (shineTrigger) {
    if (getCurrentSlug() !== 'foc') return true;
    event.preventDefault();
    showShineGifNearTrigger(shineTrigger);
    return true;
  }

  const burnedTrigger = event.target.closest('.burned-trigger');
  if (burnedTrigger) {
    if (getCurrentSlug() !== 'foc') return true;
    event.preventDefault();
    showBurnedFireSpread();
    return true;
  }

  return false;
}
