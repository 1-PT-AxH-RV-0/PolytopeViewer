import * as type from '@/type.js';

import isOdd from 'is-odd';
import { chunk } from 'lodash';
import { getUniqueSortedPairs, range } from '@/utils/general.js';
import { getGCD, polygonIndexIterator } from '../utils.js';

/**
 * 生成 n 角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
export function prism(n, s = 1) {
  const gcd = getGCD(n, s);
  const offset = !isOdd(n) ? (Math.PI * 1) / n : 0;
  const height = 2 * Math.sin((Math.PI * s) / n);

  const vertices = [];
  for (const sign of [1, -1]) {
    for (const i of polygonIndexIterator(n, s)) {
      const theta = (2 * Math.PI * i) / n + offset;
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      vertices.push({ x, y: (sign * height) / 2, z: -y });
    }
  }
  const faces = [];
  for (let componentIndex = 0; componentIndex < gcd; componentIndex++) {
    for (
      let i = (n / gcd) * componentIndex;
      i < (n / gcd) * (componentIndex + 1);
      i++
    ) {
      const i1 = i;
      const i2 = (i + 1) % ((n / gcd) * (componentIndex + 1));
      const i3 = i2 + n;
      const i4 = i1 + n;
      faces.push([
        i1,
        i2 + (i2 === 0 ? (n / gcd) * componentIndex : 0),
        i3 + (i3 === n ? (n / gcd) * componentIndex : 0),
        i4
      ]);
    }
  }
  faces.push(...chunk(range(0, 2 * n - 1), n / gcd));

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, norms: {}, nonclosed: new Set() };
}
