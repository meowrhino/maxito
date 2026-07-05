import { resolveAsset, getCurrentSlug } from '../core/data.js';
import { wrapPatternMatches } from '../core/helpers.js';

export const GDE_PAINT_TARGET_SLUG = 'gde';
const GDE_PIXEL_SIZE = 1;
const GDE_PENCIL_CURSOR_SRC = 'data/eastereggs/Recurso 1.svg';

export const GDE_PRELOAD_SOURCES = [GDE_PENCIL_CURSOR_SRC];

const gdePaintState = {
  active: false,
  layer: null,
  cursorEl: null,
  moveHandler: null,
  touchStartHandler: null,
  touchMoveHandler: null,
  autoDrawFrameId: null,
  autoX: null,
  autoY: null,
  autoVX: 0,
  autoVY: 0,
  lastX: null,
  lastY: null,
  drawnKeys: new Set()
};

export function enhanceGdePaintTriggers(container, slug) {
  if (slug !== GDE_PAINT_TARGET_SLUG || !container) return;

  wrapPatternMatches(container, {
    pattern: /Grup d[’']Estudi/gi,
    className: 'gde-paint-trigger',
    mode: 'first',
    excludeSelector: 'a, .gde-paint-trigger'
  });
}

function ensureGdePaintLayer() {
  if (gdePaintState.layer && document.body.contains(gdePaintState.layer)) {
    return gdePaintState.layer;
  }
  let layer = document.getElementById('gde-paint-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'gde-paint-layer';
    document.body.appendChild(layer);
  }
  gdePaintState.layer = layer;
  return layer;
}

function ensureGdeCursorElement() {
  if (gdePaintState.cursorEl && document.body.contains(gdePaintState.cursorEl)) {
    return gdePaintState.cursorEl;
  }

  let cursor = document.getElementById('gde-pencil-cursor');
  if (!cursor) {
    cursor = document.createElement('img');
    cursor.id = 'gde-pencil-cursor';
    cursor.alt = '';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
  }

  cursor.src = resolveAsset(GDE_PENCIL_CURSOR_SRC);
  gdePaintState.cursorEl = cursor;
  return cursor;
}

function drawGdePixel(clientX, clientY) {
  const layer = ensureGdePaintLayer();
  const gx = Math.floor(clientX / GDE_PIXEL_SIZE) * GDE_PIXEL_SIZE;
  const gy = Math.floor(clientY / GDE_PIXEL_SIZE) * GDE_PIXEL_SIZE;
  const key = `${gx},${gy}`;
  if (gdePaintState.drawnKeys.has(key)) return;

  gdePaintState.drawnKeys.add(key);
  const px = document.createElement('div');
  px.className = 'gde-paint-pixel';
  px.style.left = `${gx}px`;
  px.style.top = `${gy}px`;
  layer.appendChild(px);
}

function drawGdeLine(x0, y0, x1, y1) {
  const gx0 = Math.floor(x0 / GDE_PIXEL_SIZE);
  const gy0 = Math.floor(y0 / GDE_PIXEL_SIZE);
  const gx1 = Math.floor(x1 / GDE_PIXEL_SIZE);
  const gy1 = Math.floor(y1 / GDE_PIXEL_SIZE);

  let x = gx0;
  let y = gy0;
  const dx = Math.abs(gx1 - gx0);
  const dy = Math.abs(gy1 - gy0);
  const sx = gx0 < gx1 ? 1 : -1;
  const sy = gy0 < gy1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    drawGdePixel(x * GDE_PIXEL_SIZE, y * GDE_PIXEL_SIZE);
    if (x === gx1 && y === gy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function clearGdePainting() {
  const layer = ensureGdePaintLayer();
  layer.innerHTML = '';
  gdePaintState.drawnKeys.clear();
  gdePaintState.lastX = null;
  gdePaintState.lastY = null;
}

function updateGdeDrawPoint(clientX, clientY, cursorEl) {
  cursorEl.style.left = `${clientX}px`;
  cursorEl.style.top = `${clientY}px`;
  if (gdePaintState.lastX === null || gdePaintState.lastY === null) {
    drawGdePixel(clientX, clientY);
  } else {
    drawGdeLine(gdePaintState.lastX, gdePaintState.lastY, clientX, clientY);
  }
  gdePaintState.lastX = clientX;
  gdePaintState.lastY = clientY;
}

function startGdePaintMode() {
  if (gdePaintState.active) return;
  gdePaintState.active = true;
  document.body.classList.add('gde-paint-mode');
  ensureGdePaintLayer();
  const cursorEl = ensureGdeCursorElement();
  cursorEl.style.display = 'block';
  gdePaintState.moveHandler = (event) => {
    updateGdeDrawPoint(event.clientX, event.clientY, cursorEl);
  };

  gdePaintState.touchStartHandler = (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    updateGdeDrawPoint(touch.clientX, touch.clientY, cursorEl);
  };

  gdePaintState.touchMoveHandler = (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    updateGdeDrawPoint(touch.clientX, touch.clientY, cursorEl);
  };

  document.addEventListener('mousemove', gdePaintState.moveHandler);
  document.addEventListener('touchstart', gdePaintState.touchStartHandler, { passive: false });
  document.addEventListener('touchmove', gdePaintState.touchMoveHandler, { passive: false });
}

function stopGdePaintMode(clear = true) {
  gdePaintState.active = false;
  if (gdePaintState.moveHandler) {
    document.removeEventListener('mousemove', gdePaintState.moveHandler);
    gdePaintState.moveHandler = null;
  }
  if (gdePaintState.touchStartHandler) {
    document.removeEventListener('touchstart', gdePaintState.touchStartHandler);
    gdePaintState.touchStartHandler = null;
  }
  if (gdePaintState.touchMoveHandler) {
    document.removeEventListener('touchmove', gdePaintState.touchMoveHandler);
    gdePaintState.touchMoveHandler = null;
  }
  if (gdePaintState.autoDrawFrameId) {
    window.cancelAnimationFrame(gdePaintState.autoDrawFrameId);
    gdePaintState.autoDrawFrameId = null;
  }
  gdePaintState.autoX = null;
  gdePaintState.autoY = null;
  gdePaintState.autoVX = 0;
  gdePaintState.autoVY = 0;
  document.body.classList.remove('gde-paint-mode');
  if (gdePaintState.cursorEl) {
    gdePaintState.cursorEl.style.display = 'none';
  }
  if (clear) clearGdePainting();
}

export function syncGdePaintMode(slug) {
  if (slug !== GDE_PAINT_TARGET_SLUG) {
    stopGdePaintMode(true);
  }
}

export function handleGdeClick(event) {
  const paintTrigger = event.target.closest('.gde-paint-trigger');
  if (paintTrigger) {
    if (getCurrentSlug() !== GDE_PAINT_TARGET_SLUG) return true;
    event.preventDefault();
    startGdePaintMode();
    return true;
  }

  return false;
}
