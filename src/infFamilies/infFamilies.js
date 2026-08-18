import isOdd from 'is-odd';
import { chunk } from 'lodash';
import { alternate4D } from './alternation.js';
import { getUniqueSortedPairs, range } from '@/utils/general.js';
import * as type from '@/type.js';

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

/**
 * 生成 n 方偏方面体的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function trapezohedron(n, s = 1) {
  const gcd = getGCD(n, s);

  let height =
    Math.sqrt(2) *
    Math.sqrt(Math.cos((Math.PI * s) / n) - Math.cos((2 * Math.PI * s) / n));
  if (Number.isNaN(height)) {
    height = 1;
  }
  const y =
    (-height * (Math.cos((Math.PI * s) / n) + 1)) /
    (2 * Math.cos((Math.PI * s) / n) - 2);

  const vertices = [
    { x: 0, y: y, z: 0 },
    { x: 0, y: -y, z: 0 }
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
      const i3 = (((i1 % (2 * n_)) + 2) % (2 * n_)) + 2 * n_ * componentIndex;
      const i4 = (((i1 % (2 * n_)) + 3) % (2 * n_)) + 2 * n_ * componentIndex;
      faces.push([0, i1 + 2, i2 + 2, i3 + 2]);
      faces.push([1, i2 + 2, i3 + 2, i4 + 2]);
    }
  }

  vertices.forEach(v => (v.y /= 2));

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, norms: {}, nonclosed: new Set() };
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

  return { vertices, faces, edges, norms: {}, nonclosed: new Set() };
}

/**
 * 生成 n 台塔的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} d - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function cupola(n, d = 1) {
  if (getGCD(n, d) !== 1) throw new Error('不支持复合台塔。');

  /**
   * 生成星形多边形的迭代器。
   * @param {number} start - 开始。
   * @param {number} end - 结束。
   * @param {number} step - 步长。
   * @yields [number] - 索引。
   */
  function* starIndexGenerator(start, end, step) {
    let current = start;

    while (true) {
      yield current;

      current += step;
      if (current > end) {
        current -= end;
      }

      if (current === start) {
        break;
      }
    }
  }
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

  // 底面顶点（y=-height/2），为半台塔时生成两次顶点。
  const bottomRepeatCount = isOdd(d) ? 1 : 2;

  for (let repeat = 0; repeat < bottomRepeatCount; repeat += 1) {
    for (const index of starIndexGenerator(1, 2 * n, d)) {
      const theta = (2 * Math.PI * (index - 1)) / (2 * n) + twistAngle;

      rawVertices.push({
        x: bottomRadius * Math.cos(theta),
        y: -height / 2,
        z: bottomRadius * Math.sin(theta)
      });

      bottomVertexIndices.push(rawVertices.length - 1);
    }
  }

  // 顶面顶点（y=height/2）
  const topVertexIndices = [];

  for (const index of starIndexGenerator(1, n, d)) {
    const theta = (2 * Math.PI * (index - 1)) / n;

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

  // ---- 顶点去重并更新面索引 ----
  const coordinateToNewIndex = Object.create(null);
  const uniqueVertices = [];

  for (const index in rawVertices) {
    const vertex = rawVertices[index];
    const key = `${vertex.x},${vertex.y},${vertex.z}`;

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
      const key = `${vertex.x},${vertex.y},${vertex.z}`;

      newFace.push(coordinateToNewIndex[key]);
    }

    uniqueFaces.push(newFace);
  }

  const edges = getUniqueSortedPairs(uniqueFaces).map(edge =>
    edge.map(index => uniqueVertices[index])
  );

  return {
    vertices: uniqueVertices,
    faces: uniqueFaces,
    edges,
    norms: {},
    nonclosed: new Set()
  };
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

/**
 * 生成 m 角 n 角双反角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 * @throws {Error} - 当为原双角柱为复合双角柱时抛出。
 */
function duoantiprism(m, n, s1 = 1, s2 = 1) {
  const origDuoprism = duoprism(m * 2, n * 2, s1, s2);
  const { vertices, faces, cells } = alternate4D(origDuoprism);
  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );
  return { vertices, faces, edges, cells };
}

/**
 * 生成 m 角 n 角双罩体的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
function duotegum(m, n, s1 = 1, s2 = 1) {
  const gcd1 = getGCD(m, s1);
  const gcd2 = getGCD(n, s2);

  if (gcd1 !== 1 || gcd2 !== 1) {
    throw new Error('不支持复合双罩体。');
  }

  // 计算使得得到均匀对偶双罩体且顶点或面心居中
  const polygon_edge_length1 = 2 * Math.sin((Math.PI * s1) / m);
  const polygon_edge_length2 = 2 * Math.sin((Math.PI * s2) / n);
  const polygon2ScaleFactor =
    (polygon_edge_length1 / polygon_edge_length2) *
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

/**
 * 生成 p/q 角二角双楔体的网格数据。
 * @param {number} p - 多边形的边数。
 * @param {number} q - 多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
function pqDigonalDisphenoid(p, q = 1) {
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

export default {
  prism,
  antiprism,
  trapezohedron,
  stephanoid,
  cupola,
  duoprism,
  duoantiprism,
  duotegum,
  pqDigonalDisphenoid
};
