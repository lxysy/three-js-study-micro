import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const tree = new THREE.Group();

const loader = new GLTFLoader();

function loadTree(callback) {
  loader.load("./Horse.gltf", (gltf) => {
    console.log(gltf);

    tree.add(gltf.scene);

    tree.traverse((obj) => {
      if (obj.isMesh) {
        console.log(obj.name, obj,obj.position);
      }
    });

    callback(tree);
  });
}

export default loadTree;
