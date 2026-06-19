import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const mesh = new THREE.Group();

loader.load("./model.glb", function (gltf) {
  console.log(gltf);
  // 这里 scale.setScalar(5) 就是 scale.set(5,5,5)
  gltf.scene.scale.setScalar(5);
  // gltf.scene.traverse((obj) => {
  //   if (obj.isMesh) {
  //     console.log(obj.name, obj);
  //     obj.material.wireframe = true;
  //     obj.material.color.set("orange");
  //     obj.material.map = null;
  //   }
  // });
  mesh.add(gltf.scene);
});

export default mesh;
