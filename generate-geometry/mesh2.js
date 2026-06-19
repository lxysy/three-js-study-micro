import * as THREE from "three";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const p1 = new THREE.Vector3(-100, 0, 0);
const p2 = new THREE.Vector3(50, 100, 0);
const p3 = new THREE.Vector3(100, 0, 100);
const p4 = new THREE.Vector3(100, 0, 0);

const curve = new THREE.CubicBezierCurve3(p1, p2, p3, p4);

//通过贝塞尔曲线当做路径画管道 后面几个参数分别是组成管道的分段数、半径、圆的分段数
const geometry = new THREE.TubeGeometry(curve, 50, 20, 20);

const materail = new THREE.MeshLambertMaterial({
  color: new THREE.Color("orange"),
  side: THREE.DoubleSide,
  wireframe: true,
});

const mesh = new THREE.Mesh(geometry, materail);

// 调试面板
const gui = new GUI();

const obj = {
    tubularSegments: 50,
    radius: 20,
    radialSegments: 20
}
function onChange() {
    mesh.geometry = new THREE.TubeGeometry(
        curve,
        obj.tubularSegments,
        obj.radius,
        obj.radialSegments
    );
}
gui.add(obj, 'tubularSegments').onChange(onChange)
    .min(3).max(100).step(1).name('管道方向分段数');
gui.add(obj, 'radius').onChange(onChange)
    .min(10).max(100).step(0.1).name('半径');
gui.add(obj, 'radialSegments').onChange(onChange)
    .min(3).max(100).step(1).name('横截面分段数');

// ---------------------------------------------------------------
const geometry2 = new THREE.BufferGeometry();
geometry2.setFromPoints([p1, p2, p3, p4]);
const material2 = new THREE.PointsMaterial({
  color: new THREE.Color("blue"),
  size: 10,
});
const points2 = new THREE.Points(geometry2, material2);
const line2 = new THREE.Line(geometry2, new THREE.LineBasicMaterial());
mesh.add(points2, line2);

export default mesh;
