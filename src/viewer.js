import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

// 导入外部辅助函数和模块
import createAxes from './axesCreater.js';
import shaderCompCallback from './shaderCompCallback.js';
import {
  getFarthestPointDist,
  getFarthest4DPointDist,
  changeMaterialProperty,
  disposeGroup
} from './helperFunc.js';
import { create4DSphereMesh, toBufferGeometry } from './geometries.js';
import { processMeshData, parseOFF } from './offProcessor.js';
import { process4DMeshData, parse4OFF } from './offProcessor4D.js';
import url from '../assets/models/tri.off'; // 默认加载的模型URL

/**
 * PolyhedronRendererApp 类用于管理 THREE.js 场景、模型加载、用户交互和渲染循环。
 * 它将应用程序的所有状态和逻辑封装在一个单一的实例中。
 */
class PolyhedronRendererApp {
  constructor() {
    this.faceVisibleSwitcher = null;
    this.wireframeVisibleSwitcher = null;
    this.verticesVisibleSwitcher = null;
    this.axisVisibleSwitcher = null;
    this.perspSwitcher = null;
    this.facesOpacitySlider = null;
    this.wireframeAndVerticesDimSlider = null;
    this.projectionDistanceSlider = null;
    this.fileInput = null;

    this.rotationSliders = [];

    this.scaleFactor = 1;
    this.axesGroup = null;
    this.solidGroup = null;
    this.facesGroup = null;
    this.wireframeGroup = null;
    this.verticesGroup = null;
    this.is4D = false;

    this.rotUni = { value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] };
    this.projDistUni = { value: 2.0 };
    this.cylinderRadiusUni = { value: 0.5 };
    this.sphereRadiusUni = { value: 1.0 }

    this.renderer = null;
    this.scene = null;
    this.cameraPersp = null;
    this.cameraOrtho = null;
    this.camera = null;
    this.controls = null;

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

    this.axesGroup = await createAxes(this.scene, this.rotUni, this.projDistUni);

    const initialMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      specular: 0x222222,
      shininess: 50,
      flatShading: true,
      transparent: true
    });

    await this.loadMeshFromUrl(url, initialMaterial);

    this.setupEventListeners();

    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  /**
   * 获取所有必要的 DOM 元素并将其赋值给类属性。
   */
  _initializeDomElements() {
    this.faceVisibleSwitcher = document.getElementById('faceVisibleSwitcher');
    this.wireframeVisibleSwitcher = document.getElementById('wireframeVisibleSwitcher');
    this.verticesVisibleSwitcher = document.getElementById('verticesVisibleSwitcher');
    this.axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher');
    this.perspSwitcher = document.getElementById('perspSwitcher');
    this.facesOpacitySlider = document.getElementById('facesOpacitySlider');
    this.wireframeAndVerticesDimSlider = document.getElementById('wireframeAndVerticesDimSlider');
    this.projectionDistanceSlider = document.getElementById('projectionDistanceSlider');
    this.fileInput = document.getElementById('fileInput');

    this.rotationSliders = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'].map(i =>
      document.getElementById(`rot${i}Slider`)
    );
  }

  /**
   * 初始化 WebGL 渲染器并设置其大小，同时监听窗口大小变化事件以调整渲染器。
   */
  _initializeRenderer() {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.getElementById('polyhedronRenderer');

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      canvas: canvas
    });

    const maxSize = Math.min(
      Math.min(window.innerWidth, window.innerHeight) - 16,
      720
    );
    this.renderer.setSize(maxSize * dpr, maxSize * dpr, false);
    canvas.style.width = `${maxSize}px`;
    canvas.style.height = `${maxSize}px`;
    canvas.style.display = 'block';

    window.addEventListener('resize', () => {
      const newMaxSize = Math.min(
        Math.min(window.innerWidth, window.innerHeight) - 16,
        720
      );
      this.renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
      canvas.style.width = `${newMaxSize}px`;
      canvas.style.height = `${newMaxSize}px`;
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
    this.cameraPersp = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
    this.cameraOrtho = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.01, 500);
    this.cameraPersp.position.set(0, 0, 120);
    this.cameraOrtho.position.set(0, 0, 120);
    this.camera = this.cameraPersp.clone();
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
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.dynamicDampingFactor = 0.8;
    this.controls.rotateSpeed = 4.0;
    this.controls.maxDistance = 150.0;
    this.controls.minDistance = 0.1;
  }

  /**
   * THREE.js 渲染循环函数，用于更新控制器和渲染场景。
   */
  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 为 3D 模型创建线框（圆柱体）和顶点（球体）的可视化表示。
   * @param {Array<[{x: number, y: number, z: number}, {x: number, y: number, z: number}]>} edges - 边的数据，每个元素是一个包含起点和终点 THREE.Vector3 结构的对象数组。
   * @param {object} options - 配置选项。
   * @param {number} [options.cylinderRadius=1] - 用于表示边的圆柱体半径。
   * @param {number} [options.sphereRadiusMultiplier=2] - 球体半径相对于圆柱体半径的乘数。
   * @param {THREE.Material} [options.cylinderMaterial] - 用于圆柱体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {THREE.Material} [options.sphereMaterial] - 用于球体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {number} [options.cylinderColor=0xc0c0c0] - 如果未提供 `cylinderMaterial`，圆柱体的十六进制颜色。
   * @param {number} [options.sphereColor=0xffd700] - 如果未提供 `sphereMaterial`，球体的十六进制颜色。
   * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含线框组和顶点组的对象。
   */
  createWireframeAndVertices(
    edges,
    {
      cylinderRadius = 1,
      sphereRadiusMultiplier = 2,
      cylinderMaterial,
      sphereMaterial,
      cylinderColor = 0xc0c0c0,
      sphereColor = 0xffd700
    } = {}
  ) {
    let defaultCylinderMaterial =
      cylinderMaterial ||
      new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 1.0,
        roughness: 0.4
      });

    let defaultSphereMaterial =
      sphereMaterial ||
      new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.5
      });
    
    defaultCylinderMaterial = shaderCompCallback.cylinderMaterial3D(defaultCylinderMaterial, this.cylinderRadiusUni)
    defaultSphereMaterial = shaderCompCallback.sphereMaterial3D(defaultSphereMaterial, this.sphereRadiusUni)

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    const uniquePoints = new Set();

    const sphereRadius = cylinderRadius * sphereRadiusMultiplier;

    edges.forEach(([start, end]) => {
      const startKey = `${start.x},${start.y},${start.z}`;
      const endKey = `${end.x},${end.y},${end.z}`;

      const startVec = new THREE.Vector3(start.x, start.y, start.z);
      const endVec = new THREE.Vector3(end.x, end.y, end.z);
      const direction = new THREE.Vector3().subVectors(endVec, startVec);
      const length = direction.length();

      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(
          1,
          1,
          length,
          8,
          1,
          false
        ),
        defaultCylinderMaterial
      );

      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
      );
      cylinder.position.copy(
        new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
      );
      wireframeGroup.add(cylinder);

      if (!uniquePoints.has(startKey)) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1, 16, 16),
          defaultSphereMaterial
        );
        sphere.position.copy(startVec);
        verticesGroup.add(sphere);
        uniquePoints.add(startKey);
      }

      if (!uniquePoints.has(endKey)) {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1, 16, 16),
          defaultSphereMaterial
        );
        sphere.position.copy(new THREE.Vector3(end.x, end.y, end.z));
        verticesGroup.add(sphere);
        uniquePoints.add(endKey);
      }
    });

    return { wireframeGroup, verticesGroup };
  }

  /**
   * 为 4D 模型创建线框（圆柱体）和顶点（球体）的可视化表示。
   * @param {Array<[{x: number, y: number, z: number, w: number}, {x: number, y: number, z: number, w: number}]>} edges - 边的数据，每个元素是一个包含起点和终点（带有w坐标）的对象数组。
   * @param {object} options - 配置选项。
   * @param {THREE.Material} [options.cylinderMaterial] - 用于圆柱体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {THREE.Material} [options.sphereMaterial] - 用于球体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {number} [options.cylinderColor=0xc0c0c0] - 如果未提供 `cylinderMaterial`，圆柱体的十六进制颜色。
   * @param {number} [options.sphereColor=0xffd700] - 如果未提供 `sphereMaterial`，球体的十六进制颜色。
   * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含线框组和顶点组的对象。
   */
  create4DWireframeAndVertices(
    edges,
    {
      cylinderMaterial,
      sphereMaterial,
      cylinderColor = 0xc0c0c0,
      sphereColor = 0xffd700
    } = {}
  ) {
    let defaultCylinderMaterial =
      cylinderMaterial ||
      new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 1.0,
        roughness: 0.4
      });

    let defaultSphereMaterial =
      sphereMaterial ||
      new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.5
      });

    defaultCylinderMaterial = shaderCompCallback.cylinderMaterial(
      defaultCylinderMaterial,
      this.cylinderRadiusUni,
      this.rotUni,
      this.projDistUni
    );
    defaultSphereMaterial = shaderCompCallback.sphereMaterial(
      defaultSphereMaterial,
      this.sphereRadiusUni,
      this.rotUni,
      this.projDistUni
    );

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    const uniquePoints = new Set();

    edges.forEach(([start, end]) => {
      const startKey = `${start.x},${start.y},${start.z},${start.w}`;
      const endKey = `${end.x},${end.y},${end.z},${end.w}`;

      const { x: x1, y: y1, z: z1, w: w1 } = start;
      const { x: x2, y: y2, z: z2, w: w2 } = end;

      const geometry = toBufferGeometry(
        new THREE.CylinderGeometry(1, 1, 1, 5)
      );
      const vertexCount = geometry.attributes.position.count;
      const v1Arr = new Float32Array(vertexCount * 4);
      const v2Arr = new Float32Array(vertexCount * 4);
      for (let i = 0; i < vertexCount; i++) {
        v1Arr.set([x1, y1, z1, w1], i * 4);
        v2Arr.set([x2, y2, z2, w2], i * 4);
      }
      geometry.setAttribute('v1', new THREE.Float32BufferAttribute(v1Arr, 4));
      geometry.setAttribute('v2', new THREE.Float32BufferAttribute(v2Arr, 4));

      const cylinder = new THREE.Mesh(geometry, defaultCylinderMaterial);
      wireframeGroup.add(cylinder);

      if (!uniquePoints.has(startKey)) {
        const sphere = create4DSphereMesh(
          start,
          defaultSphereMaterial
        );
        verticesGroup.add(sphere);
        uniquePoints.add(startKey);
      }

      if (!uniquePoints.has(endKey)) {
        const sphere = create4DSphereMesh(
          end,
          defaultSphereMaterial
        );
        verticesGroup.add(sphere);
        uniquePoints.add(endKey);
      }
    });

    return {
      wireframeGroup,
      verticesGroup
    };
  }

  /**
   * 加载并显示 3D 网格模型。
   * @param {object} meshData - 包含 `vertices` (THREE.Vector3 数组)、`faces` (索引数组) 和 `edges` (边对数组) 的网格数据。
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
    meshData.faces.forEach(face => {
      if (face.length === 3) indices.push(...face);
    });
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    this.scaleFactor = 40 / getFarthestPointDist(meshData.vertices);

    const { wireframeGroup, verticesGroup } = this.createWireframeAndVertices(
      meshData.edges,
      { cylinderRadius: 0.5 / this.scaleFactor }
    );

    container.add(mesh);
    container.add(wireframeGroup);
    container.add(verticesGroup);
    container.scale.setScalar(this.scaleFactor);

    this.scene.add(container);
    this.render();

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
   * @param {object} meshData - 包含 `vertices` (带有w坐标的对象数组)、`faces` (索引数组) 和 `edges` (边对数组) 的网格数据。
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
    geometry.setAttribute('position4D', new THREE.BufferAttribute(vertices4D, 4));

    const indices = [];
    meshData.faces.forEach(face => {
      if (face.length === 3) indices.push(...face);
    });
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    this.projectionDistanceSlider.value =
      getFarthest4DPointDist(meshData.vertices) * 1.1;
    this.updateProjectionDistance();
    this.scaleFactor =
      40 /
      getFarthestPointDist(
        meshData.vertices.map(p => {
          const d = +this.projectionDistanceSlider.value;
          const s = d / (d + p.w);

          return { x: p.x * s, y: p.y * s, z: p.z * s };
        })
      );

    const { wireframeGroup, verticesGroup } = this.create4DWireframeAndVertices(
      meshData.edges,
    );

    container.add(mesh);
    container.add(wireframeGroup);
    container.add(verticesGroup);
    container.scale.setScalar(this.scaleFactor);

    this.scene.add(container);
    this.render();

    return {
      scaleFactor: this.scaleFactor,
      solidGroup: container,
      facesGroup: mesh,
      wireframeGroup,
      verticesGroup
    };
  }

  /**
   * 从 OFF 格式的字符串数据加载 3D 网格模型。
   * @param {string} data - OFF 格式的字符串数据。
   * @param {THREE.Material} material - 用于模型面的 THREE.Material 实例。
   */
  loadMeshFromOffData(data, material) {
    const mesh = parseOFF(data);
    const processedMesh = processMeshData(mesh);

    const { scaleFactor, solidGroup, facesGroup, wireframeGroup, verticesGroup } =
      this.loadMesh(processedMesh, material);

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
  loadMeshFrom4OffData(data, material) {
    const mesh = parse4OFF(data);
    const processedMesh = process4DMeshData(mesh);

    material = shaderCompCallback.faceMaterial(material, this.rotUni, this.projDistUni);

    const { scaleFactor, solidGroup, facesGroup, wireframeGroup, verticesGroup } =
      this.load4DMesh(processedMesh, material);

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
        .then(data => {
          this.loadMeshFromOffData(data, material);
          resolve();
        });
    });
  }

  /**
   * 根据 UI 控件的状态更新模型的可见性、不透明度以及线框和顶点的尺寸。
   */
  updateProperties() {
    changeMaterialProperty(this.facesGroup, 'visible', this.faceVisibleSwitcher.checked);
    changeMaterialProperty(
      this.wireframeGroup,
      'visible',
      this.wireframeVisibleSwitcher.checked
    );
    changeMaterialProperty(
      this.verticesGroup,
      'visible',
      this.verticesVisibleSwitcher.checked
    );
    if (this.axesGroup) { // 确保 axesGroup 已加载
      changeMaterialProperty(this.axesGroup, 'visible', this.axisVisibleSwitcher.checked);
    }
    changeMaterialProperty(this.facesGroup, 'opacity', +this.facesOpacitySlider.value);
    
    this.cylinderRadiusUni.value = +this.wireframeAndVerticesDimSlider.value / this.scaleFactor;
    this.sphereRadiusUni.value = +this.wireframeAndVerticesDimSlider.value * 2 / this.scaleFactor;
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
    this.rotUni.value = rotations;

    if (!this.is4D) {
      // 只有在 3D 模式下才直接修改 solidGroup 的旋转
      if (this.solidGroup) {
        this.solidGroup.rotation.x = rotations[3] * (Math.PI / -180);
        this.solidGroup.rotation.y = rotations[1] * (Math.PI / 180);
        this.solidGroup.rotation.z = rotations[0] * (Math.PI / -180);
      }
    }
  }

  /**
   * 切换当前使用的摄像机类型（透视或正交），并保持其位置和方向。
   */
  toggleCamera() {
    const isPersp = this.perspSwitcher.checked;
    const oldCamera = this.camera.clone();

    if (isPersp) {
      this.camera = this.cameraPersp.clone();
      this.camera.position.copy(oldCamera.position);
      this.camera.rotation.copy(oldCamera.rotation);
      this.camera.quaternion.copy(oldCamera.quaternion);
    } else {
      this.camera = this.cameraOrtho.clone();
      this.camera.position.copy(oldCamera.position);
      this.camera.rotation.copy(oldCamera.rotation);
      this.camera.quaternion.copy(oldCamera.quaternion);
    }

    this.controls.object = this.camera;
  }

  /**
   * 设置所有 UI 元素的事件监听器。
   * 使用箭头函数或 bind(this) 确保方法内部的 this 正确指向类实例。
   */
  setupEventListeners() {
    this.faceVisibleSwitcher.addEventListener('change', () =>
      changeMaterialProperty(this.facesGroup, 'visible', this.faceVisibleSwitcher.checked)
    );
    this.wireframeVisibleSwitcher.addEventListener('change', () =>
      changeMaterialProperty(
        this.wireframeGroup,
        'visible',
        this.wireframeVisibleSwitcher.checked
      )
    );
    this.verticesVisibleSwitcher.addEventListener('change', () =>
      changeMaterialProperty(
        this.verticesGroup,
        'visible',
        this.verticesVisibleSwitcher.checked
      )
    );
    this.axisVisibleSwitcher.addEventListener('change', () =>
      changeMaterialProperty(this.axesGroup, 'visible', this.axisVisibleSwitcher.checked)
    );
    this.facesOpacitySlider.addEventListener('input', () =>
      changeMaterialProperty(this.facesGroup, 'opacity', +this.facesOpacitySlider.value)
    );
    this.wireframeAndVerticesDimSlider.addEventListener('input', () => {
      this.cylinderRadiusUni.value = +this.wireframeAndVerticesDimSlider.value / this.scaleFactor;
      this.sphereRadiusUni.value = +this.wireframeAndVerticesDimSlider.value * 2 / this.scaleFactor;
    });

    this.projectionDistanceSlider.addEventListener('input', this.updateProjectionDistance.bind(this));

    this.rotationSliders.forEach((slider, i) => {
      slider.addEventListener('input', () => {
        this.rotUni.value[i] = +slider.value;

        if (!this.is4D) {
          if (this.solidGroup) { // 确保 solidGroup 存在
            if (i === 3) this.solidGroup.rotation.x = +slider.value * (Math.PI / -180);
            else if (i === 1) this.solidGroup.rotation.y = +slider.value * (Math.PI / 180);
            else if (i === 0)
              this.solidGroup.rotation.z = +slider.value * (Math.PI / -180);
          }
        }
      });
    });

    this.perspSwitcher.addEventListener('change', this.toggleCamera.bind(this));

    this.fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
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
        disposeGroup(this.solidGroup);
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
        flatShading: true,
        transparent: true
      });

      if (this.is4D) {
        this.loadMeshFrom4OffData(data, material);
        this.projectionDistanceSlider.disabled = false;
        this.rotationSliders[2].disabled = false;
        this.rotationSliders[4].disabled = false;
        this.rotationSliders[5].disabled = false;
      } else {
        this.loadMeshFromOffData(data, material);
        this.projectionDistanceSlider.disabled = true;
        this.rotationSliders[2].disabled = true;
        this.rotationSliders[4].disabled = true;
        this.rotationSliders[5].disabled = true;
        this.rotationSliders[2].value = 0;
        this.rotationSliders[4].value = 0;
        this.rotationSliders[5].value = 0;
        this.updateRotation();
      }
    };
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PolyhedronRendererApp();
});