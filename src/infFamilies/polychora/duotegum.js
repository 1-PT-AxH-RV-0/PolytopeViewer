import * as type from '@/type.js';

import isOdd from 'is-odd';
import { getUniqueSortedPairs } from '@/utils/general.js';
import { getGCD } from '../utils.js';

/**
 * 生成 m 角 n 角双罩体的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
export function duotegum(m, n, s1 = 1, s2 = 1) {
  const gcd1 = getGCD(m, s1);
  const gcd2 = getGCD(n, s2);

  if (gcd1 !== 1 || gcd2 !== 1) {
    throw new Error('不支持复合双罩体。');
  }

  // 计算使得得到均匀对偶双罩体且顶点或面心居中
  const polygonEdgeLength1 = 2 * Math.sin((Math.PI * s1) / m);
  const polygonEdgeLength2 = 2 * Math.sin((Math.PI * s2) / n);
  const polygon2ScaleFactor =
    (polygonEdgeLength1 / polygonEdgeLength2) *
    (Math.cos((Math.PI * s2) / n) / Math.cos((Math.PI * s1) / m));

  const offset1 = !isOdd(m) ? (Math.PI * 1) / m : 0;
  const offset2 = Math.PI / 2 - Math.PI / n;

  const vertices = [];
  // 多边形 A 位于 (x,0,z,0)
  for (let i = 0; i < m; i++) {
    const theta = (2 * Math.PI * i) / m + offset1;
    vertices.push({ x: Math.cos(theta), y: 0, z: Math.sin(theta), w: 0 });
  }
  // 多边形 B 位于 (0,y,0,w)
  for (let j = 0; j < n; j++) {
    const theta = (2 * Math.PI * j) / n + offset2;
    vertices.push({
      x: 0,
      y: Math.cos(theta) * polygon2ScaleFactor,
      z: 0,
      w: Math.sin(theta) * polygon2ScaleFactor
    });
  }

  // 两个多边形自身的边（顶点索引对）
  const edgesA = [];
  for (let i = 0; i < m; i++) {
    edgesA.push([i, (i + s1) % m]);
  }
  const edgesB = [];
  for (let j = 0; j < n; j++) {
    edgesB.push([m + j, m + ((j + s2) % n)]);
  }

  // 用于根据 (边, 顶点) 查找面索引的 Map
  // key: "u_v_w" 其中 u,v 是边（已排序），w 是第三个顶点
  const faceMap = new Map();
  const faces = [];

  /**
   * 添加一个三角形面，若已存在则返回已有索引。
   * 面由一条边和一个额外顶点定义，确保边顶点有序以保证键的一致性。
   * @param {number} edgeA - 边的第一个顶点索引。
   * @param {number} edgeB - 边的第二个顶点索引（会与 edgeA 排序）。
   * @param {number} third - 与边相对的第三个顶点索引。
   * @returns {number} 新添加的面的索引，或已存在面的索引。
   */
  function addFace(edgeA, edgeB, third) {
    // 对 edge 的两个顶点排序，保证键的一致性
    const [a, b] = edgeA < edgeB ? [edgeA, edgeB] : [edgeB, edgeA];
    const key = `${a}_${b}_${third}`;

    const idx = faces.length;
    faces.push([a, b, third]);
    faceMap.set(key, idx);
    return idx;
  }

  // 生成三角形面
  // A 的边 + B 的每个顶点
  for (const [u, v] of edgesA) {
    for (let k = 0; k < n; k++) {
      addFace(u, v, m + k);
    }
  }
  // B 的边 + A 的每个顶点
  for (const [x, y] of edgesB) {
    for (let i = 0; i < m; i++) {
      addFace(x, y, i);
    }
  }

  // 生成四面体胞：每条 A 边与每条 B 边构成一个四面体
  const cells = [];
  for (const [u, v] of edgesA) {
    for (const [x, y] of edgesB) {
      // 四面体的四个面索引
      const f1 = faceMap.get(`${u < v ? u : v}_${u < v ? v : u}_${x}`); // 边 uv + 点 x
      const f2 = faceMap.get(`${u < v ? u : v}_${u < v ? v : u}_${y}`); // 边 uv + 点 y
      const f3 = faceMap.get(`${x < y ? x : y}_${x < y ? y : x}_${u}`); // 边 xy + 点 u
      const f4 = faceMap.get(`${x < y ? x : y}_${x < y ? y : x}_${v}`); // 边 xy + 点 v
      // 确保四个面都存在（理论上必然存在）
      if (
        f1 === undefined ||
        f2 === undefined ||
        f3 === undefined ||
        f4 === undefined
      ) {
        throw new Error('内部错误：找不到对应的面');
      }
      cells.push([f1, f2, f3, f4]);
    }
  }

  // 提取所有边
  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, cells };
}
