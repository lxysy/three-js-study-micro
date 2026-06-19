import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from 'three/examples/jsm/Addons.js';
// import mesh from './mesh.js';

const scene = new THREE.Scene();
// scene.add(mesh);

const directionLight = new THREE.DirectionalLight(0xffffff);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const helper = new THREE.AxesHelper(500);
scene.add(helper);

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(300, 700, 300);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(width, height);

function render(time) {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// 加载hdr全景图
const rgbeloader = new RGBELoader();

rgbeloader.load("./pic.hdr", function (texture) {
  // 这张图的原始坐标系是经纬图（横向是经度、纵向是纬度），但 Three.js 需要用**立方体贴图（CubeMap）**的形式才能正确映射到场景的背景和反射上。
  // EquirectangularReflectionMapping 告诉 Three.js："这张图是经纬图格式的，你要负责把它转换成内部的 CubeMap 来用"。
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
});

const textureLoader = new THREE.TextureLoader();

textureLoader.load('./pic.jpg', function ( texture ) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
});

