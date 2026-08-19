import * as type from '@/type.js';

import { getUniqueSortedPairs } from '@/utils/general.js';
import { getGCD, polygonIndexIterator } from '../utils.js';

/**
 * 生成 n 方偏方面体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
export function trapezohedron(n, s = 1) {
  const gcd = getGCD(n, s);

  let height =
    Math.sqrt(2) *
    Math.sqrt(Math.cos((Math.PI * s) / n) - Math.cos((2 * Math.PI * s) / n));
  if (Number.isNaN(height)) {
    height = 1;
  }
  const y =
    (-height * (Math.cos((Math.PI * s) / n) + 1)) /
    (2 * Math.cos((Math.PI * s) / n) - 2);

  const vertices = [
    { x: 0, y: y, z: 0 },
    { x: 0, y: -y, z: 0 }
  ];
  for (const i of polygonIndexIterator(n, s)) {
    for (const sign of [1, -1]) {
      const theta =
        (2 * Math.PI * i) / n + (sign === -1 ? (Math.PI * s) / n : 0);
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      vertices.push({ x, y: (sign * height) / 2, z: -y });
    }
  }

  const faces = [];
  const n_ = n / gcd;
  for (let componentIndex = 0; componentIndex < gcd; componentIndex++) {
    for (let i = n_ * componentIndex; i < n_ * (componentIndex + 1); i++) {
      const i1 = i * 2;
      const i2 = i1 + 1;
      const i3 = (((i1 % (2 * n_)) + 2) % (2 * n_)) + 2 * n_ * componentIndex;
      const i4 = (((i1 % (2 * n_)) + 3) % (2 * n_)) + 2 * n_ * componentIndex;
      faces.push([0, i1 + 2, i2 + 2, i3 + 2]);
      faces.push([1, i2 + 2, i3 + 2, i4 + 2]);
    }
  }

  vertices.forEach(v => (v.y /= 2));

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, norms: {}, nonclosed: new Set() };
}
