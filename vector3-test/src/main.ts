import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh.ts";
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.add(mesh);

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const helper = new THREE.AxesHelper(500);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(500, 500, 500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 可视化相机方向
const origin = new THREE.Vector3(300, 300, 300);
const cameraDir = camera.getWorldDirection(new THREE.Vector3());
const arrowHelper = new THREE.ArrowHelper(cameraDir, origin, 1000, "yellow");
scene.add(arrowHelper);

// 每个向量都可以归一化，变成长度为 1 的单位向量。
// 相机方向就是一个单位向量
console.log(origin.normalize(), cameraDir);

const gui = new GUI();

let originPosition = camera.position.clone();
// 向量加法
gui
  .add({ num: 0 }, "num", 0, 200)
  .onChange((value) => {
    // 将这个向量的每个分量都乘以 value（一个标量），相当于把向量拉长或缩短
    const dir = cameraDir.clone().multiplyScalar(value);
    // pos = originPosition + dir     ← 从起始位置出发，沿视线方向走 value
    const pos = originPosition.clone().add(dir);
    // 把相机移到新位置
    camera.position.copy(pos);
  })
  .name("add");
// 向量减法
gui
  .add({ num: 0 }, "num", 0, 200)
  .onChange((value) => {
    const dir = cameraDir.clone().multiplyScalar(value);
    const pos = originPosition.clone().sub(dir);
    camera.position.copy(pos);
  })
  .name("sub");

  