import * as THREE from 'three';
import * as helperFunc from '../helperFunc.js';
import shaderCompCallback from '../shaderCompCallback.js';
import * as types from '../type.js';

/**
 * 创建三维线框和顶点组。
 * 使用圆柱体表示边，球体表示顶点。
 * @this {types.PolytopeRendererApp}
 * @param {Array<types.Edge3D>} edges - 边数组，每条边包含两个端点。
 * @param {object} [options] - 配置选项。
 * @param {THREE.Material} [options.cylinderMaterial] - 圆柱体材质。
 * @param {THREE.Material} [options.sphereMaterial] - 球体材质。
 * @param {number} [options.cylinderColor] - 圆柱体颜色。
 * @param {number} [options.sphereColor] - 球体颜色。
 * @param {THREE.Vector3} [options.faceCenter] - 面中心位置（用于分离效果）。
 * @param {THREE.Vector3} [options.faceNormal] - 面法向量（用于分离效果）。
 * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 线框组和顶点组。
 */
export function createWireframeAndVertices(
  edges,
  {
    cylinderMaterial,
    sphereMaterial,
    cylinderColor = 0xb0c4de,
    sphereColor = 0xf2c3a7,
    faceCenter = new THREE.Vector3(0, 0, 0),
    faceNormal = new THREE.Vector3(0, 0, 0)
  } = {}
) {
  let defaultCylinderMaterial =
    cylinderMaterial ||
    new THREE.MeshStandardMaterial({
      color: cylinderColor,
      metalness: 1.0,
      roughness: 0.05
    });

  let defaultSphereMaterial =
    sphereMaterial ||
    new THREE.MeshStandardMaterial({
      color: sphereColor,
      metalness: 1.0,
      roughness: 0.05
    });

  defaultCylinderMaterial = shaderCompCallback.cylinderMaterial3D(
    defaultCylinderMaterial,
    this.cylinderRadiusUni,
    this.rotUni,
    this.ofs3Uni,
    this.separationDistUni,
    this.faceScaleUni,
    this.edgeScaleUni,
    { value: faceCenter },
    { value: faceNormal }
  );
  defaultSphereMaterial = shaderCompCallback.sphereMaterial3D(
    defaultSphereMaterial,
    this.sphereRadiusUni,
    this.rotUni,
    this.ofs3Uni,
    this.separationDistUni,
    this.faceScaleUni,
    this.edgeScaleUni,
    { value: faceCenter },
    { value: faceNormal }
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
  const midArr = new Float32Array(edges.length * 3);

  const sphereGeometry = helperFunc.toBufferGeometry(
    new THREE.SphereGeometry(1, 16, 16)
  );
  const sphereInstances = new THREE.InstancedMesh(
    sphereGeometry,
    defaultSphereMaterial,
    edges.length * 2
  );
  const posArr = [];
  const midVerticesArr = [];

  edges.forEach(([start, end], index) => {
    const startVec = new THREE.Vector3(start.x, start.y, start.z);
    const endVec = new THREE.Vector3(end.x, end.y, end.z);
    const midpoint = startVec.clone().lerp(endVec, 0.5);
    v1Arr.set(startVec.toArray(), index * 3);
    v2Arr.set(endVec.toArray(), index * 3);
    midArr.set(midpoint.toArray(), index * 3);

    posArr.push(...startVec.toArray());
    midVerticesArr.push(...midpoint.toArray());
    posArr.push(...endVec.toArray());
    midVerticesArr.push(...midpoint.toArray());
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
  cylinderGeometry.setAttribute(
    'midpoint',
    new THREE.InstancedBufferAttribute(midArr, 3)
  );
  sphereGeometry.setAttribute(
    'pos',
    new THREE.InstancedBufferAttribute(new Float32Array(posArr), 3)
  );
  sphereGeometry.setAttribute(
    'midpoint',
    new THREE.InstancedBufferAttribute(new Float32Array(midVerticesArr), 3)
  );

  const wireframeGroup = new THREE.Group();
  const verticesGroup = new THREE.Group();
  wireframeGroup.add(cylinderInstances);
  verticesGroup.add(sphereInstances);

  return { wireframeGroup, verticesGroup };
}

/**
 * 创建四维线框和顶点组。
 * 使用圆柱体表示边，球体表示顶点，支持四维投影。
 * @this {types.PolytopeRendererApp}
 * @param {Array<types.Edge4D>} edges - 四维边数组。
 * @param {object} [options] - 配置选项。
 * @param {THREE.Material} [options.cylinderMaterial] - 圆柱体材质。
 * @param {THREE.Material} [options.sphereMaterial] - 球体材质。
 * @param {number} [options.cylinderColor] - 圆柱体颜色。
 * @param {number} [options.sphereColor] - 球体颜色。
 * @returns {{wireframeGroup: THREE.Group, verticesGroup: THREE.Group}} 线框组和顶点组。
 */
export function create4DWireframeAndVertices(
  edges,
  {
    cylinderMaterial,
    sphereMaterial,
    cylinderColor = 0xb0c4de,
    sphereColor = 0xf2c3a7
  } = {}
) {
  let defaultCylinderMaterial =
    cylinderMaterial ||
    new THREE.MeshStandardMaterial({
      color: cylinderColor,
      metalness: 1.0,
      roughness: 0.05
    });

  let defaultSphereMaterial =
    sphereMaterial ||
    new THREE.MeshStandardMaterial({
      color: sphereColor,
      metalness: 1.0,
      roughness: 0.05
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
 * 创建分离的面组。
 * 为每个原始面创建独立的网格对象，支持分离距离和面缩放效果。
 * @this {types.PolytopeRendererApp}
 * @param {types.Mesh3D} meshData - 处理后的网格数据。
 * @param {THREE.Material} material - 材质对象。
 * @returns {{facesGroup: THREE.Group, separatedWireframeGroup: THREE.Group, separatedVerticesGroup: THREE.Group}} 面组、分离线框组和分离顶点组。
 */
export function createSeparatedFacesGroup(meshData, material) {
  const facesGroup = new THREE.Group();
  const separatedWireframeGroup = new THREE.Group();
  const separatedVerticesGroup = new THREE.Group();

  for (const originalFaceIndex in meshData.facesMap) {
    const originalFace = meshData.originalFaces[originalFaceIndex];
    const originalFaceCenter = meshData.originalFaceCenters[originalFaceIndex];
    const originalFaceNormal = meshData.originalFaceNormals[originalFaceIndex];
    const singleFaceGeometry = new THREE.BufferGeometry();
    const verticesMap = new Map();
    const vertices = [];
    const indices = [];

    for (const faceIndex of meshData.facesMap[originalFaceIndex]) {
      const face = meshData.faces[faceIndex];
      for (const vertexIndex of face) {
        if (verticesMap.has(vertexIndex)) continue;
        const vertex = meshData.vertices[vertexIndex];
        verticesMap.set(vertexIndex, vertices.length / 3);
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
      indices.push(...face.map(idx => verticesMap.get(idx)));
    }

    singleFaceGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    singleFaceGeometry.setIndex(indices);
    singleFaceGeometry.computeVertexNormals();

    const edges = helperFunc
      .getUniqueSortedPairs([originalFace])
      .map(edge => edge.map(index => meshData.vertices[index]));

    const { wireframeGroup, verticesGroup } = this.createWireframeAndVertices(
      edges,
      {
        faceCenter: new THREE.Vector3(
          originalFaceCenter.x,
          originalFaceCenter.y,
          originalFaceCenter.z
        ),
        faceNormal: new THREE.Vector3(
          originalFaceNormal.x,
          originalFaceNormal.y,
          originalFaceNormal.z
        )
      }
    );

    facesGroup.add(
      new THREE.Mesh(
        singleFaceGeometry,
        shaderCompCallback.faceMaterial3D(
          material.clone(),
          this.rotUni,
          this.ofs3Uni,
          this.separationDistUni,
          this.faceScaleUni,
          {
            value: new THREE.Vector3(
              originalFaceCenter.x,
              originalFaceCenter.y,
              originalFaceCenter.z
            )
          },
          {
            value: new THREE.Vector3(
              originalFaceNormal.x,
              originalFaceNormal.y,
              originalFaceNormal.z
            )
          }
        )
      )
    );
    separatedWireframeGroup.add(wireframeGroup);
    separatedVerticesGroup.add(verticesGroup);
  }

  return { facesGroup, separatedWireframeGroup, separatedVerticesGroup };
}
