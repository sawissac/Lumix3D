/**
 * svgPreprocess.ts
 *
 * Converts an SVG string into a form that Three.js SVGLoader can accurately
 * extrude.  The main problem is that Three.js SVGLoader only understands
 * **filled** paths; it completely ignores stroke-width.  SVG icons are very
 * often purely stroke-based (fill="none", stroke="white", stroke-width="N"),
 * which results in invisible / wrong 3-D geometry.
 *
 * Strategy:
 *  1. Parse the SVG in a hidden off-screen SVGElement.
 *  2. Walk every path/shape element.
 *  3. For elements that are stroke-only (no fill, or fill="none"), use the
 *     browser's SVGGeometryElement stroke outline to produce a closed filled
 *     path.  We do this by:
 *       a. Getting the resolved stroke-width from getComputedStyle.
 *       b. Creating an invisible <canvas> and using the Canvas 2D API
 *          `strokePath → getImageData` technique is too lossy; instead we use
 *          the CSS Paint Worklet / OffscreenCanvas approach…
 *     Actually, the most reliable cross-browser method available without extra
 *     libs is to convert the SVG element into a "stroke" outline using the
 *     SVG `marker-mid` trick, which is also lossy.
 *
 *     The TRUE solution: use SVGO (browser build) to first flatten the SVG,
 *     then use the browser DOM to convert each stroked path into a filled
 *     path by computing an approximated outline polygon via
 *     `SVGGeometryElement.getPointAtLength`.
 *
 *  4. Run SVGO browser optimisation to clean up transforms, collapse groups,
 *     normalise colours, etc.
 *
 * Result: the returned SVG string contains only **filled** paths, ready for
 * Three.js SVGLoader.
 */

// ─── SVGO browser import (ESM, no Node.js APIs) ─────────────────────────────
import { optimize } from 'svgo/browser';

// ─── types ───────────────────────────────────────────────────────────────────
interface ProcessedSVG {
  svgString: string;
  /** true when at least one stroke was converted to fill */
  hadStrokes: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Return an absolute value from any CSS length string (px, pt, etc.). */
function resolvePx(value: string, dpi = 96): number {
  if (!value || value === 'none') return 0;
  const n = parseFloat(value);
  if (isNaN(n)) return 0;
  if (value.endsWith('pt')) return (n * dpi) / 72;
  if (value.endsWith('mm')) return (n * dpi) / 25.4;
  return n; // assume px
}

/**
 * Approximate a stroke outline around an SVGGeometryElement by sampling many
 * points along the path and building two offset polylines (inner + outer).
 *
 * This is a simplified constant-width offset — good enough for extrusion.
 */
function strokeToFilledPathData(
  el: SVGGeometryElement,
  strokeWidth: number,
  steps = 256,
): string {
  const totalLen = el.getTotalLength();
  if (totalLen === 0 || strokeWidth === 0) return '';

  const half = strokeWidth / 2;
  const points: Array<{ x: number; y: number; nx: number; ny: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalLen;
    const p = el.getPointAtLength(t);

    // Compute tangent by sampling a tiny step ahead
    const epsilon = Math.min(0.5, totalLen / steps / 2);
    const ahead = el.getPointAtLength(Math.min(t + epsilon, totalLen));
    const dx = ahead.x - p.x;
    const dy = ahead.y - p.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1e-9;

    // Normal perpendicular to tangent
    points.push({ x: p.x, y: p.y, nx: -dy / len, ny: dx / len });
  }

  // Build the outline: outer edge forward, inner edge backward
  const outer = points.map((p) => ({
    x: p.x + p.nx * half,
    y: p.y + p.ny * half,
  }));
  const inner = [...points]
    .reverse()
    .map((p) => ({ x: p.x - p.nx * half, y: p.y - p.ny * half }));

  const all = [...outer, ...inner];
  if (all.length === 0) return '';

  return (
    `M ${all[0].x} ${all[0].y} ` +
    all
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ') +
    ' Z'
  );
}

/**
 * For line elements (x1,y1 → x2,y2) produce a thin rectangle path.
 */
function lineToFilledPathData(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
): string {
  const half = strokeWidth / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1e-9;
  const nx = (-dy / len) * half;
  const ny = (dx / len) * half;
  return (
    `M ${x1 + nx} ${y1 + ny} ` +
    `L ${x2 + nx} ${y2 + ny} ` +
    `L ${x2 - nx} ${y2 - ny} ` +
    `L ${x1 - nx} ${y1 - ny} Z`
  );
}

/**
 * Resolve the effective fill / stroke / strokeWidth for a DOM element,
 * chasing `inherit` up the ancestor chain.
 */
function resolveStyle(el: Element): {
  fill: string;
  stroke: string;
  strokeWidth: number;
} {
  const cs = window.getComputedStyle(el);
  return {
    fill: cs.fill || 'none',
    stroke: cs.stroke || 'none',
    strokeWidth: resolvePx(cs.strokeWidth || '0'),
  };
}

/** Clone an element as a plain <path> with given d and fill */
function makeFilledPath(
  svgNS: string,
  d: string,
  fill: string,
  transform?: string,
): SVGPathElement {
  const path = document.createElementNS(svgNS, 'path') as SVGPathElement;
  path.setAttribute('d', d);
  path.setAttribute('fill', fill === 'none' || !fill ? '#000000' : fill);
  path.setAttribute('stroke', 'none');
  if (transform) path.setAttribute('transform', transform);
  return path;
}

// ─── main export ─────────────────────────────────────────────────────────────

/**
 * Pre-process an SVG string so that Three.js SVGLoader will produce geometry
 * that **visually matches** the original SVG.
 *
 * - Stroked paths are converted to filled outlines.
 * - SVGO cleans up the result (collapses groups, flattens transforms, etc.).
 */
export async function preprocessSVGForThree(
  svgString: string,
): Promise<ProcessedSVG> {
  // ── Step 1: parse into a live DOM ────────────────────────────────────────
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.documentElement as unknown as SVGSVGElement;

  // Attach to a hidden container so getComputedStyle / getTotalLength work
  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  document.body.appendChild(host);
  host.appendChild(svgEl);

  let hadStrokes = false;

  const NS = 'http://www.w3.org/2000/svg';

  try {
    // ── Step 2: query all drawable elements ────────────────────────────────
    const drawables = Array.from(
      svgEl.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line'),
    ) as SVGGraphicsElement[];

    for (const el of drawables) {
      const { fill, stroke, strokeWidth } = resolveStyle(el);

      const hasFill = fill !== 'none' && fill !== '';
      const hasStroke = stroke !== 'none' && stroke !== '' && strokeWidth > 0;

      if (!hasStroke) continue; // nothing to convert

      // ── Convert stroke outline to filled path ───────────────────────────
      hadStrokes = true;

      // Accumulate replacement paths (may need two: stroke outline + fill)
      const replacements: SVGPathElement[] = [];

      // a) Stroke outline
      let outlineD = '';
      const tag = el.tagName.toLowerCase();

      if (tag === 'line') {
        const lineEl = el as SVGLineElement;
        const x1 = lineEl.x1.baseVal.value;
        const y1 = lineEl.y1.baseVal.value;
        const x2 = lineEl.x2.baseVal.value;
        const y2 = lineEl.y2.baseVal.value;
        outlineD = lineToFilledPathData(x1, y1, x2, y2, strokeWidth);
      } else {
        const geom = el as SVGGeometryElement;
        try {
          outlineD = strokeToFilledPathData(geom, strokeWidth);
        } catch {
          // Fallback: keep element as-is
          continue;
        }
      }

      if (outlineD) {
        const tf = el.getAttribute('transform') || undefined;
        replacements.push(
          makeFilledPath(NS, outlineD, stroke, tf),
        );
      }

      // b) If there's also a fill, keep a copy of the original path filled
      if (hasFill && tag !== 'line') {
        const geom = el as SVGGeometryElement;
        const origD =
          tag === 'path'
            ? (el as SVGPathElement).getAttribute('d') || ''
            : geom.getAttribute('d') || '';

        if (origD) {
          const tf = el.getAttribute('transform') || undefined;
          replacements.push(makeFilledPath(NS, origD, fill, tf));
        }
      }

      // ── Splice replacements into the SVG ─────────────────────────────────
      if (replacements.length > 0 && el.parentNode) {
        for (const r of replacements) {
          el.parentNode.insertBefore(r, el);
        }
        el.parentNode.removeChild(el);
      }
    }

    // ── Step 3: serialise ─────────────────────────────────────────────────
    const serializer = new XMLSerializer();
    const rawSvg = serializer.serializeToString(svgEl);

    // ── Step 4: SVGO optimisation (browser build) ─────────────────────────
    let optimised = rawSvg;
    try {
      const result = optimize(rawSvg, {
        plugins: [
          'convertShapeToPath',
          'convertTransform',
          'mergePaths',
          'collapseGroups',
          'removeEmptyContainers',
          'cleanupIds',
          {
            name: 'convertStyleToAttrs',
          },
          {
            name: 'removeAttrs',
            params: { attrs: ['class'] },
          },
        ],
      });
      optimised = result.data;
    } catch {
      // SVGO optimisation is best-effort; use raw if it fails
    }

    return { svgString: optimised, hadStrokes };
  } finally {
    // Clean up hidden container
    document.body.removeChild(host);
  }
}
