/**
 * 三维点。
 * @typedef {object} Point3D
 * @property {number} x - x 坐标。
 * @property {number} y - y 坐标。
 * @property {number} z - z 坐标。
 */

/**
 * 四维点。
 * @typedef {object} Point4D
 * @property {number} x - x 坐标。
 * @property {number} y - y 坐标。
 * @property {number} z - z 坐标。
 * @property {number} w - w 坐标。
 */

/**
 * 三维边。
 * @typedef {[Point3D, Point3D]} Edge3D
 */

/**
 * 四维边。
 * @typedef {[Point4D, Point4D]} Edge4D
 */

/**
 * 非三角三维网格数据。
 * @typedef {object} NonTriMesh3D
 * @property {Array<Point3D>} vertices - 顶点数组。
 * @property {Array<Array<number>>} faces - 面索引数组。
 * @property {Array<[number, number]>} edges - 边索引数组。
 */

/**
 * 非三角四维网格数据。
 * @typedef {object} NonTriMesh4D
 * @property {Array<Point4D>} vertices - 顶点数组。
 * @property {Array<Array<number>>} faces - 面索引数组。
 * @property {Array<[number, number]>} edges - 边索引数组。
 * @property {Array<Array<number>>} cells - 胞索引数组。
 */

/**
 * 三维网格数据。
 * @typedef {object} Mesh3D
 * @property {Array<Point3D>} vertices - 顶点数组。
 * @property {Array<[number, number, number]>} faces - 面索引数组，必须是三角形面。
 * @property {Array<[number, number]>} edges - 边索引数组。
 */

/**
 * 四维网格数据。
 * @typedef {object} Mesh4D
 * @property {Array<Point4D>} vertices - 顶点数组。
 * @property {Array<[number, number, number]>} faces - 面索引数组，必须是三角形面。
 * @property {Array<[number, number]>} edges - 边索引数组。
 * @property {Array<Array<number>>} cells - 胞索引数组。
 */

/**
 * 4D 旋转矩阵。
 * @typedef {[[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]]} RotationMatrix
 */

export const Point3D = {};
export const Point4D = {};
export const Edge3D = {};
export const Edge4D = {};
export const NonTriMesh3D = {};
export const NonTriMesh4D = {};
export const Mesh3D = {};
export const Mesh4D = {};
export const RotationMatrix = {};
