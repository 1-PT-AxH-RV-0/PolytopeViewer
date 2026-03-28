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
 * @property {{[key: string]: string}} facesMap - 原始面索引与处理后的面索引的映射关系。
 * @property {{[key: string]: number[]}} ngonsInFaces - 按边数分组的面索引。
 * @property {Array<Array<number>>} originalFaces - 原始面索引数组。
 * @property {Array<Point3D>} originalFaceCenters - 原始面的中心点。
 * @property {Array<Point3D>} originalFaceNormals - 原始面的法向量。
 */

/**
 * 四维网格数据。
 * @typedef {object} Mesh4D
 * @property {Array<Point4D>} vertices - 顶点数组。
 * @property {Array<[number, number, number]>} faces - 面索引数组，必须是三角形面。
 * @property {Array<[number, number]>} edges - 边索引数组。
 * @property {Array<Cell>} cells - 胞数组。
 * @property {{[key: string]: string}} facesMap - 原始面索引与处理后的面索引的映射关系。
 */

/**
 * 胞数据。
 * @typedef {object} Cell
 * @property {number} facesCount - 胞的面数。
 * @property {Array<number>} faceIndices - 胞包含的面索引数组。
 */

/**
 * 4D 旋转矩阵。
 * @typedef {[[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]]} RotationMatrix
 */

/**
 * 插值函数类型。
 * @typedef {'linear' | 'quadraticEaseIn' | 'quadraticEaseOut' | 'quadraticEaseInOut' | 'cubicEaseIn' | 'cubicEaseOut' | 'cubicEaseInOut' | 'sineEaseIn' | 'sineEaseOut' | 'sineEaseInOut' | 'expoEaseIn' | 'expoEaseOut'} InterpType
 */

/**
 * 胞选择器配置。
 * @typedef {object | 'all'} CellsSelectorConfig
 * @property {number[]} [indices] - 直接指定的胞索引数组。
 * @property {[number, number][]} [ranges] - 胞索引范围数组。
 * @property {(number | NHedraConfig)[]} [nHedra] - 按面数选择的配置。
 * @property {CellsSelectorConfig} [exclude] - 排除配置。
 */

/**
 * n面体选择配置。
 * @typedef {object} NHedraConfig
 * @property {number} nFaces - 胞的面数。
 * @property {[number, number][]} [ranges] - 要选择的胞范围数组。
 */

/**
 * 面选择器配置。
 * @typedef {object | 'all'} FacesSelectorConfig
 * @property {number[]} [indices] - 直接指定的面索引数组。
 * @property {number[]} [ngons] - 按边数选择的面。
 */

/**
 * 高亮配置。
 * @typedef {{[key: string]: CellsSelectorConfig | FacesSelectorConfig | 'all'}} HighlightConfig
 */

/**
 * 应用程序主类（PolytopeRendererApp）类型。
 * 实际定义在 viewer.js 中。
 * @typedef {import('./viewer.js').PolytopeRendererApp} PolytopeRendererApp
 */

export const Point3D = {};
export const Point4D = {};
export const Edge3D = {};
export const Edge4D = {};
export const NonTriMesh3D = {};
export const NonTriMesh4D = {};
export const Mesh3D = {};
export const Mesh4D = {};
export const Cell = {};
export const RotationMatrix = {};
export const InterpType = {};
export const CellsSelectorConfig = {};
export const NHedraConfig = {};
export const FacesSelectorConfig = {};
export const HighlightConfig = {};
