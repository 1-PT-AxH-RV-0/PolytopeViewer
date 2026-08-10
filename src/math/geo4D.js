import * as type from '@/type.js';
import * as THREE from 'three';

/**
 * 从旋转欧拉角创建 4D 旋转矩阵。（角度制）
 * @param {number} xy_deg - xy 旋转角度。
 * @param {number} xz_deg - xz 旋转角度。
 * @param {number} xw_deg - xw 旋转角度。
 * @param {number} yz_deg - yz 旋转角度。
 * @param {number} yw_deg - yw 旋转角度。
 * @param {number} zw_deg - zw 旋转角度。
 * @returns {THREE.Matrix4} - 4D 旋转矩阵。
 */
export function create4DRotationMat(xy_deg, xz_deg, xw_deg, yz_deg, yw_deg, zw_deg) {
  const xy = THREE.MathUtils.degToRad(xy_deg);
  const xz = THREE.MathUtils.degToRad(xz_deg);
  const xw = THREE.MathUtils.degToRad(xw_deg);
  const yz = THREE.MathUtils.degToRad(yz_deg);
  const yw = THREE.MathUtils.degToRad(yw_deg);
  const zw = THREE.MathUtils.degToRad(zw_deg);

  /* eslint-disable */
  const cxy = Math.cos(xy), sxy = Math.sin(xy);
  const cxz = Math.cos(xz), sxz = Math.sin(xz);
  const cxw = Math.cos(xw), sxw = Math.sin(xw);
  const cyz = Math.cos(yz), syz = Math.sin(yz);
  const cyw = Math.cos(yw), syw = Math.sin(yw);
  const czw = Math.cos(zw), szw = Math.sin(zw);

  const Rxy = new THREE.Matrix4().set(
    cxy,-sxy, 0.0, 0.0,
    sxy, cxy, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  const Rxz = new THREE.Matrix4().set(
    cxz, 0.0,-sxz, 0.0,
    0.0, 1.0, 0.0, 0.0,
    sxz, 0.0, cxz, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  const Rxw = new THREE.Matrix4().set(
    cxw, 0.0, 0.0,-sxw,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    sxw, 0.0, 0.0, cxw
  );

  const Ryz = new THREE.Matrix4().set(
    1.0, 0.0, 0.0, 0.0,
    0.0, cyz,-syz, 0.0,
    0.0, syz, cyz, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  const Ryw = new THREE.Matrix4().set(
    1.0, 0.0, 0.0, 0.0,
    0.0, cyw, 0.0,-syw,
    0.0, 0.0, 1.0, 0.0,
    0.0, syw, 0.0, cyw
  );

  const Rzw = new THREE.Matrix4().set(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, czw,-szw,
    0.0, 0.0, szw, czw
  );
  /* eslint-enable */

  const result = new THREE.Matrix4();
  result.multiply(Rzw);
  result.multiply(Ryw);
  result.multiply(Ryz);
  result.multiply(Rxw);
  result.multiply(Rxz);
  result.multiply(Rxy);

  return result;
}

/**
 * 判断两个 4D 点是否在允许误差范围内接近。
 * @param {type.Point4D} point1 - 第一个 4D 点。
 * @param {type.Point4D} point2 - 第二个 4D 点。
 * @param {number} [epsilon] - 允许的误差范围。
 * @returns {boolean} 如果所有坐标差值都在误差范围内则返回 true。
 */
export function are4DPointsClose(point1, point2, epsilon = Number.EPSILON) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  const dz = Math.abs(point1.z - point2.z);
  const dw = Math.abs(point1.w - point2.w);

  return dx <= epsilon && dy <= epsilon && dz <= epsilon && dw <= epsilon;
}

/**
 * 应用 4D 变换矩阵到单个点。
 * @param {type.Point4D} point - 要变换的 4D 点。
 * @param {type.RotationMatrix} matrix - 4D 旋转矩阵。
 * @returns {type.Point4D} 变换后的 4D 点。
 */
export function apply4DMatrix(point, matrix) {
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
 * @param {type.Point4D} rotatedPoint - 已旋转的点。
 * @param {type.RotationMatrix} rotationMatrix - 原始 4D 旋转矩阵。
 * @returns {type.Point4D} 逆旋转后的 4D 点。
 */
export function apply4DInverseRotation(rotatedPoint, rotationMatrix) {
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
 * 计算 4x4 矩阵的行列式（行主序）。
 * @param {type.RotationMatrix} m - 4x4 矩阵。
 * @returns {number} 行列式值。
 */
function compute4x4Determinant(m) {
  function det3x3(m3) {
    return (
      m3[0][0] * (m3[1][1] * m3[2][2] - m3[1][2] * m3[2][1]) -
      m3[0][1] * (m3[1][0] * m3[2][2] - m3[1][2] * m3[2][0]) +
      m3[0][2] * (m3[1][0] * m3[2][1] - m3[1][1] * m3[2][0])
    );
  }

  return (
    m[0][0] *
      det3x3([
        [m[1][1], m[1][2], m[1][3]],
        [m[2][1], m[2][2], m[2][3]],
        [m[3][1], m[3][2], m[3][3]]
      ]) -
    m[0][1] *
      det3x3([
        [m[1][0], m[1][2], m[1][3]],
        [m[2][0], m[2][2], m[2][3]],
        [m[3][0], m[3][2], m[3][3]]
      ]) +
    m[0][2] *
      det3x3([
        [m[1][0], m[1][1], m[1][3]],
        [m[2][0], m[2][1], m[2][3]],
        [m[3][0], m[3][1], m[3][3]]
      ]) -
    m[0][3] *
      det3x3([
        [m[1][0], m[1][1], m[1][2]],
        [m[2][0], m[2][1], m[2][2]],
        [m[3][0], m[3][1], m[3][2]]
      ])
  );
}

/**
 * 将 4D 空间中的点集旋转到 XY 平面以便进行后续处理。
 * @param {Array<type.Point4D>} points - 要旋转的 4D 点数组。
 * @returns {{rotated: Array<type.Point4D>, rotationMatrix: type.RotationMatrix, z: number, w: number}} 包含旋转后点集、4x4 旋转矩阵和原始 z/w 值的对象。
 * @throws {Error} 当输入向量太小或线性相关时抛出错误。
 */
export function rotate4DPointsToXY(points) {
  if (points.length < 3) throw new Error('至少需要三个点');

  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];

  const u = [p1.x - p0.x, p1.y - p0.y, p1.z - p0.z, p1.w - p0.w];
  const v = [p2.x - p0.x, p2.y - p0.y, p2.z - p0.z, p2.w - p0.w];

  const normU = Math.hypot(...u);
  if (normU < 1e-10) throw new Error('向量 u 模长过小');
  const q1 = u.map(x => x / normU);

  const dotUV = u.reduce((sum, val, i) => sum + val * v[i], 0);
  const projUV = u.map(x => (dotUV / (normU * normU)) * x);
  const vOrtho = v.map((val, i) => val - projUV[i]);
  const normVOrtho = Math.hypot(...vOrtho);
  if (normVOrtho < 1e-10) throw new Error('向量线性相关');
  const q2 = vOrtho.map(x => x / normVOrtho);

  const stdBasis = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  const basis = [q1, q2];
  const orthoVecs = [];

  for (const e of stdBasis) {
    let vec = e.slice();
    for (const b of basis) {
      const dot = vec.reduce((sum, val, i) => sum + val * b[i], 0);
      vec = vec.map((val, i) => val - dot * b[i]);
    }
    const norm = Math.hypot(...vec);
    if (norm > 1e-6) {
      const normalized = vec.map(x => x / norm);
      orthoVecs.push(normalized);
      basis.push(normalized);
      if (orthoVecs.length >= 2) break;
    }
  }

  if (orthoVecs.length < 2) throw new Error('无法构造完备标准正交基');
  const [q3, q4] = orthoVecs;

  let rotationMatrix = [q1, q2, q3, q4];

  const det = compute4x4Determinant(rotationMatrix);
  if (Math.abs(det - 1) > 1e-8) {
    if (Math.abs(det + 1) < 1e-8) {
      rotationMatrix[3] = rotationMatrix[3].map(x => -x);
    } else {
      throw new Error(`矩阵行列式异常: ${det}`);
    }
  }

  const rotatedPoints = points.map(p => apply4DMatrix(p, rotationMatrix));

  const firstRotated = rotatedPoints[0];
  return {
    rotated: rotatedPoints,
    rotationMatrix: rotationMatrix,
    z: firstRotated.z,
    w: firstRotated.w
  };
}

/**
 * 获取 4D 点集中离原点最远的点的距离。
 * @param {Array<type.Point4D>} points - 4D 点集。
 * @returns {number} - 最远点离原点的距离。
 */
export function getFarthest4DPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2 + p.w ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2 + point.w ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}
