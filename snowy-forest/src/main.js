import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mountainside from "./mountainside.js";
import loadTree from "./tree.js";
import snow from "./snow.js";

const scene = new THREE.Scene();

// loadTree((tree) => {
//   scene.add(tree);
//   scene.traverse((obj) => {
//     if (obj.isMesh) {
//       console.log(obj.name, obj);
//     }
//   });
// });
scene.add(mountainside);
scene.add(snow);

const directionLight = new THREE.DirectionalLight(0xffffff, 5);
directionLight.position.set(1000, 2000, 1000);
directionLight.castShadow = true;
directionLight.shadow.camera.left = -2000;
directionLight.shadow.camera.right = 2000;
directionLight.shadow.camera.top = 2000;
directionLight.shadow.camera.bottom = -2000;
directionLight.shadow.camera.near = 0.5;
directionLight.shadow.camera.far = 10000;
scene.add(directionLight);

const cameraHelper = new THREE.CameraHelper(directionLight.shadow.camera);
scene.add(cameraHelper);

const width = window.innerWidth;
const height = window.innerHeight;

// 近截面设置远一点，防止过大的雪花刷新到摄像机前
const camera = new THREE.PerspectiveCamera(60, width / height, 100, 10000);
camera.position.set(300, 300, 500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  // antialias: true,
});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;

// function render() {
//   renderer.render(scene, camera);
//   requestAnimationFrame(render);
// }

// 圆周运动相机
let angle = 0;
let r = 1000;
function render() {
  angle += 0.03;

  camera.position.x = r * Math.cos(angle);
  camera.position.z = r * Math.sin(angle);

  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

renderer.setClearColor(new THREE.Color("darkblue"));
document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
