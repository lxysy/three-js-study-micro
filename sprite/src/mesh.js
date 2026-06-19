import * as THREE from "three";

const group = new THREE.Group();

// 创建 Sprite，它只有材质，没有几何体（因为它固定是矩形平面）。
// 没有 geometry，默认都是 1 * 1 的矩形平面
// 永远面向摄像头
const spriteMaterial = new THREE.SpriteMaterial({
  color: "orange",
});

const sprite = new THREE.Sprite(spriteMaterial);

group.add(sprite);

const geometry = new THREE.PlaneGeometry(1, 1);
const mesh = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    color: "lightblue",
  })
);
mesh.position.y = 3;

group.add(mesh);

export default group;
