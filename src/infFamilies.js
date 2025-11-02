import isOdd from 'is-odd';
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
 * @returns {{data: type.NonTriMesh3D, neverRegular: boolean}} 网格数据对象以及这种参数的反角柱是否不可能为正的。
 */
function antiprism(n, s = 1) {
  const res = {
    neverRegular: false,
    data: null
  };
  const gcd = getGCD(n, s);
  const offset = n % 2 === 0 ? (Math.PI * 1) / n : 0;

  // 正反角柱高度公式
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
  let height = Math.sqrt(2) * Math.sqrt(
      Math.cos(Math.PI * s / n) -
      Math.cos(2 * Math.PI * s / n)
  );
  
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

  res.data = { vertices, faces, edges };

  return res;
}

/**
 * 生成 n 方偏方面体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function trapezohedron(n, s = 1) {
  const gcd = getGCD(n, s);

  let height =
    Math.sqrt(2) * Math.sqrt(
      Math.cos(Math.PI * s / n) -
      Math.cos(2 * Math.PI * s / n)
    );
  if (Number.isNaN(height)) {
    height = 1;
  }
  const y =
    -height *
    (Math.cos(Math.PI*s/n) + 1) /
    (2*Math.cos(Math.PI*s/n) - 2);

  const vertices = [
    {x: 0, y: y, z: 0},
    {x: 0, y: -y, z: 0}
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
      const i3 = ((i1 % (2 * n_) + 2) % (2 * n_)) + 2 * n_ * componentIndex;
      const i4 = ((i1 % (2 * n_) + 3) % (2 * n_)) + 2 * n_ * componentIndex;
      faces.push([0, i1 + 2, i2 + 2, i3 + 2]);
      faces.push([1, i2 + 2, i3 + 2, i4 + 2]);
    }
  }

  vertices.forEach(v => v.y /= 2);

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges };
}

/**
 * 生成 n 角间 a 隔 b 冠体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} a - 第一个基的步长。
 * @param {number} b - 第二个基的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function stephanoid(n, a, b) {
  const vertices = (isOdd(a - b) ? antiprism(n).data : prism(n)).vertices;

  if (a > b) {
    [a, b] = [b, a];
    vertices.forEach(v => (v.y = -v.y));
  }

  const faces = [];
  if (isOdd(a - b)) {
    for (let i = 0; i < n; i++) {
      faces.push([i, n + i, (b + i) % n, ((a + i) % n) + n]);
      faces.push([
        i,
        ((((i - 1) % n) + n) % n) + n,
        (a + i) % n,
        ((b + i - 1) % n) + n
      ]);
    }
  } else {
    for (let i = 0; i < n; i++) {
      faces.push([i, ((i + 1) % n) + n, (b + i) % n, ((a + i + 1) % n) + n]);
      faces.push([
        i,
        ((((i - 1) % n) + n) % n) + n,
        (a + i) % n,
        ((b + i - 1) % n) + n
      ]);
    }
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges };
}

/**
 * 生成 m 角 n 角双角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 * @throws {Error} - 当为复合双角柱时抛出。
 */
function duoprism(m, n, s1 = 1, s2 = 1) {
  const polygon_edge_length1 = 2 * Math.sin((Math.PI * s1) / m);
  const polygon_edge_length2 = 2 * Math.sin((Math.PI * s2) / n);
  const polygon2ScaleFactor = polygon_edge_length1 / polygon_edge_length2;

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

export default {
  prism,
  antiprism,
  trapezohedron,
  stephanoid,
  duoprism
};
