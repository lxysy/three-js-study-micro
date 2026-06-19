// 从threejs中可以看到它把 /examples/jsm/* 映射成了 addons/*
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
const gui = new GUI();


// const geometry = new THREE.BoxGeometry(100, 100, 100);
// const material = new THREE.MeshLambertMaterial({
//   color: new THREE.Color("orange"),
// });
// const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

// PointLight DirectionalLight
// const directionalLight = new THREE.DirectionalLight(0xffffff);
const directionalLight = new THREE.PointLight(0xffffff, 10000000);
directionalLight.position.set(1000, 1000, 500);
// 设置 light 产生阴影
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -500;
directionalLight.shadow.camera.right = 500;
directionalLight.shadow.camera.top = 500;
directionalLight.shadow.camera.bottom = -500;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 10000;

gui.add(directionalLight.position, 'x', 0, 10000);
gui.add(directionalLight.position, 'y', 0, 10000);
gui.add(directionalLight.position, 'z', 0, 10000);

scene.add(directionalLight);
// 这里可以看到他是一个正交相机
console.log(directionalLight.shadow.camera);
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);



const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

// const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
// camera.position.set(400, 200, 300);
// camera.lookAt(0, 0, 0);

// 正交相机
// const aspectRatio = width / height;
// const num = 500;
// // 我们同样按照网页的宽高比来设置宽高，先计算出宽高比 aspectRatio
// // -num 到 num 是高度，那乘以宽高比之后 -num * aspectRatio 到 num * aspectRatio 就是宽度
// const camera2 = new THREE.OrthographicCamera(
//   -num * aspectRatio,
//   num * aspectRatio,
//   num,
//   -num,
//   0.1,
//   5000
// );
// camera2.position.set(400, 200, 300);
// camera2.lookAt(0, 0, 0);

// const cameraHelper = new THREE.CameraHelper(camera2);
// scene.add(cameraHelper);

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(1000, 2000, 1000);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
// 因为阴影计算是消耗性能的所以默认没有开启 要开启的话就要设置 Renderer 和哪些 Light、Mesh 要计算阴影
renderer.shadowMap.enabled = true;

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
