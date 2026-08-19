import * as type from '@/type.js';

import isOdd from 'is-odd';
import { getUniqueSortedPairs } from '@/utils/general.js';
import { getGCD, polygonIndexIterator } from '../utils.js';

/**
 * 生成 m 角 n 角双角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 * @throws {Error} - 当为复合双角柱时抛出。
 */
export function duoprism(m, n, s1 = 1, s2 = 1) {
  const polygonEdgeLength1 = 2 * Math.sin((Math.PI * s1) / m);
  const polygonEdgeLength2 = 2 * Math.sin((Math.PI * s2) / n);
  const polygon2ScaleFactor = polygonEdgeLength1 / polygonEdgeLength2;

  const offset1 = !isOdd(m) ? (Math.PI * 1) / m : 0;
  const offset2 = Math.PI / 2 - Math.PI / n;

  const gcd1 = getGCD(m, s1);
  const gcd2 = getGCD(n, s2);

  const vertices = [];
  const faces = [];
  const cells = [];
  if (gcd1 === 1 && gcd2 === 1) {
    for (const i of polygonIndexIterator(m, s1)) {
      const theta1 = (2 * Math.PI * i) / m + offset1;
      const x = Math.cos(theta1);
      const y = Math.sin(theta1);
      for (const j of polygonIndexIterator(n, s2)) {
        const theta2 = (2 * Math.PI * j) / n + offset2;
        const z = Math.cos(theta2) * polygon2ScaleFactor;
        const w = Math.sin(theta2) * polygon2ScaleFactor;
        vertices.push({ x, y: z, z: -y, w });
      }
    }

    const rectangularFaces = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const iNext = (i + 1) % m;
        const jNext = (j + 1) % n;
        const v0 = i * n + j;
        const v1 = i * n + jNext;
        const v2 = iNext * n + jNext;
        const v3 = iNext * n + j;
        rectangularFaces.push([v0, v1, v2, v3]);
      }
    }

    const mGonFaces = [];
    for (let j = 0; j < n; j++) {
      const face = [];
      for (let i = 0; i < m; i++) {
        face.push(i * n + j);
      }
      mGonFaces.push(face);
    }

    const nGonFaces = [];
    for (let i = 0; i < m; i++) {
      const face = [];
      for (let j = 0; j < n; j++) {
        face.push(i * n + j);
      }
      nGonFaces.push(face);
    }

    faces.push(...rectangularFaces);
    faces.push(...mGonFaces);
    faces.push(...nGonFaces);

    // n 个 m 角柱。
    for (let i = 0; i < n; i++) {
      const cellFaces = [];
      for (let j = 0; j < m; j++) {
        const faceIdx = j * n + i;
        cellFaces.push(faceIdx);
      }
      cellFaces.push(rectangularFaces.length + i);
      cellFaces.push(rectangularFaces.length + ((i + 1) % n));
      cells.push(cellFaces);
    }

    // m 个 n 角柱。
    for (let i = 0; i < m; i++) {
      const cellFaces = [];
      for (let j = 0; j < n; j++) {
        const faceIdx = i * n + j;
        cellFaces.push(faceIdx);
      }
      cellFaces.push(rectangularFaces.length + n + i);
      cellFaces.push(rectangularFaces.length + n + ((i + 1) % m));
      cells.push(cellFaces);
    }
  } else {
    // const m_ = m / gcd1;
    // const n_ = n;
    // const s1_ = s1 / gcd1;
    // const s2_ = s2;
    // const nVerticesInOneComponent = m_ * n_
    // const nFacesInOneComponent = m_ * n_ + m_ + n_
    // for (let i = 0; i < gcd1; i++) {
    // const { vertices: componentVertices, faces: componentFaces, cells: componentCells} = duoprism(m_, n_, s1_, s2_);
    // const deg = (2 * Math.PI * s1) / m / gcd1 * i

    // faces.push(...componentFaces.map(face => face.map(vertexI => vertexI + nVerticesInOneComponent * i)))
    // cells.push(...componentCells.map(cell => cell.map(faceI => faceI + nFacesInOneComponent * i)))
    // vertices.push(...componentVertices.map(v =>
    // ({
    // x: Math.cos(deg) * v.x - Math.sin(deg) * v.z,
    // y: v.y,
    // z: Math.sin(deg) * v.x + Math.cos(deg) * v.z,
    // w: v.w
    // })
    // ))
    // }
    // console.log(cells.map(a => a.join(' ')).join('\n'))
    throw new Error('不支持复合双角柱。');
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, cells };
}
