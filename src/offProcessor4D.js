import {
  decomposeSelfIntersectingPolygon,
  getUniqueSortedPairs,
  rotate4DPointsToXY,
  apply4DInverseRotation,
  are4DPointsClose,
  range
} from './helperFunc.js';
import * as poly2tri from 'poly2tri';
import * as type from './type.js';

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

  const totalItems = faces.length;
  let processedItems = 0;
  let prevPostTime = performance.now();

  const facesMap = {};
  faces.forEach((face, faceIndex) => {
    /**
     * 三角剖分单个面。
     * @param {Array<type.Point4D>} vertices4D - 顶点数组。
     * @returns {Array<[number, number, number]>} - 三角剖分出来的三角形。
     */
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
    const faceVertices = face.map(idx => vertices[idx]);
    const triangles = triangulateFace(faceVertices);
    triangles.forEach(t => processedFaces.push(t));
    const trianglesForFaceEndIndex = processedFaces.length - 1;
    facesMap[faceIndex] = [
      trianglesForFaceStartIndex,
      trianglesForFaceEndIndex
    ];

    processedItems++;
    // 每隔 200ms 发送一次进度。
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
    facesMap
  };
}

export { process4DMeshData, parse4OFF };
