import { set } from 'lodash';

function getFarthestPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}

function getFarthest4DPointDist(points) {
  const getDist = p => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2 + p.w ** 2);
  return getDist(
    points.reduce((farthest, point) => {
      const dist = point.x ** 2 + point.y ** 2 + point.z ** 2 + point.w ** 2;
      return dist > (farthest.dist || -1) ? { point, dist } : farthest;
    }, {}).point
  );
}

// 修改材质属性
function changeMaterialProperty(group, propertyName, newValue) {
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

// 释放组
function disposeGroup(group) {
  group.traverse(child => {
    if (child.isMesh) {
      child.geometry?.dispose();
      child.material?.dispose();
    }
  });
  group.clear();
}

export {
  getFarthestPointDist,
  getFarthest4DPointDist,
  changeMaterialProperty,
  disposeGroup
};
