import {
  decomposeSelfIntersectingPolygon,
  getUniqueSortedPairs
} from './offProcessor.js';
import * as poly2tri from 'poly2tri';

/**
 * 将 4D 空间中的点集旋转到 XY 平面以便进行后续处理。
 * @param {Array<{x: number, y: number, z: number, w: number}>} points - 要旋转的 4D 点数组。
 * @returns {{rotated: Array<{x: number, y: number, z: number, w: number}>, rotationMatrix: Array<Array<number>>, z: number, w: number}} 包含旋转后点集、4x4 旋转矩阵和原始 z/w 值的对象。
 * @throws {Error} 当输入向量太小或线性相关时抛出错误。
 */
function rotate4DPointsToXY(points) {
  // 1. 提取前三个点
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];

  // 2. 计算向量 u 和 v
  const u = [p1.x - p0.x, p1.y - p0.y, p1.z - p0.z, p1.w - p0.w];
  const v = [p2.x - p0.x, p2.y - p0.y, p2.z - p0.z, p2.w - p0.w];

  // 3. 归一化 u 得到  q1
  const normU = Math.sqrt(u.reduce((sum, val) => sum + val * val, 0));
  if (normU < 1e-10) throw new Error('Vector u is too small.');
  const q1 = u.map(x => x / normU);

  // 4. 计算 v 在 u 上的投影并正交化
  const dotUV = v.reduce((sum, val, i) => sum + val * u[i], 0);
  const projUV = u.map(x => (dotUV / (normU * normU)) * x);
  const vOrtho = v.map((val, i) => val - projUV[i]);
  const normVOrtho = Math.sqrt(vOrtho.reduce((sum, val) => sum + val * val, 0));
  if (normVOrtho < 1e-10) throw new Error('Vectors are linearly dependent.');
  const q2 = vOrtho.map(x => x / normVOrtho);

  // 5. 构造与 q1,q2 正交的基向量
  const basis = [q1, q2];
  const orthoVecs = [];
  const stdBasis = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  for (const e of stdBasis) {
    let vec = [...e];
    for (const b of basis) {
      const dot = vec.reduce((sum, val, i) => sum + val * b[i], 0);
      vec = vec.map((val, i) => val - dot * b[i]);
    }
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm > 1e-6) {
      orthoVecs.push(vec.map(x => x / norm));
      basis.push(vec.map(x => x / norm));
      if (orthoVecs.length >= 2) break;
    }
  }

  if (orthoVecs.length < 2) throw new Error('Failed to find orthogonal basis');
  const [q3, q4] = orthoVecs;

  // 6. 构造旋转矩阵（行向量为 q1, q2, q3, q4）
  const rotationMatrix = [q1, q2, q3, q4];

  // 7. 应用旋转矩阵
  const rotatedPoints = points.map(p => apply4DMatrix(p, rotationMatrix));

  // 8. 提取结果
  const firstRotated = rotatedPoints[0];
  return {
    rotated: rotatedPoints,
    rotationMatrix: rotationMatrix,
    z: firstRotated.z,
    w: firstRotated.w
  };
}

/**
 * 应用 4D 变换矩阵到单个点。
 * @param {{x: number, y: number, z: number, w: number}} point - 要变换的 4D 点。
 * @param {Array<Array<number>>} matrix - 4x4 变换矩阵。
 * @returns {{x: number, y: number, z: number, w: number}} 变换后的 4D 点。
 */
function apply4DMatrix(point, matrix) {
  const vec = [point.x, point.y, point.z, point.w];
  const transformed = [
    matrix[0][0] * vec[0] +
      matrix[0][1] * vec[1] +
      matrix[0][2] * vec[2] +
      matrix[0][3] * vec[3],
    matrix[1][0] * vec[0] +
      matrix[1][1] * vec[1] +
      matrix[1][2] * vec[2] +
      matrix[1][3] * vec[3],
    matrix[2][0] * vec[0] +
      matrix[2][1] * vec[1] +
      matrix[2][2] * vec[2] +
      matrix[2][3] * vec[3],
    matrix[3][0] * vec[0] +
      matrix[3][1] * vec[1] +
      matrix[3][2] * vec[2] +
      matrix[3][3] * vec[3]
  ];

  return {
    x: transformed[0],
    y: transformed[1],
    z: transformed[2],
    w: transformed[3]
  };
}

/**
 * 应用 4D 旋转矩阵的逆变换（转置矩阵）到单个点。
 * @param {{x: number, y: number, z: number, w: number}} rotatedPoint - 已旋转的点。
 * @param {Array<Array<number>>} rotationMatrix - 原始 4x4 旋转矩阵。
 * @returns {{x: number, y: number, z: number, w: number}} 逆旋转后的 4D 点。
 */
function apply4DInverseRotation(rotatedPoint, rotationMatrix) {
  // 计算旋转矩阵的逆矩阵。（转置矩阵，因为旋转矩阵是正交矩阵）
  const inverseRotation = [
    [
      rotationMatrix[0][0],
      rotationMatrix[1][0],
      rotationMatrix[2][0],
      rotationMatrix[3][0]
    ],
    [
      rotationMatrix[0][1],
      rotationMatrix[1][1],
      rotationMatrix[2][1],
      rotationMatrix[3][1]
    ],
    [
      rotationMatrix[0][2],
      rotationMatrix[1][2],
      rotationMatrix[2][2],
      rotationMatrix[3][2]
    ],
    [
      rotationMatrix[0][3],
      rotationMatrix[1][3],
      rotationMatrix[2][3],
      rotationMatrix[3][3]
    ]
  ];

  return apply4DMatrix(rotatedPoint, inverseRotation);
}

/**
 * 解析 4OFF 格式的四维网格数据。
 * @param {string} data - 4OFF 格式的字符串数据。
 * @returns {{vertices: Array<{x: number, y: number, z: number, w: number}>, faces: Array<Array<number>>, cells: Array<Array<number>>}} 包含顶点、面和胞的对象。
 * @throws {Error} 当文件格式无效时抛出错误。
 */
function parse4OFF(data) {
  const lines = data
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'));
  if (lines[0].trim() !== '4OFF') throw new Error('Invalid 4OFF file format');

  const [nVertices, nFaces, , nCells] = lines[1]
    .trim()
    .split(/\s+/)
    .map(Number);
  const vertices = [];

  for (let i = 0; i < nVertices; i++) {
    const [x, y, z, w] = lines[i + 2].trim().split(/\s+/).map(parseFloat);
    vertices.push({ x, y, z, w });
  }

  const faces = [];
  for (let i = 0; i < nFaces; i++) {
    const parts = lines[i + 2 + nVertices].trim().split(/\s+/);
    const count = parseInt(parts[0]);
    faces.push(parts.slice(1, count + 1).map(Number));
  }

  const cells = [];
  for (let i = 0; i < nCells; i++) {
    const parts = lines[i + 2 + nVertices + nFaces].trim().split(/\s+/);
    const count = parseInt(parts[0]);
    cells.push(parts.slice(1, count + 1).map(Number));
  }

  return { vertices, faces, cells };
}

/**
 * 判断两个 4D 点是否在允许误差范围内接近。
 * @param {{x: number, y: number, z: number, w: number}} point1 - 第一个 4D 点。
 * @param {{x: number, y: number, z: number, w: number}} point2 - 第二个 4D 点。
 * @param {number} [epsilon=Number.EPSILON] - 允许的误差范围。
 * @returns {boolean} 如果所有坐标差值都在误差范围内则返回 true。
 */
function are4DPointsClose(point1, point2, epsilon = Number.EPSILON) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  const dz = Math.abs(point1.z - point2.z);
  const dw = Math.abs(point1.w - point2.w);

  return dx <= epsilon && dy <= epsilon && dz <= epsilon && dw <= epsilon;
}

/**
 * 生成从 start 到 stop 的连续整数数组。
 * @param {number} start - 起始值（包含）。
 * @param {number} stop - 结束值（包含）。
 * @returns {Array<number>} 生成的整数数组。
 */
function range(start, stop) {
  const length = Math.max(stop - start + 1, 0);
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * 处理四维网格数据，包括面的三角化和胞重构。
 * @param {{vertices: Array<{x: number, y: number, z: number, w: number}>, faces: Array<Array<number>>, cells: Array<Array<number>>}} data - 四维网格数据对象。
 * @returns {{vertices: Array<{x: number, y: number, z: number, w: number}>, faces: Array<Array<number>>, edges: Array<Array<{x: number, y: number, z: number, w: number}>>, cells: Array<Array<number>>}} 处理后的网格数据，包含新增顶点、三角化面片、边和重构胞。
 */
function process4DMeshData({ vertices, faces, cells }) {
  const processedVertices = [...vertices];
  const processedFaces = [];
  const processedCells = [];
  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  const facesMap = {};
  faces.forEach((face, faceIndex) => {
    if (face.length === 3) {
      processedFaces.push(face);
      return;
    }

    const faceVertices = face.map(idx => vertices[idx]);

    function triangulateFace(vertices4D) {
      const { rotated, rotationMatrix, z, w } = rotate4DPointsToXY(vertices4D);
      const contour = rotated.map(p => new poly2tri.Point(p.x, p.y));

      const triangles = [];
      const decomposed = decomposeSelfIntersectingPolygon(contour);
      for (const subPolygon of decomposed) {
        const swctx = new poly2tri.SweepContext(subPolygon);
        swctx.triangulate();

        const subTriangles = swctx.getTriangles().map(triangle =>
          triangle.getPoints().map(pt => {
            pt.z = z;
            pt.w = w;
            const origPoint = apply4DInverseRotation(pt, rotationMatrix);
            const origIndex = processedVertices.findIndex(p =>
              are4DPointsClose(p, origPoint)
            );

            if (origIndex > -1) return origIndex;

            processedVertices.push(origPoint);
            return processedVertices.length - 1;
          })
        );

        triangles.push(...subTriangles);
      }

      return triangles;
    }

    const trianglesForFaceStartIndex = processedFaces.length;
    const triangles = triangulateFace(faceVertices);
    triangles.forEach(t => {
      if (t.length === 3) processedFaces.push(t);
    });
    const trianglesForFaceEndIndex = processedFaces.length - 1;
    facesMap[faceIndex] = [
      trianglesForFaceStartIndex,
      trianglesForFaceEndIndex
    ];
  });

  for (const cell of cells) {
    const processedCell = [];
    for (const face of cell) {
      processedCell.push(...range(...facesMap[face]));
    }
    processedCells.push(processedCell);
  }

  return {
    vertices: processedVertices,
    faces: processedFaces,
    edges,
    cells: processedCells
  };
}

export { process4DMeshData, parse4OFF };
