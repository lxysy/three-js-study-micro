import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh.js";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";

/**这节我们学了用 CSS2DRenderer 实现信息标注。

它是通过在 canvas 元素上加一层 div，根据 3D 物体的位置来计算出屏幕坐标的位置，调整标签位置，来实现在 3D 物体上加标注的功能。

咋要标注的物体上加一个 CSS2DObject，传入 dom 元素，这样就会在那里展示一个标注。

可以最开始设置标注的 visible 为 false，然后点击的时候再设置为 true，这样就是点击的时候显示标注的效果。

 */

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
camera.position.set(500, 600, 800);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// function render() {
//   renderer.render(scene, camera);
//   requestAnimationFrame(render);
// }

// render();
// document.body.append(renderer.domElement);

// 设置渲染器
const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(width, height);

// 我们创建一个 div，把两个 domElement 放进去，并且让 css2dRenderer.domElement 绝对定位并且不响应鼠标事件
const div = document.createElement("div");
div.style.position = "relative";
div.appendChild(css2Renderer.domElement);
css2Renderer.domElement.style.position = "absolute";
css2Renderer.domElement.style.left = "0px";
css2Renderer.domElement.style.top = "0px";
css2Renderer.domElement.style.pointerEvents = "none";

div.appendChild(renderer.domElement);
document.body.appendChild(div);

function render() {
  css2Renderer.render(scene, camera);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

const controls = new OrbitControls(camera, renderer.domElement);

// 窗口自适应
window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  css2Renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// 监听点击事件
/**
 * Three.js使用的是右手坐标系，其中Y轴向上为正方向。
 * 而浏览器的屏幕坐标系统通常是左上角为原点，Y轴向下为正。
 * 这意味着当我们在网页中获取鼠标事件的位置时，比如offsetY，它的值是从顶部开始计算的，越往下值越大。
 * 但Three.js中的坐标系Y轴方向相反，所以需要将Y坐标反转，使得在3D场景中，向上的方向对应屏幕上的向上移动。
 */
renderer.domElement.addEventListener("click", (e) => {
  // 计算屏幕坐标
  const x = (e.offsetX / width) * 2 - 1;
  const y = -((e.offsetY / height) * 2 - 1);

  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  // 获取射线穿过的mesh
  const intersections = rayCaster.intersectObjects(mesh.children);

  if (intersections.length) {
    const obj = intersections[0].object;
    const tag = obj.getObjectByName("tag");

    console.log(obj, tag);
    if (tag) {
      tag.visible = !tag.visible;
    }
  }
});
