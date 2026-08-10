/**
 * 将时间函数包装为插值函数生成器。
 * @param {Function} timingFn - 时间函数，接受 t (0-1) 返回进度值 (0-1)
 * @returns {Function} - 包装后的插值函数，接受 steps 返回差值数组
 */
export function createInterpolation(timingFn) {
  /**
   * 生成的插值函数。
   * @param {number} steps - 步数
   * @returns {Array<number>} - 相邻采样点的差值数组
   */
  return function interpolation(steps) {
    const result = [];

    for (let i = 0; i < steps; i++) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;

      const val1 = timingFn(t1);
      const val2 = timingFn(t2);

      result.push(val2 - val1);
    }

    return result;
  };
}
