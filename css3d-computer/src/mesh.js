import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DObject } from "three/examples/jsm/Addons";

const loader = new GLTFLoader();

const mesh = new THREE.Group();

let resolveMonitor;
export const monitorPromise = new Promise((resolve) => {
  resolveMonitor = resolve;
});

loader.load("./monitor.glb", function (gltf) {
  gltf.scene.name = "monitor";
  mesh.add(gltf.scene);
  gltf.scene.scale.set(300, 300, 300);
  gltf.scene.position.setY(10.14);

  const ele = document.getElementById("desktop");
  const css3dObj = new CSS3DObject(ele);
  css3dObj.scale.set(0.01, 0.01, 0.01);
  // 是绕CSS3DObject 自身的局部 X 轴旋转，不是世界坐标的 X 轴
  css3dObj.rotateX(-Math.PI / 2);
  css3dObj.position.y = 2.5;
  css3dObj.position.x = -0.16;

  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      console.log(obj.name, obj);
      if (obj.name === "Object_5") {
        const helper = new THREE.AxesHelper(1000);
        obj.add(helper);
        obj.add(css3dObj);
      }
    }
    obj.castShadow = true;
  });
  resolveMonitor(gltf.scene);
});

loader.load("./desk.glb", function (gltf) {
  console.log(gltf);
  mesh.add(gltf.scene);
  gltf.scene.scale.set(200, 200, 200);
  gltf.scene.rotateY(Math.PI / 2);
  gltf.scene.traverse((obj) => {
    obj.receiveShadow = true;
  });
});

export default mesh;
