import * as type from '@/type.js';

/**
 * 最大公约数。
 * @param {number} a - 数 1。
 * @param {number} b - 数 2。
 * @returns {number} 数 1 与数 2 的最大公约数。
 */
export const getGCD = (a, b) => (b === 0 ? a : getGCD(b, a % b));

/**
 * 多边形索引迭代器。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 迭代步长。
 * @yields {number} 返回多边形顶点索引（0 到 n-1）。
 */
export function* polygonIndexIterator(n, s) {
  let index = 0;
  const gcd = getGCD(n, s);
  for (let i = 0; i < n; i++) {
    if (i % (n / gcd) === 0 && i !== 0) index++;
    yield index;
    index += s;
    index %= n;
  }
}

/**
 * 顶点去重并更新面索引。
 * @param {type.Point3D[]} rawVertices - 顶点数组
 * @param {number[][]} rawFaces - 面数组
 * @returns {object} - 去重后的顶点与面
 */
export function deduplicateVertices(rawVertices, rawFaces) {
  const coordinateToNewIndex = Object.create(null);
  const uniqueVertices = [];

  for (const index in rawVertices) {
    const vertex = rawVertices[index];
    const key = `${vertex.x.toFixed(5)},${vertex.y.toFixed(5)},${vertex.z.toFixed(5)}`;

    if (!(key in coordinateToNewIndex)) {
      coordinateToNewIndex[key] = uniqueVertices.length;
      uniqueVertices.push(vertex);
    }
  }

  const uniqueFaces = [];

  for (const face of rawFaces) {
    const newFace = [];

    for (const rawIndex of face) {
      const vertex = rawVertices[rawIndex];
      const key = `${vertex.x.toFixed(5)},${vertex.y.toFixed(5)},${vertex.z.toFixed(5)}`;

      newFace.push(coordinateToNewIndex[key]);
    }

    uniqueFaces.push(newFace);
  }

  return {
    vertices: uniqueVertices,
    faces: uniqueFaces
  };
}
