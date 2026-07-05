import { state } from '../core/state.js';
import { resolveAsset, getCurrentSlug } from '../core/data.js';
import { wrapPatternMatches } from '../core/helpers.js';

export const NCB_TARGET_SLUG = 'ncb';
const NCB_TATTOO_IMG_SRC = 'data/eastereggs/sagrada-familia-tattoo.jpg';

export const NCB_PRELOAD_SOURCES = [NCB_TATTOO_IMG_SRC];

export function enhanceNcbTattooTrigger(container, slug) {
  if (slug !== NCB_TARGET_SLUG || !container) return;

  const pattern = state.lang === 'cat' ? /Sagrada Família tatuada/ : /Sagrada Família tattooed/;

  wrapPatternMatches(container, {
    pattern,
    className: 'ncb-tattoo-trigger',
    mode: 'first',
    excludeSelector: 'a, .ncb-tattoo-trigger'
  });
}

function spawnNcbTattooPhoto() {
  document.querySelectorAll('.ncb-tattoo-pop').forEach(node => node.remove());

  const img = document.createElement('img');
  img.className = 'ncb-tattoo-pop';
  img.src = resolveAsset(NCB_TATTOO_IMG_SRC);
  img.alt = 'Sagrada Família tattoo';

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

export function handleNcbClick(event) {
  const tattooTrigger = event.target.closest('.ncb-tattoo-trigger');
  if (tattooTrigger) {
    if (getCurrentSlug() !== NCB_TARGET_SLUG) return true;
    event.preventDefault();
    spawnNcbTattooPhoto();
    return true;
  }

  return false;
}
