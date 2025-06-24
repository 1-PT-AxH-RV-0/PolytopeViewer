import * as THREE from 'three';
import { toBufferGeometry } from './geometries.js'
import { set } from 'lodash';

function getFarthestPointDist(points) {
    const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2)
    return getDist(points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point);
}

function getFarthest4DPointDist(points) {
    const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2 + p.w ** 2)
    return getDist(points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2 + point.w ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point);
}

// 修改材质属性
function changeMaterialProperty(group, propertyName, newValue) {
    if (!group) return;
    group.traverse((child) => {
        if (child.isMesh && child.material) {
            if (!Array.isArray(child.material)) {
                set(child.material, propertyName, newValue);
                child.material.needsUpdate = true;
            } 
            else {
                for (let material of child.material) {
                    set(material, propertyName, newValue);
                    material.needsUpdate = true;
                }
            }
        }
    });
}

// 修改球体半径
function changeSpheresRadius(group, newRadius) {
  if (!group) return;
  group.children.forEach(child => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
      child.geometry.dispose();
      child.geometry = new THREE.SphereGeometry(
        newRadius,
        child.geometry.parameters.widthSegments,
        child.geometry.parameters.heightSegments
      );
    } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
      const centerAttr = child.geometry.getAttribute('center4D');
      child.geometry.dispose();
      child.geometry = toBufferGeometry(new THREE.SphereGeometry(
        newRadius,
        child.geometry.parameters.widthSegments,
        child.geometry.parameters.heightSegments
      ));
      child.geometry.setAttribute('center4D', centerAttr)
    }
  });
}

// 修改圆柱半径
function changeCylindersRadius(group, newRadius) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.geometry instanceof THREE.CylinderGeometry) {
      const oldGeo = child.geometry;

      child.geometry.dispose();
      child.geometry = new THREE.CylinderGeometry(
        newRadius,
        newRadius,
        oldGeo.parameters.height,
        oldGeo.parameters.radialSegments,
        oldGeo.parameters.heightSegments
      );
    } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
      const v1Attr = child.geometry.getAttribute('v1');
      const v2Attr = child.geometry.getAttribute('v2');
      
      child.geometry.dispose();
      child.geometry = toBufferGeometry(new THREE.CylinderGeometry(
        newRadius,
        newRadius,
        1,
        child.geometry.parameters.radialSegments,
        child.geometry.parameters.heightSegments
      ));
      child.geometry.setAttribute('v1', v1Attr)
      child.geometry.setAttribute('v2', v2Attr)
    }
  });
}

// 释放组
function disposeGroup(group) {
    group.traverse((child) => {
        if (child.isMesh) {
            child.geometry?.dispose();
            child.material?.dispose();
        }
    });
    group.clear();
}

export {getFarthestPointDist, getFarthest4DPointDist, changeMaterialProperty, changeSpheresRadius, changeCylindersRadius, disposeGroup}
