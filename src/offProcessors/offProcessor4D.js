import * as type from '@/type.js';
import * as poly2tri from 'poly2tri';

import { decomposeSelfIntersectingPolygon } from '@/utils/decompPolygon.js';
import { getUniqueSortedPairs, range } from '@/utils/general.js';
import {
  apply4DInverseRotation,
  are4DPointsClose,
  rotate4DPointsToXY
} from '@/math/geo4D.js';

/**
 * 解析 4OFF 格式的四维网格数据。
 * @param {string} data - 4OFF 格式的字符串数据。
 * @returns {type.NonTriMesh4D} 包含顶点、面、边和胞的对象。
 * @throws {Error} 当文件格式无效时抛出错误。
 */
function parse4OFF(data) {
  const lines = data
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'));
  if (lines[0].trim() !== '4OFF') throw new Error('不是有效的 4OFF 文件。');

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

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );
  return { vertices, faces, edges, cells };
}

/**
 * 处理四维网格数据，包括面的三角化和胞重构。
 * @param {type.NonTriMesh4D} data - 四维网格数据对象。
 * @param {import('lodash').Function2<number, number, any>} progressCallback - 处理面时每隔 200ms 执行的回调。
 * @returns {type.Mesh4D} 处理后的网格数据，包含新增顶点、三角化面片、边和重构胞。
 */
function process4DMeshData(
  { vertices, faces, edges, cells },
  progressCallback
) {
  const processedVertices = [...vertices];
  const processedFaces = [];
  const processedCells = [];

  // ---------- 建立顶点索引缓存 ----------
  const vertexCache = new Map();
  const pointKey = (p) =>
    `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)},${p.w.toFixed(5)}`;

  // 初始化缓存（仅包含所有原始顶点）
  vertices.forEach((v, i) => {
    vertexCache.set(pointKey(v), i);
  });

  const totalItems = faces.length;
  let processedItems = 0;
  let prevPostTime = performance.now();

  const facesMap = {};
  faces.forEach((face, faceIndex) => {
    function triangulateFace(vertices4D) {
      if (vertices4D.length === 3) return [face];

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

            const key = pointKey(origPoint);
            const cachedIndex = vertexCache.get(key);
            if (cachedIndex !== undefined) {
              return cachedIndex;
            }

            // 新顶点：添加到数组和缓存
            const newIndex = processedVertices.length;
            processedVertices.push(origPoint);
            vertexCache.set(key, newIndex);
            return newIndex;
          })
        );

        triangles.push(...subTriangles);
      }
      return triangles;
    }

    const trianglesForFaceStartIndex = processedFaces.length;
    const faceVertices = face.map(idx => vertices[idx]);
    const triangles = triangulateFace(faceVertices);
    triangles.forEach(t => processedFaces.push(t));
    const trianglesForFaceEndIndex = processedFaces.length - 1;
    facesMap[faceIndex] = [
      trianglesForFaceStartIndex,
      trianglesForFaceEndIndex
    ];

    processedItems++;
    if (progressCallback && performance.now() - prevPostTime >= 200) {
      prevPostTime = performance.now();
      progressCallback(processedItems, totalItems);
    }
  });

  for (const cell of cells) {
    const processedCell = [];
    for (const face of cell) {
      processedCell.push(...range(...facesMap[face]));
    }
    processedCells.push({
      facesCount: cell.length,
      faceIndices: processedCell
    });
  }

  return {
    vertices: processedVertices,
    faces: processedFaces,
    edges,
    cells: processedCells,
    facesMap,
    originalCells: cells
  };
}

export { parse4OFF, process4DMeshData };
