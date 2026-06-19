import * as THREE from "three";

const geometry = new THREE.BufferGeometry();

const p1 = new THREE.Vector2(0, 0);
const p2 = new THREE.Vector2(50, 200);
const p3 = new THREE.Vector2(100, 0);

// 二次贝塞尔曲线
const curve = new THREE.QuadraticBezierCurve(p1, p2, p3);
//  取 20 个来设置到 BufferGeometry 来自定义几何体
const pointsArr = curve.getPoints(20);

geometry.setFromPoints(pointsArr);

const positions = geometry.attributes.position;

const colorsArr = [];

// for (let i = 0; i < positions.count; i++) {
//   const percent = i / positions.count;
//   // color 的三个值是红、绿、蓝，我们只改绿和蓝，分成 count 份，那每次的百分比就是 i / count
//   colorsArr.push(0, percent, 1 - percent);
// }

// Color 里有对应的 api
const color1 = new THREE.Color('orange');
const color2 = new THREE.Color('blue');
for (let i = 0; i < positions.count; i++) {
    const percent = i / positions.count; 
    // 确定起点颜色、终点颜色，用 color.lerp 可以计算中间某个百分比位置的颜色
    const c = color1.clone().lerp(color2, percent);
    colorsArr.push(c.r, c.g, c.b); 
}

const colors = new Float32Array(colorsArr);
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);

const material = new THREE.LineBasicMaterial({
  vertexColors: true,
});
const line = new THREE.Line(geometry, material);

export default line;
