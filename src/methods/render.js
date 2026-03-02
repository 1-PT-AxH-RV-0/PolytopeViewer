import * as THREE from 'three';

export function render() {
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}

/**
 * 内部循环函数，由 _startLoop 启动。
 * 如果 isRenderingFlag 为 true 则持续渲染，否则停止请求新帧。
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
 * 启动循环（如果尚未启动）
 */
export function _startLoop() {
  if (!this.renderRequested) {
    this.renderRequested = true;
    requestAnimationFrame(this._renderLoop.bind(this));
  }
}

/**
 * 开启持续渲染模式
 */
export function startRenderLoop() {
  if (this.isRenderingFlag) return;
  this.isRenderingFlag = true;
  this._startLoop();
}

/**
 * 关闭持续渲染模式
 */
export function stopRenderLoop() {
  this.isRenderingFlag = false;
}

/**
 * 请求单次渲染（仅在非持续模式下执行）
 */
export function requestSingleRender() {
  if (!this.isRenderingFlag) {
    this.render();
  }
}