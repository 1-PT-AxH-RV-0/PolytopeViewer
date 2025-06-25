import shaderFuncs from './GLSLs.js';

function sphereMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;

    shader.vertexShader = `
      attribute vec4 center4D;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec3 center3D = schlegelProjection(create4DRotationMat(rotation4D) * center4D);
      transformed = transformed + center3D;
      `
    );
  };

  return material;
}

function cylinderMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;

    shader.vertexShader = `
      attribute vec4 v1;
      attribute vec4 v2;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      mat4 rotMat = create4DRotationMat(rotation4D);
      vec3 pv1 = schlegelProjection(rotMat * v1);
      vec3 pv2 = schlegelProjection(rotMat * v2);
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), pv1, pv2);
      `
    );
  };

  return material;
}

function faceMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;

    shader.vertexShader = `
      attribute vec4 position4D;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 rotatedPosition4D = create4DRotationMat(rotation4D) * position4D;
      transformed = schlegelProjection(rotatedPosition4D);
      `
    );
  };

  return material;
}

function axisMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 v = vec4(0.0, 0.0, 0.0, 0.0);
      if (axis == 0u) v.x = projectionDistance / 2.0;
      else if (axis == 1u) v.y = projectionDistance / 2.0;
      else if (axis == 2u) v.z = projectionDistance / 2.0;
      else if (axis == 3u) v.w = projectionDistance / 2.0;
      
      vec3 vProj = schlegelProjection(create4DRotationMat(rotation4D) * v);
      float s = length(vProj) / length(v);
      float scale = len / length(vProj) * s;
      vProj *= scale;
      
      transformed = transformCylinderPoint(position + vec3(0.0, 0.5, 0.0), -vProj, vProj);
      `
    );
  };

  return material;
}

function axisConeMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float height;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 v = vec4(0.0, 0.0, 0.0, 0.0);
      if (axis == 0u) v.x = projectionDistance / 2.0;
      else if (axis == 1u) v.y = projectionDistance / 2.0;
      else if (axis == 2u) v.z = projectionDistance / 2.0;
      else if (axis == 3u) v.w = projectionDistance / 2.0;
      
      vec3 vProj = schlegelProjection(create4DRotationMat(rotation4D) * v);
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

function axisLabelMaterial(material, rotUni, projDistUni) {
  material = material.clone();

  material.onBeforeCompile = shader => {
    shader.uniforms.projectionDistance = projDistUni;
    shader.uniforms.rotation4D = rotUni;
    material.userData.projectionDistance = shader.uniforms.projectionDistance;
    material.userData.rotation4D = shader.uniforms.rotation4D;

    shader.vertexShader = `
      attribute uint axis;
      attribute float len;
      attribute float offset;
      ${shaderFuncs.schlegelProjection}
      ${shaderFuncs.create4DRotationMat}
      ${shaderFuncs.rotationArrUni}
      ${shaderFuncs.transformCylinderPoint}
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 v = vec4(0.0, 0.0, 0.0, 0.0);
      if (axis == 0u) v.x = projectionDistance / 2.0;
      else if (axis == 1u) v.y = projectionDistance / 2.0;
      else if (axis == 2u) v.z = projectionDistance / 2.0;
      else if (axis == 3u) v.w = projectionDistance / 2.0;
      
      vec3 vProj = schlegelProjection(create4DRotationMat(rotation4D) * v);
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
  faceMaterial,
  axisMaterial,
  axisConeMaterial,
  axisLabelMaterial
};
