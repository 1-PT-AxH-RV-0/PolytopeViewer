import * as THREE from 'three';
import * as helperFunc from '../helperFunc.js';
import shaderCompCallback from '../shaderCompCallback.js';
import * as type from '../type.js';

export function createWireframeAndVertices(
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

export function create4DWireframeAndVertices(
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
