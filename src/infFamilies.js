import { getUniqueSortedPairs } from './helperFunc.js';
import { range } from './helperFunc.js';
import * as type from './type.js';

/**
 * 多边形索引迭代器。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 迭代步长。
 * @yields {number} 返回多边形顶点索引（0 到 n-1）。
 */
function* polygonIndexIterator(n, s) {
    let index = 0;
    for (let i = 0; i < n; i++) {
        yield index % n;
        index += s;
    }
}

/**
 * 生成 n 角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function prism(n, s = 1) {
    const offset = n % 2 === 0 ? Math.PI * 1 / n : 0;
    
    const length = 2 * Math.sin(Math.PI * s / n);

    const vertices = [];
    for (const sign of [1, -1]) {
        for (const i of polygonIndexIterator(n, s)) {
            const theta = 2 * Math.PI * i / n + offset;
            const x = Math.cos(theta);
            const y = Math.sin(theta);
            vertices.push({x, y: sign * length / 2, z: -y});
        }
    }
    const faces = [];
    for (let i = 0; i < n; i++) {
      faces.push([i, (i + 1) % n, (i + 1) % n + n, i + n])
    }
    faces.push(range(0, n - 1))
    faces.push(range(n, 2 * n - 1))
    
    const edges = getUniqueSortedPairs(faces).map(edge =>
      edge.map(index => vertices[index])
    );
    
    return { vertices, faces, edges };
}

/**
 * 生成 n 角反角柱的网格数据。
 * @param {number} n - 多边形的边数。
 * @param {number} s - 多边形的步长。
 * @returns {type.NonTriMesh3D} 网格数据对象。
 */
function antiprism(n, s = 1) {
    const offset = n % 2 === 0 ? Math.PI * 1 / n : 0;
    
    const polygon_edge_length = 2 * Math.sin(Math.PI * s / n);
    const length = Math.sqrt(polygon_edge_length ** 2 - 2 * (1 - Math.cos(Math.PI * s / n)));

    const vertices = [];
    for (const sign of [1, -1]) {
        for (const i of polygonIndexIterator(n, s)) {
            const theta = 2 * Math.PI * i / n + offset + (sign === -1 ? Math.PI * s / n : 0);
            const x = Math.cos(theta);
            const y = Math.sin(theta);
            vertices.push({x, y: sign * length / 2, z: -y});
        }
    }
    const faces = [];
    for (let i = 0; i < n; i++) {
      faces.push([i, (i + 1) % n, i + n])
      faces.push([i + n, (i + 1) % n + n, (i + 1) % n])
    }
    faces.push(range(0, n - 1))
    faces.push(range(n, 2 * n - 1))
    
    const edges = getUniqueSortedPairs(faces).map(edge =>
      edge.map(index => vertices[index])
    );
    
    return { vertices, faces, edges };
}

/**
 * 生成 m-n 角双角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 */
function duoprism(m, n, s1 = 1, s2 = 1) {
    const offset1 = m % 2 === 0 ? Math.PI * 1 / m : 0;
    const offset2 = Math.PI / 2 - Math.PI / n;

    const vertices = [];
    for (const i of polygonIndexIterator(m, s1)) {
        const theta1 = 2 * Math.PI * i / m + offset1;
        const x = Math.cos(theta1);
        const y = Math.sin(theta1);
        for (const j of polygonIndexIterator(n, s2)) {
            const theta2 = 2 * Math.PI * j / n + offset2;
            const z = Math.cos(theta2);
            const w = Math.sin(theta2);
            vertices.push({x, y: z, z: -y, w});
        }
    }

    const rectangularFaces = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const iNext = (i + 1) % m;
            const jNext = (j + 1) % n;
            const v0 = i * n + j;
            const v1 = i * n + jNext;
            const v2 = iNext * n + jNext;
            const v3 = iNext * n + j;
            rectangularFaces.push([v0, v1, v2, v3]);
        }
    }

    const mGonFaces = [];
    for (let j = 0; j < n; j++) {
        const face = [];
        for (let i = 0; i < m; i++) {
            face.push(i * n + j);
        }
        mGonFaces.push(face);
    }

    const nGonFaces = [];
    for (let i = 0; i < m; i++) {
        const face = [];
        for (let j = 0; j < n; j++) {
            face.push(i * n + j);
        }
        nGonFaces.push(face);
    }

    const faces = rectangularFaces.concat(mGonFaces, nGonFaces);

    const cells = [];
    for (let i = 0; i < m; i++) {
        const cellFaces = [];
        for (let j = 0; j < n; j++) {
            const faceIdx = i * n + j;
            cellFaces.push(faceIdx);
        }
        cellFaces.push(rectangularFaces.length + i);
        cellFaces.push(rectangularFaces.length + (i + 1) % m);
        cells.push(cellFaces);
    }

    for (let j = 0; j < n; j++) {
        const cellFaces = [];
        for (let i = 0; i < m; i++) {
            const faceIdx = i * n + j;
            cellFaces.push(faceIdx);
        }
        cellFaces.push(rectangularFaces.length + m + j);
        cellFaces.push(rectangularFaces.length + m + (j + 1) % n);
        cells.push(cellFaces);
    }
    
    const edges = getUniqueSortedPairs(faces).map(edge =>
      edge.map(index => vertices[index])
    );

    return { vertices, faces, edges, cells };
}

export default {
  prism,
  antiprism,
  duoprism
};