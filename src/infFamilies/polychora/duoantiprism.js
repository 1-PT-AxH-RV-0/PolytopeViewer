import * as type from '@/type.js';

import { getUniqueSortedPairs } from '@/utils/general.js';
import { alternate4D } from '../alternation.js';
import { duoprism } from './duoprism.js';

/**
 * 生成 m 角 n 角双反角柱的网格数据。
 * @param {number} m - 第一个多边形的边数。
 * @param {number} n - 第二个多边形的边数。
 * @param {number} s1 - 第一个多边形的步长。
 * @param {number} s2 - 第二个多边形的步长。
 * @returns {type.NonTriMesh4D} 4D 网格数据对象。
 * @throws {Error} - 当为原双角柱为复合双角柱时抛出。
 */
export function duoantiprism(m, n, s1 = 1, s2 = 1) {
  const origDuoprism = duoprism(m * 2, n * 2, s1, s2);
  const { vertices, faces, cells } = alternate4D(origDuoprism);
  const edges = getUniqueSortedPairs(faces).map(edge =>
    edge.map(index => vertices[index])
  );
  return { vertices, faces, edges, cells };
}
