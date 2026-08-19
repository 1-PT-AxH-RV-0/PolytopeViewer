import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { PMREMGenerator } from 'three';
import noUiSlider from 'nouislider';
import { EditorView, basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { linter } from '@codemirror/lint';
import YAML from 'js-yaml';
import env from '../../assets/env.exr';
import * as types from '../type.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

/**
 * 生成 noUiSlider 对数刻度 range 对象，支持负数范围（包含零）。
 * @param {number} min - 最小值。
 * @param {number} max - 最大值 (必须大于 min)。
 * @param {number} base - 指数底数，控制曲率，必须 >1 (默认 Math.E)。
 * @param {number} segments - 中间分段数，即内部点的个数 (默认 32)。
 * @returns {object} noUiSlider 的 range 配置对象。
 */
function generateLogarithmicRange(min, max, base = Math.E, segments = 32) {
  if (max <= min) {
    throw new Error('最大值必须大于最小值。');
  }
  if (segments <= 0) {
    throw new Error('分段数必须大于零。');
  }
  if (base <= 1) {
    throw new Error('底数必须大于 1。');
  }

  const isCrossZero = min < 0 && max > 0;
  const range = { min, max };

  const totalPoints = segments + 2;
  const percentages = [];
  for (let i = 0; i < totalPoints; i++) {
    percentages.push((i / (totalPoints - 1)) * 100);
  }

  /**
   * 生成某个百分百对应的值（对数刻度）
   * @param {number} p 百分比
   * @returns {number} 对应的对数值
   */
  function valueFromPercent(p) {
    const t = p / 100;
    if (isCrossZero) {
      const M = (max - min) / 2;
      const mid = (min + max) / 2;
      if (t <= 0.5) {
        const u = 1 - 2 * t;
        const v = (-M * (Math.pow(base, u) - 1)) / (base - 1);
        return v + mid;
      } else {
        const u = 2 * t - 1;
        const v = (M * (Math.pow(base, u) - 1)) / (base - 1);
        return v + mid;
      }
    } else {
      const L = max - min;
      const v = (L * (Math.pow(base, t) - 1)) / (base - 1);
      return min + v;
    }
  }

  for (let i = 1; i < percentages.length - 1; i++) {
    const p = percentages[i];
    const val = valueFromPercent(p);
    const key = p.toFixed(15) + '%';
    range[key] = val;
  }

  return range;
}

/**
 * 初始化 DOM 元素引用。
 * 将页面上的各个 UI 元素绑定到实例属性上。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeDomElements() {
  /* eslint-disable */
  this.canvas = document.getElementById('polytopeRenderer');
  this.faceVisibleSwitcher = document.getElementById('faceVisibleSwitcher');
  this.wireframeVisibleSwitcher = document.getElementById('wireframeVisibleSwitcher');
  this.verticesVisibleSwitcher = document.getElementById('verticesVisibleSwitcher');
  this.axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher');
  this.perspSwitcher = document.getElementById('perspSwitcher');
  this.schleSwitcher = document.getElementById('schleSwitcher');
  this.scaleFactorSlider = document.getElementById('scaleFactorSlider');
  this.faceOpacitySlider = document.getElementById('faceOpacitySlider');
  this.wireframeAndVerticesDimSlider = document.getElementById('wireframeAndVerticesDimSlider');
  this.projectionDistanceSlider = document.getElementById('projectionDistanceSlider');
  this.separationDistSlider = document.getElementById('separationDistSlider');
  this.faceScaleSlider = document.getElementById('faceScaleSlider');
  this.edgeScaleSlider = document.getElementById('edgeScaleSlider');
  this.fileInput = document.getElementById('fileInput');
  this.uploadOffBtn = document.getElementById('uploadOff');
  this.infoDis = document.getElementById('info');
  this.progCon = document.getElementById('progContainer');
  this.progDis = document.getElementById('prog');
  this.startRecordBtn = document.getElementById('startRecord');
  this.stopRecordBtn = document.getElementById('stopRecord');
  this.configFileInput = document.getElementById('configFileInput');
  this.highlightCellsBtn = document.getElementById('highlightCells');
  this.highlightFacesBtn = document.getElementById('highlightFaces');

  this.errorModal = document.getElementById('errorModal');
  this.errorMsg = document.getElementById('errorMsg');

  this.offSeleEle = document.getElementById('offSele');
  this.polyhedraSeleEle = document.getElementById('polyhedra');
  this.polychoraSeleEle = document.getElementById('polychora');

  this.genPrismBtn = document.getElementById('genPrism');
  this.prismNInput = document.getElementById('prismN');

  this.genAntiprismBtn = document.getElementById('genAntiprism');
  this.antiprismNInput = document.getElementById('antiprismN');

  this.genTrapezohedronBtn = document.getElementById('genTrapezohedron');
  this.trapezohedronNInput = document.getElementById('trapezohedronN');

  this.genStephanoidBtn = document.getElementById('genStephanoid');
  this.stephanoidNInput = document.getElementById('stephanoidN');
  this.stephanoidAInput = document.getElementById('stephanoidA');
  this.stephanoidBInput = document.getElementById('stephanoidB');

  this.genCupolaBtn = document.getElementById('genCupola');
  this.cupolaNInput = document.getElementById('cupolaN');

  this.genRotundaBtn = document.getElementById('genRotunda');
  this.rotundaNInput = document.getElementById('rotundaN');
  this.rotundaRInput = document.getElementById('rotundaR');
  this.rotundaHInput = document.getElementById('rotundaH');

  this.genDuoprismBtn = document.getElementById('genDuoprism');
  this.duoprismMInput = document.getElementById('duoprismM');
  this.duoprismNInput = document.getElementById('duoprismN');

  this.genDuoantiprismBtn = document.getElementById('genDuoantiprism');
  this.duoantiprismMInput = document.getElementById('duoantiprismM');
  this.duoantiprismNInput = document.getElementById('duoantiprismN');

  this.genDuotegumBtn = document.getElementById('genDuotegum');
  this.duotegumMInput = document.getElementById('duotegumM');
  this.duotegumNInput = document.getElementById('duotegumN');

  this.genPqDigonalDisphenoidBtn = document.getElementById('genPqDigonalDisphenoid');
  this.pqDigonalDisphenoidPQInput = document.getElementById('pqDigonalDisphenoidPQ');
  /* eslint-enable */

  this.rotationSliders = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'].map(i =>
    document.getElementById(`rot${i}Slider`)
  );
}

/**
 * 初始化所有滑块控件。
 * 包括缩放、透明度、尺寸、投影距离、分离距离、面缩放和旋转滑块。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeSliders() {
  noUiSlider.create(this.scaleFactorSlider, {
    range: generateLogarithmicRange(0.1, 120, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.faceOpacitySlider, {
    range: { min: 0.1, max: 1.0 },
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.wireframeAndVerticesDimSlider, {
    range: generateLogarithmicRange(0.01, 3, 10),
    start: 0.5,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.projectionDistanceSlider, {
    range: generateLogarithmicRange(0.01, 100, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.separationDistSlider, {
    range: { min: -100, max: 100 },
    start: 0,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.faceScaleSlider, {
    range: generateLogarithmicRange(-20, 20, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.edgeScaleSlider, {
    range: generateLogarithmicRange(1, 20, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  this.rotationSliders.forEach(slider => {
    noUiSlider.create(slider, {
      range: { min: 0, max: 360 },
      start: 0,
      tooltips: {
        to: function (numericValue) {
          return numericValue.toFixed(2) + '°';
        }
      },
      connect: [true, false]
    });
  });
}

/**
 * 初始化相机。
 * 创建透视相机并设置初始位置。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeCameras() {
  this.camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
  this.camera.position.set(0, 0, 120);
}

/**
 * 初始化 Three.js 场景。
 * 创建场景对象并设置背景颜色。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeScene() {
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(0x111111);
}

/**
 * 初始化 WebGL 渲染器。
 * 设置渲染器大小、设备像素比，并添加窗口大小变化事件监听器。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeRenderer() {
  const dpr = window.devicePixelRatio || 1;

  this.renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    canvas: this.canvas
  });

  const maxSize = Math.min(
    Math.min(window.innerWidth, window.innerHeight),
    720
  );
  this.canvas.style.width = `${maxSize}px`;
  this.canvas.style.height = `${maxSize}px`;
  this.progCon.style.left = `${maxSize / 2 + 8}px`;
  this.progCon.style.top = `${maxSize / 2 + 8}px`;
  if (this.nanobar) this.nanobar.style.width = `${maxSize * 0.7}px`;

  this.renderer.setSize(maxSize * dpr, maxSize * dpr, false);
  this.composer = new EffectComposer(this.renderer);
  this.renderPass = new RenderPass(this.scene, this.camera);
  this.ssaaPass = new SSAARenderPass(this.scene, this.camera);
  this.bloomPass = new UnrealBloomPass(
    new THREE.Vector2(maxSize * dpr, maxSize * dpr),
    0.3,
    0.1,
    0.98
  );
  this.composer.addPass(this.renderPass);
  this.composer.addPass(this.bloomPass);

  window.addEventListener('resize', () => {
    const newMaxSize = Math.min(
      Math.min(window.innerWidth, window.innerHeight),
      720
    );

    this.canvas.style.width = `${newMaxSize}px`;
    this.canvas.style.height = `${newMaxSize}px`;
    this.progCon.style.left = `${newMaxSize / 2 + 8}px`;
    this.progCon.style.top = `${newMaxSize / 2 + 8}px`;
    if (this.nanobar) this.nanobar.style.width = `${newMaxSize * 0.7}px`;

    this.renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
    this.composer.setSize(newMaxSize * dpr, newMaxSize * dpr);
    this.ssaaPass.setSize(newMaxSize * dpr, newMaxSize * dpr);
    this.bloomPass.setSize(newMaxSize * dpr, newMaxSize * dpr);
  });
}

/**
 * 初始化环境贴图。
 * 加载 HDR 环境贴图用于材质反射。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeEnv() {
  const loader = new EXRLoader();
  const pmremGenerator = new PMREMGenerator(this.renderer);
  pmremGenerator.compileEquirectangularShader();

  loader.load(env, texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    this.scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
  });
}

/**
 * 初始化轨道控制器。
 * 配置阻尼效果、缩放范围等参数。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeControls() {
  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.8;
  this.controls.enablePan = false;
  this.controls.minDistance = 1.0;
  this.controls.maxDistance = 150.0;
  this.controls.minZoom = 0.7;
  this.controls.maxZoom = 175.0;
}

/**
 * 初始化代码编辑器。
 * 创建用于编辑 YAML 高亮配置的 CodeMirror 编辑器实例。
 * @this {types.PolytopeRendererApp}
 */
export function _initializeEditor() {
  this.editor = new EditorView({
    doc: '3F7DBDFF: all',
    extensions: [
      basicSetup,
      yaml(),
      linter(view => {
        try {
          YAML.load(view.state.doc.toString());
        } catch (e) {
          return [
            {
              from: e.mark.position - 1,
              message: e.reason,
              severity: 'error',
              to: e.mark.position - 1
            }
          ];
        }
        return [];
      })
    ],
    parent: document.querySelector('#editor')
  });
}
