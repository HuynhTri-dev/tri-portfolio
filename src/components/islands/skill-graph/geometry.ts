/**
 * @name geometry.ts
 * @description Coordinate transformation and organic spline bezier curve generators.
 */

export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 10) / 10,
    y: Math.round((cy + r * Math.sin(rad)) * 10) / 10,
  };
}

/**
 * Generates an organic Cubic-Bezier bough/root path between two points,
 * plus optional lateral root offshoot tendrils for authentic botanical morphology.
 */
export function buildOrganicBoughGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bendFactor: number,
  isPrimary: boolean
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const offset1 = len * 0.16 * bendFactor;
  const offset2 = -len * 0.08 * bendFactor;

  const c1x = Math.round((x1 + dx * 0.34 + nx * offset1) * 10) / 10;
  const c1y = Math.round((y1 + dy * 0.34 + ny * offset1) * 10) / 10;
  const c2x = Math.round((x1 + dx * 0.68 + nx * offset2) * 10) / 10;
  const c2y = Math.round((y1 + dy * 0.68 + ny * offset2) * 10) / 10;

  const mainPath = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;

  // Lateral micro-root offshoot sprouting near mid-bough
  const midX = Math.round((x1 + dx * 0.52 + nx * (offset1 * 0.5)) * 10) / 10;
  const midY = Math.round((y1 + dy * 0.52 + ny * (offset1 * 0.5)) * 10) / 10;
  const sideSign = bendFactor >= 0 ? 1 : -1;
  const twigLen = isPrimary ? 22 : 14;
  const twigEndX = Math.round((midX + (dx / len) * twigLen * 0.7 + nx * twigLen * sideSign) * 10) / 10;
  const twigEndY = Math.round((midY + (dy / len) * twigLen * 0.7 + ny * twigLen * sideSign) * 10) / 10;
  const twigCtrlX = Math.round((midX + nx * twigLen * 0.6 * sideSign) * 10) / 10;
  const twigCtrlY = Math.round((midY + ny * twigLen * 0.6 * sideSign) * 10) / 10;

  const tendrilPath = `M ${midX} ${midY} Q ${twigCtrlX} ${twigCtrlY}, ${twigEndX} ${twigEndY}`;

  return { mainPath, tendrilPath, twigEndX, twigEndY };
}

