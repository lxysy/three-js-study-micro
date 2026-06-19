import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh, { showBoxHelper } from "./mesh.js";
import { DecalGeometry } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
scene.add(mesh);

const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.set(500, 600, 400);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);

// 加载贴图
const loader = new THREE.TextureLoader();
const texture = loader.load("./xiaoxin.png");
texture.colorSpace = THREE.SRGBColorSpace;

// 通过点击添加 decal 贴花
renderer.domElement.addEventListener("click", (e) => {
  // 将鼠标像素坐标转换为 NDC（归一化设备坐标），范围 [-1, 1]
  // offsetX：点击位置距离元素左边缘的像素值（从左到右递增）
  // offsetY：点击位置距离元素上边缘的像素值（从上到下递增）
  // X: offsetX / width  → [0,1]  → *2-1 → [-1,1]（从左到右）
  // Y: offsetY / height → [0,1]  → *2-1 → [-1,1] → 取反 → [1,-1]（Y轴朝上）
  const y = -((e.offsetY / height) * 2 - 1);
  const x = (e.offsetX / width) * 2 - 1;

  // Raycaster 接收的坐标范围是 [-1, 1]，所以需要把像素坐标转换过去
  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

  // 直接用 rayCaster.intersectObjects(mesh) 会检测射线与 Group 本身是否相交——但 Group 没有几何体（没有 geometry），所以永远检测不到。
  // mesh.children 拿到的是一个数组，包含 Group 下的所有子对象
  const intersections = rayCaster.intersectObjects(mesh.children);

  if (intersections.length) {
    // 获取交点位置和面法线
    const intersect = intersections[0];
    const position = intersect.point;
    // 将法线从物体局部空间转换到世界空间
    const normal = intersect.face.normal.clone();
    normal.transformDirection(intersect.object.matrixWorld);
    // 让贴花的 Z 轴指向法线方向，使贴花垂直于表面
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), normal
    );
    const orientation = new THREE.Euler().setFromQuaternion(quat);

    const size = new THREE.Vector3(100, 100, 100);
    const geometry1 = new DecalGeometry(
      intersections[0].object,
      position,
      orientation,
      size,
    );
    const material1 = new THREE.MeshPhongMaterial({
      polygonOffset: true,
      polygonOffsetFactor: -4,
      map: texture,
      transparent: true,
    });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    scene.add(mesh1);

    showBoxHelper(size, position, orientation);
  }
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
