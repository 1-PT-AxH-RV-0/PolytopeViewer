import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

import shaderFuncs from './GLSLs.js'
import { createSphereGeometry, createCylinderGeometry, create4DSphereMesh } from './geometries.js'
import { processMeshData, parseOFF } from './offProcessor.js'
import { process4DMeshData, parse4OFF } from './offProcessor4D.js'
import url from '../assets/models/tri.off'
import fontUrl from '../assets/fonts/Sarasa_Mono_SC_Bold.typeface.json'

const faceVisibleSwitcher = document.getElementById('faceVisibleSwitcher')
const wireframeVisibleSwitcher = document.getElementById('wireframeVisibleSwitcher')
const verticesVisibleSwitcher = document.getElementById('verticesVisibleSwitcher')
const axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher')
const facesOpacitySlider = document.getElementById('facesOpacitySlider')
const wireframeAndVerticesDimSlider = document.getElementById('wireframeAndVerticesDimSlider')
const projectionDistanceSlider = document.getElementById('projectionDistanceSlider')
const fileInput = document.getElementById('fileInput')

const rotationSliders = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'].map(i => document.getElementById(`rot${i}Slider`));

let scaleFactor, axis, solidGroup, facesGroup, wireframeGroup, verticesGroup, facesMaterial, cylinderMaterial, sphereMaterial;

// 初始化渲染器
const dpr = window.devicePixelRatio || 1;
const canvas = document.getElementById('polyhedronRenderer');

const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance",
  canvas: canvas
});

const maxSize = Math.min(
  Math.min(window.innerWidth, window.innerHeight) - 16, 
  720
);

renderer.setSize(maxSize * dpr, maxSize * dpr, false);

canvas.style.width = `${maxSize}px`;
canvas.style.height = `${maxSize}px`;
canvas.style.display = 'block';

window.addEventListener('resize', () => {
  const newMaxSize = Math.min(
    Math.min(window.innerWidth, window.innerHeight) - 16, 
    720
  );
  
  renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
  
  canvas.style.width = `${newMaxSize}px`;
  canvas.style.height = `${newMaxSize}px`;
});

// 添加场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// 配置摄像头
const camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
camera.position.z = 120;
let isPersp = true;

// 配置控制器
const controls = new TrackballControls(camera, renderer.domElement);
controls.dynamicDampingFactor = 0.8;
controls.rotateSpeed = 4.0;
controls.maxDistance = 150.0;
controls.minDistance = 0.1;
controls.noPan = true;

// 渲染循环
renderer.setAnimationLoop(render);
function render() {
    controls.update();
    renderer.render( scene, camera );
}

//添加坐标轴
const axisLength = 100;
const cylinderRadius = 0.5;
const coneRadius = 1;
const coneHeight = 3;
const textSize = 5;
const textOffset = 5;

// 加载字体
function loadFontAsync(url) {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(
      url,
      (font) => resolve(font),
      undefined,
      (error) => reject(error)
    );
  });
}

// 创建材质
function createMaterial(color) {
    return new THREE.MeshPhongMaterial({ 
        color: color, 
        shininess: 40 
    });
}

// 创建坐标轴圆柱
function createAxis(color, rotationAxis, rotationAngle) {
    const geometry = new THREE.CylinderGeometry(
        cylinderRadius,
        cylinderRadius,
        axisLength,
        32
    );
    
    if (rotationAxis && rotationAngle) {
        if (rotationAxis[0] === 1) geometry.rotateX(rotationAngle);
        else if (rotationAxis[1] === 1) geometry.rotateY(rotationAngle);
        else if (rotationAxis[2] === 1) geometry.rotateZ(rotationAngle);
    }
    
    return new THREE.Mesh(geometry, createMaterial(color));
}

// 创建箭头
function createArrow(color, position, rotation) {
    const geometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
    const mesh = new THREE.Mesh(geometry, createMaterial(color));
    
    mesh.position.set(...position);
    if (rotation) mesh.setRotationFromEuler(new THREE.Euler(...rotation));
    
    return mesh;
}

// 创建坐标轴标签
function createAxisLabel(text, color, font, position, axisDirection) {
    const geometry = new TextGeometry(text, {
        font: font,
        size: textSize,
        depth: cylinderRadius * 2,
        curveSegments: 12
    });

    geometry.computeBoundingBox();
    geometry.center();
    
    const mesh = new THREE.Mesh(geometry, createMaterial(color));
    mesh.position.set(...position);
    
    if (axisDirection === 'y') {
        mesh.rotation.y = Math.PI / 4;
    } else if (axisDirection === 'z') {
        mesh.rotation.y = Math.PI / 2;
    }
    
    return mesh;
}

// 创建完整坐标轴系统
async function createAxes(scene) {
    const font = await loadFontAsync(fontUrl)
    const container = new THREE.Group();
    
    // X轴（红色）
    const xAxis = createAxis(0xff0000, [0, 0, 1], Math.PI / 2);
    // X轴箭头
    const xArrow = createArrow(
        0xff0000,
        [axisLength / 2, 0, 0],
        [0, 0, -Math.PI / 2]
    );
    // X轴标签
    const xLabel = await createAxisLabel(
        'X',
        0xff0000,
        font,
        [axisLength / 2 + textOffset, 0, 0],
        'x'
    );

    // Y轴（绿色）
    const yAxis = createAxis(0x00ff00);
    // Y轴箭头
    const yArrow = createArrow(
        0x00ff00,
        [0, axisLength / 2, 0]
    );
    // Y轴标签
    const yLabel = await createAxisLabel(
        'Y',
        0x00ff00,
        font,
        [0, axisLength / 2 + textOffset, 0],
        'y'
    );

    // Z轴（蓝色）
    const zAxis = createAxis(0x0000ff, [1, 0, 0], Math.PI / 2);
    // Z轴箭头
    const zArrow = createArrow(
        0x0000ff,
        [0, 0, axisLength / 2],
        [Math.PI / 2, 0, 0]
    );
    // Z轴标签
    const zLabel = await createAxisLabel(
        'Z',
        0x0000ff,
        font,
        [0, 0, axisLength / 2 + textOffset],
        'z'
    );
    
    container.add(xAxis, xArrow, xLabel)
    container.add(yAxis, yArrow, yLabel)
    container.add(zAxis, zArrow, zLabel)
        
    scene.add(container)
    return container
}
(async () => {
  axis = await createAxes(scene)
})()


// 添加光源
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0.5, 0.6, 0.4).normalize();
directionalLight.intensity = 7;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x222222);
ambientLight.intensity = 100;
scene.add(ambientLight);

const backLight = new THREE.DirectionalLight(0xddddea, 0.9);
backLight.intensity = 8;
backLight.position.set(-0.5, -0.6, -0.4).normalize();
backLight.castShadow = true;
backLight.shadow.mapSize.width = 2048;
backLight.shadow.mapSize.height = 2048;
scene.add(backLight);

// 创建边和顶点
function createWireframeAndVertices(edges, { 
    cylinderRadius = 1,
    sphereRadiusMultiplier = 2,
    cylinderMaterial,
    sphereMaterial,
    cylinderColor = 0xC0C0C0,
    sphereColor = 0xffd700
} = {}) {
    const defaultCylinderMaterial = cylinderMaterial || new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 1.0,
        roughness: 0.4
    });

    const defaultSphereMaterial = sphereMaterial || new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.5
    });

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
            new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, length, 8, 1, false),
            defaultCylinderMaterial
        );

        cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
        );
        cylinder.position.copy(new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5));
        wireframeGroup.add(cylinder);

        if (!uniquePoints.has(startKey)) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(sphereRadius, 16, 16),
                defaultSphereMaterial
            );
            sphere.position.copy(startVec);
            verticesGroup.add(sphere);
            uniquePoints.add(startKey);
        }

        if (!uniquePoints.has(endKey)) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(sphereRadius, 16, 16),
                defaultSphereMaterial
            );
            sphere.position.copy(endVec);
            verticesGroup.add(sphere);
            uniquePoints.add(endKey);
        }
    });

    return { wireframeGroup, verticesGroup };
}

function create4DWireframeAndVertices(edges, { 
    cylinderRadius = 1,
    sphereRadiusMultiplier = 2,
    cylinderMaterial,
    sphereMaterial,
    cylinderColor = 0xC0C0C0,
    sphereColor = 0xffd700
} = {}) {
    const defaultCylinderMaterial = cylinderMaterial || new THREE.MeshStandardMaterial({
        color: cylinderColor,
        metalness: 1.0,
        roughness: 0.4
    });

    const defaultSphereMaterial = sphereMaterial || new THREE.MeshStandardMaterial({
        color: sphereColor,
        metalness: 1.0,
        roughness: 0.5
    });
        
    defaultSphereMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.projectionDistance = { value: 2.0 }
      shader.uniforms.rotation4D = { value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
      defaultSphereMaterial.userData.projectionDistance = shader.uniforms.projectionDistance;
      defaultSphereMaterial.userData.rotation4D = shader.uniforms.rotation4D;
    
      shader.vertexShader = `
        attribute vec4 center4D;
        ${shaderFuncs.schlegelProjection}
        ${shaderFuncs.create4DRotationMat}
        ${shaderFuncs.rotationArrUni}
        ${shader.vertexShader}
      `;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vec3 center3D = schlegelProjection(create4DRotationMat(rotation4D) * center4D);
        transformed = transformed + center3D;
        `
      );
    };
    
    defaultCylinderMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.projectionDistance = { value: 2.0 }
      shader.uniforms.rotation4D = { value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
      defaultCylinderMaterial.userData.projectionDistance = shader.uniforms.projectionDistance;
      defaultCylinderMaterial.userData.rotation4D = shader.uniforms.rotation4D;
      
      shader.vertexShader = `
        attribute vec4 v1;
        attribute vec4 v2;
        ${shaderFuncs.schlegelProjection}
        ${shaderFuncs.create4DRotationMat}
        ${shaderFuncs.rotationArrUni}
        ${shaderFuncs.transformCylinderPoint}
        ${shader.vertexShader}
      `;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        mat4 rotMat = create4DRotationMat(rotation4D);
        vec3 pv1 = schlegelProjection(rotMat * v1);
        vec3 pv2 = schlegelProjection(rotMat * v2);
        transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), pv1, pv2);
        `
      );
    };

    const wireframeGroup = new THREE.Group();
    const verticesGroup = new THREE.Group();
    const uniquePoints = new Set();

    const sphereRadius = cylinderRadius * sphereRadiusMultiplier;

    edges.forEach(([start, end]) => {
        const startKey = `${start.x},${start.y},${start.z},${start.w}`;
        const endKey = `${end.x},${end.y},${end.z},${end.w}`;
        
        const {x: x1, y: y1, z: z1, w: w1} = start;
        const {x: x2, y: y2, z: z2, w: w2} = end;

        const geometry = createCylinderGeometry(cylinderRadius)
        const vertexCount = geometry.attributes.position.count;
        const v1Arr = new Float32Array(vertexCount * 4)
        const v2Arr = new Float32Array(vertexCount * 4)
        for (let i = 0; i < vertexCount; i++) {
          v1Arr.set([x1, y1, z1, w1], i * 4)
          v2Arr.set([x2, y2, z2, w2], i * 4)
        }
        geometry.setAttribute('v1', new THREE.Float32BufferAttribute(v1Arr, 4));
        geometry.setAttribute('v2', new THREE.Float32BufferAttribute(v2Arr, 4));
        
        const cylinder = new THREE.Mesh(
            geometry,
            defaultCylinderMaterial
        );
        wireframeGroup.add(cylinder);
        
        if (!uniquePoints.has(startKey)) {
            const sphere = create4DSphereMesh(start, sphereRadius, defaultSphereMaterial);
            verticesGroup.add(sphere);
            uniquePoints.add(startKey);
        }
        
        if (!uniquePoints.has(endKey)) {
            const sphere = create4DSphereMesh(end, sphereRadius, defaultSphereMaterial);
            verticesGroup.add(sphere);
            uniquePoints.add(endKey);
        }
    });

    return { wireframeGroup, verticesGroup, cylinderMaterial: defaultCylinderMaterial, sphereMaterial: defaultSphereMaterial };
}

// 修改材质属性
function changeMaterialProperty(group, propertyName, newValue) {
    if (!group) return;
    group.traverse((child) => {
        if (child.isMesh && child.material) {
            if (!Array.isArray(child.material)) {
                child.material[propertyName] = newValue;
                child.material.needsUpdate = true;
            } 
            else {
                for (let material of child.material) {
                    material[propertyName] = newValue;
                    material.needsUpdate = true;
                }
            }
        }
    });
}

// 修改球体半径
function changeSpheresRadius(group, newRadius) {
  if (!group) return;
  group.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
      child.geometry.dispose();
      child.geometry = new THREE.SphereGeometry(
        newRadius,
        child.geometry.parameters.widthSegments,
        child.geometry.parameters.heightSegments
      );
    } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
      const centerAttr = child.geometry.getAttribute('center4D');
      child.geometry.dispose();
      child.geometry = createSphereGeometry(
        newRadius,
        child.geometry.parameters.widthSegments,
        child.geometry.parameters.heightSegments
      );
      child.geometry.setAttribute('center4D', centerAttr)
    }
  });
}

// 修改圆柱半径
function changeCylindersRadius(group, newRadius) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.geometry instanceof THREE.CylinderGeometry) {
      const oldGeo = child.geometry;

      child.geometry.dispose();
      child.geometry = new THREE.CylinderGeometry(
        newRadius,
        newRadius,
        oldGeo.parameters.height,
        oldGeo.parameters.radialSegments,
        oldGeo.parameters.heightSegments
      );
    } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
      const v1Attr = child.geometry.getAttribute('v1');
      const v2Attr = child.geometry.getAttribute('v2');
      
      child.geometry.dispose();
      child.geometry = createCylinderGeometry(
        newRadius,
        1,
        child.geometry.parameters.radialSegments,
        child.geometry.parameters.heightSegments
      );
      child.geometry.setAttribute('v1', v1Attr)
      child.geometry.setAttribute('v2', v2Attr)
    }
  });
}

// 加载模型
function loadMesh(meshData, material) {
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
  geometry.computeBoundingBox();
  
  const aabb = geometry.boundingBox;
  const objSize = aabb.max.sub(aabb.min).length();
  const scaleFactor = 100 / objSize;
  
  const { wireframeGroup, verticesGroup } = createWireframeAndVertices(meshData.edges, { cylinderRadius: 0.5 / scaleFactor })
  
  container.add(mesh);
  container.add(wireframeGroup);
  container.add(verticesGroup);
  container.scale.setScalar(scaleFactor)
  
  scene.add(container);
  render();
  
  return {scaleFactor, solidGroup: container, facesGroup: mesh, wireframeGroup, verticesGroup};
}

function load4DMesh(meshData, material) {
  const container = new THREE.Object3D();
  const geometry = new THREE.BufferGeometry();
  
  // 这里 position 属性虽然没有实际作用，但是必须得写，防止着色器报错
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
  geometry.computeBoundingBox();
  
  const aabb = geometry.boundingBox;
  const objSize = aabb.max.sub(aabb.min).length();
  const scaleFactor = 100 / objSize;
  
  const { wireframeGroup, verticesGroup, cylinderMaterial, sphereMaterial } = create4DWireframeAndVertices(meshData.edges, { cylinderRadius: 0.5 / scaleFactor })
  
  container.add(mesh);
  container.add(wireframeGroup);
  container.add(verticesGroup);
  container.scale.setScalar(scaleFactor)
  
  scene.add(container);
  render();
  
  return {scaleFactor, solidGroup: container, facesGroup: mesh, wireframeGroup, verticesGroup, cylinderMaterial, sphereMaterial };
}

// 加载 OFF
function loadMeshFromOffData(data, material) {
  const mesh = parseOFF(data)
  const processedMesh = processMeshData(mesh);

  ({ scaleFactor, solidGroup, facesGroup, wireframeGroup, verticesGroup } = loadMesh(processedMesh, material));
  updateProperties()
}

function loadMeshFrom4OffData(data, material) {
  const mesh = parse4OFF(data)
  const processedMesh = process4DMeshData(mesh);
  
  material.onBeforeCompile = (shader) => {
    shader.uniforms.projectionDistance = { value: 2.0 }
    shader.uniforms.rotation4D = { value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;
  
    shader.vertexShader = `
      attribute vec4 position4D;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shader.vertexShader}
    `;
    
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 rotatedPosition4D = create4DRotationMat(rotation4D) * position4D;
      transformed = schlegelProjection(rotatedPosition4D);
      `
    );
  };

  ({ scaleFactor, solidGroup, facesGroup, wireframeGroup, verticesGroup, cylinderMaterial, sphereMaterial } = load4DMesh(processedMesh, material));
  facesMaterial = material;
  updateProperties();
  updateProjectionDistance();
}

function loadMeshFromUrl(url, material) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        return response.text();
      })
      .then(data => {
        loadMeshFromOffData(data, material)
        resolve()
      })
  })
}

// 释放组
function disposeGroup(group) {
    group.traverse((child) => {
        if (child.isMesh) {
            child.geometry?.dispose();
            child.material?.dispose();
        }
    });
    group.clear();
}

const material = new THREE.MeshPhongMaterial({
    color: 0x555555,
    specular: 0x222222,
    shininess: 50,
    flatShading: true,
    transparent: true
});

loadMeshFromUrl(url, material)

// 事件监听
function updateProperties() {
  changeMaterialProperty(facesGroup, 'visible', faceVisibleSwitcher.checked)
  changeMaterialProperty(wireframeGroup, 'visible', wireframeVisibleSwitcher.checked)
  changeMaterialProperty(verticesGroup, 'visible', verticesVisibleSwitcher.checked)
  changeMaterialProperty(axis, 'visible', axisVisibleSwitcher.checked)
  changeMaterialProperty(facesGroup, 'opacity', +facesOpacitySlider.value)
  changeCylindersRadius(wireframeGroup, +wireframeAndVerticesDimSlider.value / scaleFactor)
  changeSpheresRadius(verticesGroup, +wireframeAndVerticesDimSlider.value / scaleFactor * 2)
}
faceVisibleSwitcher.addEventListener('change', () => changeMaterialProperty(facesGroup, 'visible', faceVisibleSwitcher.checked))
wireframeVisibleSwitcher.addEventListener('change', () => changeMaterialProperty(wireframeGroup, 'visible', wireframeVisibleSwitcher.checked))
verticesVisibleSwitcher.addEventListener('change', () => changeMaterialProperty(verticesGroup, 'visible', verticesVisibleSwitcher.checked))
axisVisibleSwitcher.addEventListener('change', () => changeMaterialProperty(axis, 'visible', axisVisibleSwitcher.checked))
facesOpacitySlider.addEventListener('input', () => changeMaterialProperty(facesGroup, 'opacity', +facesOpacitySlider.value))
wireframeAndVerticesDimSlider.addEventListener('input', () => {
  changeCylindersRadius(wireframeGroup, +wireframeAndVerticesDimSlider.value / scaleFactor)
  changeSpheresRadius(verticesGroup, +wireframeAndVerticesDimSlider.value / scaleFactor * 2)
})

function updateProjectionDistance() {
  facesMaterial.userData.projectionDistance.value = +projectionDistanceSlider.value;
  cylinderMaterial.userData.projectionDistance.value = +projectionDistanceSlider.value;
  sphereMaterial.userData.projectionDistance.value = +projectionDistanceSlider.value;
}
projectionDistanceSlider.addEventListener('input', updateProjectionDistance)
function updateRotation() {
  const rotations = rotationSliders.map(i => +i.value);
  facesMaterial.userData.rotation4D.value = rotations;
  cylinderMaterial.userData.rotation4D.value = rotations;
  sphereMaterial.userData.rotation4D.value = rotations;
}
rotationSliders.forEach((slider, i) => {
  slider.addEventListener('input', () => { 
    facesMaterial.userData.rotation4D.value[i] = +slider.value;
    cylinderMaterial.userData.rotation4D.value[i] = +slider.value;
    sphereMaterial.userData.rotation4D.value[i] = +slider.value;
  })
})

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = e.target.result;
        
        if (solidGroup) {
          disposeGroup(solidGroup)
          scene.remove(solidGroup)
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x555555,
            specular: 0x222222,
            shininess: 50,
            flatShading: true,
            transparent: true
        });
        
        loadMeshFrom4OffData(data, material)
    };
    reader.readAsText(file);
});
