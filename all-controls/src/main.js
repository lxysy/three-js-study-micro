import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import mesh from "./mesh.js";
import {
  ArcballControls,
  DragControls,
  FirstPersonControls,
  FlyControls,
  MapControls,
  TrackballControls,
  TransformControls,
} from "three/examples/jsm/Addons.js";

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
// scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(500, 500, 500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);



// OrbitControls 轨道控制器
// const controls = new OrbitControls(camera, renderer.domElement);

// DragControls 拖拽控制器
// const box1 = scene.getObjectByName('box');
// const box2 = scene.getObjectByName('box2');
// box2.material = box1.material.clone();

// const controls = new DragControls([box1, box2], camera, renderer.domElement);

// controls.addEventListener( 'dragstart', function(event) {
// 	event.object.material.color.set('lightgreen');
// });

// controls.addEventListener( 'dragend', function(event) {
// 	event.object.material.color.set('orange');
// });

// controls.addEventListener('hoveron', (event) => {
//   event.object.material.wireframe = true;
// });

// controls.addEventListener('hoveroff', (event) => {
//   event.object.material.wireframe = false;
// });

// FlyControls 飞行控制器
// FlyControls 是飞行，所以可以旋转超过 90 度
// 操作方式是这样的：
// 鼠标向左/按←键：向左旋转
// 鼠标向右/按→键：向左旋转
// 鼠标向上/按↑键：向上旋转
// 鼠标向下/按↓键：向下旋转
// 按住鼠标左键：向前
// 按住鼠标右键：向后


// const controls = new FlyControls(camera, renderer.domElement);
// controls.movementSpeed = 100;

// FirstPersonControls 第一人称控制器
// FirstPersonControls 是行走，所以向上向下不能旋转超过 90 度
// const controls = new FirstPersonControls(camera, renderer.domElement);
// controls.movementSpeed = 100;

// controls.rollSpeed = Math.PI / 10;



// TransformControls 变换控制器
const box1 = scene.getObjectByName('box');
const box2 = scene.getObjectByName('box2');

const controls = new TransformControls(camera, renderer.domElement);
controls.attach(box1);
// 可以隐藏 X 轴
// controls.showX = false;
scene.add(controls.getHelper());

// controls.setMode('rotate')
controls.setMode('translate')
// controls.setMode('scale')

// MapControls 地图控制器
// 它默认是左键平移，右键旋转，和 OrbitControls 正好相反
// const controls = new MapControls(camera, renderer.domElement);


const clock = new THREE.Clock();
function render() {
  controls.update(clock.getDelta());

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
document.body.append(renderer.domElement);

