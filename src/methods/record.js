import * as THREE from 'three';
import YAML from 'js-yaml';
import CCapture from 'ccapture.js/build/CCapture.min.js';
import WebMWriter from 'webm-writer';
import * as helperFunc from '../helperFunc.js';

export async function startRecord() {
  try {
    this.recordConfig = await helperFunc.parseYamlFileFromInput(
      this.configFileInput
    );
    helperFunc.validateRecordConfig(this.recordConfig, this.is4D);
  } catch (e) {
    this.triggerErrorDialog(e.message);
    console.error(e);
    return;
  }

  this.recordConfig.actions.forEach((action, idx, actions) => {
    if (
      Object.hasOwnProperty.call(action, 'start') &&
      Object.hasOwnProperty.call(action, 'end')
    )
      actions[idx].interps = (
        action.interp === 'sin'
          ? helperFunc.sineInterpolation
          : helperFunc.linearInterpolation
      )(action.end - action.start + 1);
  });

  this.isRecordingFlag = true;
  this.updateEnable(false);
  this.recordStates = {
    rots: {
      Infinity: this.recordConfig.initialRot
        ? helperFunc.create4DRotationMat(...this.recordConfig.initialRot)
        : this.rotUni.value
    },
    ofs: this.recordConfig.initialOfs
      ? new THREE.Vector4(...this.recordConfig.initialOfs)
      : this.ofsUni.value,
    ofs3: this.recordConfig.initialOfs3
      ? new THREE.Vector3(...this.recordConfig.initialOfs3)
      : this.ofs3Uni.value,
    verticesEdgesDim:
      this.recordConfig.initialVerticesEdgesDim ??
      this.cylinderRadiusUni.value * this.scaleFactor,
    projDist: this.recordConfig.initialProjDist ?? this.projDistUni.value,
    faceOpacity:
      this.recordConfig.initialFaceOpacity ??
      +this.faceOpacitySlider.noUiSlider.get(true),
    visibilities: this.recordConfig.initialVisibilities ?? {
      faces: this.faceVisibleSwitcher.checked,
      wireframe: this.wireframeVisibleSwitcher.checked,
      vertices: this.verticesVisibleSwitcher.checked,
      axes: this.axisVisibleSwitcher.checked
    },
    cameraIsPersp: this.recordConfig.initialCameraProjMethod
      ? this.recordConfig.initialCameraProjMethod === 'persp'
      : this.perspSwitcher.checked,
    schleProjEnable:
      this.recordConfig.initialSchleProjEnable ?? !this.isOrthoUni.value,
    highlightConfig:
      this.recordConfig.initialHighlightConfig ??
      YAML.load(this.editor.state.doc.toString()),
    highlightFacesConfig:
      this.recordConfig.initialHighlightFacesConfig ??
      YAML.load(this.editor.state.doc.toString())
  };

  const totalFrames =
    Math.max(
      ...this.recordConfig.actions.map((i, index) => {
        i.index = index;
        return i.end ?? i.at ?? -1;
      })
    ) + (this.recordConfig.endExtraFrames ?? 30);
  this.rotAngles = [0, 0, 0, 0, 0, 0];
  this.rotUni.value = new THREE.Matrix4();
  this.stopRenderLoop();
  this.controls.dispose();

  this.capturer = new CCapture({
    format: 'webm',
    framerate: 30,
    name: 'Animation',
    verbose: true
  });
  this.capturer.start();

  let frameIndex = 0;

  /**
   * 渲染终止后的动作。
   * @param {boolean} byError - 是否因错误终止，为 true 时不保存视频。
   */
  const _onStopRender = (byError = false) => {
    this.capturer.stop();
    if (!byError) this.capturer.save();
    this.capturer = null;
    this.isRecordingFlag = false;

    this.updateProperties();
    this.updateProjectionDistance();
    this.updateRotation();
    this.highlightCells(YAML.load(this.editor.state.doc.toString()));

    this._initializeControls();
    this.startRenderLoop();

    this.updateEnable();
  };

  /**
   * （视频）渲染循环。
   */
  const _renderLoop = () => {
    if (frameIndex >= totalFrames || this.stopRecordFlag) {
      _onStopRender();
      this.stopRecordFlag = false;
      return;
    }
    try {
      this.genFrame(frameIndex);
      this.capturer.capture(this.canvas);
    } catch (e) {
      this.triggerErrorDialog(e.message);
      _onStopRender(true);
      console.error(e);
      return;
    }

    frameIndex++;
    requestAnimationFrame(_renderLoop);
  };
  _renderLoop();
}

export function genFrame(frameIndex) {
  this.updateRecordStates(frameIndex);

  const {
    rots,
    ofs,
    ofs3,
    verticesEdgesDim,
    projDist,
    faceOpacity,
    visibilities,
    cameraIsPersp,
    schleProjEnable
  } = this.recordStates;
  const rot = helperFunc
    .getSortedValuesDesc(rots)
    .reduce((accumulator, currentMatrix) => {
      const product = new THREE.Matrix4();
      product.multiplyMatrices(accumulator, currentMatrix);
      return product;
    }, new THREE.Matrix4().identity());

  this.camera.position.set(0, 0, 120);
  this.camera.rotation.set(0, 0, 0);
  this.rotUni.value = rot;
  this.ofsUni.value = ofs;
  this.ofs3Uni.value = ofs3;
  this.sphereRadiusUni.value = (verticesEdgesDim * 2) / this.scaleFactor;
  this.cylinderRadiusUni.value = verticesEdgesDim / this.scaleFactor;
  this.projDistUni.value = projDist;
  this.isOrthoUni.value = !schleProjEnable;

  helperFunc.changeMaterialProperty(this.facesGroup, 'opacity', faceOpacity);
  helperFunc.changeMaterialProperty(
    this.facesGroup,
    'transparent',
    faceOpacity !== 1
  );

  /* eslint-disable */
  helperFunc.changeMaterialProperty(this.facesGroup, 'visible', visibilities.faces ?? true);
  helperFunc.changeMaterialProperty(this.wireframeGroup, 'visible', visibilities.wireframe ?? true);
  helperFunc.changeMaterialProperty(this.verticesGroup, 'visible', visibilities.vertices ?? true);
  helperFunc.changeMaterialProperty(this.axesGroup, 'visible', visibilities.axes ?? true);
  /* eslint-enable */

  this.toggleCamera(cameraIsPersp);
  this.highlightCells(this.recordStates.highlightConfig);
  this.highlightFaces(this.recordStates.highlightFacesConfig);

  this.render();
}

export function updateRecordStates(frameIndex) {
  const currrentActions = this.recordConfig.actions.filter(
    i => (i.start <= frameIndex && frameIndex <= i.end) || frameIndex === i.at
  );
  for (const action of currrentActions) {
    const prog = frameIndex - action.start;
    const interps = action.interps;
    switch (action.type) {
      case 'rot': {
        const rotAng = [0, 0, 0, 0, 0, 0];
        rotAng[action.plane] = action.angle * interps[prog];
        if (this.recordStates.rots[action.index]) {
          this.recordStates.rots[action.index].multiply(
            helperFunc.create4DRotationMat(...rotAng)
          );
        } else {
          this.recordStates.rots[action.index] =
            helperFunc.create4DRotationMat(...rotAng);
        }
        break;
      }
      case 'trans4':
        this.recordStates.ofs.add(
          new THREE.Vector4(...action.ofs).multiplyScalar(interps[prog])
        );
        break;
      case 'trans3':
        this.recordStates.ofs3.add(
          new THREE.Vector3(...action.ofs).multiplyScalar(interps[prog])
        );
        break;
      case 'setVerticesEdgesDim':
        this.recordStates.verticesEdgesDim += action.dimOfs * interps[prog];
        if (this.recordStates.verticesEdgesDim <= 0)
          throw new Error(
            `actions[${action.index}] 错误地导致边和顶点的尺寸为负数。`
          );
        break;
      case 'setProjDist':
        this.recordStates.projDist += action.projDistOfs * interps[prog];
        if (this.recordStates.projDist <= 0)
          throw new Error(
            `actions[${action.index}] 错误地导致投影距离为负数。`
          );
        break;
      case 'setFaceOpacity':
        this.recordStates.faceOpacity +=
          action.faceOpacityOfs * interps[prog];
        if (
          this.recordStates.faceOpacity < 0 ||
          this.recordStates.faceOpacity > 1
        )
          throw new Error(
            `actions[${action.index}] 错误地导致面透明度超出 0~1 的范围。`
          );
        break;
      case 'setVisibility':
        this.recordStates.visibilities[action.target] = action.visibility;
        break;
      case 'setCameraProjMethod':
        this.recordStates.cameraIsPersp = action.projMethod === 'persp';
        break;
      case 'setSchleProjEnable':
        this.recordStates.schleProjEnable = action.enable;
        break;
      case 'highlightCells':
        this.recordStates.visibilities.faces = !(action.hideFaces ?? true);
        this.recordStates.highlightConfig = action.highlightConfig;
        break;
      case 'highlightFaces':
        this.recordStates.visibilities.faces = !(action.hideFaces ?? true);
        this.recordStates.highlightFacesConfig = action.highlightConfig;
        break;
    }
  }
}