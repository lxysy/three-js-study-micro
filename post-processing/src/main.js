import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh2.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const scene = new THREE.Scene();

scene.add(mesh);

const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(300, 200, 400);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(0, 500, 500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

/**创建 EffectComposer 对象，调用 addPass 方法添加了 3 个 Pass：
RenderPass 渲染场景，OutlinePass 描边，UnrealBloomPass 发光
注意要把渲染循环里的 renderer.render 换成 composor.render */
// 后期处理 EffectComposer 可以组织多个 Pass
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 描边
const v = new THREE.Vector2(window.innerWidth, window.innerWidth);
const outlinePass = new OutlinePass(v, scene, camera);
// 颜色
outlinePass.visibleEdgeColor.set("orange");
// 亮度
outlinePass.edgeStrength = 10;
// 描边厚度
outlinePass.edgeThickness = 10;
// 闪烁频率
outlinePass.pulsePeriod = 1;
composer.addPass(outlinePass);

// 发光
const bloomPass = new UnrealBloomPass(v);
bloomPass.strength = 0.5;
// composer.addPass(bloomPass);

function render() {
  // renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function handleClick(e) {
  const y = -((e.offsetY / height) * 2 - 1);
  const x = (e.offsetX / width) * 2 - 1;

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

  // 后期处理
  if (intersections.length) {
    // 这个target是在遍历模型时添加的，点击马尾和马的身体分别是不同部分描边，因为马包含两个 mesh
    outlinePass.selectedObjects = [intersections[0].object.target];

    // 选中时添加发光pass
    if (!composer.passes.includes(bloomPass)) {
      composer.addPass(bloomPass);
    }
  } else {
    outlinePass.selectedObjects = [];
    composer.removePass(bloomPass);
  }

  intersections.forEach((item) => {
    // item.object.material.color = new THREE.Color("pink");
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
