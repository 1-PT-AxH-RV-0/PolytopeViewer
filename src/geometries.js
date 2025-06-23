import * as THREE from 'three';

function createSphereGeometry(radius = 1, widthSegments = 8, heightSegments = 8) {
    const phiStart = 0;
    const phiLength = Math.PI * 2;
    const thetaStart = 0;
    const thetaLength = Math.PI;

    widthSegments = Math.max(3, Math.floor(widthSegments));
    heightSegments = Math.max(2, Math.floor(heightSegments));

    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

    let index = 0;
    const grid = [];

    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();

    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // generate vertices, normals and uvs
    for (let iy = 0; iy <= heightSegments; iy++) {
        const verticesRow = [];
        const v = iy / heightSegments;

        // special case for the poles
        let uOffset = 0;

        if (iy === 0 && thetaStart === 0) {
            uOffset = 0.5 / widthSegments;
        } else if (iy === heightSegments && thetaEnd === Math.PI) {
            uOffset = -0.5 / widthSegments;
        }

        for (let ix = 0; ix <= widthSegments; ix++) {
            const u = ix / widthSegments;

            // vertex
            vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
            vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
            vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

            vertices.push(vertex.x, vertex.y, vertex.z);

            // normal
            normal.copy(vertex).normalize();
            normals.push(normal.x, normal.y, normal.z);

            // uv
            uvs.push(u + uOffset, 1 - v);

            verticesRow.push(index++);
        }

        grid.push(verticesRow);
    }

    // indices
    for (let iy = 0; iy < heightSegments; iy++) {
        for (let ix = 0; ix < widthSegments; ix++) {
            const a = grid[iy][ix + 1];
            const b = grid[iy][ix];
            const c = grid[iy + 1][ix];
            const d = grid[iy + 1][ix + 1];

            if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
            if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
        }
    }

    // build geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    geometry.parameters = {widthSegments, heightSegments}

    return geometry;
}


function createCylinderGeometry(radius = 1, height = 1, radialSegments = 8, heightSegments = 1) {
    const geometry = new THREE.BufferGeometry();
        
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    
    let index = 0;
    const indexArray = [];
    const halfHeight = height / 2;
    
    // 侧面
    const normal = new THREE.Vector3();
    const vertex = new THREE.Vector3();
    
    //  顶点、法线和 uv
    for (let y = 0; y <= heightSegments; y++) {
        const indexRow = [];
        const v = y / heightSegments;
        
        for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * Math.PI * 2;
            
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            // 顶点
            vertex.x = radius * sinTheta;
            vertex.y = -v * height + halfHeight;
            vertex.z = radius * cosTheta;
            vertices.push(vertex.x, vertex.y, vertex.z);
            
            // 法向量
            normal.set(sinTheta, 0, cosTheta).normalize();
            normals.push(normal.x, normal.y, normal.z);
            
            // uv
            uvs.push(u, 1 - v);
            
            indexRow.push(index++);
        }
        
        indexArray.push(indexRow);
    }
    
    // 索引
    for (let x = 0; x < radialSegments; x++) {
        const a = indexArray[0][x];
        const b = indexArray[1][x];
        const c = indexArray[1][x + 1];
        const d = indexArray[0][x + 1];
        
        // 面
        indices.push(a, b, d);
        indices.push(b, c, d);
    }
    
    // 顶面与底面
    const centerIndexStart = index;
    const uv = new THREE.Vector2();
    
    // 顶面中心顶点
    vertices.push(0, halfHeight, 0);
    normals.push(0, 1, 0);
    uvs.push(0.5, 0.5);
    index++;
    
    // 底面中心顶点
    vertices.push(0, -halfHeight, 0);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.5);
    index++;
    
    const centerIndexEnd = index;
    
    // 顶面与底面的坐标
    for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * Math.PI * 2;
        
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        
        vertex.x = radius * sinTheta;
        vertex.y = halfHeight;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);
        normals.push(0, 1, 0);
        uv.x = (cosTheta * 0.5) + 0.5;
        uv.y = (sinTheta * 0.5) + 0.5;
        uvs.push(uv.x, uv.y);
        index++;
        
        vertex.y = -halfHeight;
        vertices.push(vertex.x, vertex.y, vertex.z);
        normals.push(0, -1, 0);
        uv.y = (-sinTheta * 0.5) + 0.5;
        uvs.push(uv.x, uv.y);
        index++;
    }
    
    // 顶面与底面的索引
    for (let x = 0; x < radialSegments; x++) {
        const topCenter = centerIndexStart;
        const topEdge = centerIndexEnd + x * 2;
        indices.push(topEdge, topEdge + 2, topCenter);
        
        const bottomCenter = centerIndexStart + 1;
        const bottomEdge = centerIndexEnd + x * 2 + 1;
        indices.push(bottomEdge + 2, bottomEdge, bottomCenter);
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    geometry.parameters = {radialSegments, heightSegments}
    
    return geometry;
}

function create4DSphereMesh({x, y, z, w} = {x:0, y:0, z:0, w:0}, sphereRadius, material) {
  const sphereGeometry = createSphereGeometry(sphereRadius, 16, 16);
  const vertexCount = sphereGeometry.attributes.position.count;
  const centerArr = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) {
    centerArr.set([x, y, z, w], i * 4)
  }
  sphereGeometry.setAttribute('center4D', new THREE.Float32BufferAttribute(centerArr, 4));
  
  const sphere = new THREE.Mesh(
      sphereGeometry,
      material
  );
  return sphere;
}

export { createSphereGeometry, createCylinderGeometry, create4DSphereMesh }
