import * as THREE from "three";

const group = new THREE.Group();
const color1 = new THREE.Color("yellow");
const color2 = new THREE.Color("blue");

// 创建这样的 21 个同心圆环柱
// 外圆半径 i * 50，内圆是 i * 50 - 20，也就是圆环宽度 20
for (let i = 1; i <= 21; i++) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, i * 40, 0, Math.PI * 2);

  const path = new THREE.Path();
  path.absarc(0, 0, i * 40 - 20, 0, Math.PI * 2);

  // 用 Shape 画一个圆，然后定义 holes 的孔
  shape.holes.push(path);

  // 拉伸shape
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 300,
    curveSegments: 50,
  });

  const percent = i / 21;
  // 从内到外渐变颜色
  const color = color1.clone().lerp(color2, percent);
  const material = new THREE.MeshPhysicalMaterial({
    color,
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
}
group.rotateX(-Math.PI / 2);

export default group;
