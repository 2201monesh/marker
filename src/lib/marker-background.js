/**
 * Marker Stroke Background
 * Renders procedural chisel-tip marker strokes on a <canvas> element.
 */

const PALETTES = {
  warmBeige: { bg: '#f5f0e8', strokes: ['#e8dcc8', '#dfd3bc', '#ede2d0'] },
  coolLinen: { bg: '#f0f0ec', strokes: ['#e2e2db', '#d9dad4', '#eaeae5'] },
  blush:     { bg: '#f5efe9', strokes: ['#ebddd2', '#e4d4ca', '#f0e2d8'] },
  sage:      { bg: '#eff2ec', strokes: ['#dfe6d8', '#d6ddcf', '#e7ece2'] },
  sand:      { bg: '#f3ece0', strokes: ['#e5d9c4', '#ded0b8', '#ebe1cf'] },
};

function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b)); }
function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function getNormal(pts, i) {
  let dx, dy;
  if (i < pts.length - 1) {
    dx = pts[i + 1].x - pts[i].x;
    dy = pts[i + 1].y - pts[i].y;
  } else {
    dx = pts[i].x - pts[i - 1].x;
    dy = pts[i].y - pts[i - 1].y;
  }
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: -dy / len, y: dx / len };
}

function generatePath(sx, sy, ex, ey) {
  const pts = [];
  const steps = 120;
  const cx1 = lerp(sx, ex, 0.33) + rand(-8, 8);
  const cy1 = lerp(sy, ey, 0.33) + rand(-4, 4);
  const cx2 = lerp(sx, ex, 0.66) + rand(-8, 8);
  const cy2 = lerp(sy, ey, 0.66) + rand(-4, 4);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * u * sx + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * ex,
      y: u * u * u * sy + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t * t * t * ey,
    });
  }
  return pts;
}

function generateEdge(pts, halfWidth, side, trimStart, trimEnd) {
  // trimStart/trimEnd: how many path points to cut from each end of this edge
  const edge = [];
  let notch = 0;
  let hold = 0;
  const iStart = trimStart;
  const iEnd = pts.length - 1 - trimEnd;
  for (let i = iStart; i <= iEnd; i++) {
    const t = i / (pts.length - 1);
    let pressure = 1;

    // Rougher edge — more frequent notches, larger jumps
    if (hold <= 0) {
      if (Math.random() < 0.35) {
        notch = rand(-3, 3); // Bigger jagged notches
      } else {
        notch = rand(-1, 1); // Smaller irregularities still present
      }
      hold = randInt(3, 12); // Shorter holds = more variation
    }
    hold--;

    const n = getNormal(pts, i);
    const hw = halfWidth * pressure + notch;
    edge.push({
      x: pts[i].x + n.x * side * hw,
      y: pts[i].y + n.y * side * hw,
    });
  }
  return edge;
}

function drawMarkerStroke(ctx, pts, color, width, masterAlpha) {
  const [cr, cg, cb] = hexToRgb(color);
  const hw = width * 0.5;
  // Top edge is shorter — diagonal chisel cut at each cap
  const topEdge = generateEdge(pts, hw, 1, 3, 2);
  const botEdge = generateEdge(pts, hw, -1, 0, 0);

  // Solid filled body — dense, fully saturated
  ctx.save();
  ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
  ctx.globalAlpha = masterAlpha;
  ctx.beginPath();
  ctx.moveTo(topEdge[0].x, topEdge[0].y);
  for (let i = 1; i < topEdge.length; i++) ctx.lineTo(topEdge[i].x, topEdge[i].y);
  for (let i = botEdge.length - 1; i >= 0; i--) ctx.lineTo(botEdge[i].x, botEdge[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Edge darkening — markers deposit more ink at boundaries
  for (const edge of [topEdge, botEdge]) {
    ctx.save();
    ctx.globalAlpha = masterAlpha * 0.25;
    ctx.strokeStyle = `rgb(${clamp(cr - 20, 0, 255)},${clamp(cg - 20, 0, 255)},${clamp(cb - 20, 0, 255)})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(edge[0].x, edge[0].y);
    for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i].x, edge[i].y);
    ctx.stroke();
    ctx.restore();
  }

}

function addPaperTexture(ctx, w, h) {
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 5;
    d[i]     = clamp(d[i] + n, 0, 255);
    d[i + 1] = clamp(d[i + 1] + n, 0, 255);
    d[i + 2] = clamp(d[i + 2] + n, 0, 255);
  }
  ctx.putImageData(id, 0, 0);
}

export class MarkerBackground {
  constructor(canvas, options = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    this.ctx = this.canvas.getContext('2d');
    this.options = {
      palette: 'warmBeige',
      opacity: 0.28,
      thickness: 60,
      strokeCount: 3,
      dpr: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 2,
      ...options,
    };
    this.resize();
    this.regenerate();
  }

  _getPalette() {
    const p = this.options.palette;
    if (typeof p === 'string') return PALETTES[p] || PALETTES.warmBeige;
    return p;
  }

  resize() {
    const dpr = this.options.dpr;
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  regenerate() {
    const { ctx, w: W, h: H } = this;
    const palette = this._getPalette();
    const { opacity, thickness, strokeCount } = this.options;

    ctx.clearRect(0, 0, W, H);

    const shuffled = [...palette.strokes].sort(() => Math.random() - 0.5);
    const yStart = H * 0.18;
    const yEnd = H * 0.82;

    for (let i = 0; i < strokeCount; i++) {
      const cy = strokeCount === 1
        ? H * 0.5
        : lerp(yStart, yEnd, i / (strokeCount - 1)) + rand(-10, 10);

      const strokeLen = rand(W * 0.45, W * 0.7);
      const sx = rand(W * 0.05, W * 0.5 - strokeLen * 0.3);
      const ex = sx + strokeLen;

      const angle = rand(-3.5, 3.5) * (Math.PI / 180);
      const rise = Math.sin(angle) * strokeLen * 0.5;

      const w = rand(thickness * 0.85, thickness * 1.15);

      const path = generatePath(sx, cy - rise, ex, cy + rise);
      const color = shuffled[i % shuffled.length];
      drawMarkerStroke(ctx, path, color, w, opacity);
    }

    // No paper texture — keep strokes solid and dense
  }

  update(newOptions) {
    Object.assign(this.options, newOptions);
    this.regenerate();
  }
}

/**
 * Draw a single chisel-tip marker highlight stroke at specific coordinates.
 * Designed for positioning behind text lines.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} opts
 * @param {number} opts.sx - Start x
 * @param {number} opts.sy - Start y (center of stroke)
 * @param {number} opts.ex - End x
 * @param {number} opts.ey - End y (center of stroke)
 * @param {string} opts.color - Hex color
 * @param {number} opts.thickness - Stroke thickness in px
 * @param {number} opts.opacity - Master opacity (0-1)
 */
export function drawHighlightStroke(ctx, { sx, sy, ex, ey, color, thickness, opacity }) {
  const path = generatePath(sx, sy, ex, ey);
  drawMarkerStroke(ctx, path, color, thickness, opacity);
}
