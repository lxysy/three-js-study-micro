import * as THREE from "three";

// 在xy平面画shape  房屋侧面
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, 2000);
shape.lineTo(-1500, 3000);
shape.lineTo(-3000, 2000);
shape.lineTo(-3000, 0);

// 窗口
const windowPath = new THREE.Path();
windowPath.moveTo(-600, 400);
windowPath.lineTo(-600, 1600);
windowPath.lineTo(-2400, 1600);
windowPath.lineTo(-2400, 400);
shape.holes.push(windowPath);

// 贴图
const loader = new THREE.TextureLoader();
const texture = loader.load("./zhuan.jpg");
texture.colorSpace = THREE.SRGBColorSpace;
// 此时无效
// texture.wrapS = THREE.RepeatWrapping;
// texture.repeat.x = 2;
// 此时有效 ExtrudeGeometry的uv坐标，因为它是拉伸出来的，不像内置的几何体比如 BoxGeometry 那样有设置好的 uv 坐标，拉伸出来坐标范围超出（1,1）
// 所以这里乘以了很小的值
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.x = 0.0005;
texture.repeat.y = 0.0005;

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 100,
});
const material = new THREE.MeshLambertMaterial({
  color: new THREE.Color("lightgrey"),
  map: texture,
  aoMap: texture,
});

const sideWall = new THREE.Mesh(geometry, material);
console.log(222, sideWall);

export default sideWall;
