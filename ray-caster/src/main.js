import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh2.js";

const scene = new THREE.Scene();

scene.add(mesh);

const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(500, 400, 300);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(500, 500, 500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

/** 根据canvas offsetX、offsetY 算出 射线需要的屏幕坐标
 * 屏幕坐标要求转换为这样 -1 到 1 的范围,画布中间是 0,0; setFromCamera 需要相机的屏幕坐标
 * canvas的原点在屏幕左上角,点击的网页的时候，距离 canvas 元素左上角的距离是 offsetX、offsetY
 * 比如 offsetX 除以 canvas 的宽度，那就是从 0 到 1 的范围。然后 * 2 就是从 0 到 2 的范围，再减去 1 就是 -1 到 1 的范围了。这样就可以实现点击生成射线。
 */
// renderer.domElement.addEventListener("click", handleClick);

function handleClick(e) {
  console.log(e,e?.offsetX, e?.offsetY);
  const y = -((e.offsetY / height) * 2 - 1);
  const x = (e.offsetX / width) * 2 - 1;
  console.log(x, y);

  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  // 可视化射线
  const arrowHelper = new THREE.ArrowHelper(
    rayCaster.ray.direction,
    rayCaster.ray.origin,
    3000
  );
  scene.add(arrowHelper);

  const intersections = rayCaster.intersectObjects(mesh.children);

  intersections.forEach((item) => {
    item.object.material.color = new THREE.Color("orange");
  });
}

// --------------- 优化：防治拖动触发点击事件click
let dragStartTime;
renderer.domElement.addEventListener("mousedown", () => {
  dragStartTime = Date.now();
});

renderer.domElement.addEventListener("mouseup", (e) => {
  const dragDuration = Date.now() - dragStartTime;
  if (dragDuration > 200) {
    // 超过200ms视为拖拽
    return;
  }
  handleClick(e);
});
