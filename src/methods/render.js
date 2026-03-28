import * as types from '../type.js';

/**
 * 执行单次渲染。
 * 更新控制器并渲染场景。
 * @this {types.PolytopeRendererApp}
 */
export function render() {
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}

/**
 * 内部渲染循环函数。
 * 如果 isRenderingFlag 为 true 则持续渲染，否则停止请求新帧。
 * @this {types.PolytopeRendererApp}
 */
export function _renderLoop() {
  if (this.isRenderingFlag) {
    this.render();
    requestAnimationFrame(this._renderLoop.bind(this));
  } else {
    this.renderRequested = false;
  }
}

/**
 * 启动渲染循环（如果尚未启动）。
 * @this {types.PolytopeRendererApp}
 */
export function _startLoop() {
  if (!this.renderRequested) {
    this.renderRequested = true;
    requestAnimationFrame(this._renderLoop.bind(this));
  }
}

/**
 * 开启持续渲染模式。
 * 用于需要连续更新的场景（如用户交互时）。
 * @this {types.PolytopeRendererApp}
 */
export function startRenderLoop() {
  if (this.isRenderingFlag) return;
  this.isRenderingFlag = true;
  this._startLoop();
}

/**
 * 关闭持续渲染模式。
 * @this {types.PolytopeRendererApp}
 */
export function stopRenderLoop() {
  this.isRenderingFlag = false;
}

/**
 * 请求单次渲染。
 * 仅在非持续渲染模式下执行渲染。
 * @this {types.PolytopeRendererApp}
 */
export function requestSingleRender() {
  if (!this.isRenderingFlag) {
    this.render();
  }
}
