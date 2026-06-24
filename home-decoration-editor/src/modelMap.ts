import { GLTFLoader } from "three/examples/jsm/Addons.js";

const gltfLoader = new GLTFLoader();

export const modelMap: Record<string, Promise<GLTF>> = {
  "./bed2.glb": gltfLoader.loadAsync("./bed2.glb", (event) => {
    const percent = event.loaded / event.total;
    console.log("进度：", percent * 100 + " %");
  }),
  "./dining-table.glb": gltfLoader.loadAsync("./dining-table.glb"),
  "./window.glb": gltfLoader.loadAsync("./window.glb"),
  "./door.glb": gltfLoader.loadAsync("./door.glb"),
};
