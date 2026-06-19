import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const mesh = new THREE.Group();

loader.load("./Horse.gltf", function (gltf) {
  console.log(gltf);
  mesh.add(gltf.scene);

  gltf.scene.scale.set(50, 50, 50);

  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      // 遍历模型的所有对象的时候，给所有 mesh 加个 target 属性，然后点击的时候添加到 selectedObjects 的是这个 obj.target
      // 这里放进去的整个group
      obj.target = gltf.scene;
      if (obj.name === "Cylinder") {
        obj.material.color = new THREE.Color("white");
      } else if (obj.name === "Cylinder_1") {
        obj.material.color = new THREE.Color("pink");
      }
    }
  });
});

export default mesh;
