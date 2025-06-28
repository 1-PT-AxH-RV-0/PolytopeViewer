import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

// 导入外部辅助函数和模块
import createAxes from './axesCreater.js';
import shaderCompCallback from './shaderCompCallback.js';
import * as helperFunc from './helperFunc.js';
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
    this.schleSwitcher = null;
    this.scaleFactorSlider = null;
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
    this.isOrthoUni = { value: 0 };
    this.cylinderRadiusUni = { value: 0.5 };
    this.sphereRadiusUni = { value: 1.0 };

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

    this.axesGroup = await createAxes(this.scene, this.rotUni);

    const initialMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      specular: 0x222222,
      shininess: 50,
      flatShading: true
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
    this.wireframeVisibleSwitcher = document.getElementById(
      'wireframeVisibleSwitcher'
    );
    this.verticesVisibleSwitcher = document.getElementById(
      'verticesVisibleSwitcher'
    );
    this.axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher');
    this.perspSwitcher = document.getElementById('perspSwitcher');
    this.schleSwitcher = document.getElementById('schleSwitcher');
    this.scaleFactorSlider = document.getElementById('scaleFactorSlider');
    this.facesOpacitySlider = document.getElementById('facesOpacitySlider');
    this.wireframeAndVerticesDimSlider = document.getElementById(
      'wireframeAndVerticesDimSlider'
    );
    this.projectionDistanceSlider = document.getElementById(
      'projectionDistanceSlider'
    );
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
    this.cameraOrtho = new THREE.OrthographicCamera(
      -60,
      60,
      60,
      -60,
      0.01,
      500
    );
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
    this.controls = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
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
   * @param {THREE.Material} [options.cylinderMaterial] - 用于圆柱体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {THREE.Material} [options.sphereMaterial] - 用于球体的 THREE.Material 实例。如果未提供，将使用默认材质。
   * @param {number} [options.cylinderColor=0xc0c0c0] - 如果未提供 `cylinderMaterial`，圆柱体的十六进制颜色。
   * @param {number} [options.sphereColor=0xffd700] - 如果未提供 `sphereMaterial`，球体的十六进制颜色。
   * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 包含线框组和顶点组的对象。
   */
  createWireframeAndVertices(
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

    defaultCylinderMaterial = shaderCompCallback.cylinderMaterial3D(
      defaultCylinderMaterial,
      this.cylinderRadiusUni
    );
    defaultSphereMaterial = shaderCompCallback.sphereMaterial3D(
      defaultSphereMaterial,
      this.sphereRadiusUni
    );

    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1, false);
    const cylinderInstances = new THREE.InstancedMesh(
      cylinderGeometry,
      defaultCylinderMaterial,
      edges.length
    );

    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphereInstances = new THREE.InstancedMesh(
      sphereGeometry,
      defaultSphereMaterial,
      edges.length * 2
    ); // 最多可能需要边数×2的顶点
    sphereInstances.count = 0; // 初始为0，后面会递增

    const uniquePoints = new Set();
    const dummy = new THREE.Object3D();

    edges.forEach(([start, end], index) => {
      const startKey = `${start.x},${start.y},${start.z}`;
      const endKey = `${end.x},${end.y},${end.z}`;

      const startVec = new THREE.Vector3(start.x, start.y, start.z);
      const endVec = new THREE.Vector3(end.x, end.y, end.z);
      const direction = new THREE.Vector3().subVectors(endVec, startVec);
      const length = direction.length();

      dummy.position.copy(
        new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
      );
      dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
      );
      dummy.scale.set(1, length, 1); // 通过缩放Y轴来调整长度
      dummy.updateMatrix();
      cylinderInstances.setMatrixAt(index, dummy.matrix);

      if (!uniquePoints.has(startKey)) {
        dummy.position.copy(startVec);
        dummy.scale.set(1, 1, 1);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        sphereInstances.setMatrixAt(sphereInstances.count++, dummy.matrix);
        uniquePoints.add(startKey);
      }

      if (!uniquePoints.has(endKey)) {
        dummy.position.copy(endVec);
        dummy.scale.set(1, 1, 1);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        sphereInstances.setMatrixAt(sphereInstances.count++, dummy.matrix);
        uniquePoints.add(endKey);
      }
    });

    cylinderInstances.instanceMatrix.needsUpdate = true;
    sphereInstances.instanceMatrix.needsUpdate = true;

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    wireframeGroup.add(cylinderInstances);
    verticesGroup.add(sphereInstances);

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
        roughness: 0.4,
        side: THREE.DoubleSide
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
      this.projDistUni,
      this.isOrthoUni
    );
    defaultSphereMaterial = shaderCompCallback.sphereMaterial(
      defaultSphereMaterial,
      this.sphereRadiusUni,
      this.rotUni,
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
      new THREE.CylinderGeometry(1, 1, 1, 5)
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
      new THREE.SphereGeometry(1, 5, 5)
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
    geometry.setAttribute(
      'position4D',
      new THREE.BufferAttribute(vertices4D, 4)
    );

    const indices = [];
    meshData.faces.forEach(face => {
      if (face.length === 3) indices.push(...face);
    });
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    this.projectionDistanceSlider.value =
      helperFunc.getFarthest4DPointDist(meshData.vertices) * 1.1;
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
  loadMeshFrom4OffData(data, material) {
    const mesh = parse4OFF(data);
    const processedMesh = process4DMeshData(mesh);

    material = shaderCompCallback.faceMaterial(
      material,
      this.rotUni,
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
      +this.facesOpacitySlider.value
    );
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'transparent',
      +this.facesOpacitySlider.value !== 1
    );

    this.cylinderRadiusUni.value =
      +this.wireframeAndVerticesDimSlider.value / this.scaleFactor;
    this.sphereRadiusUni.value =
      (+this.wireframeAndVerticesDimSlider.value / this.scaleFactor) * 2;
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
    this.facesOpacitySlider.addEventListener('input', () => {
      helperFunc.changeMaterialProperty(
        this.facesGroup,
        'opacity',
        +this.facesOpacitySlider.value
      );
      helperFunc.changeMaterialProperty(
        this.facesGroup,
        'transparent',
        +this.facesOpacitySlider.value !== 1
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
        this.rotUni.value[i] = +slider.value;

        if (!this.is4D && this.solidGroup) {
          if (i === 3)
            this.solidGroup.rotation.x = +slider.value * (Math.PI / -180);
          else if (i === 1)
            this.solidGroup.rotation.y = +slider.value * (Math.PI / 180);
          else if (i === 0)
            this.solidGroup.rotation.z = +slider.value * (Math.PI / -180);
        }
      });
    });

    this.perspSwitcher.addEventListener('change', this.toggleCamera.bind(this));
    this.schleSwitcher.addEventListener(
      'change',
      () => (this.isOrthoUni.value = !this.schleSwitcher.checked)
    );

    this.fileInput.addEventListener(
      'change',
      this.handleFileInputChange.bind(this)
    );
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
        this.loadMeshFrom4OffData(data, material);
        this.projectionDistanceSlider.disabled = false;
        this.schleSwitcher.disabled = false;
        this.rotationSliders[2].disabled = false;
        this.rotationSliders[4].disabled = false;
        this.rotationSliders[5].disabled = false;
      } else {
        this.loadMeshFromOffData(data, material);
        this.projectionDistanceSlider.disabled = true;
        this.schleSwitcher.disabled = true;
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
