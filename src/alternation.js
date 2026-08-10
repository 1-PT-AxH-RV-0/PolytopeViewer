// ======================== 拓扑工具 ========================
function buildAdjacencyFromFaces(faces, numVertices) {
  const adj = new Map();
  for (let i = 0; i < numVertices; i++) {
    adj.set(i, new Set());
  }
  for (const face of faces) {
    const L = face.length;
    for (let i = 0; i < L; i++) {
      const u = face[i];
      const v = face[(i + 1) % L];
      adj.get(u).add(v);
      adj.get(v).add(u);
    }
  }
  return adj;
}

function checkBipartite(adj, numVertices) {
  const color = new Array(numVertices).fill(-1);
  for (let start = 0; start < numVertices; start++) {
    if (color[start] === -1) {
      color[start] = 0;
      const queue = [start];
      while (queue.length > 0) {
        const u = queue.shift();
        for (const v of adj.get(u)) {
          if (color[v] === -1) {
            color[v] = 1 - color[u];
            queue.push(v);
          } else if (color[v] === color[u]) {
            return { isBipartite: false, color };
          }
        }
      }
    }
  }
  return { isBipartite: true, color };
}

function canonicalFace(face) {
  if (face.length === 0) return '';
  const minVal = Math.min(...face);
  const n = face.length;
  const candidates = [];

  for (let i = 0; i < n; i++) {
    if (face[i] === minVal) {
      const forward = [];
      for (let j = 0; j < n; j++) {
        forward.push(face[(i + j) % n]);
      }
      const backward = [];
      for (let j = 0; j < n; j++) {
        backward.push(face[(i - j + n) % n]);
      }
      candidates.push(forward.join(','));
      candidates.push(backward.join(','));
    }
  }
  return candidates.sort()[0];
}

function extractCycleFromLink(neighbors, linkAdj) {
  if (neighbors.length < 3) return null;

  const start = neighbors[0];
  const cycle = [start];
  let curr = start;
  let prev = null;

  while (true) {
    let options;
    if (prev === null) {
      options = [...linkAdj.get(curr)];
    } else {
      options = [...linkAdj.get(curr)].filter(n => n !== prev);
    }
    if (options.length === 0) break;

    const nxt = options[0];
    if (nxt === start) break;

    cycle.push(nxt);
    prev = curr;
    curr = nxt;
  }

  return cycle.length >= 3 ? cycle : null;
}

// ======================== 三维交替 ========================
function alternation3DWithColor(vertices, faces, color) {
  const n = vertices.length;
  const keep = [];
  const remove = [];
  for (let i = 0; i < n; i++) {
    if (color[i] === 0) keep.push(i);
    else remove.push(i);
  }

  const newIdx = {};
  keep.forEach((old, i) => { newIdx[old] = i; });
  const newVerts = keep.map(i => vertices[i]);

  const vert2faces = {};
  for (let i = 0; i < n; i++) vert2faces[i] = [];
  faces.forEach((face, fi) => {
    for (const v of face) {
      vert2faces[v].push(fi);
    }
  });

  const newFaces = [];

  for (const face of faces) {
    const kept = face.filter(v => color[v] === 0);
    if (kept.length >= 3) {
      newFaces.push(kept.map(v => newIdx[v]));
    }
  }

  for (const v of remove) {
    const incidentFaces = vert2faces[v].map(fi => faces[fi]);
    if (incidentFaces.length === 0) continue;

    const linkAdj = new Map();
    for (const face of incidentFaces) {
      const idx = face.indexOf(v);
      if (idx === -1) continue;
      const L = face.length;
      const prevV = face[(idx - 1 + L) % L];
      const nextV = face[(idx + 1) % L];
      if (color[prevV] !== 0 || color[nextV] !== 0) continue;

      if (!linkAdj.has(prevV)) linkAdj.set(prevV, new Set());
      if (!linkAdj.has(nextV)) linkAdj.set(nextV, new Set());
      linkAdj.get(prevV).add(nextV);
      linkAdj.get(nextV).add(prevV);
    }

    const neighbors = [...linkAdj.keys()];
    const cycle = extractCycleFromLink(neighbors, linkAdj);
    if (cycle) {
      newFaces.push(cycle.map(w => newIdx[w]));
    }
  }

  const unique = new Set();
  const finalFaces = [];
  for (const face of newFaces) {
    const cf = canonicalFace(face);
    if (!unique.has(cf)) {
      unique.add(cf);
      finalFaces.push(face);
    }
  }

  return { vertices: newVerts, faces: finalFaces };
}

// ======================== 四维交替 ========================
export function alternate4D({vertices, faces, cells}) {
  const numVerts = vertices.length;
  const adj = buildAdjacencyFromFaces(faces, numVerts);
  const { isBipartite, color } = checkBipartite(adj, numVerts);

  if (!isBipartite) {
    throw new Error('多胞体的顶点图不是二分图，无法交替。');
  }

  const keep = [];
  for (let i = 0; i < numVerts; i++) {
    if (color[i] === 0) keep.push(i);
  }

  const globalNewIdx = {};
  keep.forEach((old, i) => { globalNewIdx[old] = i; });
  const newVerts = keep.map(i => vertices[i]);

  const vert2cells = {};
  for (let i = 0; i < numVerts; i++) vert2cells[i] = [];
  cells.forEach((cellFaces, ci) => {
    const cellVerts = new Set();
    for (const fi of cellFaces) {
      for (const v of faces[fi]) {
        cellVerts.add(v);
      }
    }
    for (const v of cellVerts) {
      vert2cells[v].push(ci);
    }
  });

  const allNewFaces = [];
  const newCellsTemp = [];

  for (const cellFaces of cells) {
    const localVertsSet = new Set();
    for (const fi of cellFaces) {
      for (const v of faces[fi]) {
        localVertsSet.add(v);
      }
    }
    const localVerts = [...localVertsSet].sort((a, b) => a - b);
    const globalToLocal = {};
    localVerts.forEach((v, i) => { globalToLocal[v] = i; });

    const localFaces = cellFaces.map(fi =>
      faces[fi].map(v => globalToLocal[v])
    );
    const localColor = localVerts.map(v => color[v]);

    let result;
    try {
      result = alternation3DWithColor(
        localVerts.map(v => vertices[v]),
        localFaces,
        localColor
      );
    } catch (e) {
      continue;
    }

    if (result.faces.length === 0) continue;

    const localKeepOriginal = [];
    for (let i = 0; i < localVerts.length; i++) {
      if (localColor[i] === 0) {
        localKeepOriginal.push(localVerts[i]);
      }
    }

    const localNewToGlobalNew = {};
    localKeepOriginal.forEach((origGlobal, newLocalIdx) => {
      localNewToGlobalNew[newLocalIdx] = globalNewIdx[origGlobal];
    });

    const cellGlobalFaces = [];
    for (const lf of result.faces) {
      const globalFace = lf.map(v => localNewToGlobalNew[v]);
      allNewFaces.push(globalFace);
      cellGlobalFaces.push(allNewFaces.length - 1);
    }
    newCellsTemp.push(cellGlobalFaces);
  }

  const remove = [];
  for (let i = 0; i < numVerts; i++) {
    if (color[i] === 1) remove.push(i);
  }

  for (const v of remove) {
    const incidentCells = vert2cells[v].map(ci => cells[ci]);
    if (incidentCells.length === 0) continue;

    const linkFaces = [];
    for (const cellFaces of incidentCells) {
      const facesWithV = cellFaces.filter(fi => faces[fi].includes(v));
      const linkAdj = new Map();

      for (const fi of facesWithV) {
        const face = faces[fi];
        const idx = face.indexOf(v);
        if (idx === -1) continue;
        const L = face.length;
        const prevV = face[(idx - 1 + L) % L];
        const nextV = face[(idx + 1) % L];
        if (color[prevV] !== 0 || color[nextV] !== 0) continue;

        if (!linkAdj.has(prevV)) linkAdj.set(prevV, new Set());
        if (!linkAdj.has(nextV)) linkAdj.set(nextV, new Set());
        linkAdj.get(prevV).add(nextV);
        linkAdj.get(nextV).add(prevV);
      }

      const neighbors = [...linkAdj.keys()];
      const cycle = extractCycleFromLink(neighbors, linkAdj);
      if (cycle) {
        const globalFace = cycle.map(w => globalNewIdx[w]);
        allNewFaces.push(globalFace);
        linkFaces.push(allNewFaces.length - 1);
      }
    }
    if (linkFaces.length > 0) {
      newCellsTemp.push(linkFaces);
    }
  }

  const uniqueFaces = [];
  const faceMap = new Map();

  for (const face of allNewFaces) {
    const cf = canonicalFace(face);
    if (!faceMap.has(cf)) {
      faceMap.set(cf, uniqueFaces.length);
      uniqueFaces.push(face);
    }
  }

  const newCells = [];
  for (const cellFaceIndices of newCellsTemp) {
    const newCellSet = new Set();
    for (const idx of cellFaceIndices) {
      const cf = canonicalFace(allNewFaces[idx]);
      newCellSet.add(faceMap.get(cf));
    }
    const newCell = [...newCellSet];
    if (newCell.length >= 4) {
      newCells.push(newCell);
    }
  }

  return {
    vertices: newVerts,
    faces: uniqueFaces,
    cells: newCells
  };
}
