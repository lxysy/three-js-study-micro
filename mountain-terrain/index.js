import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh.js";
import { updatePosition } from "./mesh.js";

const scene = new THREE.Scene();

scene.add(mesh);

const axesHelper = new THREE.AxesHelper(200);
// scene.add(axesHelper);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(400, 150, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function render() {
  updatePosition();
  // mesh.rotateZ(0.03);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// 自适应窗口变化
window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
	// 更新相机
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  // 更新DPR,减小渲染压力
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// controls.addEventListener("change", () => {
//   console.log(camera.position);
// });
