import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import loadTree from "./tree";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
const gui = new GUI();

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshLambertMaterial({
  color: "orange",
});
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// 这里两个mesh相互影响了
const mesh2 = mesh.clone();
// 将几何体和材质也同样克隆
mesh2.geometry = mesh2.geometry.clone();
mesh2.material = mesh2.material.clone();
mesh2.material.color.set("lightgreen");
mesh2.position.y = 200;
// scene.add(mesh2);

// 更改顶点 同时改变了 因为 mesh 和 mesh2 的 geometry 和 material 是共用的
const positions = mesh2.geometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  positions.setX(i, positions.getX(i) * 2);
}

const mesh3 = mesh.clone();
mesh3.position.x = 200;
const mesh4 = mesh.clone();
mesh4.position.x = -200;
// scene.add(mesh3, mesh4);
// 这里的mesh mesh3 mesh4是共用材质的,可同时设置隐藏
// mesh.material.visible = false;
const meshFolder3 = gui.addFolder("mesh2");
meshFolder3.add(mesh2.position, "x").min(-500).max(500).step(10);
meshFolder3.add(mesh2.position, "y").min(-500).max(500).step(10);
meshFolder3.add(mesh2.position, "z").min(-500).max(500).step(10);

const group1 = new THREE.Group();
group1.add(mesh2, mesh3, mesh4);
// scene.add(group1)

// 加载模型
// todo: 换成其他模型,看不到复制出来的模型? 似乎重合了,对tree2的设置无效
loadTree((tree) => {
  const group = new THREE.Group();

  tree.scale.set(20, 20, 20);
  tree.getObjectByName("Cylinder_1")?.material.color.set("green");
  tree.getObjectByName("tree001")?.material.color.set("brown");
  // tree.position.set(200, 0, 0);

  const cloneTree = (source) => {
    const cloned = source.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.geometry = child.geometry?.clone();
        child.material = child.material?.clone();
      }
    });
    return cloned;
  };

  // const tree2 = tree.clone(true);
  const tree2 = cloneTree(tree);
  console.log(11, tree);
  console.log(22, tree2.type, tree2);
  // tree2.position.x = -200;
  // tree2.position.set(-200, 0, 0);
  // tree2.scale.set(20, 20, 20);
  // tree2.updateMatrixWorld(true);
  // tree2.traverse((obj) => {
  //   if (obj.isMesh) {
  //     obj.material = obj.material.clone();
  //   }
  // });
  tree2.getObjectByName("Cylinder")?.material.color.set("orange");
  // const tree3 = tree.clone();
  // tree3.position.x = 200;

  // group.add(tree, tree2);
  group.add(tree);
  // group.add(tree2)

  // group.position.z = 300;
  // console.log(
  //   "Tree1 World Position:",
  //   tree.getWorldPosition(new THREE.Vector3())
  // );
  // console.log(
  //   "Tree2 World Position:",
  //   tree2.getWorldPosition(new THREE.Vector3())
  // );
  // group.traverse((obj) => {
  //   if (obj.isMesh) {
  //     console.log(obj.name, obj, obj.position);
  //   }
  // });

  const meshFolder1 = gui.addFolder("tree");
  meshFolder1.add(tree.position, "x").min(-500).max(500).step(10);
  meshFolder1.add(tree.position, "y").min(-500).max(500).step(10);
  meshFolder1.add(tree.position, "z").min(-500).max(500).step(10);
  const meshFolder2 = gui.addFolder("tree2");
  meshFolder2.add(tree2.position, "x").min(-500).max(500).step(10);
  meshFolder2.add(tree2.position, "y").min(-500).max(500).step(10);
  meshFolder2.add(tree2.position, "z").min(-500).max(500).step(10);

  scene.add(group);
});

const directionLight = new THREE.DirectionalLight(0xffffff, 2);
directionLight.position.set(500, 400, 300);
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const width = window.innerWidth;
const height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
camera.position.set(300, 300, 500);
camera.lookAt(0, 0, 0);

const helper = new THREE.AxesHelper(500);
scene.add(helper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const clock = new THREE.Clock();
function render() {
  const delta = clock.getDelta();
  // mesh.rotateY(delta);
  mesh.rotateY(delta * Math.random());
  mesh.rotateX(delta * Math.random());
  mesh.rotateZ(delta * Math.random());
  // 如果想让 mesh2、mesh3、mesh4 同步旋转
  mesh2.rotation.copy(mesh.rotation);
  mesh3.rotation.copy(mesh.rotation);
  mesh4.rotation.copy(mesh.rotation);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.body.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
