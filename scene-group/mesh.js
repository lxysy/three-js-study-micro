import * as THREE from "three";

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color("orange"),
});

const mesh = new THREE.Mesh(geometry, material);
// 如果你想找特定的 Mesh，那可以给他一个 name
mesh.name = "cube";

export default mesh;
