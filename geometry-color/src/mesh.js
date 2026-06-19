import * as THREE from "three";

const geometry = new THREE.BufferGeometry();

const point1 = new THREE.Vector3(0, 0, 0);
const point2 = new THREE.Vector3(0, 100, 0);
const point3 = new THREE.Vector3(100, 0, 0);
geometry.setFromPoints([point1, point2, point3]);

const colors = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);

// const material = new THREE.PointsMaterial({
//     // 一定要在材质里设置 vertexColors 为 true 才会用你自定义的顶点颜色
//     vertexColors:true,
//     size: 30,
// });
// const points = new THREE.Points(geometry, material);

// 使用现模型和材质这里会有渐变色
// const material = new THREE.LineBasicMaterial({
//   vertexColors: true
// });
// const line = new THREE.LineLoop(geometry, material);

// 因为这里顶点顺序是顺时针构成的三角形，是反面，默认不渲染反面，要反过来才能看到
// 一个渐变色构成的三角形,自定义顶点颜色可以实现渐变色的效果
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
const mesh = new THREE.Mesh(geometry, material);

export default mesh;
