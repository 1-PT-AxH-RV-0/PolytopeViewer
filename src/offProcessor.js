import poly2tri from 'poly2tri';

import {
  decomposeSelfIntersectingPolygon,
  computeNormalOutward,
  inverseRotatePoint,
  rotateToXY,
  arePointsClose,
  getUniqueSortedPairs,
  range,
  arePointsCoplanar
} from './helperFunc.js';
import * as type from './type.js';

/**
 * 解析 OFF 格式的 3D 模型数据。
 * @param {string} data - OFF 格式的字符串数据。
 * @returns {type.Mesh3D} 包含顶点、边和面的对象。
 * @throws {Error} 当文件格式无效时抛出错误。
 */
function parseOFF(data) {
  const lines = data
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'));
  if (lines[0].trim() !== 'OFF') throw new Error('不是有效的 OFF 文件。');

  const [nVertices, nFaces] = lines[1].trim().split(/\s+/).map(Number);
  const vertices = [];
  const norms = {};
  const nonclosed = new Set();

  for (let i = 0; i < nVertices; i++) {
    const [x, y, z] = lines[i + 2].trim().split(/\s+/).map(parseFloat);
    vertices.push({ x, y, z });
  }

  const faces = [];
  for (let i = 0; i < nFaces; i++) {
    const parts = lines[i + 2 + nVertices].trim().split(/\s+/);
    const count = parseInt(parts[0]);
    const face = parts.slice(1, count + 1).map(Number);
    
    if (lines[i + 2 + nVertices].trim().split('#')[1]?.trim?.()) {
      const norm = lines[i + 2 + nVertices].trim().split('#')[1].trim().split(/\s+/).map(parseFloat);
      norms[i] = {x: norm[0], y: norm[1], z: norm[2]};
    }
    if (lines[i + 2 + nVertices].trim().split('#')[2]?.trim?.() === 'n') {
      face.push(...face.slice(1, -1).reverse());
      if (face.length === 2) face.push(face[0])
      nonclosed.add(i)
    }
    
    faces.push(face)
  }

  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );

  return { vertices, faces, edges, norms, nonclosed };
}

/**
 * 处理网格数据，包括顶点和面的三角化。
 * @param {type.NonTriMesh3D} meshData - 网格数据对象。
 * @param {import('lodash').Function2<number, number, any>} progressCallback - 处理面时每隔 200ms 执行的回调。
 * @returns {type.Mesh3D} 处理后的网格数据。
 */
function processMeshData({ vertices, faces, edges, norms, nonclosed }, progressCallback) {
  let isSkew = false;
  const processedVertices = [...vertices];
  const processedFaces = [];

  const totalItems = faces.length;
  let processedItems = 0;
  let prevPostTime = performance.now();

  const facesMap = {};
  const ngonsInFaces = {};
  faces.forEach((face, faceIndex) => {
    /**
     * 三角剖分单个面。
     * @param {Array<type.Point3D>} vertices3D - 顶点数组。
     * @returns {Array<[number, number, number]>} - 三角剖分出来的三角形。
     */
    function triangulateFace(vertices3D) {
      if (nonclosed.has(faceIndex) || vertices3D.length === 3 || !arePointsCoplanar(vertices3D)) return [face];
      const { rotated, theta, phi, z } = rotateToXY(vertices3D);
      const contour = rotated.map(p => new poly2tri.Point(p.x, p.y));

      const triangles = [];
      const decomposed = decomposeSelfIntersectingPolygon(contour);
      for (const subPolygon of decomposed) {
        const swctx = new poly2tri.SweepContext(subPolygon);
        swctx.triangulate();

        const subTriangles = swctx.getTriangles().map(triangle =>
          triangle.getPoints().map(pt => {
            pt.z = z;
            const origPoint = inverseRotatePoint(pt, theta, phi);
            const origIndex = processedVertices.findIndex(p =>
              arePointsClose(p, origPoint)
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
    facesMap[faceIndex] = range(
      trianglesForFaceStartIndex,
      trianglesForFaceEndIndex
    );

    if (Object.hasOwnProperty.call(ngonsInFaces, face.length)) {
      ngonsInFaces[face.length].push(faceIndex);
    } else {
      ngonsInFaces[face.length] = [faceIndex];
    }
    
    if (triangles[0].length > 3) isSkew = true;

    processedItems++;
    // 每隔 200ms 发送一次进度。
    if (progressCallback && performance.now() - prevPostTime >= 200) {
      prevPostTime = performance.now();
      progressCallback(processedItems, totalItems);
    }
  });

  return {
    vertices: processedVertices,
    faces: processedFaces,
    edges,
    facesMap,
    ngonsInFaces,
    originalFaces: faces,
    originalFaceCenters: faces.map(face => {
      const len = face.length;
      const center = face.reduce(
        (acc, idx) => ({
          x: acc.x + vertices[idx].x / len,
          y: acc.y + vertices[idx].y / len,
          z: acc.z + vertices[idx].z / len
        }),
        { x: 0, y: 0, z: 0 }
      );
      return center;
    }),
    originalFaceNormals: faces.map((face, i) => {
        if (norms[i]) return norms[i];
        return computeNormalOutward(face.map(idx => vertices[idx]))
    }),
    isSkew
  };
}

export { processMeshData, parseOFF };

