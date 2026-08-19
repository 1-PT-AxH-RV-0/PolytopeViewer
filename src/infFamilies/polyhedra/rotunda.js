import * as type from '@/type.js';

import isOdd from 'is-odd';
import { getUniqueSortedPairs } from '@/utils/general.js';
import { equalPoint } from '../midFormula.js';
import { getGCD, deduplicateVertices } from '../utils.js';

/**
 * 生成 n 角丸塔的网格数据。
 * @param {number} n  - 多边形边数
 * @param {number} d  - 多边形步长
 * @param {number} h  - 高度
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
export function rotunda(n, d = 1, h = 1.0) {
  if (getGCD(n, d) !== 1) throw new Error('不支持复合丸塔。');

  const polygonEdgeLength1 = 2 * Math.sin((Math.PI * d) / n);
  const polygonEdgeLength2 = 2 * Math.sin((Math.PI * d) / (2 * n));

  const rt = 1;
  const rb = polygonEdgeLength1 / polygonEdgeLength2;

  const alpha = (Math.PI * d) / (2 * n);

  const rawVertices = [];
  const rawFaces = [];

  // 底面顶点（j = 1..2n，索引 0..2n-1）
  const bottomIndices = [];
  for (let j = 1; j <= 2 * n; j++) {
    const theta = ((2 * Math.PI * (j - 1)) / (2 * n)) * d + alpha;
    rawVertices.push({
      x: -rb * Math.cos(theta),
      y: -h / 2,
      z: -rb * Math.sin(theta)
    });
    bottomIndices.push(rawVertices.length - 1);
  }

  // 顶面顶点（j = 1..n，索引 2n..3n-1）
  const topIndices = [];
  for (let j = 1; j <= n; j++) {
    const theta = (2 * Math.PI * (j - 1) * d) / n;
    rawVertices.push({
      x: -rt * Math.cos(theta),
      y: h / 2,
      z: -rt * Math.sin(theta)
    });
    topIndices.push(rawVertices.length - 1);
  }

  // 计算等距点
  const equalPt = equalPoint(d, n, rb, rt, h);
  const rMid = Math.sqrt(equalPt[0] ** 2 + equalPt[2] ** 2);
  const hMid = equalPt[1];
  const thetaMid = Math.atan2(equalPt[2], equalPt[0]);

  // 中间圈顶点（k = 0..n-1，索引 3n..4n-1）
  const midIndices = [];
  for (let k = 0; k < n; k++) {
    const theta = thetaMid + ((2 * Math.PI * k) / n) * d;
    rawVertices.push({
      x: rMid * Math.cos(theta),
      y: hMid - h / 2,
      z: rMid * Math.sin(theta)
    });
    midIndices.push(rawVertices.length - 1);
  }

  // 底面（仅在不为半丸塔时添加）
  if (isOdd(d)) {
    rawFaces.push(bottomIndices);
  }

  // 顶面
  rawFaces.push(topIndices);

  // 底部三角形面：连接中间圈顶点和底面顶点
  for (let i = 0; i < n; i++) {
    const idxMid = i + 3 * n;
    const idxBottom1 = (2 * i + 2) % (2 * n);
    const idxBottom2 = (2 * i + 3) % (2 * n);
    rawFaces.push([idxMid, idxBottom1, idxBottom2]);
  }

  // 顶部三角形面：连接中间圈顶点和顶面顶点
  for (let i = 0; i < n; i++) {
    const idxMid = i + 3 * n;
    const idxBottom1 = ((i + 1) % n) + 2 * n;
    const idxBottom2 = ((i + 2) % n) + 2 * n;
    rawFaces.push([idxMid, idxBottom1, idxBottom2]);
  }

  // 五边形面：连接中间圈顶点、顶面顶点和底面顶点
  for (let i = 0; i < n; i++) {
    const idxMid = i + 3 * n;
    const idxMid2 = ((i + 1) % n) + 3 * n;
    const idxTop = ((i + 2) % n) + 2 * n;
    const idxBottom1 = (2 * i + 4) % (2 * n);
    const idxBottom2 = (2 * i + 3) % (2 * n);
    rawFaces.push([idxMid, idxTop, idxMid2, idxBottom1, idxBottom2]);
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
