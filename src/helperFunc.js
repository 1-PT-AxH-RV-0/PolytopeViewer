import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { set } from 'lodash';
import * as poly2tri from 'poly2tri';
import YAML from 'js-yaml';
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
 * 从旋转欧拉角创建 4D 旋转矩阵。（角度制）
 * @param {number} xy_deg - xy 旋转角度。
 * @param {number} xz_deg - xz 旋转角度。
 * @param {number} xw_deg - xw 旋转角度。
 * @param {number} yz_deg - yz 旋转角度。
 * @param {number} yw_deg - yw 旋转角度。
 * @param {number} zw_deg - zw 旋转角度。
 * @returns {THREE.Matrix4} - 4D 旋转矩阵。
 */
function create4DRotationMat(xy_deg, xz_deg, xw_deg, yz_deg, yw_deg, zw_deg) {
  // 将角度转换为弧度
  const xy = THREE.MathUtils.degToRad(xy_deg);
  const xz = THREE.MathUtils.degToRad(xz_deg);
  const xw = THREE.MathUtils.degToRad(xw_deg);
  const yz = THREE.MathUtils.degToRad(yz_deg);
  const yw = THREE.MathUtils.degToRad(yw_deg);
  const zw = THREE.MathUtils.degToRad(zw_deg);

  /* eslint-disable */
  // 计算各旋转角度的正弦和余弦
  const cxy = Math.cos(xy), sxy = Math.sin(xy);
  const cxz = Math.cos(xz), sxz = Math.sin(xz);
  const cxw = Math.cos(xw), sxw = Math.sin(xw);
  const cyz = Math.cos(yz), syz = Math.sin(yz);
  const cyw = Math.cos(yw), syw = Math.sin(yw);
  const czw = Math.cos(zw), szw = Math.sin(zw);

  // 初始化六个基本旋转矩阵
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

/**
 * 校验录制配置对象中以的有效性。
 * @param {object} config - 要验证的配置对象。
 * @param {boolean} is4D - 是否为 4D 模式。
 * @throws {Error} 当任何字段验证失败时抛出错误，包含具体的错误信息。
 */
function validateRecordConfig(config, is4D) {
  if (config.initialRot !== undefined) {
    if (
      !Array.isArray(config.initialRot) ||
      config.initialRot.length !== 6 ||
      config.initialRot.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialRot 字段必须是包含 6 个实数的数组。');
    }
    if (
      (config.initialRot[2] !== 0 ||
        config.initialRot[4] !== 0 ||
        config.initialRot[5] !== 0) &&
      !is4D
    )
      throw new Error(
        'initialRot 字段的索引 2、4、5 上的值在非 4D 模式下必须为 0。'
      );
  }

  if (config.initialOfs !== undefined) {
    if (!is4D) throw new Error('initialOfs 字段的只在 4D 模式下可用。');
    if (
      !Array.isArray(config.initialOfs) ||
      config.initialOfs.length !== 4 ||
      config.initialOfs.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialOfs 字段必须是包含 4 个实数的数组。');
    }
  }

  if (config.initialOfs3 !== undefined) {
    if (
      !Array.isArray(config.initialOfs3) ||
      config.initialOfs3.length !== 3 ||
      config.initialOfs3.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialOfs3 字段必须是包含 3 个实数的数组。');
    }
  }

  if (config.initialVerticesEdgesDim !== undefined) {
    if (
      typeof config.initialVerticesEdgesDim !== 'number' ||
      config.initialVerticesEdgesDim <= 0
    ) {
      throw new Error('initialVerticesEdgesDim 字段必须是正实数。');
    }
  }

  if (config.initialProjDist !== undefined) {
    if (!is4D) throw new Error('initialProjDist 字段的只在 4D 模式下可用。');
    if (
      typeof config.initialProjDist !== 'number' ||
      config.initialProjDist <= 0
    ) {
      throw new Error('initialProjDist 字段必须是正实数。');
    }
  }

  if (config.initialFaceOpacity !== undefined) {
    if (
      typeof config.initialFaceOpacity !== 'number' ||
      config.initialFaceOpacity < 0 ||
      config.initialFaceOpacity > 1
    ) {
      throw new Error('initialFaceOpacity 字段必须是 0~1 之间的实数。');
    }
  }

  if (config.initialVisibilities !== undefined) {
    const validTargets = ['faces', 'wireframe', 'vertices', 'axes'];
    for (const [target, value] of Object.entries(config.initialVisibilities)) {
      if (!validTargets.includes(target)) {
        throw new Error(
          `initialVisibilities 字段包含无效的目标类型: ${target}。`
        );
      }
      if (typeof value !== 'boolean') {
        throw new Error(`initialVisibilities.${target} 字段必须为布尔值。`);
      }
    }
  }

  if (
    config.initialCameraProjMethod !== undefined &&
    !['persp', 'ortho'].includes(config.initialCameraProjMethod)
  ) {
    throw new Error('initialCameraProjMethod 字段必须为 "persp" 或 "ortho"。');
  }

  if (config.initialSchleProjEnable !== undefined) {
    if (!is4D)
      throw new Error('initialSchleProjEnable 字段的只在 4D 模式下可用。');
    if (typeof config.initialSchleProjEnable !== 'boolean')
      throw new Error('initialSchleProjEnable 字段必须为布尔值。');
  }

  if (config.initialHighlightConfig !== undefined) {
    if (!is4D)
      throw new Error('initialHighlightConfig 字段的只在 4D 模式下可用。');
    for (const [color, cellsSelectorConfig] of Object.entries(
      config.initialHighlightConfig
    )) {
      if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
        throw new Error(
          `initialHighlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
        );
      validateCellsSelectorConfig(
        cellsSelectorConfig,
        `initialHighlightConfig.${color}.`
      );
    }
  }

  if (config.initialHighlightFacesConfig !== undefined) {
    if (is4D)
      throw new Error('initialHighlightFacesConfig 字段的只在 3D 模式下可用。');
    for (const [color, facesSelectorConfig] of Object.entries(
      config.initialHighlightFacesConfig
    )) {
      if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
        throw new Error(
          `initialHighlightFacesConfig 的十六进制 RGBA 色码 ${color} 无效。`
        );
      /* 未完成
        validateFacesSelectorConfig(
          facesSelectorConfig,
          `initialHighlightFacesConfig.${color}.`
        );
      */
    }
  }

  if (
    !Array.isArray(config.actions) ||
    config.actions.some(i => !(i instanceof Object))
  ) {
    throw new Error('action 字段必须为对象列表。');
  }

  config.actions.forEach((action, index) => {
    switch (action.type) {
      case 'rot':
        if (typeof action.angle !== 'number')
          throw new Error(`actions[${index}] 操作的 angle 字段必须为实数。`);
        if (
          !(
            Number.isInteger(action.plane) &&
            0 <= action.plane &&
            action.plane <= 5
          )
        )
          throw new Error(
            `actions[${index}] 操作的 plane 字段必须为大于等于零小于六的整数。`
          );
        if (!is4D && [2, 4, 5].includes(action.plane))
          throw new Error(
            `actions[${index}] 操作的 plane 字段值 ${action.plane} 只在四维模式可用。`
          );
        break;
      case 'trans4':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (
          action.ofs.length !== 4 ||
          action.ofs.some(v => typeof v !== 'number')
        )
          throw new Error(
            `actions[${index}] 操作的 ofs 字段必须为四个实数的数组。`
          );
        break;
      case 'trans3':
        if (
          action.ofs.length !== 3 ||
          action.ofs.some(v => typeof v !== 'number')
        )
          throw new Error(
            `actions[${index}] 操作的 ofs 字段必须为三个实数的数组。`
          );
        break;
      case 'setVerticesEdgesDim':
        if (typeof action.dimOfs !== 'number')
          throw new Error(`actions[${index}] 操作的 dimOfs 字段必须为实数。`);
        break;
      case 'setProjDist':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (typeof action.projDistOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 projDistOfs 字段必须为实数。`
          );
        break;
      case 'setFaceOpacity':
        if (typeof action.faceOpacityOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 faceOpacityOfs 字段必须为实数。`
          );
        break;
      case 'setVisibility':
        if (!['faces', 'wireframe', 'vertices', 'axes'].includes(action.target))
          throw new Error(
            `actions[${index}] 操作的 target 字段值必须为 faces、wireframe、vertices 或 axes 中的一者。`
          );
        if (typeof action.visibility !== 'boolean')
          throw new Error(
            `actions[${index}] 操作的 visibility 字段值必须为 boolean 类型。`
          );
        break;
      case 'setCameraProjMethod':
        if (action.projMethod !== 'persp' && action.projMethod !== 'ortho')
          throw new Error(
            `actions[${index}] 操作的 projMethod 字段值必须为 persp 或 ortho 中的一者。`
          );
        break;
      case 'setSchleProjEnable':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (typeof action.enable !== 'boolean')
          throw new Error(
            `actions[${index}] 操作的 enable 字段值必须为 boolean 类型。`
          );
        break;
      case 'highlightCells':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);

        for (const [color, cellsSelectorConfig] of Object.entries(
          action.highlightConfig
        )) {
          if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
            throw new Error(
              `actions[${index}].highlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
            );
          validateCellsSelectorConfig(
            cellsSelectorConfig,
            `actions[${index}].highlightConfig.${color}.`
          );
        }
        break;
      case 'highlightFaces':
        if (is4D) throw new Error(`actions[${index}] 操作只在三维模式可用。`);

        for (const [color, facesSelectorConfig] of Object.entries(
          action.highlightConfig
        )) {
          if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
            throw new Error(
              `actions[${index}].highlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
            );
          /* 未完成
            validateFacesSelectorConfig(
              facesSelectorConfig,
              `actions[${index}].highlightConfig.${color}.`
            );
          */
        }
        break;
      default:
        throw new Error(`actions[${index}] 操作的类型 ${action.type} 无效。`);
    }

    if (
      Object.hasOwnProperty.call(action, 'start') &&
      Object.hasOwnProperty.call(action, 'end') &&
      Object.hasOwnProperty.call(action, 'at')
    ) {
      throw new Error(
        `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
      );
    } else if (
      Object.hasOwnProperty.call(action, 'start') &&
      Object.hasOwnProperty.call(action, 'end')
    ) {
      if (
        [
          'setVisibility',
          'setCameraProjMethod',
          'setSchleProjEnable',
          'highlightCells',
          'highlightFaces'
        ].includes(action.type)
      ) {
        throw new Error(
          `actions[${index}] 的 start 和 end 字段值只适用于以下类型的操作：rot、trans4、trans3、setVerticesEdgesDim、setProjDist、setFaceOpacity。`
        );
      }
      if (
        !Number.isInteger(action.start) ||
        !Number.isInteger(action.end) ||
        action.end < action.start ||
        action.start < 0 ||
        action.end < 0
      ) {
        throw new Error(
          `actions[${index}] 的 start 和 end 字段必须均为大于等于 0 的整数，且 end 大于等于 start。`
        );
      }
      if (
        Object.hasOwnProperty.call(action, 'interp') &&
        action.interp !== 'sin' &&
        action.interp !== 'linear'
      ) {
        throw new Error(
          `actions[${index}] 的 interp 字段必须为 sin 或 linear。`
        );
      }
          
    } else if (Object.hasOwnProperty.call(action, 'at')) {
      if (
        ![
          'setVisibility',
          'setCameraProjMethod',
          'setSchleProjEnable',
          'highlightCells',
          'highlightFaces'
        ].includes(action.type)
      ) {
        throw new Error(
          `actions[${index}] 的 at 字段值只适用于以下类型的操作：setVisibility、setCameraProjMethod、setSchleProjEnable、highlightCells, highlightFaces。`
        );
      }
      if (!Number.isInteger(action.at) || action.at < 0)
        throw new Error(
          `actions[${index}] 的 at 字段必须为大于等于 0 的整数。`
        );
      if (Object.hasOwnProperty.call(action, 'interp'))
        throw new Error(
          `actions[${index}] 为瞬时操，不能用interp字段。`
        );
    } else {
      throw new Error(
        `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
      );
    }
  });
}

/**
 * 验证单个 highlightConfig 配置对象。
 * @param {object | string} config - 要验证的单个 highlightConfig 对象。
 * @param {string} prefix - 错误提示的前缀。
 * @throws {Error} - 当配置无效时抛出错误。
 */
function validateCellsSelectorConfig(config, prefix = '') {
  // 基础类型检查
  if (config === 'all') return;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`${prefix} 必须是非数组的对象类型或为字符串 "all"。`);
  }

  // 检查是否包含有效配置项（排除 exclude 字段）
  const validKeys = ['indices', 'ranges', 'nHedra'];
  const hasValidConfig = validKeys.some(
    key =>
      config[key] !== undefined &&
      (Array.isArray(config[key]) ||
        (typeof config[key] === 'object' && !Array.isArray(config[key])))
  );

  if (!hasValidConfig && !config.exclude) {
    throw new Error(
      `${prefix} 必须包含至少一个有效配置项（indices/ranges/nHedra）或 exclude 配置。`
    );
  }

  // 验证包含配置
  const validateInclusion = (conf, prefix = '') => {
    if (conf.indices !== undefined) {
      if (!Array.isArray(conf.indices)) {
        throw new Error(`${prefix}indices 必须是数组类型。`);
      }
      conf.indices.forEach((num, i) => {
        if (!Number.isInteger(num) || num < 0) {
          throw new Error(
            `${prefix}indices[${i}] 必须是非负整数，当前值为 ${num}。`
          );
        }
      });
    }

    if (conf.ranges !== undefined) {
      if (!Array.isArray(conf.ranges)) {
        throw new Error(`${prefix}ranges 必须是二维数组类型。`);
      }
      conf.ranges.forEach((range, i) => {
        if (!Array.isArray(range) || range.length !== 2) {
          throw new Error(
            `${prefix}ranges[${i}] 必须是 [start, end] 格式的数组。`
          );
        }
        const [start, end] = range;
        if (!Number.isInteger(start) || start < 0) {
          throw new Error(
            `${prefix}ranges[${i}][0]（start）必须是非负整数，当前值为 ${start}。`
          );
        }
        if (!Number.isInteger(end) || end < 0) {
          throw new Error(
            `${prefix}ranges[${i}][1]（end）必须是非负整数，当前值为 ${end}。`
          );
        }
        if (start > end) {
          throw new Error(
            `${prefix}ranges[${i}] 的 start 值 ${start} 不能大于 end 值 ${end}。`
          );
        }
      });
    }

    if (conf.nHedra !== undefined) {
      if (!Array.isArray(conf.nHedra)) {
        throw new Error(`${prefix}nHedra 必须是数组类型。`);
      }
      conf.nHedra.forEach((item, i) => {
        if (typeof item === 'number') {
          if (!Number.isInteger(item) || item <= 0) {
            throw new Error(
              `${prefix}nHedra[${i}] 作为数字时必须为正整数，当前值为 ${item}。`
            );
          }
        } else if (typeof item === 'object' && item !== null) {
          if (!Number.isInteger(item.nFaces) || item.nFaces <= 0) {
            throw new Error(
              `${prefix}nHedra[${i}].nFaces 必须为正整数，当前值为 ${item.nFaces}。`
            );
          }
          if (!item.ranges) {
            throw new Error(`${prefix}nHedra[${i}].ranges 是必填项。`);
          }
          if (!Array.isArray(item.ranges)) {
            throw new Error(
              `${prefix}nHedra[${i}].ranges 必须是二维数组类型。`
            );
          }
          validateInclusion({ ranges: item.ranges }, `${prefix}nHedra[${i}].`);
        } else {
          throw new Error(`${prefix}nHedra[${i}] 必须是数字或配置对象。`);
        }
      });
    }
  };

  // 验证主配置
  validateInclusion(config, prefix);

  // 验证 exclude 配置
  if (config.exclude) {
    if (typeof config.exclude !== 'object' || Array.isArray(config.exclude)) {
      throw new Error('exclude 配置必须是对象类型。');
    }
    validateInclusion(config.exclude, prefix + 'exclude.');
  }
}

/**
 * 异步获取并解析用户选择的 YAML 文件。
 * @param {HTMLInputElement} fileInput - 文件输入元素。
 * @returns {Promise<object>} 返回解析后的 YAML 对象。
 */
function parseYamlFileFromInput(fileInput) {
  return new Promise((resolve, reject) => {
    // 确保输入元素是文件类型
    if (fileInput.type !== 'file') {
      reject(new Error('提供的元素不是文件输入类型。'));
      return;
    }

    // 设置临时事件处理程序
    fileInput.addEventListener('change', function handleChange(e) {
      // 移除事件监听器，避免多次触发
      fileInput.removeEventListener('change', handleChange);

      if (!fileInput.files || fileInput.files.length === 0) {
        reject(new Error('没有选择文件。'));
        return;
      }

      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('文件大小不能超过 5 MiB。'));
        return;
      }

      const reader = new FileReader();

      reader.onload = event => {
        try {
          const data = YAML.load(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('文件解析失败: ' + error.message));
        } finally {
          e.target.value = '';
        }
      };

      reader.onerror = () => {
        e.target.value = '';
        reject(new Error('文件读取失败。'));
      };

      reader.readAsText(file);
    });

    // 触发文件选择对话框
    fileInput.click();
  });
}

/**
 * 计算三维点集的质心。
 * @param {type.Point3D[]} points - 三维点集数组。
 * @returns {type.Point3D} - 质心坐标。
 */
function calculateCentroid(points) {
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  const count = points.length;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumZ += point.z;
  }

  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count
  };
}

/**
 * 计算三个平面的交点坐标。
 * @param {type.Point3D[][]} pointSets 点集数组。
 * @returns {type.Point3D} 交点坐标，如果无解或有无穷多解则返回 null。
 */
function findPlanesIntersection(pointSets) {
  const planes = [];
  for (const pointSet of pointSets) {
    const plane = getPlaneEquation(pointSet);
    if (!plane) return null;
    planes.push(plane);
  }

  return solveThreePlanes(planes[0], planes[1], planes[2]);
}

/**
 * 根据三个点计算平面方程。
 * @param {[type.Point3D, type.Point3D, type.Point3D]} points 三个三维点的数组。
 * @returns {object} 平面方程 {A, B, C, D}，如果点共线则返回 null。
 */
function getPlaneEquation(points) {
  const [p1, p2, p3] = points;

  // 计算两个向量
  const v1 = {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z
  };
  const v2 = {
    x: p3.x - p1.x,
    y: p3.y - p1.y,
    z: p3.z - p1.z
  };

  // 计算法向量（叉积）
  const A = v1.y * v2.z - v1.z * v2.y;
  const B = v1.z * v2.x - v1.x * v2.z;
  const C = v1.x * v2.y - v1.y * v2.x;

  // 检查法向量是否为零向量（点共线）
  if (A === 0 && B === 0 && C === 0) {
    return null;
  }

  // 计算D
  const D = A * p1.x + B * p1.y + C * p1.z;

  return { A, B, C, D };
}

/**
 * 解三个平面方程的方程组
 * @param {object} plane1 第一个平面方程 {A, B, C, D}
 * @param {object} plane2 第二个平面方程 {A, B, C, D}
 * @param {object} plane3 第三个平面方程 {A, B, C, D}
 * @returns {object} 交点坐标 {x, y, z}，如果无解或有无穷多解则返回null
 */
function solveThreePlanes(plane1, plane2, plane3) {
  const { A: A1, B: B1, C: C1, D: D1 } = plane1;
  const { A: A2, B: B2, C: C2, D: D2 } = plane2;
  const { A: A3, B: B3, C: C3, D: D3 } = plane3;

  // 构建系数矩阵和常数项
  // A1x + B1y + C1z = D1
  // A2x + B2y + C2z = D2
  // A3x + B3y + C3z = D3

  // 计算行列式
  const det =
    A1 * (B2 * C3 - B3 * C2) -
    B1 * (A2 * C3 - A3 * C2) +
    C1 * (A2 * B3 - A3 * B2);

  // 如果行列式为0，则无解或有无穷多解
  if (Math.abs(det) < 1e-10) {
    return null;
  }

  // 计算x的分子行列式
  const detX =
    D1 * (B2 * C3 - B3 * C2) -
    B1 * (D2 * C3 - D3 * C2) +
    C1 * (D2 * B3 - D3 * B2);

  // 计算y的分子行列式
  const detY =
    A1 * (D2 * C3 - D3 * C2) -
    D1 * (A2 * C3 - A3 * C2) +
    C1 * (A2 * D3 - A3 * D2);

  // 计算z的分子行列式
  const detZ =
    A1 * (B2 * D3 - B3 * D2) -
    B1 * (A2 * D3 - A3 * D2) +
    D1 * (A2 * B3 - A3 * B2);

  // 计算解
  const x = detX / det;
  const y = detY / det;
  const z = detZ / det;

  return { x, y, z };
}

/**
 * 从源数组中原地移除排除数组中包含的元素。
 * @param {Array} sourceArray - 将被修改的源数组。
 * @param {Array} excludeArray - 包含需要移除元素的数组。
 * @returns {Array} 返回修改后的源数组（移除了排除元素的数组）。
 */
function filterArray(sourceArray, excludeArray) {
  const excludeSet = new Set(excludeArray);
  for (let i = sourceArray.length - 1; i >= 0; i--) {
    if (excludeSet.has(sourceArray[i])) {
      sourceArray.splice(i, 1);
    }
  }
  return sourceArray;
}

/**
 * 生成 noUiSlider 对数刻度 range 对象
 * @param {number} min - 最小值(必须 >0)
 * @param {number} max - 最大值(必须 >min)
 * @param {number} base - 对数底数(默认 e)
 * @param {number} segments - 中间分段数(默认 32)
 * @returns {object} noUiSlider 的 range 配置对象
 */
function generateLogarithmicRange(min, max, base = Math.E, segments = 32) {
  if (min <= 0 || max <= 0) {
    throw new Error('最小值和最大值必须大于零。');
  }
  if (max <= min) {
    throw new Error('最大值必须大于最小值。');
  }
  if (segments <= 0) {
    throw new Error('分段数必须大于零。');
  }

  // 计算对数
  const logMin = Math.log(min) / Math.log(base);
  const logMax = Math.log(max) / Math.log(base);
  const logRange = logMax - logMin;

  const range = {
    min: min,
    max: max
  };

  // 生成中间点
  for (let i = 1; i < segments; i++) {
    // 计算对数位置
    const logValue = logMin + (i / segments) * logRange;
    // 转换回实际值
    const value = Math.pow(base, logValue);
    // 计算百分比位置
    const percent = (i / segments) * 100;
    // 保留三位小数百分比
    const percentKey = percent.toFixed(3) + '%';

    range[percentKey] = value;
  }

  return range;
}

function sineInterpolation(steps) {
    const result = [];
    
    for (let i = 0; i < steps; i++) {
        // 当前点的角度（从0到π）
        const angle1 = (i / steps) * Math.PI;
        // 下一个点的角度
        const angle2 = ((i + 1) / steps) * Math.PI;
        
        // 计算函数值：sin(x-π/2)/2 + 0.5
        const val1 = Math.sin(angle1 - Math.PI/2) / 2 + 0.5;
        const val2 = Math.sin(angle2 - Math.PI/2) / 2 + 0.5;
        
        // 两点差值
        result.push(val2 - val1);
    }
    
    return result;
}

function linearInterpolation(steps) {
    const stepValue = 1 / steps;
    return new Array(steps).fill(stepValue);
}

export {
  decomposeSelfIntersectingPolygon,
  inverseRotatePoint,
  rotateToXY,
  arePointsClose,
  getUniqueSortedPairs,
  rotate4DPointsToXY,
  apply4DInverseRotation,
  apply4DMatrix,
  are4DPointsClose,
  range,
  getFarthestPointDist,
  getFarthest4DPointDist,
  changeMaterialProperty,
  disposeGroup,
  toBufferGeometry,
  create4DRotationMat,
  getSortedValuesDesc,
  validateRecordConfig,
  validateCellsSelectorConfig,
  parseYamlFileFromInput,
  calculateCentroid,
  findPlanesIntersection,
  filterArray,
  generateLogarithmicRange,
  sineInterpolation,
  linearInterpolation
};
