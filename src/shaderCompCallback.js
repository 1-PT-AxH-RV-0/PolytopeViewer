import * as THREE from 'three';
import shaderFuncs from './GLSLs.js';

/**
 * 3D 空间球体材质：在顶点阶段简单地按 radius 缩放顶点。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<number>} sphereRadiusUni - 球体半径 uniform.
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function sphereMaterial3D(material, sphereRadiusUni, rotUni, ofs3Uni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.radius = sphereRadiusUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.vertexShader = `
      attribute vec3 pos;
      uniform float radius;
      uniform mat4 rotation4D;
      uniform vec3 offset3D;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 顶点按 radius 统一缩放
      transformed *= radius;
      transformed += (rotation4D * vec4(pos, 0)).xyz;
      transformed += offset3D;
      `
    );
  };

  return material;
}

/**
 * 3D 空间圆柱材质：在顶点阶段按 x, z 方向缩放至所需半径。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<number>} cylinderRadiusUni - 圆柱半径 uniform.
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function cylinderMaterial3D(material, cylinderRadiusUni, rotUni, ofs3Uni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.radius = cylinderRadiusUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset3D = ofs3Uni;

    shader.vertexShader = `
      attribute vec3 v1;
      attribute vec3 v2;
      uniform float radius;
      uniform mat4 rotation4D;
      uniform vec3 offset3D;
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <defaultnormal_vertex>',
        `
      #include <defaultnormal_vertex>
      // 计算法向量。
      vec3 transformedV1 = (rotation4D * vec4(v1, 0)).xyz;
      vec3 transformedV2 = (rotation4D * vec4(v2, 0)).xyz;
      
      objectNormal = transformCylinderPoint(objectNormal, transformedV1, transformedV2);
      transformedNormal = normalMatrix * objectNormal;
      `
      )
      .replace(
        '#include <begin_vertex>',
        `
      #include <begin_vertex>
      // 让圆柱变粗/细。
      transformed.x *= radius;
      transformed.z *= radius;
      transformed.y += 0.5;
      transformed = transformCylinderPoint(transformed, transformedV1, transformedV2);
      transformed += offset3D;
      `
      );
  };

  return material;
}

/**
 * 面片材质，在 Shader 中旋转顶点。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function faceMaterial3D(material, rotUni, ofs3Uni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset3D = ofs3Uni;

    shader.vertexShader = `
      uniform mat4 rotation4D;
      uniform vec3 offset3D;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 将位置旋转。
      transformed = (rotation4D * vec4(transformed, 0)).xyz;
      transformed += offset3D;
      `
    );
  };

  return material;
}

/**
 * 创建一个可以在顶点着色器中将网格顶点映射到4D球面的材质。
 * 过程：克隆材质，注入 Schlegel 投影、4D 旋转矩阵等 GLSL 片段，并在顶点阶段根据旋转和投影计算出 3D 坐标。
 * @param {THREE.Material} material - 原始 Three.js 材质。
 * @param {THREE.IUniform<number>} sphereRadiusUni - 球体半径 uniform.
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} 新的材质实例。
 */
function sphereMaterial(
  material,
  sphereRadiusUni,
  rotUni,
  ofsUni,
  ofs3Uni,
  projDistUni,
  isOrthoUni
) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.radius = sphereRadiusUni;
    shader.uniforms.isOrtho = isOrthoUni;

    shader.vertexShader = `
      attribute vec4 center4D;
      uniform float radius;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;

      ${shaderFuncs.schlegelProjection}
      ${shader.vertexShader}
    `;

    // 替换 <begin_vertex> 段，将顶点先缩放再移到四维中心投影位置
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 将顶点按球体半径缩放，再加上中心点的 3D 投影
      vec3 center3D = schlegelProjection(rotation4D * center4D + offset4D);
      float radius_scale = max(length(center3D) / length(center4D), 0.1);
      transformed = transformed * radius * radius_scale + center3D + offset3D;
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
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} 新材质实例。
 */
function cylinderMaterial(
  material,
  cylinderRadiusUni,
  rotUni,
  ofsUni,
  ofs3Uni,
  projDistUni,
  isOrthoUni
) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.radius = cylinderRadiusUni;
    shader.uniforms.isOrtho = isOrthoUni;

    shader.vertexShader = `
      attribute vec4 v1;
      attribute vec4 v2;
      uniform float radius;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;
      
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <defaultnormal_vertex>',
        `
      #include <defaultnormal_vertex>
      // 计算 4D 空间中圆柱两端点的投影
      vec3 pv1 = schlegelProjection(rotation4D * v1 + offset4D);
      vec3 pv2 = schlegelProjection(rotation4D * v2 + offset4D);
      // 计算法向量
      objectNormal = transformCylinderPoint(objectNormal, pv1, pv2);
      transformedNormal = normalMatrix * objectNormal;
      `
      )
      .replace(
        '#include <begin_vertex>',
        `
      #include <begin_vertex>
      float v1_radius_scale = max(length(pv1) / length(v1), 0.1);
      float v2_radius_scale = max(length(pv2) / length(v2), 0.1);

      transformed.y += 0.5;
      // 判断顶点在哪一头
      vec3 transformed_simulation = transformCylinderPoint(transformed, pv1, pv2);
      
      vec3 diff1 = transformed_simulation - pv1;
      vec3 diff2 = transformed_simulation - pv2;
      
      bool closerToPv1 = dot(diff1, diff1) < dot(diff2, diff2);
      
      // 缩放成锥台
      float radius_scale = closerToPv1 ? v1_radius_scale : v2_radius_scale;
      transformed.x *= radius * radius_scale;
      transformed.z *= radius * radius_scale;
      transformed = transformCylinderPoint(transformed, pv1, pv2) + offset3D;
      `
      );
  };

  return material;
}

/**
 * 面片材质：将面的位置从 4D 空间经旋转后投影到 3D。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} projDistUni - 投影距离 uniform.
 * @param {THREE.IUniform<boolean>} isOrthoUni - 是否正交投影 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function faceMaterial(
  material,
  rotUni,
  ofsUni,
  ofs3Uni,
  projDistUni,
  isOrthoUni
) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.isOrtho = isOrthoUni;

    shader.vertexShader = `
      attribute vec4 position4D;
      uniform float projectionDistance;
      uniform bool isOrtho;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;
      
      ${shaderFuncs.schlegelProjection}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // 将四维位置旋转后投影到三维空间
      vec4 rotatedPosition4D = rotation4D * position4D + offset4D;
      transformed = schlegelProjection(rotatedPosition4D) + offset3D;
      `
    );
  };

  return material;
}

/**
 * 轴线材质：在四维空间中选择某一坐标轴，映射为三维的一根圆柱。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisMaterial(material, rotUni, ofsUni, ofs3Uni, offsetScaleUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.offsetScale = offsetScaleUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;
      uniform float offsetScale;
      
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
      vec3 vProj = (rotation4D * v).xyz;
      float s = length(vProj) / length(v);
      float scale = len / length(vProj) * s;
      vProj *= scale;
      // 旋转与平移
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), -vProj + offset4D.xyz * offsetScale, vProj + offset4D.xyz * offsetScale) + offset3D * offsetScale;
      `
    );
  };

  return material;
}

/**
 * 轴锥材质：在四维空间中选择轴线，并生成一个锥体。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisConeMaterial(material, rotUni, ofsUni, ofs3Uni, offsetScaleUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.offsetScale = offsetScaleUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float height;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;
      uniform float offsetScale;

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
      vec3 vProj = (rotation4D * v).xyz;
      float s = length(vProj) / length(v);
      float scale1 = len / length(vProj) * s;
      float scale2 = (len * s + height) / length(vProj);
      vec3 vProj1 = vProj * scale1;
      vec3 vProj2 = vProj * scale2;
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), vProj1 + offset4D.xyz * offsetScale, vProj2 + offset4D.xyz * offsetScale) + offset3D * offsetScale;
      `
    );
  };

  return material;
}

/**
 * 轴标签材质：在轴线上添加文本标签。
 * @param {THREE.Material} material - 原始材质。
 * @param {THREE.IUniform<THREE.Matrix4>} rotUni - 4D 旋转矩阵 uniform.
 * @param {THREE.IUniform<THREE.Vector4>} ofsUni - 4D 位置偏移 uniform.
 * @param {THREE.IUniform<THREE.Vector3>} ofs3Uni - 3D 位置偏移 uniform.
 * @param {THREE.IUniform<number>} offsetScaleUni - 位置偏移缩放 uniform.
 * @returns {THREE.Material} - 新材质实例。
 */
function axisLabelMaterial(material, rotUni, ofsUni, ofs3Uni, offsetScaleUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.rotation4D = rotUni;
    shader.uniforms.offset4D = ofsUni;
    shader.uniforms.offset3D = ofs3Uni;
    shader.uniforms.offsetScale = offsetScaleUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float offset;
      uniform mat4 rotation4D;
      uniform vec4 offset4D;
      uniform vec3 offset3D;
      uniform float offsetScale;

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
      vec3 vProj = (rotation4D * v).xyz;
      float s = length(vProj) / length(v);
      float scale1 = (len * s + offset) / length(vProj);
      float scale2 = (len * s + offset + 1.0) / length(vProj);
      vec3 vProj1 = vProj * scale1;
      vec3 vProj2 = vProj * scale2;
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), vProj1 + offset4D.xyz * offsetScale, vProj2 + offset4D.xyz * offsetScale) + offset3D * offsetScale;
      `
    );
  };

  return material;
}

export default {
  sphereMaterial3D,
  cylinderMaterial3D,
  faceMaterial3D,
  sphereMaterial,
  cylinderMaterial,
  faceMaterial,
  axisMaterial,
  axisConeMaterial,
  axisLabelMaterial
};
