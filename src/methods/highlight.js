import * as THREE from 'three';
import * as helperFunc from '../helperFunc.js';
import shaderCompCallback from '../shaderCompCallback.js';
import * as types from '../type.js';

/**
 * 修改面组中所有面的颜色。
 * 递归遍历组中的所有网格并设置颜色和透明度。
 * @param {THREE.Group | THREE.Mesh} faces - 面组或单个网格。
 * @param {{rgb: number, a: number}} colorInt - 颜色对象，包含 RGB 值和 alpha 值。
 */
function changeFaceColor(faces, colorInt) {
  if (faces instanceof THREE.Group) {
    faces.children.forEach(f => changeFaceColor(f, colorInt));
  } else if (faces instanceof THREE.Mesh) {
    faces.material.color.set(colorInt.rgb);
    faces.material.transparent = colorInt.a !== 1;
    faces.material.opacity = colorInt.a;
  }
}

/**
 * 高亮四维多胞体的胞。
 * 根据配置选择特定的胞并以指定颜色高亮显示。
 * @this {types.PolytopeRendererApp}
 * @param {types.HighlightConfig} highlightConfig - 高亮配置对象，键为 16 进制 RGBA 色码，值为胞选择器配置。
 * @throws {Error} 当颜色码无效或胞索引不存在时抛出错误。
 */
export function highlightCells(highlightConfig) {
  this.highlightedPartGroup.clear();
  for (const [color, cellsSelectorConfig] of Object.entries(highlightConfig)) {
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
          throw new Error(`ranges[${i}] 的起始索引 ${start} 对应的胞不存在。`);
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

  this.requestSingleRender();
}

/**
 * 高亮三维多面体的面。
 * 根据配置选择特定的面并以指定颜色高亮显示。
 * @this {types.PolytopeRendererApp}
 * @param {types.HighlightConfig} highlightConfig - 高亮配置对象，键为 16 进制 RGBA 色码，值为面选择器配置。
 * @throws {Error} 当颜色码无效或面索引不存在时抛出错误。
 */
export function highlightFaces(highlightConfig) {
  this.highlightedPartGroup.clear();
  changeFaceColor(this.facesGroup, { rgb: 0, a: 0 });
  for (const [color, facesSelectorConfig] of Object.entries(highlightConfig)) {
    if (!/^[0-9a-fA-F]{8}$/.test(color))
      throw new Error(`十六进制 RGBA 色码 ${color} 无效。`);

    const colorInt = helperFunc.colorStrToInt(color);

    if (facesSelectorConfig === 'all') {
      changeFaceColor(this.facesGroup, colorInt);
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

    for (const idx of highlightFacesIdx) {
      const face = this.facesGroup.children[idx];
      changeFaceColor(face, colorInt);
    }
  }

  this.requestSingleRender();
}
