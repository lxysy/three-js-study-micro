import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh, { tubePoints } from "./mesh.js";

const scene = new THREE.Scene();
scene.add(mesh);

const axesHelper = new THREE.AxesHelper(200);
scene.add(axesHelper);

const pointLight = new THREE.PointLight(0xffffff, 200);
pointLight.position.set(80, 80, 80);
scene.add(pointLight);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(200, 200, 200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

let i = 0;
function render() {
  if (i < tubePoints.length - 1) {
    // 将摄像机的位置设置为tubePoints数组中第i个点的位置
    camera.position.copy(tubePoints[i]);
    // lookAt方法会使摄像机的视线指向指定的三维坐标点。这样，当摄像机沿着路径移动时，它总是朝向前方路径上的下一个点，从而保持一个连贯的视角
    camera.lookAt(tubePoints[i + 1]);
    i += 1;
  } else {
    i = 0;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 还可以把它改成键盘控制,按向下的键才会动
// document.addEventListener("keydown", (e) => {
//   if (e.code === "ArrowDown") {
//     i += 10;
//   }
// });
