import * as type from '@/type.js';

/**
 * 生成从 start 到 stop 的连续整数数组。
 * @param {number} start - 起始值（包含）。
 * @param {number} stop - 结束值（包含）。
 * @returns {Array<number>} 生成的整数数组。
 */
export function range(start, stop) {
  const length = Math.max(stop - start + 1, 0);
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * 从面数组中提取唯一且排序过的边对。
 * @param {Array<Array<number>>} arrays - 面的索引数组。
 * @returns {Array<type.Edge3D>} 唯一且排序过的边对数组。
 */
export function getUniqueSortedPairs(arrays) {
  const pairs = arrays.flatMap(arr =>
    arr.map((v, i) => [
      Math.min(v, arr[(i + 1) % arr.length]),
      Math.max(v, arr[(i + 1) % arr.length])
    ])
  );
  return [...new Set(pairs.map(JSON.stringify))].map(JSON.parse);
}

/**
 * 按键的数值大小对对象进行排序，并返回排序后的值数组。
 * @param {object} obj - 要排序的对象。
 * @returns {Array} 排序后的值数组（按 key 从大到小）。
 */
export function getSortedValuesDesc(obj) {
  return Object.entries(obj)
    .sort(([keyA], [keyB]) => +keyB - +keyA)
    .map(([, value]) => value);
}

/**
 * 从源数组中原地移除排除数组中包含的元素。
 * @param {Array} sourceArray - 将被修改的源数组。
 * @param {Array} excludeArray - 包含需要移除元素的数组。
 * @returns {Array} 返回修改后的源数组（移除了排除元素的数组）。
 */
export function filterArray(sourceArray, excludeArray) {
  const excludeSet = new Set(excludeArray);
  for (let i = sourceArray.length - 1; i >= 0; i--) {
    if (excludeSet.has(sourceArray[i])) {
      sourceArray.splice(i, 1);
    }
  }
  return sourceArray;
}

/**
 * 将十六进制颜色字符串转换为 RGB 和 Alpha 分量。
 * @param {string} color - 十六进制颜色字符串（如 'FF0000FF'）。
 * @returns {{rgb: number, a: number}} 包含 RGB 值和 Alpha 值（0-1）的对象。
 */
export function colorStrToInt(color) {
  const colorNum = parseInt(color, 16);
  const rgb = colorNum >>> 8;
  const a = (colorNum & 0xff) / 255;

  return { rgb, a };
}
