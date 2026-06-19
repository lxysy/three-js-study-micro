import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 创建场景
const scene = new THREE.Scene();

{
  // 立方体
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  // 漫反射材质
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color("orange"),
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);
}

{
  // 点光源
  const pointLight = new THREE.PointLight(0xffffff, 10000);
  pointLight.position.set(80, 80, 80);
  scene.add(pointLight);
}

{
  // 坐标系工具
  const axesHelper = new THREE.AxesHelper(200);
  scene.add(axesHelper);
}

{
  // 摄影机
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 透视
  // 角度、宽高比、近点、远点
  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(200, 200, 200);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  function render() {
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
  }

  render();
  document.body.append(renderer.domElement);

  // 原理就是监听cavas，更改相机参数
  // wheel pointerDown pointerCancel contextMenu keydown 事件 
  const controls = new OrbitControls(camera, renderer.domElement);
}
