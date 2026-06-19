import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mesh, light } from "./mesh5.js";

const scene = new THREE.Scene();
scene.add(mesh, light);

// // 就是在 XZ 平面上的铺一层网格
// // 在添加物体的时候，可以通过 GridHelper 来大概确定物体基于地面的位置
// const gridHelper = new THREE.GridHelper(
//   1000, 
//   10,
//   new THREE.Color('green'),
//   new THREE.Color('pink')
// );
// scene.add(gridHelper);

// // 需要标识方向的时候，可以用 ArrowHelper 画个箭头
// const origin = new THREE.Vector3( 0, 0, 0 );
// const dir = new THREE.Vector3( 1, 2, 0 );
// // 这里用 nomalize 方法把它变为长度为 1 的单位向量
// dir.normalize();
// const arrowHelper = new THREE.ArrowHelper( dir, origin, 500, new THREE.Color('yellow') );
// scene.add( arrowHelper );

// 坐标轴
const axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

// 极坐标
// 第一个参数是半径，第二个参数是画多少直线，第三个参数是画多少圆圈，第四个参数就是圆的分段数了。
const helper = new THREE.PolarGridHelper( 500, 5, 20, 8 );
// const helper = new THREE.PolarGridHelper( 500, 10, 5, 64 );
scene.add( helper );
const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
camera.position.set(200, 800, 800);
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
