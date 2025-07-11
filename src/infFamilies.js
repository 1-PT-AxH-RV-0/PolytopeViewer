import { chunk } from 'lodash';
import { getUniqueSortedPairs } from './helperFunc.js';
import {
  range,
  calculateCentroid,
  findPlanesIntersection
} from './helperFunc.js';
import * as type from './type.js';

/**
 * 最大公约数。
 * @param {number} a - 数 1。
 * @param {number} b - 数 2。
 * @returns {number} 数 1 与数 2 的最大公约数。
 */
const getGCD = (a, b) => (b === 0 ? a : getGCD(b, a % b));

/**
 * 多边形索引迭代器。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 迭代步长。
 * @yields {number} 返回多边形顶点索引（0 到 n-1）。
 */
function* polygonIndexIterator(n, s) {
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
 * 生成 n 角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function prism(n, s = 1) {
  const gcd = getGCD(n, s);
  const offset = n % 2 === 0 ? (Math.PI * 1) / n : 0;
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

  return { vertices, faces, edges };
}

/**
 * 生成 n 角反角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function antiprism(n, s = 1) {
  const gcd = getGCD(n, s);
  const offset = n % 2 === 0 ? (Math.PI * 1) / n : 0;

  const polygon_edge_length = 2 * Math.sin((Math.PI * s) / n);
  const height = Math.sqrt(
    polygon_edge_length ** 2 - 2 * (1 - Math.cos((Math.PI * s) / n))
  );

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

  return { vertices, faces, edges };
}

/**
 * 生成 n 方偏方面体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function trapezohedron(n, s = 1) {
  const gcd = getGCD(n, s);
  const { vertices: antiprismVertices, faces: antiprismFaces } = antiprism(
    n,
    s
  );
  let vertices = antiprismFaces.map(f =>
    calculateCentroid(f.map(vi => antiprismVertices[vi]))
  );

  if (n / gcd > 3) {
    vertices = vertices.slice(gcd * 2);
    const planes1 = [
      [vertices[0], vertices[1], vertices[2]],
      [vertices[2], vertices[3], vertices[4]],
      [vertices[4], vertices[5], vertices[6]]
    ];
    const planes2 = [
      [vertices[1], vertices[2], vertices[3]],
      [vertices[3], vertices[4], vertices[5]],
      [vertices[5], vertices[6], vertices[7]]
    ];
    vertices.unshift(
      findPlanesIntersection(planes1),
      findPlanesIntersection(planes2)
    );
  }
  const faces = [];
  const n_ = n / gcd;
  for (let componentIndex = 0; componentIndex < gcd; componentIndex++) {
    for (let i = n_ * componentIndex; i < n_ * (componentIndex + 1); i++) {
      const i1 = i * 2;
      const i2 = i1 + 1;
      const i3 = (i1 + 2) % (2 * n_ * (componentIndex + 1));
      const i4 = (i1 + 3) % (2 * n_ * (componentIndex + 1));
      faces.push([0, i1 + 2, i2 + 2, i3 + 2]);
      faces.push([1, i2 + 2, i3 + 2, i4 + 2]);
    }
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges };
}

/**
 * 生成 m-n 角双角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
function duoprism(m, n, s1 = 1, s2 = 1) {
  const offset1 = m % 2 === 0 ? (Math.PI * 1) / m : 0;
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
        const z = Math.cos(theta2);
        const w = Math.sin(theta2);
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

    for (let i = 0; i < m; i++) {
      const cellFaces = [];
      for (let j = 0; j < n; j++) {
        const faceIdx = i * n + j;
        cellFaces.push(faceIdx);
      }
      cellFaces.push(rectangularFaces.length + i);
      cellFaces.push(rectangularFaces.length + ((i + 1) % m));
      cells.push(cellFaces);
    }

    for (let j = 0; j < n; j++) {
      const cellFaces = [];
      for (let i = 0; i < m; i++) {
        const faceIdx = i * n + j;
        cellFaces.push(faceIdx);
      }
      cellFaces.push(rectangularFaces.length + m + j);
      cellFaces.push(rectangularFaces.length + m + ((j + 1) % n));
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
    alert('不支持复合双角柱。');
    throw new Error('不支持复合双角柱。');
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, cells };
}

export default {
  prism,
  antiprism,
  trapezohedron,
  duoprism
};
