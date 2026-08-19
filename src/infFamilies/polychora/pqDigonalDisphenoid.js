import * as type from '@/type.js';

import { getUniqueSortedPairs } from '@/utils/general.js';

/**
 * 生成 p/q 角二角双楔体的网格数据。
 * @param {number} p - 多边形的边数。
 * @param {number} q - 多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
export function pqDigonalDisphenoid(p, q = 1) {
  // ---------- 1. 顶点坐标 ----------
  // 多边形位于 xz 平面
  const vertices = [];
  for (let k = 0; k < p; k++) {
    const idx = (k * q) % p;
    const angle = (2 * Math.PI * idx) / p;
    vertices.push({
      x: Math.cos(angle) * 5,
      y: 0.0,
      z: Math.sin(angle) * 5,
      w: 0.0
    });
  }

  const A = {
    x: 0,
    y: 2.5,
    z: 0,
    w: 2.5
  };
  const B = {
    x: 0,
    y: -2.5,
    z: 0,
    w: 2.5
  };

  vertices.push(A, B);

  // ---------- 2. 第一次锥积：多边形 → 锥体 ----------
  // 多边形的边 (无序对)
  const baseEdges = [];
  for (let i = 0; i < p; i++) {
    const j = (i + 1) % p;
    baseEdges.push(new Set([i, j]));
  }

  // 面：多边形面 + 每个边与 A 形成的三角形
  const starFace = Array.from({ length: p }, (_, i) => i); // 环 0,1,2,...,p-1
  const triFacesA = [];
  for (const e of baseEdges) {
    const [v1, v2] = [...e].sort((a, b) => a - b);
    triFacesA.push([v1, v2, p]); // 三角形面
  }

  const facesA = [starFace, ...triFacesA]; // 共 1 + p 个二维面

  // 胞：由这些面围成
  const cellA = Array.from({ length: facesA.length }, (_, i) => i);

  // 保存第一次锥积的边集
  const edgesA = new Set(baseEdges);
  for (let i = 0; i < p; i++) {
    edgesA.add(new Set([i, p]));
  }
  const edgesAList = [...edgesA]; // 固定顺序，用于后续查找

  // 创建边到索引的映射（用于快速查找）
  const edgeToIdx = new Map();
  edgesAList.forEach((e, idx) => {
    const key = [...e].sort((a, b) => a - b).join(',');
    edgeToIdx.set(key, idx);
  });

  // ---------- 3. 第二次锥积：锥体 → p/q二边形双楔体 ----------
  // 原有面 (来自第一次锥积) 作为底保留
  const oldFaces = facesA;
  const nOldFaces = oldFaces.length;

  // 新三角形面：每条旧边与 B 形成
  const triFacesB = [];
  for (let idx = 0; idx < edgesAList.length; idx++) {
    const e = edgesAList[idx];
    const [v1, v2] = [...e].sort((a, b) => a - b);
    triFacesB.push([v1, v2, p + 1]);
  }

  // 所有面
  const faces = [...oldFaces, ...triFacesB];

  // 胞：
  const cells = [];
  // (a) 底胞：原胞的面索引不变
  cells.push(cellA);

  // (b) 每个旧面与 B 形成的新胞
  for (let faceIdx = 0; faceIdx < oldFaces.length; faceIdx++) {
    const faceRing = oldFaces[faceIdx];
    // 旧面自身的索引
    const faceList = [faceIdx];
    // 计算旧面的边集
    const m = faceRing.length;
    for (let j = 0; j < m; j++) {
      const v1 = faceRing[j];
      const v2 = faceRing[(j + 1) % m];
      const key = [v1, v2].sort((a, b) => a - b).join(',');
      // 找到这条边对应的新三角形面索引
      const tidx = nOldFaces + edgeToIdx.get(key);
      faceList.push(tidx);
    }
    cells.push(faceList);
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, edges, faces, cells };
}
