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

function createMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.3,
    metalness: 0.0,
    flatShading: true
  });
}

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

function createAxisCylinderMesh(axis, color, rotUni) {
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
  material = shaderCompCallback.axisMaterial(material, rotUni);

  const cylinder = new THREE.Mesh(geometry, material);

  return cylinder;
}

function createAxisConeMesh(axis, color, rotUni) {
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
  material = shaderCompCallback.axisConeMaterial(material, rotUni);

  const cone = new THREE.Mesh(geometry, material);

  return cone;
}

function createAxisLabelMesh(axis, color, text, font, rotUni) {
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
  material = shaderCompCallback.axisLabelMaterial(material, rotUni);

  const label = new THREE.Mesh(geometry, material);

  return label;
}

async function createAxes(scene, rotUni) {
  const font = await loadFontAsync(fontUrl);
  const container = new THREE.Group();

  const cylinderX = createAxisCylinderMesh(0, 0xff0000, rotUni);
  const coneX = createAxisConeMesh(0, 0xff0000, rotUni);
  const labelX = createAxisLabelMesh(0, 0xff0000, 'X', font, rotUni);

  const cylinderY = createAxisCylinderMesh(1, 0x00ff00, rotUni);
  const coneY = createAxisConeMesh(1, 0x00ff00, rotUni);
  const labelY = createAxisLabelMesh(1, 0x00ff00, 'Y', font, rotUni);

  const cylinderZ = createAxisCylinderMesh(2, 0x0000ff, rotUni);
  const coneZ = createAxisConeMesh(2, 0x0000ff, rotUni);
  const labelZ = createAxisLabelMesh(2, 0x0000ff, 'Z', font, rotUni);

  const cylinderW = createAxisCylinderMesh(3, 0xf07026, rotUni);
  const coneW = createAxisConeMesh(3, 0xf07026, rotUni);
  const labelW = createAxisLabelMesh(3, 0xf07026, 'W', font, rotUni);

  container.add(cylinderX, coneX, labelX);
  container.add(cylinderY, coneY, labelY);
  container.add(cylinderZ, coneZ, labelZ);
  container.add(cylinderW, coneW, labelW);
  scene.add(container);

  return container;
}

export default createAxes;
