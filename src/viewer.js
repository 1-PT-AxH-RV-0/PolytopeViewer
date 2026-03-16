// 导入样式。
import './style.scss';
import 'nouislider/dist/nouislider.css';
// 导入全局库
import * as THREE from 'three';
// eslint-disable-next-line no-unused-vars
import { Button, Tab, Tooltip, Modal } from 'bootstrap';
import WebMWriter from 'webm-writer';
// 导入辅助模块
import createAxes from './axesCreater.js';
import * as helperFunc from './helperFunc.js';

// 导入拆分的各个方法模块
import * as initMethods from './methods/init.js';
import * as renderMethods from './methods/render.js';
import * as loadMethods from './methods/load.js';
import * as geometryMethods from './methods/geometry.js';
import * as highlightMethods from './methods/highlight.js';
import * as updateMethods from './methods/update.js';
import * as eventsMethods from './methods/events.js';
import * as recordMethods from './methods/record.js';
import * as errorMethods from './methods/error.js';

window.WebMWriter = WebMWriter;
window.download = function (data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

/**
 * PolytopeRendererApp 类用于管理 THREE.js 场景、模型加载、用户交互和渲染循环。
 * 它将应用程序的所有状态和逻辑封装在一个单一的实例中。
 */
class PolytopeRendererApp {
  constructor() {
    // 控制页元素。
    this.canvas = null;
    this.faceVisibleSwitcher = null;
    this.wireframeVisibleSwitcher = null;
    this.verticesVisibleSwitcher = null;
    this.axisVisibleSwitcher = null;
    this.perspSwitcher = null;
    this.schleSwitcher = null;
    this.scaleFactorSlider = null;
    this.faceOpacitySlider = null;
    this.wireframeAndVerticesDimSlider = null;
    this.projectionDistanceSlider = null;
    this.separationDistSlider = null;
    this.faceScaleSlider = null;
    this.fileInput = null;
    this.uploadOffBtn = null;
    this.infoDis = null;
    this.progCon = null;
    this.progDis = null;
    this.nanobar = null;
    this.startRecordBtn = null;
    this.stopRecordBtn = null;
    this.configFileInput = null;
    this.highlightCellsBtn = null;
    this.highlightFacesBtn = null;
    this.rotationSliders = [];

    this.errorModal = null;
    this.errorMsg = null;

    // OFF 选择页元素。
    this.offSeleEle = null;
    this.polyhedraSeleEle = null;
    this.polychoraSeleEle = null;

    this.genPrismBtn = null;
    this.prismNInput = null;

    this.genAntiprismBtn = null;
    this.antiprismNInput = null;

    this.genTrapezohedronBtn = null;
    this.trapezohedronNInput = null;

    this.genStephanoidBtn = null;
    this.stephanoidNInput = null;
    this.stephanoidAInput = null;
    this.stephanoidBInput = null;

    this.genDuoprismBtn = null;
    this.duoprismMInput = null;
    this.duoprismNInput = null;

    // 物体组变量
    this.axesGroup = null;
    this.solidGroup = null;
    this.facesGroup = null;
    this.wireframeGroup = null;
    this.verticesGroup = null;
    this.separatedWireframeGroup = null;
    this.separatedVerticesGroup = null;

    // Uniform 对象。
    this.rotAngles = [0, 0, 0, 0, 0, 0];
    this.rotUni = { value: new THREE.Matrix4() };
    this.ofsUni = { value: new THREE.Vector4(0, 0, 0, 0) };
    this.ofs3Uni = { value: new THREE.Vector3() };
    this.axesOffsetScaleUni = { value: 1.0 };
    this.projDistUni = { value: 2.0 };
    this.isOrthoUni = { value: 0 };
    this.cylinderRadiusUni = { value: 0.5 };
    this.sphereRadiusUni = { value: 1.5 };
    this.separationDistUni = { value: 0 };
    this.faceScaleUni = { value: 1.0 };

    // 渲染用变量。
    this.renderer = null;
    this.isRenderingFlag = false;
    this.scene = null;
    this.camera = null;
    this.controls = null;

    // 录制变量。
    this.capturer = null;
    this.recordConfig = null;
    this.recordStates = null;
    this.isRecordingFlag = false;
    this.stopRecordFlag = false;

    // 高亮用变量。
    this.cells = [];
    this.faces = [];
    this.facesMap = {};
    this.nHedraInCells = {};
    this.ngonsInFaces = {};
    this.highlightedPartGroup = new THREE.Group();

    // 其他变量。
    this.loadMeshPromise = null;
    this.is4D = false;
    this.scaleFactor = 1;
    this.initialMaterial = new THREE.MeshStandardMaterial({
      color: 0x3f7dbd,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x000000,
      flatShading: true,
      side: THREE.DoubleSide,
      emissiveIntensity: 1
    });
    this.editor = null;
    this.errorModalBs = null;
    this.sphereRadiusRatio = 2.5; // 球与圆柱的半径比

    // 插值函数映射
    const timingFunctions = {
      // 线性
      linear: t => t,

      // 二次方
      quadraticEaseIn: t => t * t,
      quadraticEaseOut: t => t * (2 - t),
      quadraticEaseInOut: t =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(2 * (1 - t), 2) / 2,

      // 三次方
      cubicEaseIn: t => t * t * t,
      cubicEaseOut: t => 1 - Math.pow(1 - t, 3),
      cubicEaseInOut: t =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

      // 正弦
      sineEaseIn: t => 1 - Math.cos((t * Math.PI) / 2),
      sineEaseOut: t => Math.sin((t * Math.PI) / 2),
      sineEaseInOut: t => (1 - Math.cos(Math.PI * t)) / 2,

      // 指数
      expoEaseIn: t => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
      expoEaseOut: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
    };
    this.interpFuncMap = new Map(
      Object.entries(timingFunctions).map(([key, fn]) => [
        key,
        helperFunc.createInterpolation(fn)
      ])
    );

    // 渲染循环
    this.renderRequested = false; // 是否有活跃的 requestAnimationFrame
    this.interactionTimer = null; // 延迟停止渲染的定时器
    this.userInteracting = false; // 鼠标或触摸按下状态
    this.wheelTimer = null; // 滚轮停止检测定时器

    this.init();
  }

  /**
   * 动态导入 OFF。
   * @param {string} path - OFF 文件路径。
   * @returns {string} - 导入的 OFF 字符串。
   */
  async importOff(path) {
    try {
      const data = await import(`../assets/models/${path}`);
      return data.default;
    } catch (error) {
      console.error('OFF 加载失败：', error);
      return {};
    }
  }

  /**
   * 初始化应用程序，按顺序调用其他初始化方法。
   */
  async init() {
    this._initializeDomElements();
    this._initializeSliders();
    this._initializeRenderer();
    this._initializeScene();
    this._initializeEnv();
    this._initializeCameras();
    this._initializeControls();
    this._initializeEditor();

    // 为 OFF 列表的 a 元素加上类名。
    document.querySelectorAll('a[data-path]').forEach(a => {
      a.classList.add('list-group-item');
      a.classList.add('list-group-item-action');
    });
    // 实例化错误弹窗
    this.errorModalBs = new Modal(this.errorModal);

    this.axesGroup = await createAxes(
      this.scene,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.axesOffsetScaleUni
    );

    await this.loadMeshFromUrl(
      await this.importOff(
        'polyhedra/KeplerPoinsot/Small_stellated_dodecahedron.off'
      ),
      this.initialMaterial
    );

    /* await this.loadMeshFromData(
      infFamilies.stephanoid(5, 1, 3),
      this.initialMaterial
    ); */

    this.setupEventListeners();
    this._startLoop();
    this.requestSingleRender();
  }
}

// 将各个模块的方法混入到原型
Object.assign(
  PolytopeRendererApp.prototype,
  initMethods,
  renderMethods,
  loadMethods,
  geometryMethods,
  highlightMethods,
  updateMethods,
  eventsMethods,
  recordMethods,
  errorMethods
);

// 实例化应用
new PolytopeRendererApp();

// 初始化 Bootstrap Tooltip
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
[...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
