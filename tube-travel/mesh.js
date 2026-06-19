import * as THREE from "three";

// 用三维样条曲线 CatmullRomCurve3 创建穿过 6 个点的一条曲线
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-100, 20, 90),
  new THREE.Vector3(-40, 80, 100),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(60, -60, 0),
  new THREE.Vector3(100, -40, 80),
  new THREE.Vector3(150, 60, 60),
]);

const geometry = new THREE.TubeGeometry(path, 100, 5, 30);

const loader = new THREE.TextureLoader();
const texture = loader.load("./stone.png");
// 使用RepeatWrapping，纹理将简单地重复到无穷大
texture.wrapS = THREE.RepeatWrapping;
texture.colorSpace = THREE.SRGBColorSpace;
texture.repeat.x = 20;

const material = new THREE.MeshBasicMaterial({
  // color: new THREE.Color("orange"),
  side: THREE.DoubleSide,
  aoMap: texture,
  map: texture,
});

const mesh = new THREE.Mesh(geometry, material);
export const tubePoints = path.getSpacedPoints(1000);

export default mesh;
