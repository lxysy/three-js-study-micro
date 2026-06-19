import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const mesh = new THREE.Group();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./matcap3.png');


loader.load("./duck.glb", function (gltf) {
  console.log(gltf);
  mesh.add(gltf.scene);
  // setScalar(3000) 就是 set(3000, 3000, 3000)
  gltf.scene.scale.setScalar(3000);
  gltf.scene.position.y = -300;

  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      // 用 MatCap 材质，能简单快速实现各种高级效果，性能消耗还少，因为不计算光照
      obj.material = new THREE.MeshMatcapMaterial({
        color: "orange",
        matcap: texture
      });
    }
  });
});

export default mesh;
