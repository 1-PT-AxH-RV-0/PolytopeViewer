import * as poly2tri from 'poly2tri';
import * as polygonClipping from 'polygon-clipping';

/**
 * 将自相交多边形分解为多个非自相交多边形。
 * @param {Array<{x: number, y: number}>} originalPoints - 原始多边形点集。
 * @returns {Array<Array<poly2tri.Point>>} 分解后的多边形数组。
 */
export function decomposeSelfIntersectingPolygon(originalPoints) {
  const coords = originalPoints.map(p => [+p.x.toFixed(6), +p.y.toFixed(6)]);
  if (coords.length > 0) {
    coords.push([coords[0][0], coords[0][1]]);
  }

  const result = polygonClipping.union([coords]);

  const decomposed = [];
  for (const polygon of result) {
    for (const ring of polygon) {
      if (ring.length === 0) continue;
      const ringPoints = ring.slice(0, -1);
      const points = ringPoints.map(([x, y]) => new poly2tri.Point(x, y));
      decomposed.push(points);
    }
  }

  return decomposed;
}
