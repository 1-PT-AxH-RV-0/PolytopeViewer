import * as type from '@/type.js';

import isOdd from 'is-odd';
import { getUniqueSortedPairs } from '@/utils/general.js';
import { getGCD, deduplicateVertices } from '../utils.js';

/**
 * 生成 n 台塔的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} d - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
export function cupola(n, d = 1) {
  if (getGCD(n, d) !== 1) throw new Error('不支持复合台塔。');

  const twistAngle = (Math.PI / (2 * n)) * d;

  // 半径（边长 s=1）
  const bottomRadius =
    1 / Math.sqrt(2 * (1 - Math.cos((2 * Math.PI * d) / n - 2 * twistAngle)));
  const topRadius = 1 / Math.sqrt(2 * (1 - Math.cos((2 * Math.PI * d) / n)));

  // 高度公式（边长 s=1）
  const ratio = n / d;
  let height;

  if (6 / 5 < ratio && ratio < 6) {
    height = Math.sqrt(1 - 1 / (4 * Math.sin((Math.PI * d) / n) ** 2));
  } else {
    height = Math.max(topRadius, bottomRadius) * 0.8;
  }

  const rawVertices = [];
  const rawFaces = [];
  const bottomVertexIndices = [];

  // 底面顶点
  for (let index = 0; index < 2 * n; index += 1) {
    const theta = (index * (2 * d * Math.PI)) / (2 * n) + twistAngle;

    rawVertices.push({
      x: bottomRadius * Math.cos(theta),
      y: -height / 2,
      z: bottomRadius * Math.sin(theta)
    });

    bottomVertexIndices.push(rawVertices.length - 1);
  }

  // 顶面顶点
  const topVertexIndices = [];

  for (let index = 0; index < n; index += 1) {
    const theta = (index * (2 * d * Math.PI)) / n;

    rawVertices.push({
      x: topRadius * Math.cos(theta),
      y: height / 2,
      z: topRadius * Math.sin(theta)
    });

    topVertexIndices.push(rawVertices.length - 1);
  }

  // 底面（半台塔无底面，仅当 d 为奇数时添加）
  if (isOdd(d)) {
    rawFaces.push(bottomVertexIndices);
  }

  // 顶面
  rawFaces.push(topVertexIndices);

  // 三角形侧面
  for (let i = 0; i < n; i += 1) {
    const topVertex = topVertexIndices[i];

    const bottomVertex1Index =
      (2 * i - 1 + bottomVertexIndices.length) % bottomVertexIndices.length;

    const bottomVertex1 = bottomVertexIndices[bottomVertex1Index];
    const bottomVertex2 = bottomVertexIndices[2 * i];

    rawFaces.push([topVertex, bottomVertex1, bottomVertex2]);
  }

  // 矩形侧面
  for (let i = 0; i < n; i += 1) {
    const topVertex1 = topVertexIndices[(i + 1) % n];
    const topVertex2 = topVertexIndices[i];
    const bottomVertex1 = bottomVertexIndices[2 * i];
    const bottomVertex2 = bottomVertexIndices[2 * i + 1];

    rawFaces.push([topVertex1, topVertex2, bottomVertex1, bottomVertex2]);
  }

  const { vertices, faces } = deduplicateVertices(rawVertices, rawFaces);

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return {
    vertices,
    faces,
    edges,
    norms: {},
    nonclosed: new Set()
  };
}
