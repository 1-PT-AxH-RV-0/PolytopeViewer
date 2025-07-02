import * as THREE from 'three';
import shaderFuncs from './GLSLs.js';

/**
 * 创建一个可以在顶点着色器中将网格顶点映射到4D球面的材质。
 * 过程：克隆材质，注入 Schlegel 投影、4D 旋转矩阵等 GLSL 片段，并在顶点阶段根据旋转和投影计算出 3D 坐标。
 * @param {THREE.Material} material - 原始 Three.js 材质。
 * @param {THREE.IUniform<number>} sphereRadiusUni - 球体半径 uniform.
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} 新的材质实例。
 */
function sphereMaterial(
  material,
  sphereRadiusUni,
  rotUni,
  projDistUni,
  isOrthoUni
) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    // 注入 uniforms
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.radius = sphereRadiusUni;
    shader.uniforms.isOrtho = isOrthoUni;

    // 在顶点着色器开头插入必要的函数和 uniform 声明
    shader.vertexShader = `
      attribute vec4 center4D;
      uniform float radius;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform float rotation4D[6];

      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shader.vertexShader}
    `;

    // 替换 <begin_vertex> 段，将顶点先缩放再移到四维中心投影位置
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 将顶点按球体半径缩放，再加上中心点的 3D 投影
      vec3 center3D = schlegelProjection(create4DRotationMat(rotation4D) * center4D);
      transformed = transformed * radius + center3D;
      `
    );
  };

  return material;
}

/**
 * 创建一个可以在顶点着色器中将网格顶点映射到 4D 圆柱面的材质。
 * 过程：克隆材质，注入 Schlegel 投影 & 4D 旋转等工具函数，并在顶点阶段通过 transformCylinderPoint 计算圆柱表面点。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<number>} cylinderRadiusUni - 圆柱半径 uniform.
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} 新材质实例。
 */
function cylinderMaterial(
  material,
  cylinderRadiusUni,
  rotUni,
  projDistUni,
  isOrthoUni
) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.radius = cylinderRadiusUni;
    shader.uniforms.isOrtho = isOrthoUni;

    shader.vertexShader = `
      attribute vec4 v1;
      attribute vec4 v2;
      uniform float radius;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform float rotation4D[6];
      
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 计算 4D 空间中圆柱两端点的投影
      mat4 rotMat = create4DRotationMat(rotation4D);
      vec3 pv1 = schlegelProjection(rotMat * v1);
      vec3 pv2 = schlegelProjection(rotMat * v2);
      // 将模型顶点在 x, z 方向缩放至所需半径（让圆柱变粗/细）
      transformed.x *= radius;
      transformed.z *= radius;
      // 将顶点旋转平移到合适位置
      transformed = transformCylinderPoint(transformed + vec3(0.0, 0.5, 0.0), pv1, pv2);
      `
    );
  };

  return material;
}

/**
 * 3D 空间球体材质：在顶点阶段简单地按 radius 缩放顶点。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<number>} sphereRadiusUni - 球体半径 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function sphereMaterial3D(material, sphereRadiusUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.radius = sphereRadiusUni;

    shader.vertexShader = `
      uniform float radius;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 顶点按 radius 统一缩放
      transformed *= radius;
      `
    );
  };

  return material;
}

/**
 * 3D 空间圆柱材质：在顶点阶段按 x, z 方向缩放至所需半径。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<number>} cylinderRadiusUni - 圆柱半径 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function cylinderMaterial3D(material, cylinderRadiusUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.radius = cylinderRadiusUni;

    shader.vertexShader = `
      uniform float radius;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 让圆柱变粗/细
      transformed.x *= radius;
      transformed.z *= radius;
      `
    );
  };

  return material;
}

/**
 * 面片材质：将面的位置从 4D 空间经旋转后投影到 3D。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function faceMaterial(material, rotUni, projDistUni, isOrthoUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.isOrtho = isOrthoUni;

    shader.vertexShader = `
      attribute vec4 position4D;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform float rotation4D[6];
      
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 将四维位置旋转后投影到三维空间
      vec4 rotatedPosition4D = create4DRotationMat(rotation4D) * position4D;
      transformed = schlegelProjection(rotatedPosition4D);
      `
    );
  };

  return material;
}

/**
 * 轴线材质：在四维空间中选择某一坐标轴，映射为三维的一根圆柱。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisMaterial(material, rotUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      uniform float rotation4D[6];
      
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 根据 axis 决定投影到四维哪条轴上
      vec4 v = vec4(0.0);
      if (axis == 0u) v.x = 1.0;
      else if (axis == 1u) v.y = 1.0;
      else if (axis == 2u) v.z = 1.0;
      else if (axis == 3u) v.w = 1.0;
      // 投影并计算缩放，使圆柱长度符合 len
      vec3 vProj = (create4DRotationMat(rotation4D) * v).xyz;
      float s = length(vProj) / length(v);
      float scale = len / length(vProj) * s;
      vProj *= scale;
      // 旋转与平移
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), -vProj, vProj);
      `
    );
  };

  return material;
}

/**
 * 轴锥材质：在四维空间中选择轴线，并生成一个锥体。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisConeMaterial(material, rotUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float height;
      uniform float rotation4D[6];

      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 同 axisMaterial，但是底部坐标变成了坐标轴圆柱的结束坐标。
      vec4 v = vec4(0.0);
      if (axis == 0u) v.x = 1.0;
      else if (axis == 1u) v.y = 1.0;
      else if (axis == 2u) v.z = 1.0;
      else if (axis == 3u) v.w = 1.0;
      vec3 vProj = (create4DRotationMat(rotation4D) * v).xyz;
      float s = length(vProj) / length(v);
      float scale1 = len / length(vProj) * s;
      float scale2 = (len * s + height) / length(vProj);
      vec3 vProj1 = vProj * scale1;
      vec3 vProj2 = vProj * scale2;
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), vProj1, vProj2);
      `
    );
  };

  return material;
}

/**
 * 轴标签材质：在轴线上添加文本标签。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<[number, number, number, number, number, number]>} rotUni - 4D 旋转欧拉角 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisLabelMaterial(material, rotUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float offset;
      uniform float rotation4D[6];

      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 类似 axisCone，但是往坐标轴方向上偏移了一些。
      vec4 v = vec4(0.0);
      if (axis == 0u) v.x = 1.0;
      else if (axis == 1u) v.y = 1.0;
      else if (axis == 2u) v.z = 1.0;
      else if (axis == 3u) v.w = 1.0;
      vec3 vProj = (create4DRotationMat(rotation4D) * v).xyz;
      float s = length(vProj) / length(v);
      float scale1 = (len * s + offset) / length(vProj);
      float scale2 = (len * s + offset + 1.0) / length(vProj);
      vec3 vProj1 = vProj * scale1;
      vec3 vProj2 = vProj * scale2;
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), vProj1, vProj2);
      `
    );
  };

  return material;
}

export default {
  sphereMaterial,
  cylinderMaterial,
  sphereMaterial3D,
  cylinderMaterial3D,
  faceMaterial,
  axisMaterial,
  axisConeMaterial,
  axisLabelMaterial
};
