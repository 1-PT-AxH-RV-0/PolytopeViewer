import * as THREE from 'three';

function toBufferGeometry(source) {
  const geo = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach(
    k =>
      source.attributes[k] && geo.setAttribute(k, source.attributes[k].clone())
  );
  source.index && geo.setIndex(source.index.clone());
  source.parameters && (geo.parameters = { ...source.parameters });

  source.dispose();
  return geo;
}

function create4DSphereMesh(
  { x, y, z, w } = { x: 0, y: 0, z: 0, w: 0 },
  material
) {
  const sphereGeometry = toBufferGeometry(new THREE.SphereGeometry(1, 5, 5));
  const vertexCount = sphereGeometry.attributes.position.count;
  const centerArr = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) {
    centerArr.set([x, y, z, w], i * 4);
  }
  sphereGeometry.setAttribute(
    'center4D',
    new THREE.Float32BufferAttribute(centerArr, 4)
  );

  const sphere = new THREE.Mesh(sphereGeometry, material);
  return sphere;
}

export { create4DSphereMesh, toBufferGeometry };
