import * as type from '@/type.js';

import isOdd from 'is-odd';
import { getUniqueSortedPairs } from '@/utils/general.js';
import { prism } from './prism.js';
import { antiprism } from './antiprism.js';

/**
 * 生成 n 角间 a 隔 b 冠体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} a - 第一个基的步长。
 * @param {number} b - 第二个基的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
export function stephanoid(n, a, b) {
  const vertices = (isOdd(a - b) ? antiprism(n).data : prism(n)).vertices;

  if (a > b) {
    [a, b] = [b, a];
    vertices.forEach(v => (v.y = -v.y));
  }

  const faces = [];
  if (isOdd(a - b)) {
    for (let i = 0; i < n; i++) {
      faces.push([i, n + i, (b + i) % n, ((a + i) % n) + n]);
      faces.push([
        i,
        ((((i - 1) % n) + n) % n) + n,
        (a + i) % n,
        ((b + i - 1) % n) + n
      ]);
    }
  } else {
    for (let i = 0; i < n; i++) {
      faces.push([i, ((i + 1) % n) + n, (b + i) % n, ((a + i + 1) % n) + n]);
      faces.push([
        i,
        ((((i - 1) % n) + n) % n) + n,
        (a + i) % n,
        ((b + i - 1) % n) + n
      ]);
    }
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, norms: {}, nonclosed: new Set() };
}
