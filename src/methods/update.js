import * as THREE from 'three';
import * as helperFunc from '../helperFunc.js';

export function updateProperties() {
  helperFunc.changeMaterialProperty(
    this.facesGroup,
    'visible',
    this.faceVisibleSwitcher.checked
  );
  this.updateWireframeAndVerticesVisibilities()
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
    this.wireframeAndVerticesDimSlider.noUiSlider.get(true) / this.scaleFactor *
    this.sphereRadiusRatio;
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) / this.scaleFactor;
  this.faceScaleUni.value =
    this.faceScaleSlider.noUiSlider.get(true);
  this.isOrthoUni.value = !this.schleSwitcher.checked;
  this.ofsUni.value = new THREE.Vector4(0, 0, 0, 0);
  this.ofs3Uni.value = new THREE.Vector3();
  
  this.requestSingleRender();
}

export function updateProjectionDistance() {
  this.projDistUni.value = this.projectionDistanceSlider.noUiSlider.get(true);
  this.requestSingleRender();
}

export function updateWireframeAndVerticesVisibilities() {
  helperFunc.changeMaterialProperty(
    this.wireframeGroup,
    'visible',
     this.wireframeVisibleSwitcher.checked && (this.is4D || (this.separationDistSlider.noUiSlider.get(true) === 0 && this.faceScaleSlider.noUiSlider.get(true) === 1))
  )
  helperFunc.changeMaterialProperty(
    this.verticesGroup,
    'visible',
    this.verticesVisibleSwitcher.checked && (this.is4D || (this.separationDistSlider.noUiSlider.get(true) === 0 && this.faceScaleSlider.noUiSlider.get(true) === 1))
  )
  helperFunc.changeMaterialProperty(
    this.separatedWireframeGroup,
    'visible',
    !this.is4D && this.wireframeVisibleSwitcher.checked && (this.separationDistSlider.noUiSlider.get(true) !== 0 || this.faceScaleSlider.noUiSlider.get(true) !== 1)
  )
  helperFunc.changeMaterialProperty(
    this.separatedVerticesGroup,
    'visible',
    !this.is4D && this.verticesVisibleSwitcher.checked && (this.separationDistSlider.noUiSlider.get(true) !== 0 || this.faceScaleSlider.noUiSlider.get(true) !== 1)
  )
  
  this.requestSingleRender();
}

export function updateSeparationDist() {
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) /
    this.scaleFactor;
  this.updateWireframeAndVerticesVisibilities()
}

export function updateFaceScale() {
  this.faceScaleUni.value =
    this.faceScaleSlider.noUiSlider.get(true);
  this.updateWireframeAndVerticesVisibilities()
}

export function updateRotation() {
  const rotations = this.rotationSliders.map(i => i.noUiSlider.get(true));
  this.rotAngles = rotations;
  this.rotUni.value = helperFunc.create4DRotationMat(...this.rotAngles);
  this.requestSingleRender();
}

export function updateScaleFactor(scaleFactor, updateSlider = true) {
  this.scaleFactor = scaleFactor;
  if (updateSlider) this.scaleFactorSlider.noUiSlider.set(scaleFactor);
  if (this.solidGroup) this.solidGroup.scale.setScalar(scaleFactor);
  this.axesOffsetScaleUni.value = scaleFactor;
  this.cylinderRadiusUni.value =
    this.wireframeAndVerticesDimSlider.noUiSlider.get(true) / this.scaleFactor;
  this.sphereRadiusUni.value =
    this.wireframeAndVerticesDimSlider.noUiSlider.get(true) / this.scaleFactor *
    this.sphereRadiusRatio;
  this.separationDistUni.value =
    this.separationDistSlider.noUiSlider.get(true) / this.scaleFactor;
  this.requestSingleRender();
}

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
      } else if (
        element.tagName === 'INPUT' ||
        element.tagName === 'BUTTON'
      ) {
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
