import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const mesh = new THREE.Group();
// .gltf 模型的三种形式：
// .gltf：所有纹理图片、顶点信息都是 base64 内联在一个文件里
// .gltf + .bin + .jpg/.png：图片单独存在文件，顶点信息放在 .bin
// .glb：也是内联所有资源，但是二进制形式体积更小

loader.load("./gltf1/CesiumMan.gltf", function (gltf) {
  console.log(gltf);
  mesh.add(gltf.scene);
  gltf.scene.scale.set(50, 50, 50);
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      console.log(obj.name, obj);
      obj.material.wireframe = true;
      obj.material.color.set("orange");
      obj.material.map = null;
    }
  });
});

loader.load("./gltf2/CesiumMan.gltf", function (gltf) {
  mesh.add(gltf.scene);

  gltf.scene.scale.set(50, 50, 50);
  gltf.scene.translateX(-50);

  gltf.scene.traverse(obj => {
      if(obj.isMesh) {
          obj.material.wireframe = true;
          obj.material.color.set('lightblue');
          obj.material.map = null;
      }
  })
});

loader.load("./gltf3/CesiumMan.glb", function (gltf) {
  mesh.add(gltf.scene);

  gltf.scene.scale.set(50, 50, 50);
  gltf.scene.translateX(50);

  gltf.scene.traverse(obj => {
      if(obj.isMesh) {
          obj.material.wireframe = true;
          obj.material.color.set('lightgreen');
          obj.material.map = null;
      }
  })
});

export default mesh;
