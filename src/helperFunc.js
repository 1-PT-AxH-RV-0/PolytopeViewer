import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { set } from 'lodash';
import * as poly2tri from 'poly2tri';
import * as polygonClipping from 'polygon-clipping';
import * as type from './type.js';

/**
 * 将自相交多边形分解为多个非自相交多边形。
 * @param {Array<{x: number, y: number}>} originalPoints - 原始多边形点集。
 * @returns {Array<Array<poly2tri.Point>>} 分解后的多边形数组。
 */
function decomposeSelfIntersectingPolygon(originalPoints) {
  const coords = originalPoints.map(p => [+p.x.toFixed(6), +p.y.toFixed(6)]);
  if (coords.length > 0) {
    coords.push([coords[0][0], coords[0][1]]);
  }

  const result = polygonClipping.union([coords]);

  const decomposed = [];
  for (const polygon of result) {
    for (const ring of polygon) {
      if (ring.length === 0) continue;
      const ringPoints = ring.slice(0, -1);
      const points = ringPoints.map(([x, y]) => new poly2tri.Point(x, y));
      decomposed.push(points);
    }
  }

  return decomposed;
}

/**
 * 计算 3D 点集所在平面的法向量。
 * @param {Array<type.Point3D>} points - 3D 点集。
 * @returns {type.Point3D} 单位法向量。
 */
function computeNormal(points) {
  const v1 = {
    x: points[1].x - points[0].x,
    y: points[1].y - points[0].y,
    z: points[1].z - points[0].z
  };
  const v2 = {
    x: points[2].x - points[0].x,
    y: points[2].y - points[0].y,
    z: points[2].z - points[0].z
  };

  const nx = v1.y * v2.z - v1.z * v2.y;
  const ny = v1.z * v2.x - v1.x * v2.z;
  const nz = v1.x * v2.y - v1.y * v2.x;

  const length = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
  return { x: nx / length, y: ny / length, z: nz / length };
}

/**
 * 按照给定的 theta 和 phi 角度旋转 3D 点。
 * @param {type.Point3D} p - 要旋转的点。
 * @param {number} theta - 绕 X 轴的旋转角度（弧度）。
 * @param {number} phi - 绕 Y 轴的旋转角度（弧度）。
 * @returns {{x: number, y: number, z: number, orig: object}} 旋转后的点，包含原始点引用。
 */
function rotatePoint(p, theta, phi) {
  const cosT = Math.cos(theta),
    sinT = Math.sin(theta);
  const cosP = Math.cos(phi),
    sinP = Math.sin(phi);
  const y1 = p.y * cosT - p.z * sinT;
  const z1 = p.y * sinT + p.z * cosT;

  const x2 = p.x * cosP + z1 * sinP;
  const z2 = -p.x * sinP + z1 * cosP;

  return { x: x2, y: y1, z: z2, orig: p };
}

/**
 * 按照给定的 theta 和 phi 角度反向旋转 3D 点。
 * @param {type.Point3D} p - 要反向旋转的点。
 * @param {number} theta - 绕 X 轴的反向旋转角度（弧度）。
 * @param {number} phi - 绕 Y 轴的反向旋转角度（弧度）。
 * @returns {type.Point3D} 反向旋转后的点。
 */
function inverseRotatePoint(p, theta, phi) {
  const cosT = Math.cos(-theta),
    sinT = Math.sin(-theta);
  const cosP = Math.cos(-phi),
    sinP = Math.sin(-phi);

  const x1 = p.x * cosP + p.z * sinP;
  const z1 = -p.x * sinP + p.z * cosP;

  const y2 = p.y * cosT - z1 * sinT;
  const z2 = p.y * sinT + z1 * cosT;

  return { x: x1, y: y2, z: z2 };
}

/**
 * 将点集旋转到 XY 平面。
 * @param {Array<type.Point3D>} points - 要旋转的点集。
 * @returns {{rotated: Array<type.Point3D>, theta: number, phi: number, z: number}} 旋转结果和旋转参数。
 */
function rotateToXY(points) {
  const normal = computeNormal(points);

  const theta = Math.atan2(normal.y, normal.z);
  const phi = Math.atan2(-normal.x, Math.sqrt(normal.y ** 2 + normal.z ** 2));

  const rotated = points.map(p => rotatePoint(p, theta, phi));

  return { rotated, theta, phi, z: rotated[0].z };
}

/**
 * 判断两个 3D 点是否在允许误差范围内接近。
 * @param {type.Point3D} point1 - 第一个点。
 * @param {type.Point3D} point2 - 第二个点。
 * @param {number} [epsilon] - 允许的误差范围。
 * @returns {boolean} 如果点在误差范围内接近则返回 true。
 */
function arePointsClose(point1, point2, epsilon = Number.EPSILON) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  const dz = Math.abs(point1.z - point2.z);

  return dx <= epsilon && dy <= epsilon && dz <= epsilon;
}

/**
 * 从面数组中提取唯一且排序过的边对。
 * @param {Array<Array<number>>} arrays - 面的索引数组。
 * @returns {Array<type.Edge3D>} 唯一且排序过的边对数组。
 */
function getUniqueSortedPairs(arrays) {
  const pairs = arrays.flatMap(arr =>
    arr.map((v, i) => [
      Math.min(v, arr[(i + 1) % arr.length]),
      Math.max(v, arr[(i + 1) % arr.length])
    ])
  );
  return [...new Set(pairs.map(JSON.stringify))].map(JSON.parse);
}

/**
 * 将 4D 空间中的点集旋转到 XY 平面以便进行后续处理。
 * @param {Array<type.Point4D>} points - 要旋转的 4D 点数组。
 * @returns {{rotated: Array<type.Point4D>, rotationMatrix: type.RotationMatrix, z: number, w: number}} 包含旋转后点集、4x4 旋转矩阵和原始 z/w 值的对象。
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
 * @param {type.Point4D} point - 要变换的 4D 点。
 * @param {type.RotationMatrix} matrix - 4D 旋转矩阵。
 * @returns {type.Point4D} 变换后的 4D 点。
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
 * @param {type.Point4D} rotatedPoint - 已旋转的点。
 * @param {type.RotationMatrix} rotationMatrix - 原始 4D 旋转矩阵。
 * @returns {type.Point4D} 逆旋转后的 4D 点。
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
 * 判断两个 4D 点是否在允许误差范围内接近。
 * @param {type.Point4D} point1 - 第一个 4D 点。
 * @param {type.Point4D} point2 - 第二个 4D 点。
 * @param {number} [epsilon] - 允许的误差范围。
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
 * 获取点集中离原点最远的点的距离。
 * @param {Array<type.Point3D>} points - 3D 点集。
 * @returns {number} - 最远点离原点的距离。
 */
function getFarthestPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}

/**
 * 获取 4D 点集中离原点最远的点的距离。
 * @param {Array<type.Point4D>} points - 4D 点集。
 * @returns {number} - 最远点离原点的距离。
 */
function getFarthest4DPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2 + p.w ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2 + point.w ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}

/**
 * 修改材质属性
 * @param {THREE.Group} group - 组。
 * @param {string} propertyName - 属性路径。
 * @param { any } newValue - 新值。
 */
function changeMaterialProperty(group, propertyName, newValue) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.material) {
      if (!Array.isArray(child.material)) {
        set(child.material, propertyName, newValue);
        child.material.needsUpdate = true;
      } else {
        for (let material of child.material) {
          set(material, propertyName, newValue);
          material.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * 释放组。
 * @param {THREE.Group} group - 组。
 */
function disposeGroup(group) {
  group.traverse(child => {
    if (child.isMesh) {
      child.geometry?.dispose();
      child.material?.dispose();
    }
  });
  group.clear();
}

/**
 * 转换其他 Geomtry 到 BufferGeometry.
 * @param {(THREE.SphereGeometry | THREE.CylinderGeometry | THREE.ConeGeometry | TextGeometry)} source - 非 BufferGeometry 类型的 Gemotry.
 * @returns {THREE.BufferGeometry} - 复制了 position、normal、uv 数据的 BufferGeometry.
 */
function toBufferGeometry(source) {
  const geo = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach(
    k =>
      source.attributes[k] && geo.setAttribute(k, source.attributes[k].clone())
  );
  source.index && geo.setIndex(source.index.clone());
  source.parameters && (geo.parameters = { ...source.parameters });

  source.dispose();
  return geo;
}

/**
 *
 * @param xy_deg
 * @param xz_deg
 * @param xw_deg
 * @param yz_deg
 * @param yw_deg
 * @param zw_deg
 */
function create4DRotationMat(xy_deg, xz_deg, xw_deg, yz_deg, yw_deg, zw_deg) {
  // 将角度转换为弧度
  const xy = THREE.MathUtils.degToRad(xy_deg);
  const xz = THREE.MathUtils.degToRad(xz_deg);
  const xw = THREE.MathUtils.degToRad(xw_deg);
  const yz = THREE.MathUtils.degToRad(yz_deg);
  const yw = THREE.MathUtils.degToRad(yw_deg);
  const zw = THREE.MathUtils.degToRad(zw_deg);

  // 计算各旋转角度的正弦和余弦
  const cxy = Math.cos(xy),
    sxy = Math.sin(xy);
  const cxz = Math.cos(xz),
    sxz = Math.sin(xz);
  const cxw = Math.cos(xw),
    sxw = Math.sin(xw);
  const cyz = Math.cos(yz),
    syz = Math.sin(yz);
  const cyw = Math.cos(yw),
    syw = Math.sin(yw);
  const czw = Math.cos(zw),
    szw = Math.sin(zw);

  // 初始化六个基本旋转矩阵
  const Rxy = new THREE.Matrix4().set(
    cxy,
    -sxy,
    0.0,
    0.0,
    sxy,
    cxy,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  const Rxz = new THREE.Matrix4().set(
    cxz,
    0.0,
    -sxz,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    sxz,
    0.0,
    cxz,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  const Rxw = new THREE.Matrix4().set(
    cxw,
    0.0,
    0.0,
    -sxw,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    sxw,
    0.0,
    0.0,
    cxw
  );

  const Ryz = new THREE.Matrix4().set(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    cyz,
    -syz,
    0.0,
    0.0,
    syz,
    cyz,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  const Ryw = new THREE.Matrix4().set(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    cyw,
    0.0,
    -syw,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    syw,
    0.0,
    cyw
  );

  const Rzw = new THREE.Matrix4().set(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    czw,
    -szw,
    0.0,
    0.0,
    szw,
    czw
  );

  // 组合所有旋转（顺序会影响最终结果）
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
 * 按键的数值大小对对象进行排序，并返回排序后的值数组。
 * @param {object} obj - 要排序的对象。
 * @returns {Array} 排序后的值数组（按 key 从大到小）。
 */
function getSortedValuesDesc(obj) {
  return Object.entries(obj)
    .sort(([keyA], [keyB]) => +keyB - +keyA)
    .map(([, value]) => value);
}

export {
  decomposeSelfIntersectingPolygon,
  inverseRotatePoint,
  rotateToXY,
  arePointsClose,
  getUniqueSortedPairs,
  rotate4DPointsToXY,
  apply4DInverseRotation,
  are4DPointsClose,
  range,
  getFarthestPointDist,
  getFarthest4DPointDist,
  changeMaterialProperty,
  disposeGroup,
  toBufferGeometry,
  create4DRotationMat,
  getSortedValuesDesc
};
