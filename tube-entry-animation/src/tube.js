import * as THREE from "three";

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1000, 200, 900),
  new THREE.Vector3(-400, 800, 1000),
  // 曲线的结束点一定是 0,0,0 这样管道出来相机才会正对着 3D 场景
  new THREE.Vector3(0, 0, 0),
]);

const geometry = new THREE.TubeGeometry(path, 100, 50, 30);

const material = new THREE.MeshBasicMaterial({
  color: "blue",
  wireframe: true,
});

const tube = new THREE.Mesh(geometry, material);
tube.position.set(0, 500, 800);

// 换成点模型
material.visible = false;
const pointsMaterial = new THREE.PointsMaterial({
    color: 'orange',
    size: 3
});
const points = new THREE.Points(geometry, pointsMaterial);
tube.add(points);

// 管道位置变了，拿到的点也得改一下位置
export const tubePoints = path.getSpacedPoints(1000).map((item) => {
  return new THREE.Vector3(item.x, item.y + 500, item.z + 800);
});

export default tube;
