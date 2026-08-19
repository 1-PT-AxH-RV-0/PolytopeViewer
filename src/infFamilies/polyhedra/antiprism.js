import * as type from '@/type.js';

import isOdd from 'is-odd';
import { chunk } from 'lodash';
import { getUniqueSortedPairs, range } from '@/utils/general.js';
import { getGCD, polygonIndexIterator } from '../utils.js';

/**
 * 生成 n 角反角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {{data: type.NonTriMesh3D, neverRegular: boolean}} 网格数据对象以及这种参数的反角柱是否不可能为正的。
 */
export function antiprism(n, s = 1) {
  const res = {
    neverRegular: false,
    data: null
  };
  const gcd = getGCD(n, s);
  const offset = !isOdd(n) ? (Math.PI * 1) / n : 0;

  // 均匀反角柱高度公式
  /*
  推导过程：

  令正整数 n, s (n ≥ 3, s < n) 和正实数 h，
  再令：
  l = 2sin(sπ/n),
  f(a, θ)=(a.x cosθ + a.z sinθ, a.y, -a.x sinθ + a.z cosθ),
  p = (0, h/2, 1),
  q = f(p, sπ/n),
  d = distance(p, (q.x, -q.y, q.z))

  解关于 h 的方程 d = l 即可得到下面这个式子。
  注：方程仅在 s < 2n/3 时有实解。
  */
  let height =
    Math.sqrt(2) *
    Math.sqrt(Math.cos((Math.PI * s) / n) - Math.cos((2 * Math.PI * s) / n));

  if (Number.isNaN(height)) {
    height = 1;
    res.neverRegular = true;
  }

  const vertices = [];
  for (const sign of [1, -1]) {
    for (const i of polygonIndexIterator(n, s)) {
      const theta =
        (2 * Math.PI * i) / n + offset + (sign === -1 ? (Math.PI * s) / n : 0);
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      vertices.push({ x, y: (sign * height) / 2, z: -y });
    }
  }
  const faces = [];
  faces.push(...chunk(range(0, 2 * n - 1), n / gcd));
  for (let componentIndex = 0; componentIndex < gcd; componentIndex++) {
    for (
      let i = (n / gcd) * componentIndex;
      i < (n / gcd) * (componentIndex + 1);
      i++
    ) {
      const i1 = i;
      let i2 = (i + 1) % ((n / gcd) * (componentIndex + 1));
      const i3 = i1 + n;

      i2 += i2 === 0 ? (n / gcd) * componentIndex : 0;
      faces.push([i1, i2, i3]);
      faces.push([i3, i2 + n, i2]);
    }
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  res.data = { vertices, faces, edges, norms: {}, nonclosed: new Set() };

  return res;
}
