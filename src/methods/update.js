import * as THREE from 'three';
import * as helperFunc from '../helperFunc.js';

/**
 * 更新所有属性到当前 UI 状态。
 * 同步可见性、透明度、相机模式、尺寸等属性。
 * @this {PolytopeRendererApp}
 */
export function updateProperties() {
  helperFunc.changeMaterialProperty(
    this.facesGroup,
    'visible',
    this.faceVisibleSwitcher.checked
  );
  this.updateWireframeAndVerticesVisibilities();
  helperFunc.changeMaterialProperty(
    this.axesGroup,
    'visible',
    this.axisVisibleSwitcher.checked
  );
  helperFunc.changeMaterialProperty(
    this.facesGroup,
    'opacity',
    +this.faceOpacitySlider.noUiSlider.get(true)
  );
  helperFunc.changeMaterialProperty(
    this.facesGroup,
    'transparent',
    +this.faceOpacitySlider.noUiSlider.get(true) !== 1
  );
  this.toggleCamera(this.perspSwitcher.checked);

  this.cylinderRadiusUni.value =
    this.wireframeAndVerticesDimSlider.noUiSlider.get(true) / this.scaleFactor;
  this.sphereRadiusUni.value =
    (this.wireframeAndVerticesDimSlider.noUiSlider.get(true) /
      this.scaleFactor) *
    this.sphereRadiusRatio;
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) / this.scaleFactor;
  this.faceScaleUni.value = this.faceScaleSlider.noUiSlider.get(true);
  this.isOrthoUni.value = !this.schleSwitcher.checked;
  this.ofsUni.value = new THREE.Vector4(0, 0, 0, 0);
  this.ofs3Uni.value = new THREE.Vector3();

  this.requestSingleRender();
}

/**
 * 更新投影距离。
 * 从滑块读取新值并更新 uniform。
 * @this {PolytopeRendererApp}
 */
export function updateProjectionDistance() {
  this.projDistUni.value = this.projectionDistanceSlider.noUiSlider.get(true);
  this.requestSingleRender();
}

/**
 * 更新线框和顶点的可见性。
 * 根据分离距离和面缩放设置决定显示原始或分离版本。
 * @this {PolytopeRendererApp}
 */
export function updateWireframeAndVerticesVisibilities() {
  helperFunc.changeMaterialProperty(
    this.wireframeGroup,
    'visible',
    this.wireframeVisibleSwitcher.checked &&
      (this.is4D ||
        (this.separationDistSlider.noUiSlider.get(true) === 0 &&
          this.faceScaleSlider.noUiSlider.get(true) === 1))
  );
  helperFunc.changeMaterialProperty(
    this.verticesGroup,
    'visible',
    this.verticesVisibleSwitcher.checked &&
      (this.is4D ||
        (this.separationDistSlider.noUiSlider.get(true) === 0 &&
          this.faceScaleSlider.noUiSlider.get(true) === 1))
  );
  helperFunc.changeMaterialProperty(
    this.separatedWireframeGroup,
    'visible',
    !this.is4D &&
      this.wireframeVisibleSwitcher.checked &&
      (this.separationDistSlider.noUiSlider.get(true) !== 0 ||
        this.faceScaleSlider.noUiSlider.get(true) !== 1)
  );
  helperFunc.changeMaterialProperty(
    this.separatedVerticesGroup,
    'visible',
    !this.is4D &&
      this.verticesVisibleSwitcher.checked &&
      (this.separationDistSlider.noUiSlider.get(true) !== 0 ||
        this.faceScaleSlider.noUiSlider.get(true) !== 1)
  );

  this.requestSingleRender();
}

/**
 * 更新分离距离。
 * 从滑块读取新值并更新 uniform，同时更新线框和顶点可见性。
 * @this {PolytopeRendererApp}
 */
export function updateSeparationDist() {
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) / this.scaleFactor;
  this.updateWireframeAndVerticesVisibilities();
}

/**
 * 更新面缩放。
 * 从滑块读取新值并更新 uniform，同时更新线框和顶点可见性。
 * @this {PolytopeRendererApp}
 */
export function updateFaceScale() {
  this.faceScaleUni.value = this.faceScaleSlider.noUiSlider.get(true);
  this.updateWireframeAndVerticesVisibilities();
}

/**
 * 更新旋转矩阵。
 * 从六个旋转滑块读取角度并计算四维旋转矩阵。
 * @this {PolytopeRendererApp}
 */
export function updateRotation() {
  const rotations = this.rotationSliders.map(i => i.noUiSlider.get(true));
  this.rotAngles = rotations;
  this.rotUni.value = helperFunc.create4DRotationMat(...this.rotAngles);
  this.requestSingleRender();
}

/**
 * 更新缩放因子。
 * 设置模型的整体缩放，并同步更新相关的 uniform 值。
 * @this {PolytopeRendererApp}
 * @param {number} scaleFactor - 新的缩放因子。
 * @param {boolean} [updateSlider] - 是否同步更新滑块显示。
 */
export function updateScaleFactor(scaleFactor, updateSlider = true) {
  this.scaleFactor = scaleFactor;
  if (updateSlider) this.scaleFactorSlider.noUiSlider.set(scaleFactor);
  if (this.solidGroup) this.solidGroup.scale.setScalar(scaleFactor);
  this.axesOffsetScaleUni.value = scaleFactor;
  this.cylinderRadiusUni.value =
    this.wireframeAndVerticesDimSlider.noUiSlider.get(true) / this.scaleFactor;
  this.sphereRadiusUni.value =
    (this.wireframeAndVerticesDimSlider.noUiSlider.get(true) /
      this.scaleFactor) *
    this.sphereRadiusRatio;
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) / this.scaleFactor;
  this.requestSingleRender();
}

/**
 * 更新 UI 元素的启用/禁用状态。
 * 根据当前模式（3D/4D）和录制状态控制各控件的可用性。
 * @this {PolytopeRendererApp}
 * @param {boolean} [enable] - 是否启用 UI 元素。
 */
export function updateEnable(enable = true) {
  /**
   * 禁用或启用页面上所有的 UI 元素。
   * @param {boolean} enable - true 表示启用，false 表示禁用。
   */
  const _toggleUIs = enable => {
    const elements = document.querySelectorAll(
      'input, .btn-group button:not([data-bs-toggle="tooltip"]), div[id$="Slider"], a[data-path]'
    );

    elements.forEach(element => {
      if (element.tagName === 'DIV') {
        element.noUiSlider[enable ? 'enable' : 'disable']();
      } else if (element.tagName === 'A') {
        element.classList.toggle('disabled', !enable);
      } else if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
        element.disabled = !enable;
      }
    });
  };

  _toggleUIs(enable);
  this.stopRecordBtn.disabled = !this.isRecordingFlag;
  if (!enable) return;
  if (!this.schleSwitcher.disabled && !this.is4D) {
    this.rotationSliders[2].noUiSlider.set(0);
    this.rotationSliders[4].noUiSlider.set(0);
    this.rotationSliders[5].noUiSlider.set(0);
    this.updateRotation();
  }
  const enableStringBy4D = this.is4D ? 'enable' : 'disable';
  const enableStringBy3D = !this.is4D ? 'enable' : 'disable';
  this.projectionDistanceSlider.noUiSlider[enableStringBy4D]();
  this.schleSwitcher.disabled = !this.is4D;
  this.highlightFacesBtn.disabled = this.is4D;
  this.highlightCellsBtn.disabled = !this.is4D;
  this.rotationSliders[2].noUiSlider[enableStringBy4D]();
  this.rotationSliders[4].noUiSlider[enableStringBy4D]();
  this.rotationSliders[5].noUiSlider[enableStringBy4D]();
  this.separationDistSlider.noUiSlider[enableStringBy3D]();
  this.faceScaleSlider.noUiSlider[enableStringBy3D]();

  this.startRecordBtn.disabled = this.isRecordingFlag;
}

/**
 * 切换相机投影模式。
 * 在透视投影和正交投影之间切换。
 * @this {PolytopeRendererApp}
 * @param {boolean} isPersp - true 为透视投影，false 为正交投影。
 */
export function toggleCamera(isPersp) {
  const oldCamera = this.camera.clone();

  if (isPersp) {
    this.camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
  } else {
    this.camera = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.01, 500);
  }

  this.camera.position.copy(oldCamera.position);
  this.camera.rotation.copy(oldCamera.rotation);
  this._initializeControls();
  this.requestSingleRender();
}
