import * as THREE from 'three';
import Nanobar from 'nanobar';
import * as helperFunc from '../helperFunc.js';
import { parseOFF } from '../offProcessor.js';
import { parse4OFF } from '../offProcessor4D.js';
import shaderCompCallback from '../shaderCompCallback.js';

/**
 *
 * @param path
 */
export async function importOff(path) {
  try {
    const data = await import(`../../assets/models/${path}`);
    return data.default;
  } catch (error) {
    console.error('OFF 加载失败：', error);
    return {};
  }
}

/**
 *
 * @param meshData
 * @param is4D
 */
export function processMeshData(meshData, is4D = false) {
  const bar = new Nanobar({ target: this.progCon });
  const controller = new AbortController();
  const worker = new Worker(
    new URL('../processMeshData.worker.js', import.meta.url)
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
 *
 * @param data
 * @param material
 */
export async function loadMeshFromData(data, material) {
  if (this.loadMeshPromise) this.loadMeshPromise.abort();
  const mesh = data instanceof Object ? data : parseOFF(data);
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
    solidGroup,
    facesGroup,
    wireframeGroup,
    verticesGroup,
    separatedWireframeGroup,
    separatedVerticesGroup
  } = this.loadMesh(processedMesh, material);

  this.solidGroup = solidGroup;
  this.facesGroup = facesGroup;
  this.wireframeGroup = wireframeGroup;
  this.verticesGroup = verticesGroup;
  this.separatedWireframeGroup = separatedWireframeGroup;
  this.separatedVerticesGroup = separatedVerticesGroup;

  this.updateProperties();
}

/**
 *
 * @param data
 * @param material
 */
export async function loadMeshFrom4Data(data, material) {
  if (this.loadMeshPromise) this.loadMeshPromise.abort();
  const mesh = data instanceof Object ? data : parse4OFF(data);
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

  const { solidGroup, facesGroup, wireframeGroup, verticesGroup } =
    this.load4DMesh(processedMesh, material);

  this.solidGroup = solidGroup;
  this.facesGroup = facesGroup;
  this.wireframeGroup = wireframeGroup;
  this.verticesGroup = verticesGroup;

  this.updateProperties();
  this.updateProjectionDistance();
  this.updateRotation();
}

/**
 *
 * @param url
 * @param material
 * @param is4Off
 */
export async function loadMeshFromUrl(url, material, is4Off = false) {
  return new Promise(resolve => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常。');
        }
        return response.text();
      })
      .then(async data => {
        await (
          is4Off
            ? this.loadMeshFrom4Data.bind(this)
            : this.loadMeshFromData.bind(this)
        )(data, material);
        resolve();
      });
  });
}

/**
 *
 * @param meshData
 * @param material
 */
export function loadMesh(meshData, material) {
  this.is4D = false;
  this.cells = [];
  this.faces = meshData.faces;
  this.facesMap = meshData.facesMap;
  this.nHedraInCells = {};
  this.ngonsInFaces = {};
  this.highlightedPartGroup.clear();
  this.ngonsInFaces = meshData.ngonsInFaces;

  if (this.solidGroup) {
    helperFunc.disposeGroup(this.solidGroup);
    this.scene.remove(this.solidGroup);
  }
  this.updateEnable();
  const container = new THREE.Object3D();
  this.updateScaleFactor(
    40 / helperFunc.getFarthestPointDist(meshData.vertices)
  );

  const { wireframeGroup, verticesGroup } = this.createWireframeAndVertices(
    meshData.edges
  );
  const { facesGroup, separatedWireframeGroup, separatedVerticesGroup } =
    this.createSeparatedFacesGroup(meshData, material);

  container.add(wireframeGroup);
  container.add(verticesGroup);
  container.add(separatedWireframeGroup);
  container.add(separatedVerticesGroup);
  container.add(facesGroup);
  container.add(this.highlightedPartGroup);
  container.scale.setScalar(this.scaleFactor);

  this.scene.add(container);

  return {
    solidGroup: container,
    facesGroup,
    wireframeGroup,
    verticesGroup,
    separatedWireframeGroup,
    separatedVerticesGroup
  };
}

/**
 *
 * @param meshData
 * @param material
 */
export function load4DMesh(meshData, material) {
  this.is4D = true;
  this.cells = meshData.cells;
  this.faces = meshData.faces;
  this.facesMap = meshData.facesMap;
  this.ngonsInFaces = {};
  this.nHedraInCells = {};
  this.highlightedPartGroup.clear();
  meshData.cells.forEach((cell, cellIdx) => {
    if (Object.hasOwnProperty.call(this.nHedraInCells, cell.facesCount)) {
      this.nHedraInCells[cell.facesCount].push(cellIdx);
    } else {
      this.nHedraInCells[cell.facesCount] = [cellIdx];
    }
  });

  if (this.solidGroup) {
    helperFunc.disposeGroup(this.solidGroup);
    this.scene.remove(this.solidGroup);
  }
  this.highlightedPartGroup.clear();
  this.updateEnable();
  const container = new THREE.Group();
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
  meshData.faces.forEach(face => indices.push(...face));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  material = shaderCompCallback.faceMaterial(
    material,
    this.rotUni,
    this.ofsUni,
    this.ofs3Uni,
    this.projDistUni,
    this.isOrthoUni
  );
  material.side = THREE.DoubleSide;

  const mesh = new THREE.Mesh(geometry, material);
  this.projectionDistanceSlider.noUiSlider.set(
    helperFunc.getFarthest4DPointDist(meshData.vertices) * 1.05
  );
  this.updateProjectionDistance();
  this.updateScaleFactor(
    40 /
      helperFunc.getFarthestPointDist(
        meshData.vertices.map(p => {
          if (!this.schleSwitcher.checked) return { x: p.x, y: p.y, z: p.z };
          const d = this.projectionDistanceSlider.noUiSlider.get(true);
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
  container.add(this.highlightedPartGroup);

  this.scene.add(container);

  return {
    solidGroup: container,
    facesGroup: mesh,
    wireframeGroup,
    verticesGroup
  };
}
