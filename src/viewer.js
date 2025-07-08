import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Nanobar from 'nanobar';
import CCapture from 'ccapture.js/build/CCapture.min.js';
import WebMWriter from 'webm-writer';

// 导入外部辅助函数和模块。
import createAxes from './axesCreater.js';
import shaderCompCallback from './shaderCompCallback.js';
import * as helperFunc from './helperFunc.js';
import { parseOFF } from './offProcessor.js';
import { parse4OFF } from './offProcessor4D.js';
import url from '../assets/models/Small_stellated_dodecahedron.off'; // 默认加载的模型 URL
import * as type from './type.js';

// 导入样式。
import './style.css';

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
    this.fileInput = null;
    this.uploadOffBtn = null;
    this.infoDis = null;
    this.progCon = null;
    this.progDis = null;
    this.nanobar = null;
    this.startRecordBtn = null;
    this.stopRecordBtn = null;
    this.configFileInput = null;

    this.rotationSliders = [];

    this.scaleFactor = 1;
    this.axesGroup = null;
    this.solidGroup = null;
    this.facesGroup = null;
    this.wireframeGroup = null;
    this.verticesGroup = null;
    this.is4D = false;

    this.rotAngles = [0, 0, 0, 0, 0, 0];
    this.rotUni = { value: new THREE.Matrix4() };
    this.ofsUni = { value: new THREE.Vector4(0, 0, 0, 0) };
    this.ofs3Uni = { value: new THREE.Vector3() };
    this.axesOffsetScaleUni = { value: 1.0 };
    this.projDistUni = { value: 2.0 };
    this.isOrthoUni = { value: 0 };
    this.cylinderRadiusUni = { value: 0.5 };
    this.sphereRadiusUni = { value: 1.0 };

    this.renderer = null;
    this.isRenderingFlag = false;
    this.scene = null;
    this.camera = null;
    this.controls = null;

    this.loadMeshPromise = null;
    this.capturer = null;
    this.recordConfig = null;
    this.recordStates = null;
    this.isRecordingFlag = false;
    this.stopRecordFlag = false;

    this.init();
  }

  /**
   * 初始化应用程序，按顺序调用其他初始化方法。
   */
  async init() {
    this._initializeDomElements();
    this._initializeRenderer();
    this._initializeScene();
    this._initializeCameras();
    this._initializeLights();
    this._initializeControls();

    this.axesGroup = await createAxes(
      this.scene,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.axesOffsetScaleUni
    );

    const initialMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      specular: 0x222222,
      shininess: 50,
      flatShading: true
    });

    await this.loadMeshFromUrl(url, initialMaterial);
    this.updateEnable();

    this.setupEventListeners();
    this.startRenderLoop();
  }

  /**
   * 获取所有必要的 DOM 元素并将其赋值给类属性。
   */
  _initializeDomElements() {
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
    this.fileInput = document.getElementById('fileInput');
    this.uploadOffBtn = document.getElementById('uploadOff');
    this.infoDis = document.getElementById('info');
    this.progCon = document.getElementById('progContainer');
    this.progDis = document.getElementById('prog');
    this.startRecordBtn = document.getElementById('startRecord');
    this.stopRecordBtn = document.getElementById('stopRecord');
    this.configFileInput = document.getElementById('configFileInput');
    /* eslint-enable */

    this.rotationSliders = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'].map(i =>
      document.getElementById(`rot${i}Slider`)
    );
  }

  /**
   * 初始化 WebGL 渲染器并设置其大小，同时监听窗口大小变化事件以调整渲染器。
   */
  _initializeRenderer() {
    const dpr = window.devicePixelRatio || 1;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      canvas: this.canvas
    });

    const maxSize = Math.min(
      Math.min(window.innerWidth, window.innerHeight),
      720
    );
    this.renderer.setSize(maxSize * dpr, maxSize * dpr, false);
    this.canvas.style.width = `${maxSize}px`;
    this.canvas.style.height = `${maxSize}px`;
    this.progCon.style.left = `${maxSize / 2 + 8}px`;
    this.progCon.style.top = `${maxSize / 2 + 8}px`;
    if (this.nanobar) this.nanobar.style.width = `${maxSize * 0.7}px`;

    window.addEventListener('resize', () => {
      const newMaxSize = Math.min(
        Math.min(window.innerWidth, window.innerHeight),
        720
      );
      this.renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
      this.canvas.style.width = `${newMaxSize}px`;
      this.canvas.style.height = `${newMaxSize}px`;
      this.progCon.style.left = `${newMaxSize / 2 + 8}px`;
      this.progCon.style.top = `${newMaxSize / 2 + 8}px`;
      if (this.nanobar) this.nanobar.style.width = `${newMaxSize * 0.7}px`;
    });
  }

  /**
   * 初始化 THREE.js 场景，设置背景颜色。
   */
  _initializeScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
  }

  /**
   * 初始化透视相机和正交相机，并设置它们的初始位置。
   */
  _initializeCameras() {
    this.camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
    this.camera.position.set(0, 0, 120);
  }

  /**
   * 向场景中添加方向光和环境光。
   */
  _initializeLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0.5, 0.6, 0.4).normalize();
    directionalLight.intensity = 7;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x222222);
    ambientLight.intensity = 100;
    this.scene.add(ambientLight);

    const backLight = new THREE.DirectionalLight(0xddddea, 0.9);
    backLight.intensity = 8;
    backLight.position.set(-0.5, -0.6, -0.4).normalize();
    backLight.castShadow = true;
    backLight.shadow.mapSize.width = 2048;
    backLight.shadow.mapSize.height = 2048;
    this.scene.add(backLight);
  }

  /**
   * 初始化 TrackballControls 控制器，用于用户交互。
   */
  _initializeControls() {
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
   * THREE.js 渲染函数。
   */
  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 渲染循环函数。
   */
  renderLoop() {
    if (!this.isRenderingFlag) return;
    this.render();
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  /**
   * 开始渲染循环。
   */
  startRenderLoop() {
    if (this.isRenderingFlag) return;
    this.isRenderingFlag = true;
    this.renderLoop();
  }

  /**
   * 停止渲染循环。
   */
  stopRenderLoop() {
    if (!this.isRenderingFlag) return;
    this.isRenderingFlag = false;
  }

  /**
   * 为 3D 模型创建线框（圆柱体）和顶点（球体）的可视化表示。
   * @param {Array<type.Edge3D>} edges - 边的数据，每个元素是一个包含起点和终点 THREE.Vector3 结构的对象数组。
   * @param {object} options - 配置选项。
   * @param {THREE.Material} [options.cylinderMaterial] - 用于圆柱体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {THREE.Material} [options.sphereMaterial] - 用于球体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {number} [options.cylinderColor] - 如果未提供 `cylinderMaterial`，圆柱体的十六进制颜色。
   * @param {number} [options.sphereColor] - 如果未提供 `sphereMaterial`，球体的十六进制颜色。
   * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含线框组和顶点组的对象。
   */
  createWireframeAndVertices(
    edges,
    {
      cylinderMaterial,
      sphereMaterial,
      cylinderColor = 0x777777,
      sphereColor = 0xffd700
    } = {}
  ) {
    let defaultCylinderMaterial =
      cylinderMaterial ||
      new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 0.9,
        roughness: 0.3
      });

    let defaultSphereMaterial =
      sphereMaterial ||
      new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.3
      });

    defaultCylinderMaterial = shaderCompCallback.cylinderMaterial3D(
      defaultCylinderMaterial,
      this.cylinderRadiusUni,
      this.rotUni,
      this.ofs3Uni
    );
    defaultSphereMaterial = shaderCompCallback.sphereMaterial3D(
      defaultSphereMaterial,
      this.sphereRadiusUni,
      this.rotUni,
      this.ofs3Uni
    );

    const cylinderGeometry = helperFunc.toBufferGeometry(
      new THREE.CylinderGeometry(1, 1, 1, 16)
    );
    const cylinderInstances = new THREE.InstancedMesh(
      cylinderGeometry,
      defaultCylinderMaterial,
      edges.length
    );
    const v1Arr = new Float32Array(edges.length * 3);
    const v2Arr = new Float32Array(edges.length * 3);

    const sphereGeometry = helperFunc.toBufferGeometry(
      new THREE.SphereGeometry(1, 16, 16)
    );
    const sphereInstances = new THREE.InstancedMesh(
      sphereGeometry,
      defaultSphereMaterial,
      edges.length * 2
    ); // 最多可能需要边数×2的顶点
    sphereInstances.count = 0; // 初始为0，后面会递增
    const posArr = [];

    const uniquePoints = new Set();
    edges.forEach(([start, end], index) => {
      const startKey = `${start.x},${start.y},${start.z}`;
      const endKey = `${end.x},${end.y},${end.z}`;

      const startVec = new THREE.Vector3(start.x, start.y, start.z);
      const endVec = new THREE.Vector3(end.x, end.y, end.z);
      v1Arr.set(startVec.toArray(), index * 3);
      v2Arr.set(endVec.toArray(), index * 3);

      if (!uniquePoints.has(startKey)) {
        posArr.push(...startVec.toArray());
        sphereInstances.count++;
        uniquePoints.add(startKey);
      }

      if (!uniquePoints.has(endKey)) {
        posArr.push(...endVec.toArray());
        sphereInstances.count++;
        uniquePoints.add(endKey);
      }
    });

    cylinderInstances.instanceMatrix.needsUpdate = true;
    sphereInstances.instanceMatrix.needsUpdate = true;

    cylinderGeometry.setAttribute(
      'v1',
      new THREE.InstancedBufferAttribute(v1Arr, 3)
    );
    cylinderGeometry.setAttribute(
      'v2',
      new THREE.InstancedBufferAttribute(v2Arr, 3)
    );
    sphereGeometry.setAttribute(
      'pos',
      new THREE.InstancedBufferAttribute(new Float32Array(posArr), 3)
    );

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    wireframeGroup.add(cylinderInstances);
    verticesGroup.add(sphereInstances);

    return { wireframeGroup, verticesGroup };
  }

  /**
   * 为 4D 模型创建线框（圆柱体）和顶点（球体）的可视化表示。
   * @param {Array<type.Edge4D>} edges - 边的数据，每个元素是一个包含起点和终点（带有 w 坐标）的对象数组。
   * @param {object} options - 配置选项。
   * @param {THREE.Material} [options.cylinderMaterial] - 用于圆柱体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {THREE.Material} [options.sphereMaterial] - 用于球体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {number} [options.cylinderColor] - 如果未提供 `cylinderMaterial`，圆柱体的十六进制颜色。
   * @param {number} [options.sphereColor] - 如果未提供 `sphereMaterial`，球体的十六进制颜色。
   * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含线框组和顶点组的对象。
   */
  create4DWireframeAndVertices(
    edges,
    {
      cylinderMaterial,
      sphereMaterial,
      cylinderColor = 0x777777,
      sphereColor = 0xffd700
    } = {}
  ) {
    let defaultCylinderMaterial =
      cylinderMaterial ||
      new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 0.9,
        roughness: 0.3
      });

    let defaultSphereMaterial =
      sphereMaterial ||
      new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.3
      });

    defaultCylinderMaterial = shaderCompCallback.cylinderMaterial(
      defaultCylinderMaterial,
      this.cylinderRadiusUni,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.projDistUni,
      this.isOrthoUni
    );
    defaultSphereMaterial = shaderCompCallback.sphereMaterial(
      defaultSphereMaterial,
      this.sphereRadiusUni,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.projDistUni,
      this.isOrthoUni
    );

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    const uniquePoints = new Set();

    const v1Arr = new Float32Array(edges.length * 4);
    const v2Arr = new Float32Array(edges.length * 4);
    const vertexSpheresPosArr = [];

    edges.forEach(([start, end], i) => {
      const startKey = `${start.x},${start.y},${start.z},${start.w}`;
      const endKey = `${end.x},${end.y},${end.z},${end.w}`;

      v1Arr.set(Object.values(start), i * 4);
      v2Arr.set(Object.values(end), i * 4);

      if (!uniquePoints.has(startKey)) {
        vertexSpheresPosArr.push(Object.values(start));
        uniquePoints.add(startKey);
      }

      if (!uniquePoints.has(endKey)) {
        vertexSpheresPosArr.push(Object.values(end));
        uniquePoints.add(endKey);
      }
    });

    const cylinderGeometry = helperFunc.toBufferGeometry(
      new THREE.CylinderGeometry(1, 1, 1, 16)
    );
    cylinderGeometry.setAttribute(
      'v1',
      new THREE.InstancedBufferAttribute(v1Arr, 4)
    );
    cylinderGeometry.setAttribute(
      'v2',
      new THREE.InstancedBufferAttribute(v2Arr, 4)
    );
    const instancedCylinderMesh = new THREE.InstancedMesh(
      cylinderGeometry,
      defaultCylinderMaterial,
      edges.length
    );
    wireframeGroup.add(instancedCylinderMesh);

    const sphereGeometry = helperFunc.toBufferGeometry(
      new THREE.SphereGeometry(1, 16, 16)
    );
    sphereGeometry.setAttribute(
      'center4D',
      new THREE.InstancedBufferAttribute(
        new Float32Array(vertexSpheresPosArr.flat()),
        4
      )
    );
    const instancedSphereMesh = new THREE.InstancedMesh(
      sphereGeometry,
      defaultSphereMaterial,
      vertexSpheresPosArr.length
    );
    verticesGroup.add(instancedSphereMesh);

    return {
      wireframeGroup,
      verticesGroup
    };
  }

  /**
   * 加载并显示 3D 网格模型。
   * @param {type.Mesh3D} meshData - 3D 网格数据。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   * @returns {{scaleFactor: number, solidGroup: THREE.Object3D, facesGroup: THREE.Mesh, wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含模型相关 THREE.js 对象的引用和计算出的缩放因子。
   */
  loadMesh(meshData, material) {
    const container = new THREE.Object3D();
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(meshData.vertices.length * 3);
    meshData.vertices.forEach((v, i) => {
      vertices[i * 3] = v.x;
      vertices[i * 3 + 1] = v.y;
      vertices[i * 3 + 2] = v.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const indices = [];
    meshData.faces.forEach(face => indices.push(...face));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    material = shaderCompCallback.faceMaterial3D(
      material,
      this.rotUni,
      this.ofs3Uni
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    this.updateScaleFactor(
      40 / helperFunc.getFarthestPointDist(meshData.vertices)
    );

    const { wireframeGroup, verticesGroup } = this.createWireframeAndVertices(
      meshData.edges
    );

    container.add(mesh);
    container.add(wireframeGroup);
    container.add(verticesGroup);
    container.scale.setScalar(this.scaleFactor);

    this.scene.add(container);

    return {
      scaleFactor: this.scaleFactor,
      solidGroup: container,
      facesGroup: mesh,
      wireframeGroup,
      verticesGroup
    };
  }

  /**
   * 加载并显示 4D 网格模型。
   * @param {type.Mesh4D} meshData - 4D 网格数据。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   * @returns {{scaleFactor: number, solidGroup: THREE.Object3D, facesGroup: THREE.Mesh, wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含模型相关 THREE.js 对象的引用和计算出的缩放因子。
   */
  load4DMesh(meshData, material) {
    const container = new THREE.Object3D();
    const geometry = new THREE.BufferGeometry();

    // position 属性在这里没有实际作用，但必须设置以防止着色器报错。
    const vertices = new Float32Array(meshData.vertices.length * 3);
    meshData.vertices.forEach((v, i) => {
      vertices[i * 3] = v.x;
      vertices[i * 3 + 1] = v.y;
      vertices[i * 3 + 2] = v.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const vertices4D = new Float32Array(meshData.vertices.length * 4);
    meshData.vertices.forEach((v, i) => {
      vertices4D[i * 4] = v.x;
      vertices4D[i * 4 + 1] = v.y;
      vertices4D[i * 4 + 2] = v.z;
      vertices4D[i * 4 + 3] = v.w;
    });
    geometry.setAttribute(
      'position4D',
      new THREE.BufferAttribute(vertices4D, 4)
    );

    const indices = [];
    meshData.faces.forEach(face => indices.push(...face));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    this.projectionDistanceSlider.value =
      helperFunc.getFarthest4DPointDist(meshData.vertices) * 1.05;
    this.updateProjectionDistance();
    this.updateScaleFactor(
      40 /
        helperFunc.getFarthestPointDist(
          meshData.vertices.map(p => {
            if (!this.schleSwitcher.checked) return { x: p.x, y: p.y, z: p.z };
            const d = +this.projectionDistanceSlider.value;
            const s = d / (d + p.w);

            return { x: p.x * s, y: p.y * s, z: p.z * s };
          })
        )
    );

    const { wireframeGroup, verticesGroup } = this.create4DWireframeAndVertices(
      meshData.edges
    );

    container.add(mesh);
    container.add(wireframeGroup);
    container.add(verticesGroup);
    container.scale.setScalar(this.scaleFactor);

    this.scene.add(container);

    return {
      scaleFactor: this.scaleFactor,
      solidGroup: container,
      facesGroup: mesh,
      wireframeGroup,
      verticesGroup
    };
  }

  /**
   * 使用 WebWorker 异步处理网格数据。
   * @param {(type.NonTriMesh3D|type.NonTriMesh4D)} meshData - 3D / 4D 网格数据。
   * @param {boolean} is4D - 是否为 4D 网格。
   * @returns {object} 包含 Promise 和 abort 方法的对象。
   * @property {Promise<(type.Mesh3D|type.Mesh4D)>} promise - 处理结果的 Promise，成功时返回处理完成的数据，失败时返回错误信息。
   * @property {Function} abort - 中止处理的方法，会终止 Worker 并清理资源。
   */
  processMeshData(meshData, is4D = false) {
    const bar = new Nanobar({ target: this.progCon });
    const controller = new AbortController();
    const worker = new Worker(
      new URL('./processMeshData.worker.js', import.meta.url)
    );
    this.nanobar = bar.el;
    bar.el.style.position = 'static';

    const promise = new Promise((resolve, reject) => {
      worker.postMessage({ meshData, is4D });

      worker.addEventListener('message', event => {
        const { type, data } = event.data;

        switch (type) {
          case 'progress':
            this.progDis.innerHTML = `${data.progress.toFixed(2)}%<br />（${data.current}/${data.total}）`;
            bar.go(data.progress);
            break;
          case 'complete':
            worker.terminate();
            this.progDis.innerText = '';
            bar.el.remove();
            this.loadMeshPromise = null;
            this.nanobar = null;
            resolve(data);
            break;
          case 'error':
            worker.terminate();
            this.progDis.innerText = '';
            bar.el.remove();
            this.loadMeshPromise = null;
            this.nanobar = null;
            reject(data);
            break;
        }
      });
    });

    return {
      promise,
      abort: () => {
        controller.abort();
        worker.terminate();
        this.progDis.innerText = '';
        bar.el.remove();
        this.loadMeshPromise = null;
        this.nanobar = null;
      }
    };
  }

  /**
   * 从 OFF 格式的字符串数据加载 3D 网格模型。
   * @param {string} data - OFF 格式的字符串数据。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   */
  async loadMeshFromOffData(data, material) {
    if (this.loadMeshPromise) this.loadMeshPromise.abort();
    const mesh = parseOFF(data);
    this.loadMeshPromise = this.processMeshData(mesh);
    const processedMesh = await this.loadMeshPromise.promise;

    const info = `
    顶点数：${mesh.vertices.length}
    边数：${mesh.edges.length}
    面数：${mesh.faces.length}
    `
      .trim()
      .replace(' ', '');
    this.infoDis.innerText = info;

    const {
      scaleFactor,
      solidGroup,
      facesGroup,
      wireframeGroup,
      verticesGroup
    } = this.loadMesh(processedMesh, material);

    this.scaleFactor = scaleFactor;
    this.solidGroup = solidGroup;
    this.facesGroup = facesGroup;
    this.wireframeGroup = wireframeGroup;
    this.verticesGroup = verticesGroup;

    this.updateProperties();
  }

  /**
   * 从 4OFF 格式的字符串数据加载 4D 网格模型。
   * @param {string} data - 4OFF 格式的字符串数据。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   */
  async loadMeshFrom4OffData(data, material) {
    if (this.loadMeshPromise) this.loadMeshPromise.abort();
    const mesh = parse4OFF(data);
    this.loadMeshPromise = this.processMeshData(mesh, true);
    const processedMesh = await this.loadMeshPromise.promise;

    const info = `
    顶点数：${mesh.vertices.length}
    边数：${mesh.edges.length}
    面数：${mesh.faces.length}
    胞数：${mesh.cells.length}
    `
      .trim()
      .replace(' ', '');
    this.infoDis.innerText = info;

    material = shaderCompCallback.faceMaterial(
      material,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.projDistUni,
      this.isOrthoUni
    );

    const {
      scaleFactor,
      solidGroup,
      facesGroup,
      wireframeGroup,
      verticesGroup
    } = this.load4DMesh(processedMesh, material);

    this.scaleFactor = scaleFactor;
    this.solidGroup = solidGroup;
    this.facesGroup = facesGroup;
    this.wireframeGroup = wireframeGroup;
    this.verticesGroup = verticesGroup;

    this.updateProperties();
    this.updateProjectionDistance();
    this.updateRotation();
  }

  /**
   * 从指定的 URL 异步加载模型数据。
   * @param {string} url - 模型的 URL。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   * @returns {Promise<void>} 一个 Promise，在模型加载完成后解析。
   */
  async loadMeshFromUrl(url, material) {
    return new Promise(resolve => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('网络响应不正常');
          }
          return response.text();
        })
        .then(async data => {
          await this.loadMeshFromOffData(data, material);
          resolve();
        });
    });
  }

  /**
   * 根据 UI 控件的状态更新模型的可见性、面不透明度、Uniform 值、摄像头模式以及线框和顶点的尺寸。
   */
  updateProperties() {
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'visible',
      this.faceVisibleSwitcher.checked
    );
    helperFunc.changeMaterialProperty(
      this.wireframeGroup,
      'visible',
      this.wireframeVisibleSwitcher.checked
    );
    helperFunc.changeMaterialProperty(
      this.verticesGroup,
      'visible',
      this.verticesVisibleSwitcher.checked
    );
    helperFunc.changeMaterialProperty(
      this.axesGroup,
      'visible',
      this.axisVisibleSwitcher.checked
    );
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'opacity',
      +this.faceOpacitySlider.value
    );
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'transparent',
      +this.faceOpacitySlider.value !== 1
    );
    this.toggleCamera(this.perspSwitcher.checked);

    this.cylinderRadiusUni.value =
      +this.wireframeAndVerticesDimSlider.value / this.scaleFactor;
    this.sphereRadiusUni.value =
      (+this.wireframeAndVerticesDimSlider.value / this.scaleFactor) * 2;
    this.ofsUni.value = new THREE.Vector4(0, 0, 0, 0);
    this.ofs3Uni.value = new THREE.Vector3();
  }

  /**
   * 更新用于 4D 投影距离的 Uniform 变量。
   */
  updateProjectionDistance() {
    this.projDistUni.value = +this.projectionDistanceSlider.value;
  }

  /**
   * 更新旋转 Uniform 变量，并在 3D 模式下直接修改 solidGroup 的旋转。
   */
  updateRotation() {
    const rotations = this.rotationSliders.map(i => +i.value);
    this.rotAngles = rotations;
    this.rotUni.value = helperFunc.create4DRotationMat(...this.rotAngles);
  }

  /**
   * 更新缩放因子。
   * @param {number} scaleFactor - 缩放因子。
   */
  updateScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor;
    this.scaleFactorSlider.value = scaleFactor;
    this.cylinderRadiusUni.value =
      +this.wireframeAndVerticesDimSlider.value / scaleFactor;
    this.sphereRadiusUni.value =
      (+this.wireframeAndVerticesDimSlider.value / scaleFactor) * 2;
    if (this.solidGroup) this.solidGroup.scale.setScalar(scaleFactor);
    this.axesOffsetScaleUni.value = scaleFactor;
  }
  
  /**
   * 更新 UI 控件可用状态。
   * @param {boolean} enable - true 表示启用，false 表示禁用。
   */
  updateEnable(enable=true) {
    /**
     * 禁用或启用页面上所有的 input 和 button 元素。
     * @param {boolean} enable - true 表示启用，false 表示禁用。
     */
    const _toggleInputsAndButtons = (enable) => {
      const elements = document.querySelectorAll('input, button');
      
      elements.forEach(element => {
          element.disabled = !enable;
      });
    }
    
    _toggleInputsAndButtons(enable);
    this.stopRecordBtn.disabled = !this.isRecordingFlag;
    if (!enable) return;
    this.projectionDistanceSlider.disabled = true;
    if (!this.schleSwitcher.disabled && !this.is4D) {
      this.rotationSliders[2].value = 0;
      this.rotationSliders[4].value = 0;
      this.rotationSliders[5].value = 0;
      this.updateRotation();
    }
    this.projectionDistanceSlider.disabled = !this.is4D;
    this.schleSwitcher.disabled = !this.is4D;
    this.rotationSliders[2].disabled = !this.is4D;
    this.rotationSliders[4].disabled = !this.is4D;
    this.rotationSliders[5].disabled = !this.is4D;
    
    this.startRecordBtn.disabled = this.isRecordingFlag;
  }

  /**
   * 切换当前使用的摄像机类型（透视或正交），并保持其位置和方向。
   * @param {boolean} isPersp - 是否使用透视相机（否则正交）。
   */
  toggleCamera(isPersp) {
    const oldCamera = this.camera.clone();

    if (isPersp) {
      this.camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
    } else {
      this.camera = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.01, 500);
    }

    this.camera.position.copy(oldCamera.position);
    this.camera.rotation.copy(oldCamera.rotation);
    this._initializeControls();
  }

  /**
   * 设置所有 UI 元素的事件监听器。
   * 使用箭头函数或 bind(this) 确保方法内部的 this 正确指向类实例。
   */
  setupEventListeners() {
    this.faceVisibleSwitcher.addEventListener('change', () =>
      helperFunc.changeMaterialProperty(
        this.facesGroup,
        'visible',
        this.faceVisibleSwitcher.checked
      )
    );
    this.wireframeVisibleSwitcher.addEventListener('change', () =>
      helperFunc.changeMaterialProperty(
        this.wireframeGroup,
        'visible',
        this.wireframeVisibleSwitcher.checked
      )
    );
    this.verticesVisibleSwitcher.addEventListener('change', () =>
      helperFunc.changeMaterialProperty(
        this.verticesGroup,
        'visible',
        this.verticesVisibleSwitcher.checked
      )
    );
    this.axisVisibleSwitcher.addEventListener('change', () =>
      helperFunc.changeMaterialProperty(
        this.axesGroup,
        'visible',
        this.axisVisibleSwitcher.checked
      )
    );
    this.scaleFactorSlider.addEventListener('input', () =>
      this.updateScaleFactor(+this.scaleFactorSlider.value)
    );
    this.faceOpacitySlider.addEventListener('input', () => {
      helperFunc.changeMaterialProperty(
        this.facesGroup,
        'opacity',
        +this.faceOpacitySlider.value
      );
      helperFunc.changeMaterialProperty(
        this.facesGroup,
        'transparent',
        +this.faceOpacitySlider.value !== 1
      );
    });
    this.wireframeAndVerticesDimSlider.addEventListener('input', () => {
      this.cylinderRadiusUni.value =
        +this.wireframeAndVerticesDimSlider.value / this.scaleFactor;
      this.sphereRadiusUni.value =
        (+this.wireframeAndVerticesDimSlider.value / this.scaleFactor) * 2;
    });

    this.projectionDistanceSlider.addEventListener(
      'input',
      this.updateProjectionDistance.bind(this)
    );

    this.rotationSliders.forEach((slider, i) => {
      slider.addEventListener('input', () => {
        this.rotAngles[i] = +slider.value;
        this.rotUni.value = helperFunc.create4DRotationMat(...this.rotAngles);
      });
    });

    this.perspSwitcher.addEventListener('change', () =>
      this.toggleCamera(this.perspSwitcher.checked)
    );
    this.schleSwitcher.addEventListener(
      'change',
      () => (this.isOrthoUni.value = !this.schleSwitcher.checked)
    );

    this.uploadOffBtn.addEventListener('click', () => this.fileInput.click())
    this.fileInput.addEventListener(
      'change',
      this.handleFileInputChange.bind(this)
    );
    this.startRecordBtn.addEventListener('click', this.startRecord.bind(this));
    this.stopRecordBtn.addEventListener('click', () => this.stopRecordFlag = true);
  }

  /**
   * 处理文件输入元素的选择事件，读取文件内容并加载相应的 3D 或 4D 模型。
   * @param {Event} e - 文件输入事件对象。
   */
  handleFileInputChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
      const data = e.target.result;

      if (this.solidGroup) {
        helperFunc.disposeGroup(this.solidGroup);
        this.scene.remove(this.solidGroup);
      }

      this.is4D =
        data
          .split('\n')
          .filter(line => line.trim() !== '' && !line.startsWith('#'))[0]
          .trim() === '4OFF';

      const material = new THREE.MeshPhongMaterial({
        color: 0x555555,
        specular: 0x222222,
        shininess: 50,
        flatShading: true
      });

      if (this.is4D) {
        await this.loadMeshFrom4OffData(data, material);
      } else {
        await this.loadMeshFromOffData(data, material);
      }
      this.updateEnable();
    };
    reader.readAsText(file);
  }

  /**
   * 校验录制配置对象中以的有效性。
   * @param {object} config - 要验证的配置对象。
   * @throws {Error} 当任何字段验证失败时抛出错误，包含具体的错误信息。
   */
  validateRecordConfig(config) {
    if (config.initialRot !== undefined) {
      if (
        !Array.isArray(config.initialRot) ||
        config.initialRot.length !== 6 ||
        config.initialRot.some(v => typeof v !== 'number')
      ) {
        throw new Error('initialRot 字段必须是包含 6 个实数的数组。');
      }
    }

    if (config.initialOfs !== undefined) {
      if (
        !Array.isArray(config.initialOfs) ||
        config.initialOfs.length !== 4 ||
        config.initialOfs.some(v => typeof v !== 'number')
      ) {
        throw new Error('initialOfs 字段必须是包含 4 个实数的数组。');
      }
    }

    if (config.initialOfs3 !== undefined) {
      if (
        !Array.isArray(config.initialOfs3) ||
        config.initialOfs3.length !== 3 ||
        config.initialOfs3.some(v => typeof v !== 'number')
      ) {
        throw new Error('initialOfs3 字段必须是包含 3 个实数的数组。');
      }
    }

    if (config.initialVerticesEdgesDim !== undefined) {
      if (
        typeof config.initialVerticesEdgesDim !== 'number' ||
        config.initialVerticesEdgesDim <= 0
      ) {
        throw new Error('initialVerticesEdgesDim 字段必须是正实数。');
      }
    }

    if (config.initialProjDist !== undefined) {
      if (
        typeof config.initialProjDist !== 'number' ||
        config.initialProjDist <= 0
      ) {
        throw new Error('initialProjDist 字段必须是正实数。');
      }
    }

    if (config.initialFaceOpacity !== undefined) {
      if (
        typeof config.initialFaceOpacity !== 'number' ||
        config.initialFaceOpacity < 0 ||
        config.initialFaceOpacity > 1
      ) {
        throw new Error('initialFaceOpacity 字段必须是 0~1 之间的实数。');
      }
    }

    if (config.initialVisibilities !== undefined) {
      const validTargets = ['faces', 'wireframe', 'vertices', 'axes'];
      for (const [target, value] of Object.entries(
        config.initialVisibilities
      )) {
        if (!validTargets.includes(target)) {
          throw new Error(
            `initialVisibilities 字段包含无效的目标类型: ${target}。`
          );
        }
        if (typeof value !== 'boolean') {
          throw new Error(`initialVisibilities.${target} 字段必须为布尔值。`);
        }
      }
    }

    if (
      config.initialCameraProjMethod !== undefined &&
      !['persp', 'ortho'].includes(config.initialCameraProjMethod)
    ) {
      throw new Error(
        'initialCameraProjMethod 字段必须为 "persp" 或 "ortho"。'
      );
    }

    if (
      config.initialSchleProjEnable !== undefined &&
      typeof config.initialSchleProjEnable !== 'boolean'
    ) {
      throw new Error('initialSchleProjEnable 字段必须为布尔值。');
    }

    if (
      !Array.isArray(config.actions) ||
      config.actions.some(i => !(i instanceof Object))
    ) {
      throw new Error('action 字段必须为对象列表。');
    }

    config.actions.forEach((action, index) => {
      switch (action.type) {
        case 'rot':
          if (typeof action.angle !== 'number')
            throw new Error(`actions[${index}] 操作的 angle 字段必须为实数。`);
          if (
            !(
              Number.isInteger(action.plane) &&
              0 <= action.plane &&
              action.plane <= 5
            )
          )
            throw new Error(
              `actions[${index}] 操作的 plane 字段必须为大于等于零小于六的整数。`
            );
          if (!this.is4D && [2, 4, 5].includes(action.plane))
            throw new Error(
              `actions[${index}] 操作的 plane 字段值 ${action.plane} 只在四维模式可用。`
            );
          break;
        case 'trans4':
          if (!this.is4D)
            throw new Error(`actions[${index}] 操作只在四维模式可用。`);
          if (
            action.ofs.length !== 4 ||
            action.ofs.some(v => typeof v !== 'number')
          )
            throw new Error(
              `actions[${index}] 操作的 ofs 字段必须为四个实数的数组。`
            );
          break;
        case 'trans3':
          if (
            action.ofs.length !== 3 ||
            action.ofs.some(v => typeof v !== 'number')
          )
            throw new Error(
              `actions[${index}] 操作的 ofs 字段必须为三个实数的数组。`
            );
          break;
        case 'setVerticesEdgesDim':
          if (typeof action.dimOfs !== 'number')
            throw new Error(`actions[${index}] 操作的 dimOfs 字段必须为实数。`);
          break;
        case 'setProjDist':
          if (!this.is4D)
            throw new Error(`actions[${index}] 操作只在四维模式可用。`);
          if (typeof action.projDistOfs !== 'number')
            throw new Error(
              `actions[${index}] 操作的 projDistOfs 字段必须为实数。`
            );
          break;
        case 'setFaceOpacity':
          if (typeof action.faceOpacityOfs !== 'number')
            throw new Error(
              `actions[${index}] 操作的 faceOpacityOfs 字段必须为实数。`
            );
          break;
        case 'setVisibility':
          if (
            !['faces', 'wireframe', 'vertices', 'axes'].includes(action.target)
          )
            throw new Error(
              `actions[${index}] 操作的 target 字段值必须为 faces、wireframe、vertices 或 axes 中的一者。`
            );
          if (typeof action.visibility !== 'boolean')
            throw new Error(
              `actions[${index}] 操作的 visibility 字段值必须为 boolean 类型。`
            );
          break;
        case 'setCameraProjMethod':
          if (action.projMethod !== 'persp' && action.projMethod !== 'ortho')
            throw new Error(
              `actions[${index}] 操作的 projMethod 字段值必须为 persp 或 ortho 中的一者。`
            );
          break;
        case 'setSchleProjEnable':
          if (!this.is4D)
            throw new Error(`actions[${index}] 操作只在四维模式可用。`);
          if (typeof action.enable !== 'boolean')
            throw new Error(
              `actions[${index}] 操作的 enable 字段值必须为 boolean 类型。`
            );
          break;
        default:
          throw new Error(`actions[${index}] 操作的类型 ${action.type} 无效。`);
      }
      
      if (
        Object.hasOwnProperty.call(action, 'start') &&
        Object.hasOwnProperty.call(action, 'end') &&
        Object.hasOwnProperty.call(action, 'at')
      ) {
        throw new Error(
          `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
        );
      } else if (
        Object.hasOwnProperty.call(action, 'start') &&
        Object.hasOwnProperty.call(action, 'end')
      ) {
        if (['setVisibility', 'setCameraProjMethod', 'setSchleProjEnable'].includes(action.type)) {
          throw new Error(`actions[${index}] 的 start 和 end 字段值只适用于以下类型的操作：rot、trans4、trans3、setVerticesEdgesDim、setProjDist、setFaceOpacity。`)
        }
        if (
          !Number.isInteger(action.start) ||
          !Number.isInteger(action.end) ||
          action.end < action.start ||
          action.start < 0 ||
          action.end < 0
        ) {
          throw new Error(
            `actions[${index}] 的 start 和 end 字段必须均为大于等于 0 的整数，且 end 大于等于 start。`
          );
        }
      } else if (Object.hasOwnProperty.call(action, 'at')) {
        if (!['setVisibility', 'setCameraProjMethod', 'setSchleProjEnable'].includes(action.type)) {
          throw new Error(`actions[${index}] 的 at 字段值只适用于以下类型的操作：setVisibility、setCameraProjMethod、setSchleProjEnable。`)
        }
        if (!Number.isInteger(action.at) || action.at < 0)
          throw new Error(
            `actions[${index}] 的 at 字段必须为大于等于 0 的整数。`
          );
      } else {
        throw new Error(
          `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
        );
      }
    });
  }
  
  /**
   * 异步获取并解析用户选择的 JSON 文件。
   * @param {HTMLInputElement} fileInput - 文件输入元素。
   * @returns {Promise<object>} 返回解析后的 JSON 对象。
   */
  parseJsonFileFromInput(fileInput) {
    return new Promise((resolve, reject) => {
      // 确保输入元素是文件类型
      if (fileInput.type !== 'file') {
        reject(new Error('提供的元素不是文件输入类型'));
        return;
      }
  
      // 设置临时事件处理程序
      fileInput.addEventListener('change', function handleChange() {
        // 移除事件监听器，避免多次触发
        fileInput.removeEventListener('change', handleChange);
  
        if (!fileInput.files || fileInput.files.length === 0) {
          reject(new Error('没有选择文件'));
          return;
        }
  
        const file = fileInput.files[0];
        const reader = new FileReader();
  
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target.result);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('文件解析失败: ' + error.message));
          }
        };
  
        reader.onerror = () => {
          reject(new Error('文件读取失败'));
        };
  
        reader.readAsText(file);
      });
  
      // 触发文件选择对话框
      fileInput.click();
    });
  }
  
  /**
   * 开始录制视频。
   */
  async startRecord() {
    try {
      this.recordConfig = await this.parseJsonFileFromInput(this.configFileInput);
      this.validateRecordConfig(this.recordConfig);
    } catch (e) {
      alert(e.message);
      console.error(e);
      return;
    }
    
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
        this.recordConfig.initialFaceOpacity ?? +this.faceOpacitySlider.value,
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
        this.recordConfig.initialSchleProjEnable ?? !this.isOrthoUni.value
    };

    const totalFrames = Math.max(
      ...this.recordConfig.actions.map((i, index) => {
        i.index = index;
        return i.end ?? i.at ?? -1;
      })
    );
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
    const _onStopRender = (byError=false) => {
      this.capturer.stop();
      if (!byError) this.capturer.save();
      this.capturer = null;
      this.isRecordingFlag = false;

      this.updateProperties();
      this.updateProjectionDistance();
      this.updateRotation();

      this._initializeControls();
      this.startRenderLoop();
      
      this.updateEnable();
    }
    
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
        alert(e.message);
        _onStopRender(true);
        console.error(e);
        return;
      }

      frameIndex++;
      requestAnimationFrame(_renderLoop);
    }
    _renderLoop();
  }

  /**
   * 渲染一帧。
   * @param {number} frameIndex - 帧索引。
   */
  genFrame(frameIndex) {
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

    this.render();
  }

  /**
   * 更新录制状态。
   * @param {number} frameIndex - 帧索引。
   * @throws {Error} 当任何动作导致错误值时抛出，包含具体的错误信息。
   */
  updateRecordStates(frameIndex) {
    const currrentActions = this.recordConfig.actions.filter(
      i => (i.start <= frameIndex && frameIndex < i.end) || frameIndex === i.at
    );
    for (const action of currrentActions) {
      switch (action.type) {
        case 'rot': {
          const rotAng = [0, 0, 0, 0, 0, 0];
          rotAng[action.plane] = action.angle / (action.end - action.start);
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
            new THREE.Vector4(...action.ofs).divideScalar(
              action.end - action.start
            )
          );
          break;
        case 'trans3':
          this.recordStates.ofs3.add(
            new THREE.Vector3(...action.ofs).divideScalar(
              action.end - action.start
            )
          );
          break;
        case 'setVerticesEdgesDim':
          this.recordStates.verticesEdgesDim +=
            action.dimOfs / (action.end - action.start);
          if (this.recordStates.verticesEdgesDim <= 0) 
            throw new Error(`actions[${action.index}] 错误地导致边和顶点的尺寸为负数。`);
          break;
        case 'setProjDist':
          this.recordStates.projDist +=
            action.projDistOfs / (action.end - action.start);
          if (this.recordStates.projDist <= 0) 
            throw new Error(`actions[${action.index}] 错误地导致投影距离为负数。`);
          break;
        case 'setFaceOpacity':
          this.recordStates.faceOpacity +=
            action.faceOpacityOfs / (action.end - action.start);
          if (this.recordStates.faceOpacity < 0 || this.recordStates.faceOpacity > 1)
            throw new Error(`actions[${action.index}] 错误地导致面透明度超出 0~1 的范围。`);
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
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new PolytopeRendererApp());
