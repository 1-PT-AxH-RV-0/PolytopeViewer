import * as type from '@/type.js';

/**
 * 计算 3D 点集的平面法向量（右手定则）。
 * @param {Array<type.Point3D>} points - 3D 点集。
 * @returns {type.Point3D} 单位法向量。
 */
export function computeNormal(points) {
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
 * 计算由三个点定义的三角形的法线，并确保法线指向外部。
 * @param {Array<type.Point3D>} points - 三个顶点数组。
 * @returns {type.Point3D} 计算得到的单位法线向量。
 */
export function computeNormalOutward(points) {
  const normal = computeNormal(points);

  const center = { x: 0, y: 0, z: 0 };
  for (const p of points) {
    center.x += p.x;
    center.y += p.y;
    center.z += p.z;
  }
  center.x /= points.length;
  center.y /= points.length;
  center.z /= points.length;

  const dot = normal.x * center.x + normal.y * center.y + normal.z * center.z;

  if (dot < 0) {
    return { x: -normal.x, y: -normal.y, z: -normal.z };
  }

  return normal;
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
export function inverseRotatePoint(p, theta, phi) {
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
export function rotateToXY(points) {
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
export function arePointsClose(point1, point2, epsilon = Number.EPSILON) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  const dz = Math.abs(point1.z - point2.z);

  return dx <= epsilon && dy <= epsilon && dz <= epsilon;
}

/**
 * 获取点集中离原点最远的点的距离。
 * @param {Array<type.Point3D>} points - 3D 点集。
 * @returns {number} - 最远点离原点的距离。
 */
export function getFarthestPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}

/**
 * 判断三维点集是否共面。
 * @param {Array<type.Point3D>} points - 点集数组，每个元素为 {x, y, z} 对象。
 * @param {number} epsilon - 距离阈值。
 * @returns {boolean} - 共面返回 true，否则返回 false。
 */
export function arePointsCoplanar(points, epsilon = 1e-2) {
  if (points.length < 4) return true;

  const p0 = points[0],
    p1 = points[1],
    p2 = points[2];

  const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
  const v2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };

  const n = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };

  for (let i = 3; i < points.length; i++) {
    const v = {
      x: points[i].x - p0.x,
      y: points[i].y - p0.y,
      z: points[i].z - p0.z
    };
    const dist =
      Math.abs(n.x * v.x + n.y * v.y + n.z * v.z) /
      Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
    if (dist > epsilon) return false;
  }
  return true;
}
