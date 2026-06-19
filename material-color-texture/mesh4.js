import * as THREE from "three";

const loader = new THREE.TextureLoader();
const texture = loader.load("./zhuan.jpg");

// 设置材质水平、竖直方向重复
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(3, 3);
// 修改下 texture 的颜色空间，
// 可以确保纹理的颜色在显示时看起来是正确的。这对于处理图像和纹理特别重要，因为不同的颜色空间可能会使相同的颜色值显示出来不同的效果。
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.PlaneGeometry(1000, 1000);

const material = new THREE.MeshBasicMaterial({
  map: texture,
  aoMap: texture,
});

const mesh = new THREE.Mesh(geometry, material);

export default mesh;
