import * as THREE from 'three';

export function render() {
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}

export function renderLoop() {
  if (!this.isRenderingFlag) return;
  this.render();
  requestAnimationFrame(this.renderLoop.bind(this));
}

export function startRenderLoop() {
  if (this.isRenderingFlag) return;
  this.isRenderingFlag = true;
  this.renderLoop();
}

export function stopRenderLoop() {
  if (!this.isRenderingFlag) return;
  this.isRenderingFlag = false;
}
