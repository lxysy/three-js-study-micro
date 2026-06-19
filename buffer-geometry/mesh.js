import * as THREE from "three";

const geometry = new THREE.BufferGeometry();
// 顶点数据 6个顶点 两个三角形
const vertices = new Float32Array([
  0, 0, 0,
  100, 0, 0,
  0, 100, 0,
  0, 0, 10,
  0, 0, 100,
  100, 0, 10,
]);

// 优化前
// const vertices1 = new Float32Array([
//   0, 0, 0,
//   100, 0, 0,
//   0, 100, 0,

//   // 0, 100, 0,
//   // 100, 0, 0,
//   100, 100, 0
// ]);

// 优化顶点数据存储，去掉重复数据，存索引
const vertices1 = new Float32Array([
  0, 0, 0,
  100, 0, 0,
  0, 100, 0,

  // 0, 100, 0,
  // 100, 0, 0,
  100, 100, 0
]);

const attribute = new THREE.BufferAttribute(vertices1, 3);
geometry.attributes.position = attribute;

// 存储顶点索引
const indexes = new Uint16Array([0, 1, 2, 2, 1, 3]);
geometry.index = new THREE.BufferAttribute(indexes, 1);

// 不受灯光影响材质
const material = new THREE.MeshBasicMaterial({
  color: new THREE.Color("orange"),
  // 展示线框
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;
