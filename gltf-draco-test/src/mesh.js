import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

const loader = new GLTFLoader();
const mesh = new THREE.Group();

// 现在我们的 draco decoder 是从 cdn 下载的，其实 three.js 也内置了
// 但 node_modules 下的代码网页访问不到，我们要把这个 /examples/jsm/libs/draco/gltf 目录复制出来，放到 public 下
const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/' );
dracoLoader.setDecoderPath('gltf/')
loader.setDRACOLoader(dracoLoader);
loader.load("./Michelle2.glb", function (gltf) {
    console.log(gltf);
    gltf.scene.scale.setScalar(5);
    mesh.add(gltf.scene);
})

export default mesh;