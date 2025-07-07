import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import shaderCompCallback from './shaderCompCallback.js';
import { toBufferGeometry } from './helperFunc.js';
import fontUrl from '../assets/fonts/Sarasa_Mono_SC_Bold.typeface.json';

const axisLength = 100;
const cylinderRadius = 0.5;
const coneRadius = 2;
const coneHeight = 6;
const textSize = 5;
const textOffset = 7;

/**
 * 创建标准材质。
 * @param {number} color - 材质颜色。
 * @returns {THREE.MeshStandardMaterial} 标准材质对象。
 */
function createMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.3,
    metalness: 0.0,
    flatShading: true
  });
}

/**
 * 异步加载字体。
 * @param {string} url - 字体文件URL。
 * @returns {Promise<THREE.Font>} 返回加载完成的字体对象。
 */
function loadFontAsync(url) {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(
      url,
      font => resolve(font),
      undefined,
      error => reject(error)
    );
  });
}

/**
 * 创建坐标轴圆柱体网格。
 * @param {number} axis - 坐标轴索引 (0:X, 1:Y, 2:Z, 3:W)。
 * @param {number} color - 圆柱体颜色。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵的 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Mesh} 圆柱体网格对象
 */
function createAxisCylinderMesh(
  axis,
  color,
  rotUni,
  ofsUni,
  ofs3Uni,
  offsetScaleUni
) {
  const geometry = toBufferGeometry(
    new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 10)
  );
  const vertexCount = geometry.attributes.position.count;
  const axisArr = new Uint32Array(vertexCount);
  const lenArr = new Float32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    axisArr[i] = axis;
    lenArr[i] = axisLength / 2;
  }
  geometry.setAttribute('axis', new THREE.Uint32BufferAttribute(axisArr, 1));
  geometry.setAttribute('len', new THREE.Float32BufferAttribute(lenArr, 1));

  let material = createMaterial(color);
  material = shaderCompCallback.axisMaterial(
    material,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const cylinder = new THREE.Mesh(geometry, material);

  return cylinder;
}

/**
 * 创建坐标轴圆锥体网格
 * @param {number} axis - 坐标轴索引 (0:X, 1:Y, 2:Z, 3:W)。
 * @param {number} color - 圆锥体颜色。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵的 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Mesh} 圆锥体网格对象。
 */
function createAxisConeMesh(
  axis,
  color,
  rotUni,
  ofsUni,
  ofs3Uni,
  offsetScaleUni
) {
  const geometry = toBufferGeometry(new THREE.ConeGeometry(coneRadius, 1, 10));
  const vertexCount = geometry.attributes.position.count;
  const axisArr = new Uint32Array(vertexCount);
  const lenArr = new Float32Array(vertexCount);
  const heightArr = new Float32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    axisArr[i] = axis;
    lenArr[i] = axisLength / 2;
    heightArr[i] = coneHeight;
  }
  geometry.setAttribute('axis', new THREE.Uint32BufferAttribute(axisArr, 1));
  geometry.setAttribute('len', new THREE.Float32BufferAttribute(lenArr, 1));
  geometry.setAttribute(
    'height',
    new THREE.Float32BufferAttribute(heightArr, 1)
  );

  let material = createMaterial(color);
  material = shaderCompCallback.axisConeMaterial(
    material,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const cone = new THREE.Mesh(geometry, material);

  return cone;
}

/**
 * 创建坐标轴标签网格
 * @param {number} axis - 坐标轴索引 (0:X, 1:Y, 2:Z, 3:W)。
 * @param {number} color - 标签颜色。
 * @param {string} text - 标签文本。
 * @param {THREE.Font} font - 字体对象。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵的 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Mesh} 标签网格对象。
 */
function createAxisLabelMesh(
  axis,
  color,
  text,
  font,
  rotUni,
  ofsUni,
  ofs3Uni,
  offsetScaleUni
) {
  const geometry = toBufferGeometry(
    new TextGeometry(text, {
      font: font,
      size: textSize,
      depth: cylinderRadius * 2,
      curveSegments: 12
    })
  );

  geometry.computeBoundingBox();
  geometry.center();

  const vertexCount = geometry.attributes.position.count;
  const axisArr = new Uint32Array(vertexCount);
  const lenArr = new Float32Array(vertexCount);
  const offsetArr = new Float32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    axisArr[i] = axis;
    lenArr[i] = axisLength / 2;
    offsetArr[i] = coneHeight + textOffset;
  }
  geometry.setAttribute('axis', new THREE.Uint32BufferAttribute(axisArr, 1));
  geometry.setAttribute('len', new THREE.Float32BufferAttribute(lenArr, 1));
  geometry.setAttribute(
    'offset',
    new THREE.Float32BufferAttribute(offsetArr, 1)
  );

  let material = createMaterial(color);
  material = shaderCompCallback.axisLabelMaterial(
    material,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const label = new THREE.Mesh(geometry, material);

  return label;
}

/**
 * 创建坐标轴系统。
 * @param {THREE.Scene} scene - 场景对象。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵的 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {Promise<THREE.Group>} 包含所有坐标轴元素的组对象。
 */
async function createAxes(scene, rotUni, ofsUni, ofs3Uni, offsetScaleUni) {
  const font = await loadFontAsync(fontUrl);
  const container = new THREE.Group();

  const cylinderX = createAxisCylinderMesh(
    0,
    0xff0000,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const coneX = createAxisConeMesh(
    0,
    0xff0000,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const labelX = createAxisLabelMesh(
    0,
    0xff0000,
    'X',
    font,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const cylinderY = createAxisCylinderMesh(
    1,
    0x00ff00,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const coneY = createAxisConeMesh(
    1,
    0x00ff00,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const labelY = createAxisLabelMesh(
    1,
    0x00ff00,
    'Y',
    font,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const cylinderZ = createAxisCylinderMesh(
    2,
    0x0000ff,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const coneZ = createAxisConeMesh(
    2,
    0x0000ff,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const labelZ = createAxisLabelMesh(
    2,
    0x0000ff,
    'Z',
    font,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  const cylinderW = createAxisCylinderMesh(
    3,
    0xf07026,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const coneW = createAxisConeMesh(
    3,
    0xf07026,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );
  const labelW = createAxisLabelMesh(
    3,
    0xf07026,
    'W',
    font,
    rotUni,
    ofsUni,
    ofs3Uni,
    offsetScaleUni
  );

  container.add(cylinderX, coneX, labelX);
  container.add(cylinderY, coneY, labelY);
  container.add(cylinderZ, coneZ, labelZ);
  container.add(cylinderW, coneW, labelW);
  scene.add(container);

  return container;
}

export default createAxes;
