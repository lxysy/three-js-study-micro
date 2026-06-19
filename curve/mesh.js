import * as THREE from "three";

// 曲线 API 就是一些计算曲线坐标的公式，从中取出一些点用点模型或者线模型画出来。

// 椭圆 长短半轴 弧度
const arc = new THREE.EllipseCurve(0, 0, 100, 50, 0, Math.PI / 2);
// 从中取出一些点的坐标，传入的是分段数，20 段就是 21 个点
const pointsList = arc.getPoints(20);

const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(pointsList);

// const material = new THREE.PointsMaterial({
//   color: new THREE.Color("orange"),
//   size: 10,
// });
// const points = new THREE.Points(geometry, material);

const material = new THREE.LineBasicMaterial({
  color: new THREE.Color("orange"),
});
const line = new THREE.Line(geometry, material);

// console.log(points);

export default line;
