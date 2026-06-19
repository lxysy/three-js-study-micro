import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshPhongMaterial({
  color: "orange",
});
const mesh = new THREE.Mesh(geometry, material);
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
camera.position.set(500, 600, 800);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
// 默认转一周 30s，你可以把速度调成 10s
controls.autoRotateSpeed = 10.0;
// 拖动惯性
controls.enableDamping = true;
// 是否允许旋转
// controls.enableRotate = false;
// // 平移
// controls.enablePan = false;
// // 缩放
// controls.enableZoom = false;
// 设置旋转最大角度 旋转相机的时候，经常能旋转到地面之下，其实这个也可以限制
controls.maxPolarAngle  = Math.PI /2;

// 自定义左键平移，右键旋转
// controls.mouseButtons = {
//   RIGHT: THREE.MOUSE.ROTATE,
//   LEFT: THREE.MOUSE.PAN
// }

controls.target.set(-373, -160, -257);

// 我们还经常监听 change 事件来拿到实时的相机位置和焦点
// 在设置相机焦点lookAt时，此时 OrbitControls 会接管相机，此时lookeAt无效
controls.addEventListener('change', () => {
  console.log(camera.position, controls.target);
})

// 前面我们都是自己写的相机圆周运动，其实 OrbitControls 自带这个
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);


