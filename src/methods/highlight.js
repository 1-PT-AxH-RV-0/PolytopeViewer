import * as THREE from 'three';
import YAML from 'js-yaml';
import * as helperFunc from '../helperFunc.js';
import shaderCompCallback from '../shaderCompCallback.js';

export function highlightCells(highlightConfig) {
  this.highlightedPartGroup.clear();
  for (const [color, cellsSelectorConfig] of Object.entries(
    highlightConfig
  )) {
    if (!/^[0-9a-fA-F]{8}$/.test(color))
      throw new Error(`十六进制 RGBA 色码 ${color} 无效。`);
    helperFunc.validateCellsSelectorConfig(cellsSelectorConfig, color + '.');

    const highlightedPartGeo = this.facesGroup.geometry.clone();
    const highlightedPartMaterial = shaderCompCallback.faceMaterial(
      this.facesGroup.material,
      this.rotUni,
      this.ofsUni,
      this.ofs3Uni,
      this.projDistUni,
      this.isOrthoUni
    );
    const colorNum = parseInt(color, 16);
    const rgb = colorNum >>> 8;
    const a = colorNum & 0xff;
    highlightedPartMaterial.color.set(rgb);
    highlightedPartMaterial.transparent = a === 255 ? false : true;
    highlightedPartMaterial.opacity = a / 255;
    highlightedPartMaterial.visible = true;

    if (cellsSelectorConfig === 'all') {
      const indices = [];
      this.faces.forEach(face => indices.push(...face));
      highlightedPartGeo.setIndex(indices);
      highlightedPartGeo.computeVertexNormals();
      this.highlightedPartGroup.add(
        new THREE.Mesh(highlightedPartGeo, highlightedPartMaterial)
      );

      continue;
    }
    const highlightCellsIdx = [];

    // 验证 indices。
    if (Object.hasOwnProperty.call(cellsSelectorConfig, 'indices')) {
      for (const index of cellsSelectorConfig.indices) {
        if (!this.cells[index]) {
          throw new Error(`索引为 ${index} 的胞不存在。`);
        }
      }
      highlightCellsIdx.push(...cellsSelectorConfig.indices);
    }

    // 验证 ranges。
    if (Object.hasOwnProperty.call(cellsSelectorConfig, 'ranges')) {
      for (const [i, range] of cellsSelectorConfig.ranges.entries()) {
        const [start, end] = range;
        if (!this.cells[start]) {
          throw new Error(
            `ranges[${i}] 的起始索引 ${start} 对应的胞不存在。`
          );
        }
        if (!this.cells[end - 1]) {
          throw new Error(`ranges[${i}] 的结束索引 ${end} 对应的胞不存在。`);
        }
        highlightCellsIdx.push(...helperFunc.range(start, end - 1));
      }
    }

    // 验证 nHedra。
    if (Object.hasOwnProperty.call(cellsSelectorConfig, 'nHedra')) {
      for (const [i, item] of cellsSelectorConfig.nHedra.entries()) {
        if (typeof item === 'number') {
          const nFaces = item;
          if (!this.nHedraInCells[nFaces]) {
            throw new Error(`nHedra[${i}] 指定的 ${nFaces} 面体胞不存在。`);
          }
          highlightCellsIdx.push(...this.nHedraInCells[nFaces]);
        } else if (item instanceof Object) {
          const { nFaces, ranges } = item;
          if (!this.nHedraInCells[nFaces]) {
            throw new Error(`nHedra[${i}] 指定的 ${nFaces} 面体胞不存在。`);
          }
          const cells = [];
          for (const [j, range] of ranges.entries()) {
            const [start, end] = range;
            if (start >= this.nHedraInCells[nFaces].length) {
              throw new Error(
                `nHedra[${i}].ranges[${j}] 的起始索引 ${start} 超出范围。`
              );
            }
            if (end > this.nHedraInCells[nFaces].length) {
              throw new Error(
                `nHedra[${i}].ranges[${j}] 的结束索引 ${end} 超出范围。`
              );
            }
            cells.push(...this.nHedraInCells[nFaces].slice(...range));
          }
          highlightCellsIdx.push(...cells);
        }
      }
    }

    // 验证 exclude。
    if (Object.hasOwnProperty.call(cellsSelectorConfig, 'exclude')) {
      const exclude = cellsSelectorConfig.exclude;

      if (Object.hasOwnProperty.call(exclude, 'indices')) {
        for (const index of exclude.indices) {
          if (!this.cells[index]) {
            throw new Error(
              `exclude.indices 中的索引 ${index} 对应的胞不存在。`
            );
          }
        }
        helperFunc.filterArray(highlightCellsIdx, exclude.indices);
      }

      if (Object.hasOwnProperty.call(exclude, 'ranges')) {
        for (const [i, range] of exclude.ranges.entries()) {
          const [start, end] = range;
          if (!this.cells[start]) {
            throw new Error(
              `exclude.ranges[${i}] 的起始索引 ${start} 对应的胞不存在。`
            );
          }
          if (!this.cells[end - 1]) {
            throw new Error(
              `exclude.ranges[${i}] 的结束索引 ${end} 对应的胞不存在。`
            );
          }
          helperFunc.filterArray(
            highlightCellsIdx,
            helperFunc.range(start, end - 1)
          );
        }
      }

      if (Object.hasOwnProperty.call(exclude, 'nHedra')) {
        for (const [i, item] of exclude.nHedra.entries()) {
          if (typeof item === 'number') {
            const nFaces = item;
            if (!this.nHedraInCells[nFaces]) {
              throw new Error(
                `exclude.nHedra[${i}] 指定的 ${nFaces} 面体胞不存在。`
              );
            }
            helperFunc.filterArray(
              highlightCellsIdx,
              this.nHedraInCells[nFaces]
            );
          } else if (item instanceof Object) {
            const { nFaces, ranges } = item;
            if (!this.nHedraInCells[nFaces]) {
              throw new Error(
                `exclude.nHedra[${i}] 指定的 ${nFaces} 面体胞不存在。`
              );
            }
            const cells = [];
            for (const [j, range] of ranges.entries()) {
              const [start, end] = range;
              if (start >= this.nHedraInCells[nFaces].length) {
                throw new Error(
                  `exclude.nHedra[${i}].ranges[${j}] 的起始索引 ${start} 超出范围。`
                );
              }
              if (end > this.nHedraInCells[nFaces].length) {
                throw new Error(
                  `exclude.nHedra[${i}].ranges[${j}] 的结束索引 ${end} 超出范围。`
                );
              }
              cells.push(...this.nHedraInCells[nFaces].slice(...range));
            }
            helperFunc.filterArray(highlightCellsIdx, cells);
          }
        }
      }
    }

    const indices = [];
    for (const cellIdx of highlightCellsIdx) {
      for (const faceIndex of this.cells[cellIdx].faceIndices) {
        indices.push(...this.faces[faceIndex]);
      }
    }

    highlightedPartGeo.setIndex(indices);
    highlightedPartGeo.computeVertexNormals();
    this.highlightedPartGroup.add(
      new THREE.Mesh(highlightedPartGeo, highlightedPartMaterial)
    );
  }
}

export function highlightFaces(highlightConfig) {
  this.highlightedPartGroup.clear();
  for (const [color, facesSelectorConfig] of Object.entries(
    highlightConfig
  )) {
    if (!/^[0-9a-fA-F]{8}$/.test(color))
      throw new Error(`十六进制 RGBA 色码 ${color} 无效。`);

    const highlightedPartGeo = this.facesGroup.geometry.clone();
    const highlightedPartMaterial = shaderCompCallback.faceMaterial3D(
      this.facesGroup.material,
      this.rotUni,
      this.ofs3Uni
    );
    const colorNum = parseInt(color, 16);
    const rgb = colorNum >>> 8;
    const a = colorNum & 0xff;
    highlightedPartMaterial.color.set(rgb);
    highlightedPartMaterial.transparent = a === 255 ? false : true;
    highlightedPartMaterial.opacity = a / 255;
    highlightedPartMaterial.visible = true;

    if (facesSelectorConfig === 'all') {
      const indices = [];
      this.faces.forEach(face => indices.push(...face));
      highlightedPartGeo.setIndex(indices);
      highlightedPartGeo.computeVertexNormals();
      this.highlightedPartGroup.add(
        new THREE.Mesh(highlightedPartGeo, highlightedPartMaterial)
      );

      continue;
    }

    const highlightFacesIdx = [];
    if (Object.hasOwnProperty.call(facesSelectorConfig, 'indices')) {
      for (const index of facesSelectorConfig.indices) {
        if (!this.facesMap[index]) {
          throw new Error(`索引为 ${index} 的面不存在。`);
        }
      }
      highlightFacesIdx.push(...facesSelectorConfig.indices);
    }

    if (Object.hasOwnProperty.call(facesSelectorConfig, 'ngons')) {
      console.log(this.ngonsInFaces);
      for (const n of facesSelectorConfig.ngons) {
        if (!Object.hasOwnProperty.call(this.ngonsInFaces, n)) {
          throw new Error(`${n} 边形的面不存在。`);
        }
        highlightFacesIdx.push(...this.ngonsInFaces[n]);
      }
    }

    const indices = [];
    for (const faceIndex of highlightFacesIdx) {
      for (const triangleFacesIndex of this.facesMap[faceIndex]) {
        indices.push(...this.faces[triangleFacesIndex]);
      }
    }

    highlightedPartGeo.setIndex(indices);
    highlightedPartGeo.computeVertexNormals();
    this.highlightedPartGroup.add(
      new THREE.Mesh(highlightedPartGeo, highlightedPartMaterial)
    );
  }
}
