import { drawCleanUnderline } from './marker-background.js';

const COLOR = '#3A7D56';
const THICKNESS = 8;
const ANGLE_RAD = -0.3 * (Math.PI / 180);

function getStrokeParams(section, canvas) {
  const sectionRect = section.getBoundingClientRect();
  const lines = section.querySelectorAll('[data-marker-line]');
  if (!lines.length) return [];

  return Array.from(lines).map((line) => {
    const rect = line.getBoundingClientRect();
    const cy = rect.bottom - sectionRect.top + 2;
    const sx = rect.left - sectionRect.left - 8;
    const ex = rect.right - sectionRect.left + 8;
    const strokeLen = ex - sx;
    const rise = Math.sin(ANGLE_RAD) * strokeLen * 0.5;

    return {
      sx, sy: cy - rise,
      ex, ey: cy + rise,
      color: COLOR,
      thickness: THICKNESS,
      opacity: 1,
    };
  });
}

function render(canvas) {
  const section = canvas.closest('section');
  if (!section) return;

  const dpr = window.devicePixelRatio || 1;
  const W = section.clientWidth;
  const H = section.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  getStrokeParams(section, canvas).forEach(p => drawCleanUnderline(ctx, p));
}

/**
 * Initialize underline canvases for all sections with [data-underline-canvas].
 * Call once on page load.
 */
export function initSectionUnderlines() {
  const canvases = document.querySelectorAll('[data-underline-canvas]');
  canvases.forEach(c => render(c));
  window.addEventListener('resize', () => canvases.forEach(c => render(c)));
}
