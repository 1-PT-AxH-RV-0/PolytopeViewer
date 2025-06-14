import * as poly2tri from 'poly2tri'
import * as polygonClipping from 'polygon-clipping'

function decomposeSelfIntersectingPolygon(originalPoints) {
    const coords = originalPoints.map(p => [+p.x.toFixed(6), +p.y.toFixed(6)]);
    if (coords.length > 0) {
        coords.push([coords[0][0], coords[0][1]]);
    }

    const result = polygonClipping.union([coords]);
    
    const decomposed = [];
    for (const polygon of result) {
        for (const ring of polygon) {
            if (ring.length === 0) continue;
            const ringPoints = ring.slice(0, -1);
            const points = ringPoints.map(([x, y]) => new poly2tri.Point(x, y));
            decomposed.push(points);
        }
    }
    
    return decomposed;
}

function parseOFF(data) {
    const lines = data.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    if (lines[0].trim() !== 'OFF') throw new Error('Invalid OFF file format');
        
    const [nVertices, nFaces] = lines[1].trim().split(/\s+/).map(Number);
    const vertices = [];
    
    for (let i = 0; i < nVertices; i++) {
        const [x, y, z] = lines[i + 2].trim().split(/\s+/).map(parseFloat);
        vertices.push({ x, y, z });
    }
    
    const faces = [];
    for (let i = 0; i < nFaces; i++) {
        const parts = lines[i + 2 + nVertices].trim().split(/\s+/);
        const count = parseInt(parts[0]);
        faces.push(parts.slice(1, count + 1).map(Number));
    }
    
    return { vertices, faces };
}

function computeNormal(points) {
    const v1 = {
        x: points[1].x - points[0].x,
        y: points[1].y - points[0].y,
        z: points[1].z - points[0].z
    };
    const v2 = {
        x: points[2].x - points[0].x,
        y: points[2].y - points[0].y,
        z: points[2].z - points[0].z
    };
    
    const nx = v1.y * v2.z - v1.z * v2.y;
    const ny = v1.z * v2.x - v1.x * v2.z;
    const nz = v1.x * v2.y - v1.y * v2.x;
    
    const length = Math.sqrt(nx**2 + ny**2 + nz**2);
    return { x: nx/length, y: ny/length, z: nz/length };
}

function rotatePoint(p, theta, phi) {
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    const cosP = Math.cos(phi), sinP = Math.sin(phi);
    const y1 = p.y * cosT - p.z * sinT;
    const z1 = p.y * sinT + p.z * cosT;
    
    const x2 = p.x * cosP + z1 * sinP;
    const z2 = -p.x * sinP + z1 * cosP;
    
    return { x: x2, y: y1, z: z2, orig: p };
}

function inverseRotatePoint(p, theta, phi) {
    const cosT = Math.cos(-theta), sinT = Math.sin(-theta);
    const cosP = Math.cos(-phi), sinP = Math.sin(-phi);
    
    const x1 = p.x * cosP + p.z * sinP;
    const z1 = -p.x * sinP + p.z * cosP;
    
    const y2 = p.y * cosT - z1 * sinT;
    const z2 = p.y * sinT + z1 * cosT;
        
    return { x: x1, y: y2, z: z2 };
}

function rotateToXY(points) {
    const normal = computeNormal(points);
    
    const theta = Math.atan2(normal.y, normal.z);
    const phi = Math.atan2(-normal.x, Math.sqrt(normal.y**2 + normal.z**2));
    
    const rotated = points.map(p => rotatePoint(p, theta, phi))
    
    return {rotated, theta, phi, z: rotated[0].z}
}

function arePointsClose(point1, point2, epsilon = Number.EPSILON) {
    const dx = Math.abs(point1.x - point2.x);
    const dy = Math.abs(point1.y - point2.y);
    const dz = Math.abs(point1.z - point2.z);

    return dx <= epsilon && dy <= epsilon && dz <= epsilon;
}

function getUniqueSortedPairs(arrays) {
  const pairs = arrays.flatMap(arr => arr.map((v, i) => [Math.min(v, arr[(i + 1) % arr.length]), Math.max(v, arr[(i + 1) % arr.length])]));
  return [...new Set(pairs.map(JSON.stringify))].map(JSON.parse);
};

function processMeshData({vertices, faces}) {
    const processedVertices = [...vertices];
    const processedFaces = [];
    const edges = getUniqueSortedPairs(faces).map(edge => edge.map(index => vertices[index]));

    faces.forEach(face => {
        if (face.length === 3) {
            processedFaces.push(face);
            return;
        }
        
        const faceVertices = face.map(idx => vertices[idx]);
        
        function triangulateFace(vertices3D) {
              const {rotated, theta, phi, z} = rotateToXY(vertices3D);
              const contour = rotated.map(p => new poly2tri.Point(p.x, p.y));

              const triangles = [];
              const decomposed = decomposeSelfIntersectingPolygon(contour)
              for (const subPolygon of decomposed) {
                const swctx = new poly2tri.SweepContext(subPolygon);
                swctx.triangulate();
                
                const subTriangles = swctx.getTriangles().map(triangle =>
                  triangle.getPoints().map(pt => {
                    pt.z = z
                    const origPoint = inverseRotatePoint(pt, theta, phi)
                    const origIndex = processedVertices.findIndex(p => arePointsClose(p, origPoint))
                    
                    if (origIndex > -1) return origIndex
                    
                    processedVertices.push(origPoint)
                    return processedVertices.length - 1
                  })
                );
                
                triangles.push(...subTriangles)
              }
              
              return triangles
        }
        
        const triangles = triangulateFace(faceVertices);
        triangles.forEach(t => {
            if (t.length === 3) processedFaces.push(t);
        });
    });
    
    return {vertices: processedVertices, faces: processedFaces, edges}
}

export { processMeshData, parseOFF };
