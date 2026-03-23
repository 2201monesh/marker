/**
 * Pencil-trace animation for .btn-molding buttons.
 * A nib traces each edge at constant speed with pauses at corners.
 * The drawn line stays at full opacity until the rectangle is complete,
 * then the whole border fades out, pauses, and repeats.
 */

const SPEED = 500;           // px per second (constant across all edges)
const PAUSE = 450;           // ms pause at each corner
const FADE_DURATION = 800;   // ms to fade out after completing the rectangle
const REST = 4000;           // ms rest (fully invisible) before next loop
const OPACITY = 0.18;        // line opacity while drawing
const LINE_WIDTH = 1.5;
const COLOR = '45, 36, 24';

export function initButtonTrace() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.btn-molding').forEach((btn, index) => {
    new ButtonTrace(btn, index);
  });
}

class ButtonTrace {
  constructor(btn, index) {
    this.btn = btn;
    this.timeOffset = index * 1800;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:-2px;pointer-events:none;z-index:1;';
    this.canvas.setAttribute('aria-hidden', 'true');
    btn.appendChild(this.canvas);

    this.measure();
    requestAnimationFrame((t) => this.draw(t));

    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(btn);
  }

  measure() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.btn.getBoundingClientRect();
    // Canvas has inset:-2px relative to the padding box.
    // The button has 1px border, so padding box = border box - 2px.
    // Canvas rendered size = padding box + 4px = border box + 2px.
    this.W = rect.width + 2;
    this.H = rect.height + 2;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Canvas origin is 1px outside the button's border-box.
    // The outermost box-shadow line (0 0 0 2px) is 2px outside the border,
    // which is 1px from the canvas edge. Trace there.
    const p = 1;
    this.corners = [
      { x: p, y: p },
      { x: this.W - p, y: p },
      { x: this.W - p, y: this.H - p },
      { x: p, y: this.H - p },
    ];

    this.edges = [];
    for (let i = 0; i < 4; i++) {
      const a = this.corners[i], b = this.corners[(i + 1) % 4];
      this.edges.push(Math.hypot(b.x - a.x, b.y - a.y));
    }
    this.perimeter = this.edges.reduce((s, e) => s + e, 0);

    this.cumDist = [0];
    for (let i = 0; i < 4; i++) {
      this.cumDist.push(this.cumDist[i] + this.edges[i]);
    }

    // Cycle: trace all 4 edges with pauses + fade + rest
    let t = 0;
    for (let i = 0; i < 4; i++) {
      t += (this.edges[i] / SPEED) * 1000 + PAUSE;
    }
    this.traceDuration = t;
    this.cycleDuration = t + FADE_DURATION + REST;
  }

  /**
   * Returns { nibDist, phase, fade }
   *   phase: 'drawing' | 'fading' | 'rest'
   *   nibDist: how far along the perimeter the nib has drawn (0 to perimeter)
   *   fade: opacity multiplier (1 during drawing, 1→0 during fading, 0 during rest)
   */
  getState(elapsed) {
    let t = ((elapsed + this.timeOffset) % this.cycleDuration);

    // Phase 1: drawing edge by edge
    if (t < this.traceDuration) {
      let remaining = t;
      for (let i = 0; i < 4; i++) {
        const edgeTime = (this.edges[i] / SPEED) * 1000;
        if (remaining < edgeTime) {
          return {
            nibDist: this.cumDist[i] + this.edges[i] * (remaining / edgeTime),
            phase: 'drawing',
            fade: 1,
          };
        }
        remaining -= edgeTime;
        if (remaining < PAUSE) {
          return { nibDist: this.cumDist[i + 1], phase: 'drawing', fade: 1 };
        }
        remaining -= PAUSE;
      }
    }

    // Phase 2: fading out the completed rectangle
    const fadeT = t - this.traceDuration;
    if (fadeT < FADE_DURATION) {
      const progress = fadeT / FADE_DURATION;
      // Ease-out fade
      const fade = 1 - progress * progress;
      return { nibDist: this.perimeter, phase: 'fading', fade };
    }

    // Phase 3: rest (invisible)
    return { nibDist: 0, phase: 'rest', fade: 0 };
  }

  draw(now) {
    const { ctx, W, H, corners, cumDist, perimeter } = this;
    ctx.clearRect(0, 0, W, H);

    const { nibDist, fade } = this.getState(now);

    if (fade > 0.01 && nibDist > 0) {
      ctx.strokeStyle = `rgba(${COLOR}, ${(OPACITY * fade).toFixed(4)})`;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'butt';

      // Draw all fully-completed edges + the partial current edge
      for (let i = 0; i < 4; i++) {
        const a = corners[i], b = corners[(i + 1) % 4];
        const eS = cumDist[i];
        const eE = cumDist[i + 1];

        if (nibDist <= eS) break; // haven't reached this edge yet

        const drawEnd = Math.min(nibDist, eE);
        const fE = (drawEnd - eS) / (eE - eS);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * fE, a.y + (b.y - a.y) * fE);
        ctx.stroke();
      }
    }

    requestAnimationFrame((t) => this.draw(t));
  }
}
