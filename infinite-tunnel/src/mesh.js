import * as THREE from "three";

// 第六个参数是是否空心
const geometry = new THREE.CylinderGeometry(30, 50, 1000, 32, 32, true);

const loader = new THREE.TextureLoader();
const texture = loader.load("../public/storm.png");
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapT = THREE.RepeatWrapping;
// 竖直方向垂直两次
texture.repeat.set(1, 2);

const material = new THREE.MeshBasicMaterial({
  // side: THREE.DoubleSide,
  // 只需要内部展示贴图
  side: THREE.BackSide,
  // 颜色贴图
  // map: texture,

  // 灰度纹理
  alphaMap: texture,
  transparent: true,
});

const tunnel = new THREE.Mesh(geometry, material);

export default tunnel;
