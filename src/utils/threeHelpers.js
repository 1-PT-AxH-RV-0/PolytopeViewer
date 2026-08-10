import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { set } from 'lodash';

/**
 * 修改材质属性。
 * @param {THREE.Group} group - 组。
 * @param {string} propertyName - 属性路径。
 * @param {any} newValue - 新值。
 */
export function changeMaterialProperty(group, propertyName, newValue) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.material) {
      if (!Array.isArray(child.material)) {
        set(child.material, propertyName, newValue);
        child.material.needsUpdate = true;
      } else {
        for (let material of child.material) {
          set(material, propertyName, newValue);
          material.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * 释放组。
 * @param {THREE.Group} group - 组。
 */
export function disposeGroup(group) {
  group.traverse(child => {
    if (child.isMesh) {
      child.geometry?.dispose();
      child.material?.dispose();
    }
  });
  group.clear();
}

/**
 * 转换其他 Geometry 到 BufferGeometry。
 * @param {(THREE.SphereGeometry | THREE.CylinderGeometry | THREE.ConeGeometry | TextGeometry)} source - 非 BufferGeometry 类型的 Geometry。
 * @returns {THREE.BufferGeometry} - 复制了 position、normal、uv 数据的 BufferGeometry。
 */
export function toBufferGeometry(source) {
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
